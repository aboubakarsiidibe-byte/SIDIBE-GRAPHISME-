import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { getTodayDateString, parseDate, calculateTaskUrgency } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface WeekViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onUpdateTaskStatus,
  onOpenNewTaskWithDate,
}) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const todayStr = getTodayDateString();

  // Compute start of week (Monday)
  const getWeekDays = (offset: number) => {
    const today = parseDate(todayStr);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + offset * 7);

    const days = [];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dateNum}`;

      days.push({
        name: dayNames[i],
        dateStr,
        dayNumber: d.getDate(),
        monthNumber: d.getMonth() + 1,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(weekOffset);
  const startDay = weekDays[0];
  const endDay = weekDays[6];

  // Total week hours
  const allWeekTasks = tasks.filter((t) =>
    weekDays.some((d) => d.dateStr === t.dueDate)
  );
  const totalWeekHours = allWeekTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const completedWeekTasks = allWeekTasks.filter((t) => t.status === 'Terminé').length;

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <CalendarRange className="w-4 h-4" />
            <span>Vue Hebdomadaire & Planning</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Semaine du {startDay.dayNumber}/{startDay.monthNumber} au {endDay.dayNumber}/{endDay.monthNumber}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {allWeekTasks.length} tâche(s) réparties • {totalWeekHours}h de charge estimée • {completedWeekTasks} complétée(s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-800 rounded-lg p-1 border border-zinc-700">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title="Semaine précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-semibold text-zinc-200 hover:text-white cursor-pointer"
            >
              Semaine en cours
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title="Semaine suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid (7 days) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.dateStr);
          const dayHours = dayTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
          const isWeekend = day.name === 'Samedi' || day.name === 'Dimanche';

          return (
            <div
              key={day.dateStr}
              className={`rounded-xl border flex flex-col min-h-[350px] transition-all ${
                day.isToday
                  ? 'bg-zinc-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : isWeekend
                  ? 'bg-zinc-950/40 border-zinc-800/50'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  day.isToday
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <div>
                  <div
                    className={`text-xs font-bold ${
                      day.isToday ? 'text-amber-300' : 'text-zinc-300'
                    }`}
                  >
                    {day.name}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {day.dayNumber} {day.dateStr.split('-')[1]}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      dayHours > 7
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {dayHours}h
                  </span>
                  <button
                    onClick={() => onOpenNewTaskWithDate(day.dateStr)}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 cursor-pointer"
                    title={`Ajouter une tâche le ${day.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Tasks List */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-[11px] text-zinc-600">Aucune tâche</span>
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    const urgency = calculateTaskUrgency(task, project);
                    const isDone = task.status === 'Terminé';

                    return (
                      <div
                        key={task.id}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          isDone
                            ? 'bg-zinc-950/40 border-zinc-800/40 opacity-50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <UrgencyBadge urgency={urgency} showScore={false} />
                          <button
                            onClick={() =>
                              onUpdateTaskStatus(task.id, isDone ? 'À faire' : 'Terminé')
                            }
                            className="text-zinc-500 hover:text-emerald-400 cursor-pointer"
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                isDone ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        </div>

                        <div
                          onClick={() => onEditTask(task)}
                          className={`font-semibold cursor-pointer truncate ${
                            isDone ? 'line-through text-zinc-500' : 'text-zinc-200 hover:text-amber-300'
                          }`}
                        >
                          {task.title}
                        </div>

                        {project && (
                          <div
                            className="text-[10px] truncate mt-1"
                            style={{ color: project.colorTag }}
                          >
                            {project.name}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-800 text-[10px] text-zinc-400">
                          <span>{task.estimatedHours}h</span>
                          <span className="truncate max-w-[80px]">{task.status}</span>
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
    </div>
  );
};
