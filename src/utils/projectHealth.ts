import { Project, Task } from '../types';
import { calculateProjectProgress, getDaysDifference, getTodayDateString } from './urgencyCalculator';

export type ProjectHealthLevel = 'Excellent' | 'Attention' | 'Risque' | 'Bloqué';

export interface ProjectHealth {
  score: number;
  level: ProjectHealthLevel;
  overdueTasks: number;
  validationTasks: number;
  daysToDeadline: number;
}

export function calculateProjectHealth(project: Project, tasks: Task[], today = getTodayDateString()): ProjectHealth {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const progress = calculateProjectProgress(projectTasks);
  const overdueTasks = projectTasks.filter((task) => task.status !== 'Terminé' && task.dueDate < today).length;
  const validationTasks = projectTasks.filter((task) => task.status === 'En attente de validation client').length;
  const daysToDeadline = getDaysDifference(project.deadline, today);
  const deadlineRisk = daysToDeadline < 0 ? 2 : daysToDeadline <= 2 ? 1 : 0;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (progress.totalTasks > 0 ? progress.completedTasks / progress.totalTasks : 0) * 100 -
          overdueTasks * 20 -
          validationTasks * 8 -
          deadlineRisk * 15
      )
    )
  );

  const level: ProjectHealthLevel =
    score >= 75 ? 'Excellent' : score >= 50 ? 'Attention' : score >= 25 ? 'Risque' : 'Bloqué';

  return { score, level, overdueTasks, validationTasks, daysToDeadline };
}
