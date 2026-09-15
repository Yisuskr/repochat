# RepoChat Project Spec

## Product Direction

RepoChat is a VS Code-native chat surface for developers working in the same Git repository. The product should feel compact, editor-native, and designed around source references rather than like a generic tutorial chat.

The project is intended to become a public, portfolio-quality extension that can be published to the VS Code Marketplace and shared on GitHub to impress software companies. Every milestone should preserve that standard: professional UX, clean architecture, security-aware decisions, good documentation, and a repository history that looks credible to reviewers.

The repository should be understandable as a public preview: implemented features must be clearly separated from planned realtime/auth features, and installation instructions should work from a locally built `.vsix`.

## Foundation Architecture

- `src/extension.ts` owns VS Code activation, command registration, and webview registration.
- `src/services/gitService.ts` contains repository detection and remote normalization.
- `src/services/localMessageService.ts` contains the in-memory local message store used before realtime persistence exists.
- `src/webview/RepoChatViewProvider.ts` renders and updates the sidebar webview.
- `src/webview/webviewHtml.ts` isolates webview markup, styles, script, and content security policy creation.
- `src/domain/` defines shared repository and message data types.
- `test/` covers pure domain/service behavior that can run outside VS Code.

## Decisions

- React is deferred. The current UI is simple enough to keep as static webview HTML with a small script for state updates.
- Git detection shells out to the local `git` executable. This is stable for a VS Code extension foundation and keeps dependencies low.
- GitHub remote normalization supports common HTTPS, SSH, and `git@host:owner/repo.git` forms. Non-GitHub remotes still display their URL but may not have a normalized repository identifier.
- Supabase and GitHub authentication are deferred until repository identity and the local extension shell are stable.
- The composer now sends messages locally through extension-host/webview message passing. This keeps the UI interactive while preserving a clean path to replace the local store with Supabase later.
- `Share in RepoChat` is local-first: selected code becomes an in-memory message attachment with repository metadata, and the attachment can open the referenced local file and line range.
- The first Supabase schema is versioned but not wired into the extension yet. RLS is enabled from the start, and private repository access must be verified before membership rows become trusted.

## Near-Term Milestones

1. Add a short demo GIF for the private GitHub README.
2. Add Supabase client configuration without committed secrets.
3. Add GitHub authentication with minimal scopes.
4. Verify repository access server-side before joining private repository chats.
5. Add persistent realtime messaging and presence.
6. Add a short demo GIF for the source sharing flow.

## Publishing Readiness

- Keep `README.md` written for recruiters, engineering managers, and developers evaluating the extension.
- Keep the README screenshot current and add a short demo GIF once the source sharing flow is ready to showcase.
- Add CI before publishing the repository publicly.
- Add marketplace metadata, changelog, license choice, and packaging checks before any VS Code Marketplace upload.
- Avoid half-finished public-facing claims. Document planned features separately from implemented features.
