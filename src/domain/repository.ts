export type RepositoryProvider = "github" | "unknown";

export interface RepositoryIdentifier {
  readonly provider: RepositoryProvider;
  readonly host: string;
  readonly owner: string;
  readonly name: string;
  readonly slug: string;
}

export interface RepositoryInfo {
  readonly workspacePath: string;
  readonly rootPath: string;
  readonly remoteUrl: string | null;
  readonly repository: RepositoryIdentifier | null;
  readonly branch: string | null;
  readonly commitSha: string | null;
}

export interface RepositoryDetectionResult {
  readonly status: "ready" | "unavailable";
  readonly info: RepositoryInfo | null;
  readonly reason?: string;
}
