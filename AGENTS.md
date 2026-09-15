# RepoChat Agent Notes

- Keep the project incremental. Do not add Supabase, authentication, or realtime behavior until the local VS Code extension foundation is stable.
- Treat RepoChat as a portfolio-quality extension intended for GitHub and the VS Code Marketplace. Favor decisions that look professional to companies reviewing the project.
- Prefer small, typed services over mixing VS Code APIs directly into domain logic.
- Keep secrets out of the repository. Use environment/config files that remain ignored.
- Run `pnpm run check` after meaningful changes when dependencies are installed.
- Maintain `PROJECT_SPEC.md` when architecture or major milestones change.
