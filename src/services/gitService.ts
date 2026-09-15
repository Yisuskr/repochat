import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type {
  RepositoryDetectionResult,
  RepositoryIdentifier,
  RepositoryInfo,
  RepositoryProvider
} from "../domain/repository";

const execFileAsync = promisify(execFile);

interface GitCommandResult {
  readonly stdout: string;
}

export class GitService {
  public async detectRepository(workspacePath: string): Promise<RepositoryDetectionResult> {
    const rootPath = await this.tryGit(workspacePath, ["rev-parse", "--show-toplevel"]);

    if (!rootPath) {
      return {
        status: "unavailable",
        info: null,
        reason: "The active workspace is not inside a Git repository."
      };
    }

    const [remoteUrl, branch, commitSha] = await Promise.all([
      this.detectRemoteUrl(rootPath),
      this.tryGit(rootPath, ["branch", "--show-current"]),
      this.tryGit(rootPath, ["rev-parse", "HEAD"])
    ]);

    const info: RepositoryInfo = {
      workspacePath,
      rootPath,
      remoteUrl,
      repository: remoteUrl ? normalizeRepositoryIdentifier(remoteUrl) : null,
      branch: branch || null,
      commitSha: commitSha || null
    };

    return {
      status: "ready",
      info
    };
  }

  private async detectRemoteUrl(repositoryPath: string): Promise<string | null> {
    const originUrl = await this.tryGit(repositoryPath, ["config", "--get", "remote.origin.url"]);

    if (originUrl) {
      return originUrl;
    }

    const remoteNames = await this.tryGit(repositoryPath, ["remote"]);
    const firstRemote = remoteNames?.split(/\r?\n/).find(Boolean);

    if (!firstRemote) {
      return null;
    }

    return this.tryGit(repositoryPath, ["config", "--get", `remote.${firstRemote}.url`]);
  }

  private async tryGit(cwd: string, args: readonly string[]): Promise<string | null> {
    try {
      const result = (await execFileAsync("git", args, {
        cwd,
        windowsHide: true
      })) as GitCommandResult;

      return result.stdout.trim() || null;
    } catch {
      return null;
    }
  }
}

export function normalizeRepositoryIdentifier(remoteUrl: string): RepositoryIdentifier | null {
  const trimmedUrl = remoteUrl.trim();
  const parsed = parseRemoteUrl(trimmedUrl);

  if (!parsed) {
    return null;
  }

  const provider: RepositoryProvider =
    parsed.host.toLowerCase() === "github.com" ? "github" : "unknown";
  const name = parsed.name.replace(/\.git$/i, "");

  if (!parsed.owner || !name) {
    return null;
  }

  return {
    provider,
    host: parsed.host.toLowerCase(),
    owner: parsed.owner,
    name,
    slug: `${parsed.owner}/${name}`
  };
}

function parseRemoteUrl(remoteUrl: string): { host: string; owner: string; name: string } | null {
  const scpMatch = /^(?:[^@]+@)?([^:]+):([^/]+)\/(.+)$/.exec(remoteUrl);

  if (scpMatch) {
    return {
      host: scpMatch[1],
      owner: scpMatch[2],
      name: scpMatch[3]
    };
  }

  try {
    const url = new URL(remoteUrl);
    const [owner, name] = url.pathname.replace(/^\/+/, "").split("/");

    if (!url.hostname || !owner || !name) {
      return null;
    }

    return {
      host: url.hostname,
      owner,
      name
    };
  } catch {
    return null;
  }
}
