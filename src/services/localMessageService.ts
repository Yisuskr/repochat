import type {
  ChatMessage,
  CodeAttachment,
  SendMessageInput,
  ShareCodeInput
} from "../domain/message";

const initialMessages: readonly ChatMessage[] = [
  {
    id: "preview-1",
    authorName: "Daniel",
    body: "I think the validation bug comes from here.",
    createdAt: createTodayTime("14:32"),
    kind: "remote",
    attachment: {
      id: "attachment-preview-1",
      type: "code",
      repositorySlug: "openai/repochat",
      relativePath: "src/auth/service.ts",
      selectedText:
        "async function login(input: LoginInput) {\n  return validateCredentials(input);\n}",
      startLine: 81,
      endLine: 103,
      branch: "feature/auth",
      commitSha: "a8291fd"
    }
  },
  {
    id: "preview-2",
    authorName: "Maya",
    body: "Good catch. Repo-aware attachments will land after the messaging foundation.",
    createdAt: createTodayTime("14:36"),
    kind: "remote"
  }
];

export class LocalMessageService {
  private readonly messages: ChatMessage[] = [...initialMessages];

  public listMessages(): readonly ChatMessage[] {
    return [...this.messages];
  }

  public sendMessage(input: SendMessageInput): ChatMessage {
    const body = input.body.trim();

    if (!body) {
      throw new Error("Message body is required.");
    }

    const message: ChatMessage = {
      id: createId("local"),
      authorName: input.authorName,
      body,
      createdAt: new Date().toISOString(),
      kind: "local"
    };

    this.messages.push(message);
    return message;
  }

  public shareCode(input: ShareCodeInput): ChatMessage {
    const body = input.body.trim();

    if (!body) {
      throw new Error("Message body is required.");
    }

    const message: ChatMessage = {
      id: createId("local"),
      authorName: input.authorName,
      body,
      createdAt: new Date().toISOString(),
      kind: "local",
      attachment: {
        id: createId("attachment"),
        type: "code",
        ...input.attachment
      }
    };

    this.messages.push(message);
    return message;
  }

  public findCodeAttachment(attachmentId: string): CodeAttachment | null {
    for (const message of this.messages) {
      if (message.attachment?.id === attachmentId) {
        return message.attachment;
      }
    }

    return null;
  }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTodayTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}
