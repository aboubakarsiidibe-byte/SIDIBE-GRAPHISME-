-- SIDIBE STUDIO V2 — safe migration for an already-created Supabase database
-- Run once in Supabase SQL Editor after Supabase Auth is enabled.

alter table public.studio_workspaces enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_tasks enable row level security;

create index if not exists studio_projects_workspace_idx on public.studio_projects(workspace_id);
create index if not exists studio_tasks_workspace_idx on public.studio_tasks(workspace_id);
create index if not exists studio_tasks_project_idx on public.studio_tasks(project_id);

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
