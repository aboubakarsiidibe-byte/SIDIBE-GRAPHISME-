import { Project, Task } from '../types';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialData';

const STORAGE_KEY_PROJECTS = 'sidibe_studio_projects_v1';
const STORAGE_KEY_TASKS = 'sidibe_studio_tasks_v1';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Invalid project storage format');

    const migrated: Project[] = parsed.map((rawProject) => {
      const p = rawProject as Partial<Project>;
      const budget = typeof p.budget === 'number' && Number.isFinite(p.budget) ? Math.max(0, p.budget) : 0;
      return {
        id: typeof p.id === 'string' && p.id ? p.id : crypto.randomUUID(),
        name: typeof p.name === 'string' && p.name.trim() ? p.name : 'Projet sans titre',
        client: typeof p.client === 'string' && p.client.trim() ? p.client : 'Client',
        clientEmail: typeof p.clientEmail === 'string' ? p.clientEmail : undefined,
        clientPhone: typeof p.clientPhone === 'string' ? p.clientPhone : undefined,
        type: p.type ?? 'Autre',
        budget,
        currency: 'XOF',
        paymentStatus: p.paymentStatus ?? 'Non facturé',
        startDate: typeof p.startDate === 'string' && p.startDate ? p.startDate : new Date().toISOString().slice(0, 10),
        deadline: typeof p.deadline === 'string' && p.deadline ? p.deadline : new Date().toISOString().slice(0, 10),
        links: Array.isArray(p.links) ? p.links.filter(Boolean) as Project['links'] : [],
        notesBrief: typeof p.notesBrief === 'string' ? p.notesBrief : '',
        colorTag: typeof p.colorTag === 'string' && p.colorTag ? p.colorTag : '#f59e0b',
        createdAt: typeof p.createdAt === 'string' && p.createdAt ? p.createdAt : new Date().toISOString(),
        archived: Boolean(p.archived),
      };
    });
    saveProjects(migrated);
    return migrated;
  } catch (e) {
    console.error('Error loading projects from localStorage', e);
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to localStorage', e);
  }
}

function migrateTask(raw: Partial<Task>): Task {
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    projectId: typeof raw.projectId === 'string' && raw.projectId ? raw.projectId : 'studio-interne',
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Tâche sans titre',
    description: typeof raw.description === 'string' ? raw.description : '',
    status: raw.status ?? 'À faire',
    dueDate: typeof raw.dueDate === 'string' && raw.dueDate ? raw.dueDate : new Date().toISOString().slice(0, 10),
    startDate: typeof raw.startDate === 'string' ? raw.startDate : undefined,
    estimatedHours: typeof raw.estimatedHours === 'number' && Number.isFinite(raw.estimatedHours)
      ? Math.max(0, raw.estimatedHours)
      : 0,
    priority: raw.priority ?? 'Moyenne',
    subtasks: Array.isArray(raw.subtasks)
      ? raw.subtasks.filter(Boolean).map((subtask) => ({
          id: typeof subtask.id === 'string' && subtask.id ? subtask.id : crypto.randomUUID(),
          title: typeof subtask.title === 'string' ? subtask.title : 'Sous-tâche',
          completed: Boolean(subtask.completed),
        }))
      : [],
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    graphicTool: raw.graphicTool,
    clientValidationRequestedDate: raw.clientValidationRequestedDate,
    completedAt: raw.completedAt,
    createdAt: typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : new Date().toISOString(),
  };
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid task storage format');
    }

    const migrated = parsed.map((task) => migrateTask(task as Partial<Task>));
    saveTasks(migrated);
    return migrated;
  } catch (e) {
    console.error('Error loading tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks to localStorage', e);
  }
}

export function resetStudioData(): { projects: Project[]; tasks: Task[] } {
  localStorage.removeItem(STORAGE_KEY_PROJECTS);
  localStorage.removeItem(STORAGE_KEY_TASKS);
  saveProjects(INITIAL_PROJECTS);
  saveTasks(INITIAL_TASKS);
  return { projects: INITIAL_PROJECTS, tasks: INITIAL_TASKS };
}

export function exportWorkspaceJSON(projects: Project[], tasks: Task[]): void {
  const exportData = {
    workspace: 'SIDIBE STUDIO',
    exportedAt: new Date().toISOString(),
    projects,
    tasks,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sidibe-studio-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}


export interface WorkspaceBackup {
  workspace: 'SIDIBE STUDIO';
  version: 1;
  exportedAt: string;
  projects: Project[];
  tasks: Task[];
}

export function importWorkspaceJSON(file: File): Promise<{ projects: Project[]; tasks: Task[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object') throw new Error('Format de sauvegarde invalide.');
        const data = parsed as Partial<WorkspaceBackup>;
        if (data.workspace !== 'SIDIBE STUDIO' || !Array.isArray(data.projects) || !Array.isArray(data.tasks)) {
          throw new Error('Cette sauvegarde ne provient pas de SIDIBE STUDIO.');
        }

        const projects = data.projects.map((item) => {
          const p = item as Partial<Project>;
          return {
            id: typeof p.id === 'string' && p.id ? p.id : crypto.randomUUID(),
            name: typeof p.name === 'string' && p.name.trim() ? p.name : 'Projet sans titre',
            client: typeof p.client === 'string' && p.client.trim() ? p.client : 'Client',
            clientEmail: typeof p.clientEmail === 'string' ? p.clientEmail : undefined,
            clientPhone: typeof p.clientPhone === 'string' ? p.clientPhone : undefined,
            type: p.type ?? 'Autre',
            budget: typeof p.budget === 'number' && Number.isFinite(p.budget) ? Math.max(0, p.budget) : 0,
            currency: 'XOF',
            paymentStatus: p.paymentStatus ?? 'Non facturé',
            startDate: typeof p.startDate === 'string' && p.startDate ? p.startDate : new Date().toISOString().slice(0, 10),
            deadline: typeof p.deadline === 'string' && p.deadline ? p.deadline : new Date().toISOString().slice(0, 10),
            links: Array.isArray(p.links) ? p.links.filter(Boolean) as Project['links'] : [],
            notesBrief: typeof p.notesBrief === 'string' ? p.notesBrief : '',
            colorTag: typeof p.colorTag === 'string' && p.colorTag ? p.colorTag : '#f59e0b',
            createdAt: typeof p.createdAt === 'string' && p.createdAt ? p.createdAt : new Date().toISOString(),
            archived: Boolean(p.archived),
          } as Project;
        });

        const tasks = data.tasks.map((item) => migrateTask(item as Partial<Task>));
        saveProjects(projects);
        saveTasks(tasks);
        resolve({ projects, tasks });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Impossible de lire la sauvegarde.'));
      }
    };
    reader.onerror = () => reject(new Error('Impossible de lire le fichier de sauvegarde.'));
    reader.readAsText(file);
  });
}

export function exportTasksCSV(tasks: Task[], projects: Project[]): void {
  const headers = ['ID', 'Titre', 'Projet', 'Statut', 'Priorité', 'Échéance', 'Heures estimées', 'Sous-tâches'];
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(projectMap.get(t.projectId) || 'Studio interne').replace(/"/g, '""')}"`,
    `"${t.status}"`,
    `"${t.priority}"`,
    `"${t.dueDate}"`,
    `"${t.estimatedHours}"`,
    `"${t.subtasks.filter((s) => s.completed).length}/${t.subtasks.length}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sidibe-studio-taches-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
