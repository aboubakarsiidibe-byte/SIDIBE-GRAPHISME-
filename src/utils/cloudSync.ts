import { Project, Task } from '../types';

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

async function supabaseRequest(
  config: CloudSyncConfig,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export async function pushWorkspaceSnapshot(
  workspaceId: string,
  projects: Project[],
  tasks: Task[]
): Promise<void> {
  const config = getCloudSyncConfig();
  if (!config) throw new Error('La synchronisation cloud Supabase n’est pas configurée.');

  const projectRows = projects.map((project) => ({
    id: project.id,
    workspace_id: workspaceId,
    name: project.name,
    client: project.client,
    type: project.type,
    budget: project.budget,
    currency: 'XOF',
    payment_status: project.paymentStatus,
    start_date: project.startDate || null,
    deadline: project.deadline || null,
    notes_brief: project.notesBrief || '',
    archived: Boolean(project.archived),
  }));

  const taskRows = tasks.map((task) => ({
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
  }));

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
