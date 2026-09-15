import * as vscode from "vscode";
import path from "node:path";

import type { CodeAttachment, SendMessageInput } from "../domain/message";
import type { RepositoryDetectionResult } from "../domain/repository";
import type { GitService } from "../services/gitService";
import type { LocalMessageService } from "../services/localMessageService";
import { getRepoChatHtml } from "./webviewHtml";

export class RepoChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "repochat.chatView";

  private view?: vscode.WebviewView;

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly gitService: GitService,
    private readonly messageService: LocalMessageService
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = getRepoChatHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(
      async (message: WebviewInboundMessage) => {
        await this.handleWebviewMessage(message);
      },
      undefined,
      []
    );

    return this.refreshRepository();
  }

  public async refreshRepository(): Promise<void> {
    const result = await this.detectRepository();

    this.view?.webview.postMessage({
      type: "repository:update",
      payload: result
    });

    await this.refreshMessages();
  }

  public async refreshMessages(): Promise<void> {
    await this.view?.webview.postMessage({
      type: "messages:update",
      payload: this.messageService.listMessages()
    });
  }

  public async shareActiveSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      await vscode.window.showWarningMessage("Open a source file before sharing code in RepoChat.");
      return;
    }

    if (editor.selection.isEmpty) {
      await vscode.window.showWarningMessage("Select code before using Share in RepoChat.");
      return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

    if (!workspaceFolder) {
      await vscode.window.showWarningMessage(
        "Open a workspace folder before sharing code in RepoChat."
      );
      return;
    }

    const repositoryResult = await this.gitService.detectRepository(workspaceFolder.uri.fsPath);

    if (repositoryResult.status !== "ready" || !repositoryResult.info) {
      await vscode.window.showWarningMessage(
        "RepoChat could not detect a Git repository for this file."
      );
      return;
    }

    const attachment = createCodeAttachment(editor, workspaceFolder, repositoryResult);
    this.messageService.shareCode({
      authorName: "You",
      body: "Shared a code reference.",
      attachment
    });

    await vscode.commands.executeCommand("repochat.chatView.focus");
    await this.refreshRepository();
  }

  private async detectRepository(): Promise<RepositoryDetectionResult> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      return {
        status: "unavailable",
        info: null,
        reason: "Open a Git repository folder to connect RepoChat."
      };
    }

    return this.gitService.detectRepository(workspaceFolder.uri.fsPath);
  }

  private async handleWebviewMessage(message: WebviewInboundMessage): Promise<void> {
    if (message.type === "attachment:open") {
      await this.openCodeAttachment(message.payload);
      return;
    }

    if (message.type !== "message:send") {
      return;
    }

    try {
      const input = parseSendMessageInput(message.payload);
      this.messageService.sendMessage(input);
      await this.refreshMessages();
    } catch (error) {
      await this.view?.webview.postMessage({
        type: "error",
        payload: error instanceof Error ? error.message : "Unable to send message."
      });
    }
  }

  private async openCodeAttachment(payload: unknown): Promise<void> {
    const attachmentId = parseAttachmentOpenPayload(payload);
    const attachment = this.messageService.findCodeAttachment(attachmentId);

    if (!attachment) {
      await vscode.window.showWarningMessage("RepoChat could not find that code attachment.");
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      await vscode.window.showWarningMessage(
        "Open the repository workspace before opening this attachment."
      );
      return;
    }

    const targetPath = path.resolve(workspaceFolder.uri.fsPath, attachment.relativePath);
    const workspaceRoot = path.resolve(workspaceFolder.uri.fsPath);

    if (!isInsidePath(targetPath, workspaceRoot)) {
      await vscode.window.showWarningMessage(
        "RepoChat blocked a code attachment outside the workspace."
      );
      return;
    }

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(targetPath));
    const editor = await vscode.window.showTextDocument(document);
    const range = createAttachmentRange(document, attachment);

    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }
}

type WebviewInboundMessage =
  | {
      readonly type: "message:send";
      readonly payload: SendMessageInput;
    }
  | {
      readonly type: "attachment:open";
      readonly payload: unknown;
    }
  | {
      readonly type: string;
      readonly payload?: unknown;
    };

function parseSendMessageInput(payload: unknown): SendMessageInput {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("body" in payload) ||
    !("authorName" in payload) ||
    typeof payload.body !== "string" ||
    typeof payload.authorName !== "string"
  ) {
    throw new Error("Invalid message payload.");
  }

  return {
    body: payload.body,
    authorName: payload.authorName
  };
}

function parseAttachmentOpenPayload(payload: unknown): string {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("attachmentId" in payload) ||
    typeof payload.attachmentId !== "string"
  ) {
    throw new Error("Invalid attachment payload.");
  }

  return payload.attachmentId;
}

function createCodeAttachment(
  editor: vscode.TextEditor,
  workspaceFolder: vscode.WorkspaceFolder,
  repositoryResult: RepositoryDetectionResult
): Omit<CodeAttachment, "id" | "type"> {
  const repositoryInfo = repositoryResult.info;
  const relativePath = path
    .relative(workspaceFolder.uri.fsPath, editor.document.uri.fsPath)
    .replace(/\\/g, "/");

  return {
    repositorySlug: repositoryInfo?.repository?.slug ?? null,
    relativePath,
    selectedText: editor.document.getText(editor.selection),
    startLine: editor.selection.start.line + 1,
    endLine: editor.selection.end.line + 1,
    branch: repositoryInfo?.branch ?? null,
    commitSha: repositoryInfo?.commitSha ?? null
  };
}

function createAttachmentRange(
  document: vscode.TextDocument,
  attachment: CodeAttachment
): vscode.Range {
  const startLine = clampLine(attachment.startLine - 1, document);
  const endLine = clampLine(attachment.endLine - 1, document);
  const endCharacter = document.lineAt(endLine).text.length;

  return new vscode.Range(startLine, 0, endLine, endCharacter);
}

function clampLine(line: number, document: vscode.TextDocument): number {
  return Math.max(0, Math.min(line, document.lineCount - 1));
}

function isInsidePath(targetPath: string, parentPath: string): boolean {
  const relativePath = path.relative(parentPath, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
