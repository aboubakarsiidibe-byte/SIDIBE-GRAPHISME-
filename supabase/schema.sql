-- SIDIBE STUDIO V2 — Supabase foundation
-- Canonical schema: IDs match the local SIDIBE STUDIO app (text).

create extension if not exists pgcrypto;

create table if not exists public.studio_workspaces (
  id text primary key,
  owner_id text not null,
  name text not null,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_projects (
  id text primary key,
  workspace_id text not null references public.studio_workspaces(id) on delete cascade,
  name text not null,
  client text not null,
  type text not null,
  budget numeric(14,2) not null default 0,
  currency text not null default 'XOF',
  payment_status text not null default 'Non facturé',
  start_date date,
  deadline date,
  notes_brief text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_tasks (
  id text primary key,
  workspace_id text not null references public.studio_workspaces(id) on delete cascade,
  project_id text references public.studio_projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'À faire',
  due_date date,
  start_date date,
  estimated_hours numeric(8,2) not null default 0,
  priority text not null default 'Moyenne',
  tags jsonb not null default '[]'::jsonb,
  subtasks jsonb not null default '[]'::jsonb,
  graphic_tool text,
  client_validation_requested_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_projects_workspace_idx on public.studio_projects(workspace_id);
create index if not exists studio_tasks_workspace_idx on public.studio_tasks(workspace_id);
create index if not exists studio_tasks_project_idx on public.studio_tasks(project_id);

alter table public.studio_workspaces enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_tasks enable row level security;

-- RLS is owner-based until workspace membership is introduced.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_workspaces' and policyname='workspace_owner_select') then
    create policy workspace_owner_select on public.studio_workspaces for select using (owner_id = (select auth.uid()::text));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_workspaces' and policyname='workspace_owner_insert') then
    create policy workspace_owner_insert on public.studio_workspaces for insert with check (owner_id = (select auth.uid()::text));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_workspaces' and policyname='workspace_owner_update') then
    create policy workspace_owner_update on public.studio_workspaces for update using (owner_id = (select auth.uid()::text)) with check (owner_id = (select auth.uid()::text));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_workspaces' and policyname='workspace_owner_delete') then
    create policy workspace_owner_delete on public.studio_workspaces for delete using (owner_id = (select auth.uid()::text));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='project_workspace_owner_select') then
    create policy project_workspace_owner_select on public.studio_projects for select using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='project_workspace_owner_insert') then
    create policy project_workspace_owner_insert on public.studio_projects for insert with check (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='project_workspace_owner_update') then
    create policy project_workspace_owner_update on public.studio_projects for update using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text))) with check (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='project_workspace_owner_delete') then
    create policy project_workspace_owner_delete on public.studio_projects for delete using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_tasks' and policyname='task_workspace_owner_select') then
    create policy task_workspace_owner_select on public.studio_tasks for select using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_tasks' and policyname='task_workspace_owner_insert') then
    create policy task_workspace_owner_insert on public.studio_tasks for insert with check (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_tasks' and policyname='task_workspace_owner_update') then
    create policy task_workspace_owner_update on public.studio_tasks for update using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text))) with check (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_tasks' and policyname='task_workspace_owner_delete') then
    create policy task_workspace_owner_delete on public.studio_tasks for delete using (exists (select 1 from public.studio_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()::text)));
  end if;
end $$;

drop table if exists public.test_sidibe;
