import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { normalizeRepositoryIdentifier } from "../src/services/gitService";

describe("normalizeRepositoryIdentifier", () => {
  it("normalizes GitHub HTTPS remotes", () => {
    assert.deepEqual(normalizeRepositoryIdentifier("https://github.com/openai/repochat.git"), {
      provider: "github",
      host: "github.com",
      owner: "openai",
      name: "repochat",
      slug: "openai/repochat"
    });
  });

  it("normalizes GitHub SSH remotes", () => {
    assert.deepEqual(normalizeRepositoryIdentifier("git@github.com:openai/repochat.git"), {
      provider: "github",
      host: "github.com",
      owner: "openai",
      name: "repochat",
      slug: "openai/repochat"
    });
  });

  it("normalizes unknown Git hosts without claiming GitHub semantics", () => {
    assert.deepEqual(normalizeRepositoryIdentifier("ssh://git@example.com/team/repochat.git"), {
      provider: "unknown",
      host: "example.com",
      owner: "team",
      name: "repochat",
      slug: "team/repochat"
    });
  });

  it("returns null for unsupported remote values", () => {
    assert.equal(normalizeRepositoryIdentifier("not a remote url"), null);
  });
});
