import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { calculateTaskUrgency, getTodayDateString, parseDate } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { ClientFollowUpModal } from './ClientFollowUpModal';
import {
  AlertTriangle,
  Flame,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Send,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface OverdueViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onUpdateTaskDueDate: (taskId: string, newDueDate: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onUpdateTaskDueDate,
  onUpdateTaskStatus,
}) => {
  const [selectedTaskForFollowUp, setSelectedTaskForFollowUp] = useState<Task | null>(null);
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const todayStr = getTodayDateString();

  // Filter overdue pending tasks
  const overdueTasks = tasks
    .filter((t) => t.status !== 'Terminé' && t.dueDate < todayStr)
    .map((task) => {
      const project = projectMap.get(task.projectId);
      const urgency = calculateTaskUrgency(task, project);
      return { task, project, urgency };
    })
    .sort((a, b) => b.urgency.score - a.urgency.score);

  // Projects overdue
  const overdueProjects = projects.filter((p) => p.deadline < todayStr && !p.archived);

  const handlePostponeDays = (taskId: string, currentDueDate: string, addDays: number) => {
    const cur = parseDate(currentDueDate);
    cur.setDate(cur.getDate() + addDays);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    onUpdateTaskDueDate(taskId, `${y}-${m}-${d}`);
  };

  const handleSetToday = (taskId: string) => {
    onUpdateTaskDueDate(taskId, todayStr);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/50 via-zinc-900 to-zinc-900 border border-rose-900/40 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>Gestion des Retards & Alertes Prioritaires</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Tâches et Livrables en Retard
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            {overdueTasks.length} tâche(s) nécessitant une régularisation, un report d'échéance ou une relance client.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          Algorithme d'urgence : Score max 100/100
        </div>
      </div>

      {/* Overdue Projects Notice */}
      {overdueProjects.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>{overdueProjects.length} Projet(s) dont la deadline globale est dépassée</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {overdueProjects.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-lg bg-zinc-900/90 border border-rose-900/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-200">{p.name}</div>
                  <div className="text-zinc-400">{p.client} • Échéance : {p.deadline}</div>
                </div>
                <span className="text-[11px] font-mono text-rose-400 font-bold">
                  Budget : {p.budget} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Task List */}
      {overdueTasks.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Aucun retard détecté !</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
            Félicitations, toutes les tâches et livrables de SIDIBE STUDIO sont à jour ou dans les temps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueTasks.map(({ task, project, urgency }) => {
            const overdueDays = Math.abs(urgency.daysRemaining);

            return (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-zinc-900/90 border border-rose-900/40 hover:border-rose-700/60 shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500 text-white shadow-xs">
                        <Clock className="w-3 h-3" />
                        Retard : +{overdueDays} jour{overdueDays > 1 ? 's' : ''}
                      </span>
                      <UrgencyBadge urgency={urgency} />
                      <StatusBadge status={task.status} size="sm" />
                      {project && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border truncate"
                          style={{
                            borderColor: `${project.colorTag}40`,
                            backgroundColor: `${project.colorTag}15`,
                            color: project.colorTag,
                          }}
                        >
                          {project.name}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onEditTask(task)}
                      className="text-base font-bold text-zinc-100 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                      <span>Date initiale : <strong className="text-zinc-300">{task.dueDate}</strong></span>
                      <span>•</span>
                      <span>Charge : {task.estimatedHours}h</span>
                      {project && (
                        <>
                          <span>•</span>
                          <span>Client : {project.client}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions to recover delay */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                    {/* Relance client */}
                    {task.status === 'En attente de validation client' && (
                      <button
                        onClick={() => setSelectedTaskForFollowUp(task)}
                        className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Relancer client</span>
                      </button>
                    )}

                    {/* Postpone to today */}
                    <button
                      onClick={() => handleSetToday(task.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer"
                      title="Reprogrammer pour aujourd'hui"
                    >
                      Mettre à aujourd'hui
                    </button>

                    {/* Postpone +2 days */}
                    <button
                      onClick={() => handlePostponeDays(task.id, task.dueDate, 2)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer"
                      title="Reporter de 2 jours"
                    >
                      +2 jours
                    </button>

                    {/* Postpone +7 days */}
                    <button
                      onClick={() => handlePostponeDays(task.id, task.dueDate, 7)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer"
                      title="Reporter d'une semaine"
                    >
                      +1 semaine
                    </button>

                    {/* Fast Complete */}
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'Terminé')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terminer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client follow-up modal */}
      {selectedTaskForFollowUp && (
        <ClientFollowUpModal
          task={selectedTaskForFollowUp}
          project={projectMap.get(selectedTaskForFollowUp.projectId)}
          onClose={() => setSelectedTaskForFollowUp(null)}
        />
      )}
    </div>
  );
};
