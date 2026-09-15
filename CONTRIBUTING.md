# Contributing

RepoChat is currently an early preview project. Contributions should keep the extension small, typed, and easy to review.

## Development Workflow

1. Install dependencies with `pnpm install`.
2. Make focused changes.
3. Run `pnpm run check`.
4. For packaging-related changes, run `pnpm run package:vsix`.

## Code Guidelines

- Keep VS Code API usage in extension/webview integration layers.
- Keep pure logic in small services or domain modules.
- Do not commit secrets, tokens, `.env`, generated dependency folders, or local editor caches.
- Update `PROJECT_SPEC.md` when architectural decisions or milestones change.
- Update `CHANGELOG.md` for user-visible changes.

## Pull Request Expectations

- Explain the user-facing behavior changed.
- Mention tests or checks run.
- Keep unrelated refactors out of feature PRs.
