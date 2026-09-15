import * as vscode from "vscode";

import { LocalMessageService } from "./services/localMessageService";
import { GitService } from "./services/gitService";
import { RepoChatViewProvider } from "./webview/RepoChatViewProvider";

export function activate(context: vscode.ExtensionContext): void {
  const gitService = new GitService();
  const messageService = new LocalMessageService();
  const provider = new RepoChatViewProvider(context.extensionUri, gitService, messageService);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(RepoChatViewProvider.viewType, provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }),
    vscode.commands.registerCommand("repochat.refreshRepository", async () => {
      await provider.refreshRepository();
    }),
    vscode.commands.registerCommand("repochat.shareSelection", async () => {
      await provider.shareActiveSelection();
    })
  );
}

export function deactivate(): void {
  // No background resources are held yet.
}
