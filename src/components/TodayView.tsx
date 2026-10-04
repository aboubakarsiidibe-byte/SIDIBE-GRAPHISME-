import React from 'react';
import { Project, Task, TaskStatus } from '../types';
import { calculateTaskUrgency, getTodayDateString } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  CheckSquare,
  Square,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTask: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onUpdateTaskStatus,
  onToggleSubtask,
  onOpenNewTask,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const todayStr = getTodayDateString();

  // Tasks due today or completed today
  const todayTasks = tasks.filter((t) => {
    return t.dueDate === todayStr;
  });

  // Project deliverables due today
  const projectsDeliveredToday = projects.filter((p) => p.deadline === todayStr);

  const completedToday = todayTasks.filter((t) => t.status === 'Terminé').length;
  const totalHoursToday = todayTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const remainingHours = todayTasks
    .filter((t) => t.status !== 'Terminé')
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const handleComplete = (taskId: string) => {
    onUpdateTaskStatus(taskId, 'Terminé');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-900/30 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Focus Quotidien — {todayStr}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Tâches & Livrables du Jour
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            {todayTasks.length} tâche(s) planifiée(s) aujourd'hui • {totalHoursToday}h de travail estimées ({remainingHours}h restantes)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
            <div className="text-xs text-zinc-400">Complétées</div>
            <div className="text-lg font-bold text-emerald-400">
              {completedToday} / {todayTasks.length}
            </div>
          </div>
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter pour aujourd'hui</span>
          </button>
        </div>
      </div>

      {/* Projects with final delivery deadline today */}
      {projectsDeliveredToday.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                Livrable Final Projet Aujourd'hui
              </div>
              <div className="text-sm font-bold text-white">
                {projectsDeliveredToday.map((p) => p.name).join(' • ')}
              </div>
              <div className="text-xs text-zinc-400">
                Client(s) : {projectsDeliveredToday.map((p) => `${p.client} (${p.budget} €)`).join(', ')}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 shrink-0">
            Deadline Finale
          </span>
        </div>
      )}

      {/* Task List for Today */}
      {todayTasks.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucune tâche prévue aujourd'hui</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            Toutes les échéances du jour sont à jour ou vous n'avez pas de tâches assignées au {todayStr}.
          </p>
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
          >
            Planifier une tâche pour aujourd'hui
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayTasks.map((task) => {
            const project = projectMap.get(task.projectId);
            const urgency = calculateTaskUrgency(task, project);
            const isCompleted = task.status === 'Terminé';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Fast complete toggle button */}
                    <button
                      onClick={() =>
                        onUpdateTaskStatus(task.id, isCompleted ? 'À faire' : 'Terminé')
                      }
                      className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-zinc-600 hover:border-emerald-400 transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UrgencyBadge urgency={urgency} />
                        <StatusBadge
                          status={task.status}
                          size="sm"
                          interactive
                          onClick={() => {
                            const statuses: TaskStatus[] = [
                              'À faire',
                              'En cours',
                              'En attente de validation client',
                              'En révision',
                              'Terminé',
                            ];
                            const next = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];
                            onUpdateTaskStatus(task.id, next);
                          }}
                        />
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
                        className={`text-base font-bold cursor-pointer transition-colors ${
                          isCompleted
                            ? 'line-through text-zinc-500'
                            : 'text-zinc-100 hover:text-amber-400'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks checklist */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-zinc-800/60 space-y-1.5">
                          <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                            <span>Sous-tâches & Étapes</span>
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {task.subtasks.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => onToggleSubtask(task.id, sub.id)}
                                className="flex items-center gap-2 text-left p-1.5 rounded-md hover:bg-zinc-800/60 text-xs transition-colors cursor-pointer"
                              >
                                {sub.completed ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                )}
                                <span
                                  className={
                                    sub.completed
                                      ? 'line-through text-zinc-500'
                                      : 'text-zinc-300'
                                  }
                                >
                                  {sub.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Hours */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {task.estimatedHours}h de studio
                    </span>
                    <button
                      onClick={() => onEditTask(task)}
                      className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                    >
                      Éditer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
