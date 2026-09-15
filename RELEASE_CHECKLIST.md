# RepoChat Release Checklist

Use this checklist to keep RepoChat moving toward a credible public GitHub project and eventual VS Code Marketplace extension.

## Current Foundation

- [x] TypeScript VS Code extension scaffold.
- [x] RepoChat Activity Bar container.
- [x] Sidebar Webview View.
- [x] Polished local chat preview UI.
- [x] Webview-to-extension message passing.
- [x] Local in-memory message composer.
- [x] Git repository detection service.
- [x] Remote URL detection.
- [x] GitHub-style owner/repository normalization.
- [x] Branch detection.
- [x] Commit SHA detection.
- [x] Strict TypeScript configuration.
- [x] ESLint configuration.
- [x] Prettier configuration.
- [x] Lightweight tracked-file secret check.
- [x] Basic service tests.
- [x] README, project spec, future-agent notes, and gitignore.

## Before Public GitHub

- [x] Initialize this folder as a Git repository.
- [x] Choose a public-facing license.
- [x] Add `CHANGELOG.md`.
- [x] Add repository URL metadata to `package.json` after the private GitHub repo exists.
- [ ] Replace placeholder publisher value after choosing the Marketplace publisher id.
- [x] Add a README preview screenshot.
- [ ] Add a short demo GIF for the source sharing flow.
- [x] Add a crisp README section for recruiters and engineering managers.
- [x] Add GitHub Actions CI for lint, format, compile, and tests.
- [x] Verify GitHub Actions passes on the private repository.
- [x] Review `.vscodeignore` before packaging.
- [x] Add public-facing install, support, contribution, and security docs.
- [ ] Make the first commit history clean and intentional.

## Before Marketplace Packaging

- [x] Add a Marketplace-ready icon asset.
- [x] Add `galleryBanner`, keywords, categories, and badges where useful.
- [x] Install and run `vsce package`.
- [x] Test the generated `.vsix` in a clean VS Code profile.
- [x] Confirm no secrets, local caches, or generated dependency folders are packaged.
- [x] Keep development scripts and Supabase migrations out of the packaged `.vsix`.
- [ ] Confirm activation, sidebar rendering, and message composer work after install.

## Product Next Steps

- [x] Add `Share in RepoChat` editor context menu command.
- [x] Capture selected file path, line range, text, branch, and commit.
- [x] Render real code attachments in local messages.
- [x] Click attachment to open the file and reveal selected lines.
- [x] Add Supabase schema migrations.
- [x] Add Supabase local environment documentation without committed secrets.
- [ ] Add Supabase client configuration without committed secrets.
- [ ] Add GitHub authentication with minimal scopes.
- [ ] Verify private repository access server-side.
- [ ] Add persistent realtime messages.
- [ ] Add presence/users online.
- [ ] Add advanced stale-reference resolution.

## Verification Commands

- [x] `pnpm run check`
- [x] `vsce package`
- [ ] Manual Extension Development Host test with `F5`
- [x] Manual `.vsix` install test
