import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { calculateTaskUrgency } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import confetti from 'canvas-confetti';
import {
  Kanban as KanbanIcon,
  Plus,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Filter,
  Flame,
  CheckSquare,
  Square,
  MessageSquare,
} from 'lucide-react';
import { ClientFollowUpModal } from './ClientFollowUpModal';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onUpdateTaskStatus,
  onToggleSubtask,
  onOpenNewTaskWithStatus,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTaskForRelance, setSelectedTaskForRelance] = useState<Task | null>(null);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const COLUMNS: Array<{
    status: TaskStatus;
    label: string;
    color: string;
    borderTopColor: string;
    dotColor: string;
  }> = [
    {
      status: 'À faire',
      label: 'À faire',
      color: 'text-zinc-300',
      borderTopColor: 'border-t-zinc-500',
      dotColor: 'bg-zinc-400',
    },
    {
      status: 'En cours',
      label: 'En cours',
      color: 'text-blue-400',
      borderTopColor: 'border-t-blue-500',
      dotColor: 'bg-blue-400 animate-pulse',
    },
    {
      status: 'En attente de validation client',
      label: 'En attente client',
      color: 'text-amber-400',
      borderTopColor: 'border-t-amber-500',
      dotColor: 'bg-amber-400',
    },
    {
      status: 'En révision',
      label: 'En révision',
      color: 'text-purple-400',
      borderTopColor: 'border-t-purple-500',
      dotColor: 'bg-purple-400',
    },
    {
      status: 'Terminé',
      label: 'Terminé',
      color: 'text-emerald-400',
      borderTopColor: 'border-t-emerald-500',
      dotColor: 'bg-emerald-400',
    },
  ];

  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId === selectedProjectId);

  const handleMoveStatus = (taskId: string, currentStatus: TaskStatus, direction: 'next' | 'prev') => {
    const statuses: TaskStatus[] = [
      'À faire',
      'En cours',
      'En attente de validation client',
      'En révision',
      'Terminé',
    ];
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const nextStatus = statuses[nextIndex];
      onUpdateTaskStatus(taskId, nextStatus);

      if (nextStatus === 'Terminé') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <KanbanIcon className="w-4 h-4" />
            <span>Workflow Graphique</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Kanban par Statut
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            5 colonnes de production adaptées au studio créatif avec calcul d'urgence en direct.
          </p>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">Tous les projets</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col, colIndex) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          const colHours = colTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

          return (
            <div
              key={col.status}
              className={`bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col min-h-[500px] border-t-4 ${col.borderTopColor} shadow-md`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="font-bold text-xs text-zinc-200">
                    {col.label}
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {colHours}h
                  </span>
                  <button
                    onClick={() => onOpenNewTaskWithStatus(col.status)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title={`Ajouter tâche en "${col.status}"`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]">
                {colTasks.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-center p-4">
                    <span className="text-xs text-zinc-600">Aucune tâche</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    const urgency = calculateTaskUrgency(task, project);
                    const isDone = task.status === 'Terminé';

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all shadow-xs ${
                          isDone
                            ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-sm'
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                          <UrgencyBadge urgency={urgency} showScore={false} />
                          {project && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full border truncate max-w-[120px]"
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

                        {/* Title */}
                        <h4
                          onClick={() => onEditTask(task)}
                          className={`text-xs font-bold cursor-pointer transition-colors leading-snug ${
                            isDone ? 'line-through text-zinc-500' : 'text-zinc-100 hover:text-amber-300'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Subtasks snippet */}
                        {task.subtasks.length > 0 && (
                          <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1.5">
                            <span className="font-semibold">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                            <span>étapes validées</span>
                          </div>
                        )}

                        {/* Relance client shortcut */}
                        {task.status === 'En attente de validation client' && (
                          <button
                            onClick={() => setSelectedTaskForRelance(task)}
                            className="mt-2 w-full py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Relancer le client</span>
                          </button>
                        )}

                        {/* Bottom Row: Due date, Hours, Directional arrows */}
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className={urgency.isOverdue ? 'text-rose-400 font-bold' : ''}>
                              {task.dueDate.split('-').slice(1).join('/')}
                            </span>
                            <span>• {task.estimatedHours}h</span>
                          </div>

                          {/* Fast move buttons */}
                          <div className="flex items-center gap-1">
                            {colIndex > 0 && (
                              <button
                                onClick={() => handleMoveStatus(task.id, task.status, 'prev')}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                                title="Reculer statut"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {colIndex < COLUMNS.length - 1 && (
                              <button
                                onClick={() => handleMoveStatus(task.id, task.status, 'next')}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                                title="Avancer statut"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Relance Modal */}
      {selectedTaskForRelance && (
        <ClientFollowUpModal
          task={selectedTaskForRelance}
          project={projectMap.get(selectedTaskForRelance.projectId)}
          onClose={() => setSelectedTaskForRelance(null)}
        />
      )}
    </div>
  );
};
