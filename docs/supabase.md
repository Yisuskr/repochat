# Supabase Plan

RepoChat will use Supabase for persistent repository rooms, realtime messages, presence, authentication, and row-level security.

The extension is not connected to Supabase yet. This document records the intended backend shape so the next implementation step can be done without improvising schema decisions.

## Local Environment

Create a local `.env` file from `.env.example` when Supabase integration begins:

```powershell
Copy-Item .env.example .env
```

Never commit `.env` files or privileged backend credentials.

## Security Direction

- Public repository identifiers from the extension are treated as hints, not proof of access.
- Private repository membership must be verified server-side through GitHub before a user can read or write messages.
- Client code should use only public client configuration.
- Privileged database access belongs only in trusted server-side code such as Supabase Edge Functions.
- Row Level Security stays enabled on all app tables.

## Initial Tables

- `app_repositories`: one row per normalized repository remote.
- `repository_members`: authenticated users allowed to access a repository room.
- `messages`: chat messages scoped to a repository.
- `code_attachments`: optional source references attached to messages.

## Next Implementation Step

Add the Supabase client package and a configuration service that reads user/workspace settings. Keep the local in-memory message service as a fallback until realtime persistence is fully working.
