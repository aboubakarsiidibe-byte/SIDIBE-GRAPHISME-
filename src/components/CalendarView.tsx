import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { getTodayDateString, parseDate } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  Plus,
  Filter,
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onEditProject: (project: Project) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onEditProject,
  onOpenNewTaskWithDate,
}) => {
  const todayStr = getTodayDateString();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedDayTasks, setSelectedDayTasks] = useState<{
    dateStr: string;
    tasks: Task[];
    projectDeadlines: Project[];
  } | null>(null);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId === selectedProjectId);

  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter((p) => p.id === selectedProjectId);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = parseDate(todayStr);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Build calendar matrix (Monday to Sunday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Monday = 0, Sunday = 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Échéancier Visuel</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Surveillez les dates de livraison des projets et l'échéance des livrables
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
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

          {/* Month Navigation */}
          <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold text-zinc-200 hover:text-white cursor-pointer"
            >
              Aujourd'hui
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/90 text-center text-xs font-bold text-zinc-400 py-3">
          <span>LUN</span>
          <span>MAR</span>
          <span>MER</span>
          <span>JEU</span>
          <span>VEN</span>
          <span className="text-zinc-500">SAM</span>
          <span className="text-zinc-500">DIM</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-800/80 bg-zinc-950/40">
          {Array.from({ length: totalCells }).map((_, index) => {
            const dayNumber = index - firstDayIndex + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

            if (!isCurrentMonth) {
              return (
                <div
                  key={index}
                  className="min-h-[105px] p-2 bg-zinc-950/80 text-zinc-700 text-xs"
                />
              );
            }

            const mStr = String(currentMonth + 1).padStart(2, '0');
            const dStr = String(dayNumber).padStart(2, '0');
            const cellDateStr = `${currentYear}-${mStr}-${dStr}`;
            const isToday = cellDateStr === todayStr;

            // Events on this date
            const cellTasks = filteredTasks.filter((t) => t.dueDate === cellDateStr);
            const cellProjectDeadlines = filteredProjects.filter((p) => p.deadline === cellDateStr);

            return (
              <div
                key={index}
                onClick={() => {
                  if (cellTasks.length > 0 || cellProjectDeadlines.length > 0) {
                    setSelectedDayTasks({
                      dateStr: cellDateStr,
                      tasks: cellTasks,
                      projectDeadlines: cellProjectDeadlines,
                    });
                  }
                }}
                className={`min-h-[105px] p-2 transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isToday
                    ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/40'
                    : 'hover:bg-zinc-900/80'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-amber-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-300'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewTaskWithDate(cellDateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-opacity"
                    title={`Ajouter tâche le ${cellDateStr}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Badges / Items */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {/* Project Deadlines */}
                  {cellProjectDeadlines.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(proj);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 truncate flex items-center gap-1 hover:brightness-120"
                      title={`Deadline Projet: ${proj.name}`}
                    >
                      <Briefcase className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                  ))}

                  {/* Tasks */}
                  {cellTasks.slice(0, 2).map((t) => {
                    const p = projectMap.get(t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(t);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1 transition-all ${
                          t.status === 'Terminé'
                            ? 'bg-zinc-900 text-zinc-500 line-through'
                            : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: p?.colorTag || '#71717a' }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}

                  {cellTasks.length > 2 && (
                    <div className="text-[9px] font-semibold text-zinc-500 text-center">
                      +{cellTasks.length - 2} autre(s)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Modal */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Échéances du {selectedDayTasks.dateStr}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedDayTasks.tasks.length} tâche(s) • {selectedDayTasks.projectDeadlines.length} livraison(s) projet
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTasks(null)}
                className="text-zinc-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Project Deliveries */}
            {selectedDayTasks.projectDeadlines.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Livrables Finaux Projets
                </div>
                {selectedDayTasks.projectDeadlines.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedDayTasks(null);
                      onEditProject(proj);
                    }}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:bg-amber-500/20"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{proj.name}</div>
                      <div className="text-xs text-zinc-400">{proj.client} • {proj.budget} €</div>
                    </div>
                    <span className="text-xs font-semibold text-amber-300">Voir Projet →</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Tâches du jour
              </div>
              {selectedDayTasks.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedDayTasks(null);
                    onEditTask(task);
                  }}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-200 hover:text-amber-400">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {task.estimatedHours}h estimées • Statut: {task.status}
                    </div>
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  const date = selectedDayTasks.dateStr;
                  setSelectedDayTasks(null);
                  onOpenNewTaskWithDate(date);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                + Ajouter une tâche à cette date
              </button>
              <button
                onClick={() => setSelectedDayTasks(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
