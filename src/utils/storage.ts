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
    const parsed: Project[] = JSON.parse(raw);
    // Sanitize: force XOF and if currency was € or legacy non-XOF, ensure budget is 0
    const migrated = parsed.map((p) => {
      const hadEuro = p.currency === '€' || !p.currency || p.currency === 'EUR';
      return {
        ...p,
        currency: 'XOF',
        budget: hadEuro ? 0 : (typeof p.budget === 'number' ? p.budget : 0),
      };
    });
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

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
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
