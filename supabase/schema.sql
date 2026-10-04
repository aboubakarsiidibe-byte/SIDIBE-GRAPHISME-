-- SIDIBE STUDIO V2 — Supabase foundation
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
  workspace_id uuid not null references public.studio_workspaces(id) on delete cascade,
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

-- Policies must be added after connecting Supabase Auth and mapping workspace membership.
