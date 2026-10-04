import { Task, Project, CalculatedUrgency } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysDifference(targetDateStr: string, fromDateStr = getTodayDateString()): number {
  if (!targetDateStr) return 999;
  const target = parseDate(targetDateStr);
  const from = parseDate(fromDateStr);
  const diffTime = target.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcul intelligent de l'urgence et de la priorité automatique
 * Retourne un score de 0 à 100, un niveau (Critique, Haute, Modérée, Faible) et la raison explicative.
 */
export function calculateTaskUrgency(task: Task, project?: Project): CalculatedUrgency {
  if (task.status === 'Terminé') {
    return {
      score: 0,
      level: 'Faible',
      badgeColor: 'text-zinc-500 bg-zinc-800/40 border-zinc-700/40',
      reason: 'Tâche complétée',
      daysRemaining: 0,
      isOverdue: false,
      isDueToday: false,
    };
  }

  const todayStr = getTodayDateString();
  const daysDiff = getDaysDifference(task.dueDate, todayStr);
  const isOverdue = daysDiff < 0;
  const isDueToday = daysDiff === 0;

  let baseScore = 50;
  let reason = '';

  // 1. Facteur Deadline
  if (isOverdue) {
    const overdueDays = Math.abs(daysDiff);
    baseScore = 90 + Math.min(overdueDays * 2, 10); // 92 à 100
    reason = `En retard de ${overdueDays} jour${overdueDays > 1 ? 's' : ''}`;
  } else if (isDueToday) {
    baseScore = 88;
    reason = `Échéance aujourd'hui !`;
  } else if (daysDiff === 1) {
    baseScore = 78;
    reason = `Échéance demain`;
  } else if (daysDiff <= 3) {
    baseScore = 68;
    reason = `Livraison dans ${daysDiff} jours`;
  } else if (daysDiff <= 7) {
    baseScore = 52;
    reason = `Dans la semaine (${daysDiff} j)`;
  } else {
    baseScore = 30;
    reason = `Échéance dans ${daysDiff} jours`;
  }

  // 2. Facteur Priorité manuelle
  if (task.priority === 'Urgente') baseScore += 12;
  else if (task.priority === 'Haute') baseScore += 6;
  else if (task.priority === 'Basse') baseScore -= 10;

  // 3. Facteur Statut du workflow
  if (task.status === 'En révision') {
    baseScore += 8;
    reason = `Retour client en cours de révision (${reason})`;
  } else if (task.status === 'En attente de validation client') {
    // Si en attente depuis plusieurs jours, alerte de relance
    if (task.clientValidationRequestedDate) {
      const waitDays = Math.abs(getDaysDifference(task.clientValidationRequestedDate, todayStr));
      if (waitDays >= 2) {
        baseScore += 5;
        reason = `Relance client requise (en attente depuis ${waitDays} j)`;
      }
    }
  }

  // 4. Alignement avec la deadline du projet parent
  if (project && project.deadline) {
    const projectDaysDiff = getDaysDifference(project.deadline, todayStr);
    if (projectDaysDiff <= 2 && projectDaysDiff >= 0) {
      baseScore += 6;
    }
  }

  // Normalisation du score
  const finalScore = Math.min(100, Math.max(1, Math.round(baseScore)));

  // Détermination du niveau
  let level: CalculatedUrgency['level'] = 'Modérée';
  let badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';

  if (finalScore >= 85 || isOverdue) {
    level = 'Critique';
    badgeColor = 'text-rose-400 bg-rose-950/50 border-rose-800/50';
  } else if (finalScore >= 70 || isDueToday) {
    level = 'Haute';
    badgeColor = 'text-orange-400 bg-orange-950/40 border-orange-800/40';
  } else if (finalScore >= 40) {
    level = 'Modérée';
    badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
  } else {
    level = 'Faible';
    badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
  }

  return {
    score: finalScore,
    level,
    badgeColor,
    reason,
    daysRemaining: daysDiff,
    isOverdue,
    isDueToday,
  };
}

/**
 * Calcule le pourcentage de progression d'un projet basé sur ses tâches
 */
export function calculateProjectProgress(tasks: Task[]): {
  percent: number;
  completedTasks: number;
  totalTasks: number;
  inProgressTasks: number;
  waitingTasks: number;
} {
  if (tasks.length === 0) {
    return {
      percent: 0,
      completedTasks: 0,
      totalTasks: 0,
      inProgressTasks: 0,
      waitingTasks: 0,
    };
  }

  const completed = tasks.filter((t) => t.status === 'Terminé').length;
  const inProgress = tasks.filter((t) => t.status === 'En cours' || t.status === 'En révision').length;
  const waiting = tasks.filter((t) => t.status === 'En attente de validation client').length;

  const percent = Math.round((completed / tasks.length) * 100);

  return {
    percent,
    completedTasks: completed,
    totalTasks: tasks.length,
    inProgressTasks: inProgress,
    waitingTasks: waiting,
  };
}
