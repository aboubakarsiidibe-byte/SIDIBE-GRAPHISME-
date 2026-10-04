import { Project, Task, Workspace } from '../types';
import { getValidSupabaseSession } from './supabaseAuth';

export interface CloudSyncConfig {
  url: string;
  anonKey: string;
}

export function getCloudSyncConfig(): CloudSyncConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey || url.includes('MY_SUPABASE') || anonKey.includes('MY_SUPABASE')) return null;
  return { url: url.replace(/\/$/, ''), anonKey };
}

export function isCloudSyncConfigured(): boolean {
  return getCloudSyncConfig() !== null;
}

export async function isCloudSessionReady(): Promise<boolean> {
  return (await getValidSupabaseSession()) !== null;
}

async function supabaseRequest(
  config: CloudSyncConfig,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = await getValidSupabaseSession();
  if (!session) {
    throw new Error('Connectez votre compte Supabase avant d’utiliser la synchronisation cloud.');
  }

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function toProjectRow(workspaceId: string, project: Project) {
  return {
    id: project.id,
    workspace_id: workspaceId,
    name: project.name,
    client: project.client,
    type: project.type,
    budget: project.budget,
    currency: project.currency || 'XOF',
    payment_status: project.paymentStatus,
    start_date: project.startDate || null,
    deadline: project.deadline || null,
    notes_brief: project.notesBrief || '',
    archived: Boolean(project.archived),
  };
}

function toTaskRow(workspaceId: string, task: Task) {
  return {
    id: task.id,
    workspace_id: workspaceId,
    project_id: task.projectId || null,
    title: task.title,
    description: task.description || '',
    status: task.status,
    due_date: task.dueDate || null,
    start_date: task.startDate || null,
    estimated_hours: task.estimatedHours || 0,
    priority: task.priority,
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    graphic_tool: task.graphicTool || null,
    client_validation_requested_date: task.clientValidationRequestedDate || null,
    completed_at: task.completedAt || null,
  };
}

export async function ensureCloudWorkspace(workspace: Workspace): Promise<void> {
  const config = getCloudSyncConfig();
  if (!config) throw new Error('La synchronisation cloud Supabase n’est pas configurée.');

  const session = await getValidSupabaseSession();
  if (!session) throw new Error('Connectez votre compte Supabase avant de synchroniser.');

  const response = await supabaseRequest(config, 'studio_workspaces?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: workspace.id,
      owner_id: session.user.id,
      name: workspace.name,
      domain: workspace.domain,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur cloud espace de travail (${response.status}).`);
  }
}

export async function pushWorkspaceSnapshot(
  workspace: Workspace,
  projects: Project[],
  tasks: Task[]
): Promise<void> {
  const config = getCloudSyncConfig();
  if (!config) throw new Error('La synchronisation cloud Supabase n’est pas configurée.');

  await ensureCloudWorkspace(workspace);

  const projectRows = projects.map((project) => toProjectRow(workspace.id, project));
  const taskRows = tasks.map((task) => toTaskRow(workspace.id, task));

  if (projectRows.length) {
    const response = await supabaseRequest(config, 'studio_projects?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(projectRows),
    });
    if (!response.ok) throw new Error(`Erreur cloud projets (${response.status}).`);
  }

  if (taskRows.length) {
    const response = await supabaseRequest(config, 'studio_tasks?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(taskRows),
    });
    if (!response.ok) throw new Error(`Erreur cloud tâches (${response.status}).`);
  }
}

export async function pullWorkspaceSnapshot(
  workspaceId: string
): Promise<{ projects: Project[]; tasks: Task[] }> {
  const config = getCloudSyncConfig();
  if (!config) throw new Error('La synchronisation cloud Supabase n’est pas configurée.');

  const projectResponse = await supabaseRequest(
    config,
    `studio_projects?workspace_id=eq.${encodeURIComponent(workspaceId)}&order=updated_at.desc`
  );
  if (!projectResponse.ok) throw new Error(`Erreur lecture cloud projets (${projectResponse.status}).`);

  const taskResponse = await supabaseRequest(
    config,
    `studio_tasks?workspace_id=eq.${encodeURIComponent(workspaceId)}&order=updated_at.desc`
  );
  if (!taskResponse.ok) throw new Error(`Erreur lecture cloud tâches (${taskResponse.status}).`);

  const projectRows = await projectResponse.json() as Array<Record<string, unknown>>;
  const taskRows = await taskResponse.json() as Array<Record<string, unknown>>;

  const projects: Project[] = projectRows.map((row) => ({
    id: String(row.id),
    name: String(row.name || ''),
    client: String(row.client || ''),
    type: row.type as Project['type'],
    budget: Number(row.budget || 0),
    currency: String(row.currency || 'XOF'),
    paymentStatus: row.payment_status as Project['paymentStatus'],
    startDate: String(row.start_date || ''),
    deadline: String(row.deadline || ''),
    links: [],
    notesBrief: String(row.notes_brief || ''),
    colorTag: '#f59e0b',
    createdAt: String(row.created_at || new Date().toISOString()),
    archived: Boolean(row.archived),
  }));

  const tasks: Task[] = taskRows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id || 'studio-interne'),
    title: String(row.title || ''),
    description: String(row.description || ''),
    status: row.status as Task['status'],
    dueDate: String(row.due_date || ''),
    startDate: row.start_date ? String(row.start_date) : undefined,
    estimatedHours: Number(row.estimated_hours || 0),
    priority: row.priority as Task['priority'],
    subtasks: Array.isArray(row.subtasks) ? row.subtasks as Task['subtasks'] : [],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    graphicTool: row.graphic_tool && typeof row.graphic_tool === 'object'
      ? row.graphic_tool as Task['graphicTool']
      : undefined,
    clientValidationRequestedDate: row.client_validation_requested_date
      ? String(row.client_validation_requested_date)
      : undefined,
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
  }));

  return { projects, tasks };
}

export async function syncWorkspaceSnapshot(
  workspace: Workspace,
  projects: Project[],
  tasks: Task[]
): Promise<{ projects: Project[]; tasks: Task[] }> {
  await pushWorkspaceSnapshot(workspace, projects, tasks);
  return pullWorkspaceSnapshot(workspace.id);
}
