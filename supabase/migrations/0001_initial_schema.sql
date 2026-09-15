create extension if not exists pgcrypto;

create table public.app_repositories (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  host text not null,
  owner_name text not null,
  repository_name text not null,
  repository_slug text not null,
  remote_url text,
  is_private boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, host, repository_slug)
);

create table public.repository_members (
  repository_id uuid not null references public.app_repositories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  github_login text,
  role text not null default 'member',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (repository_id, user_id),
  constraint repository_members_role_check check (role in ('owner', 'maintainer', 'member'))
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.app_repositories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint messages_body_not_blank check (length(trim(body)) > 0)
);

create table public.code_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  repository_id uuid not null references public.app_repositories(id) on delete cascade,
  relative_path text not null,
  start_line integer not null,
  end_line integer not null,
  selected_text text not null,
  branch_name text,
  commit_sha text,
  context_hash text,
  created_at timestamptz not null default now(),
  constraint code_attachments_line_range_check check (start_line > 0 and end_line >= start_line),
  constraint code_attachments_relative_path_check check (
    relative_path <> ''
    and relative_path not like '/%'
    and relative_path not like '../%'
    and relative_path not like '%/../%'
  )
);

create index app_repositories_slug_idx on public.app_repositories (repository_slug);
create index repository_members_user_id_idx on public.repository_members (user_id);
create index messages_repository_created_at_idx on public.messages (repository_id, created_at desc);
create index code_attachments_message_id_idx on public.code_attachments (message_id);

alter table public.app_repositories enable row level security;
alter table public.repository_members enable row level security;
alter table public.messages enable row level security;
alter table public.code_attachments enable row level security;

create policy "Repository members can read repositories"
  on public.app_repositories
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.repository_members
      where repository_members.repository_id = app_repositories.id
        and repository_members.user_id = auth.uid()
        and repository_members.verified_at is not null
    )
  );

create policy "Repository members can read memberships"
  on public.repository_members
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.repository_members as viewer_membership
      where viewer_membership.repository_id = repository_members.repository_id
        and viewer_membership.user_id = auth.uid()
        and viewer_membership.verified_at is not null
    )
  );

create policy "Repository members can read messages"
  on public.messages
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.repository_members
      where repository_members.repository_id = messages.repository_id
        and repository_members.user_id = auth.uid()
        and repository_members.verified_at is not null
    )
  );

create policy "Repository members can insert messages"
  on public.messages
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.repository_members
      where repository_members.repository_id = messages.repository_id
        and repository_members.user_id = auth.uid()
        and repository_members.verified_at is not null
    )
  );

create policy "Message authors can update their own messages"
  on public.messages
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Repository members can read code attachments"
  on public.code_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.repository_members
      where repository_members.repository_id = code_attachments.repository_id
        and repository_members.user_id = auth.uid()
        and repository_members.verified_at is not null
    )
  );

create policy "Message authors can insert code attachments"
  on public.code_attachments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.messages
      where messages.id = code_attachments.message_id
        and messages.repository_id = code_attachments.repository_id
        and messages.user_id = auth.uid()
    )
  );
