import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: root,
  encoding: "utf8"
})
  .split(/\r?\n/)
  .filter(Boolean);

const blockedPatterns = [
  { name: "Supabase service role key", pattern: /service[_-]?role/i },
  {
    name: "JWT-like token",
    pattern: /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/
  },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{30,}/ }
];

const allowedFiles = new Set(["docs/supabase.md"]);
const violations = [];

for (const file of trackedFiles) {
  const normalized = file.replace(/\\/g, "/");

  if (allowedFiles.has(normalized)) {
    continue;
  }

  const contents = readFileSync(resolve(root, file), "utf8");

  for (const blockedPattern of blockedPatterns) {
    if (blockedPattern.pattern.test(contents)) {
      violations.push(`${relative(root, file)}: ${blockedPattern.name}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Potential secrets found:");
  console.error(violations.map((violation) => `- ${violation}`).join("\n"));
  process.exitCode = 1;
}
