export interface ChatMessage {
  readonly id: string;
  readonly authorName: string;
  readonly body: string;
  readonly createdAt: string;
  readonly kind: "local" | "remote";
  readonly attachment?: CodeAttachment;
}

export interface SendMessageInput {
  readonly body: string;
  readonly authorName: string;
}

export interface CodeAttachment {
  readonly id: string;
  readonly type: "code";
  readonly repositorySlug: string | null;
  readonly relativePath: string;
  readonly selectedText: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly branch: string | null;
  readonly commitSha: string | null;
}

export interface ShareCodeInput {
  readonly authorName: string;
  readonly body: string;
  readonly attachment: Omit<CodeAttachment, "id" | "type">;
}
