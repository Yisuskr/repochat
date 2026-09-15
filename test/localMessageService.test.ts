import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { LocalMessageService } from "../src/services/localMessageService";

describe("LocalMessageService", () => {
  it("starts with polished preview messages", () => {
    const service = new LocalMessageService();

    assert.equal(service.listMessages().length, 2);
  });

  it("stores trimmed local messages", () => {
    const service = new LocalMessageService();
    const message = service.sendMessage({
      authorName: "You",
      body: "  Ship the local composer  "
    });

    assert.equal(message.body, "Ship the local composer");
    assert.equal(message.authorName, "You");
    assert.equal(message.kind, "local");
    assert.equal(service.listMessages().at(-1), message);
  });

  it("rejects blank messages", () => {
    const service = new LocalMessageService();

    assert.throws(
      () =>
        service.sendMessage({
          authorName: "You",
          body: "   "
        }),
      /Message body is required/
    );
  });

  it("stores code attachments for shared selections", () => {
    const service = new LocalMessageService();
    const message = service.shareCode({
      authorName: "You",
      body: "Shared a code reference.",
      attachment: {
        repositorySlug: "Yisuskr/repochat",
        relativePath: "src/extension.ts",
        selectedText: "activate(context)",
        startLine: 8,
        endLine: 10,
        branch: "main",
        commitSha: "3531f6bfff2ffd3a805f0fa26a67119ab22cc2bc"
      }
    });

    assert.equal(message.attachment?.type, "code");
    assert.equal(message.attachment?.relativePath, "src/extension.ts");
    assert.equal(message.attachment?.startLine, 8);
    assert.equal(message.attachment?.endLine, 10);
  });

  it("finds code attachments by id", () => {
    const service = new LocalMessageService();
    const message = service.shareCode({
      authorName: "You",
      body: "Shared a code reference.",
      attachment: {
        repositorySlug: "Yisuskr/repochat",
        relativePath: "src/webview/webviewHtml.ts",
        selectedText: "createCodeAttachment",
        startLine: 1,
        endLine: 3,
        branch: "main",
        commitSha: "3531f6b"
      }
    });

    assert.equal(service.findCodeAttachment(message.attachment?.id ?? ""), message.attachment);
    assert.equal(service.findCodeAttachment("missing"), null);
  });
});
