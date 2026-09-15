import type * as vscode from "vscode";

export function getRepoChatHtml(webview: vscode.Webview): string {
  const nonce = createNonce();
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`
  ].join("; ");

  return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <title>RepoChat</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: var(--vscode-foreground);
        background: var(--vscode-sideBar-background);
        font: var(--vscode-font-size) / 1.45 var(--vscode-font-family);
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      .shell {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 100vh;
      }

      .repoHeader {
        padding: 14px 14px 12px;
        border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, transparent);
        background: color-mix(in srgb, var(--vscode-sideBar-background) 88%, var(--vscode-editor-background));
      }

      .brandRow,
      .repoLine,
      .messageMeta,
      .composerActions {
        display: flex;
        align-items: center;
      }

      .brandRow {
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }

      .brand {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 8px;
      }

      .mark {
        display: grid;
        width: 24px;
        height: 24px;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 6px;
        color: var(--vscode-button-foreground);
        background: var(--vscode-button-background);
        font-size: 13px;
        font-weight: 700;
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        overflow: hidden;
        font-size: 13px;
        font-weight: 650;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .statusPill {
        flex: 0 0 auto;
        border: 1px solid var(--vscode-charts-green);
        border-radius: 999px;
        color: var(--vscode-charts-green);
        padding: 2px 8px;
        font-size: 11px;
      }

      .repoCard {
        display: grid;
        gap: 8px;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 8px;
        padding: 10px;
        background: var(--vscode-editor-background);
      }

      .repoLine {
        gap: 8px;
        min-width: 0;
      }

      .repoLabel {
        width: 54px;
        flex: 0 0 auto;
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
      }

      .repoValue {
        min-width: 0;
        overflow: hidden;
        color: var(--vscode-foreground);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .repoValue.muted {
        color: var(--vscode-descriptionForeground);
      }

      .messages {
        display: grid;
        align-content: start;
        gap: 12px;
        overflow: auto;
        padding: 14px;
      }

      .dayDivider {
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
        text-align: center;
      }

      .message {
        display: grid;
        gap: 6px;
      }

      .messageMeta {
        gap: 6px;
        min-width: 0;
      }

      .author {
        overflow: hidden;
        font-weight: 650;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .time {
        flex: 0 0 auto;
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
      }

      .bubble {
        border-left: 2px solid var(--vscode-button-background);
        padding: 8px 10px;
        background: color-mix(in srgb, var(--vscode-editor-background) 88%, var(--vscode-button-background));
      }

      .attachment {
        display: grid;
        gap: 5px;
        margin-top: 8px;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 6px;
        padding: 8px;
        background: var(--vscode-sideBar-background);
      }

      code {
        color: var(--vscode-textPreformat-foreground);
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
      }

      .attachmentHeader {
        display: grid;
        gap: 3px;
      }

      .attachmentPath {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .attachmentMeta {
        color: var(--vscode-descriptionForeground);
      }

      .codePreview {
        overflow: hidden;
        max-height: 112px;
        margin: 2px 0 0;
        border-radius: 4px;
        background: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
        padding: 7px;
        white-space: pre-wrap;
      }

      .openCode {
        justify-self: start;
        margin-top: 4px;
        border: 0;
        color: var(--vscode-textLink-foreground);
        background: transparent;
        padding: 0;
        cursor: pointer;
      }

      .composer {
        display: grid;
        gap: 8px;
        border-top: 1px solid var(--vscode-sideBarSectionHeader-border, transparent);
        padding: 10px;
        background: var(--vscode-sideBar-background);
      }

      textarea {
        width: 100%;
        min-height: 72px;
        resize: none;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 6px;
        color: var(--vscode-input-foreground);
        background: var(--vscode-input-background);
        padding: 8px;
      }

      textarea::placeholder {
        color: var(--vscode-input-placeholderForeground);
      }

      .composerActions {
        justify-content: space-between;
        gap: 8px;
      }

      .hint {
        overflow: hidden;
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .send {
        border: 0;
        border-radius: 6px;
        color: var(--vscode-button-foreground);
        background: var(--vscode-button-background);
        padding: 5px 10px;
      }

      .send:hover {
        background: var(--vscode-button-hoverBackground);
      }

      .send:disabled {
        opacity: 0.55;
      }

      .error {
        color: var(--vscode-errorForeground);
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="repoHeader">
        <div class="brandRow">
          <div class="brand">
            <div class="mark">RC</div>
            <h1>RepoChat</h1>
          </div>
          <div class="statusPill" id="statusPill">Local</div>
        </div>
        <section class="repoCard" aria-label="Repository">
          <div class="repoLine">
            <span class="repoLabel">Repo</span>
            <span class="repoValue muted" id="repoSlug">Detecting...</span>
          </div>
          <div class="repoLine">
            <span class="repoLabel">Branch</span>
            <span class="repoValue muted" id="repoBranch">Detecting...</span>
          </div>
          <div class="repoLine">
            <span class="repoLabel">Commit</span>
            <span class="repoValue muted" id="repoCommit">Detecting...</span>
          </div>
          <div class="repoLine">
            <span class="repoLabel">Remote</span>
            <span class="repoValue muted" id="repoRemote">Detecting...</span>
          </div>
        </section>
      </header>

      <section class="messages" id="messages" aria-label="Messages">
        <div class="dayDivider">Local preview</div>
      </section>

      <footer class="composer">
        <textarea
          id="composer"
          placeholder="Message this repository..."
          aria-label="Message this repository"
        ></textarea>
        <div class="composerActions">
          <span class="hint" id="composerHint">Local preview mode</span>
          <button class="send" id="sendButton" type="button" disabled>Send</button>
        </div>
        <div class="error" id="errorMessage" role="status"></div>
      </footer>
    </main>

    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const fields = {
        status: document.getElementById("statusPill"),
        slug: document.getElementById("repoSlug"),
        branch: document.getElementById("repoBranch"),
        commit: document.getElementById("repoCommit"),
        remote: document.getElementById("repoRemote")
      };
      const messagesElement = document.getElementById("messages");
      const composerElement = document.getElementById("composer");
      const sendButton = document.getElementById("sendButton");
      const errorMessage = document.getElementById("errorMessage");

      composerElement.addEventListener("input", () => {
        sendButton.disabled = composerElement.value.trim().length === 0;
        errorMessage.textContent = "";
      });

      composerElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          sendMessage();
        }
      });

      sendButton.addEventListener("click", sendMessage);

      window.addEventListener("message", (event) => {
        if (event.data?.type === "repository:update") {
          renderRepository(event.data.payload);
        }

        if (event.data?.type === "messages:update") {
          renderMessages(event.data.payload ?? []);
        }

        if (event.data?.type === "error") {
          errorMessage.textContent = event.data.payload ?? "Something went wrong.";
        }
      });

      function sendMessage() {
        const body = composerElement.value.trim();

        if (!body) {
          return;
        }

        vscode.postMessage({
          type: "message:send",
          payload: {
            authorName: "You",
            body
          }
        });

        composerElement.value = "";
        sendButton.disabled = true;
      }

      function renderRepository(result) {
        if (!result || result.status !== "ready" || !result.info) {
          const reason = result?.reason ?? "Repository unavailable";
          setValue(fields.status, "Setup");
          setValue(fields.slug, reason, true);
          setValue(fields.branch, "Not detected", true);
          setValue(fields.commit, "Not detected", true);
          setValue(fields.remote, "Not detected", true);
          return;
        }

        const info = result.info;
        setValue(fields.status, "Ready");
        setValue(fields.slug, info.repository?.slug ?? "Unnormalized remote", !info.repository);
        setValue(fields.branch, info.branch ?? "Detached or unknown", !info.branch);
        setValue(fields.commit, info.commitSha ? info.commitSha.slice(0, 12) : "Unknown", !info.commitSha);
        setValue(fields.remote, info.remoteUrl ?? "No remote configured", !info.remoteUrl);
      }

      function setValue(element, value, muted = false) {
        element.textContent = value;
        element.classList.toggle("muted", muted);
      }

      function renderMessages(messages) {
        messagesElement.replaceChildren(createDivider("Local preview"));

        for (const message of messages) {
          messagesElement.appendChild(createMessage(message));
        }

        messagesElement.scrollTop = messagesElement.scrollHeight;
      }

      function createDivider(label) {
        const divider = document.createElement("div");
        divider.className = "dayDivider";
        divider.textContent = label;
        return divider;
      }

      function createMessage(message) {
        const article = document.createElement("article");
        article.className = "message";

        const meta = document.createElement("div");
        meta.className = "messageMeta";

        const author = document.createElement("span");
        author.className = "author";
        author.textContent = message.authorName;

        const time = document.createElement("span");
        time.className = "time";
        time.textContent = formatTime(message.createdAt);

        const bubble = document.createElement("div");
        bubble.className = "bubble";

        const body = document.createElement("p");
        body.textContent = message.body;

        meta.append(author, time);
        bubble.appendChild(body);

        if (message.attachment?.type === "code") {
          bubble.appendChild(createCodeAttachment(message.attachment));
        }

        article.append(meta, bubble);
        return article;
      }

      function createCodeAttachment(attachmentData) {
        const attachment = document.createElement("div");
        attachment.className = "attachment";

        const header = document.createElement("div");
        header.className = "attachmentHeader";

        const path = document.createElement("code");
        path.className = "attachmentPath";
        path.textContent = attachmentData.relativePath;

        const lines = document.createElement("code");
        lines.className = "attachmentMeta";
        lines.textContent = "L" + attachmentData.startLine + "-L" + attachmentData.endLine;

        const revision = document.createElement("code");
        revision.className = "attachmentMeta";
        revision.textContent = formatAttachmentRevision(attachmentData);

        const preview = document.createElement("code");
        preview.className = "codePreview";
        preview.textContent = attachmentData.selectedText;

        const button = document.createElement("button");
        button.className = "openCode";
        button.type = "button";
        button.textContent = "Open code";
        button.addEventListener("click", () => {
          vscode.postMessage({
            type: "attachment:open",
            payload: {
              attachmentId: attachmentData.id
            }
          });
        });

        header.append(path, lines, revision);
        attachment.append(header, preview, button);

        return attachment;
      }

      function formatAttachmentRevision(attachmentData) {
        const branch = attachmentData.branch ?? "unknown branch";
        const commit = attachmentData.commitSha ? attachmentData.commitSha.slice(0, 7) : "unknown commit";
        return branch + " · " + commit;
      }

      function formatTime(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    </script>
  </body>
</html>`;
}

function createNonce(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";

  for (let index = 0; index < 32; index += 1) {
    nonce += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return nonce;
}
