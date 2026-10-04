import React, { useState } from 'react';
import { Project, Task, ProjectType } from '../types';
import { getTodayDateString, parseDate } from '../utils/urgencyCalculator';
import {
  BarChart3,
  Clock,
  AlertTriangle,
  Zap,
  CheckCircle,
  Briefcase,
  PieChart,
} from 'lucide-react';

interface WorkloadViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({
  tasks,
  projects,
  onEditTask,
}) => {
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState<number>(35);
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const todayStr = getTodayDateString();

  // Pending tasks workload
  const pendingTasks = tasks.filter((t) => t.status !== 'Terminé');
  const totalPendingHours = pendingTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'Terminé');
  const totalCompletedHours = completedTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  // Group by project
  const workloadByProject = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id && t.status !== 'Terminé');
    const hours = pTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    return {
      project: p,
      hours,
      taskCount: pTasks.length,
    };
  }).filter((item) => item.hours > 0).sort((a, b) => b.hours - a.hours);

  // Group by project type
  const workloadByType: Record<string, number> = {};
  pendingTasks.forEach((t) => {
    const p = projectMap.get(t.projectId);
    const type = p ? p.type : 'Studio interne';
    workloadByType[type] = (workloadByType[type] || 0) + (t.estimatedHours || 0);
  });

  // Calculate this week's hours
  const today = parseDate(todayStr);
  const dayOfWeek = today.getDay();
  const distToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distToMon);

  const weekDayHours: Array<{ dateStr: string; dayName: string; hours: number; tasks: Task[] }> = [];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  let currentWeekTotalHours = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayN = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayN}`;

    const dTasks = tasks.filter((t) => t.dueDate === dateStr && t.status !== 'Terminé');
    const h = dTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    currentWeekTotalHours += h;

    weekDayHours.push({
      dateStr,
      dayName: dayNames[i],
      hours: h,
      tasks: dTasks,
    });
  }

  const weekSaturationPercent = Math.min(100, Math.round((currentWeekTotalHours / weeklyCapacityHours) * 100));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Capacité & Gestion de la Charge</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Charge de Travail par Période
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Surveillez le volume d'heures estimées, évitez la surcharge et répartissez équitablement l'effort studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-zinc-400">Capacité hebdo cible :</span>
            <input
              type="number"
              min="10"
              max="70"
              value={weeklyCapacityHours}
              onChange={(e) => setWeeklyCapacityHours(Number(e.target.value) || 35)}
              className="w-12 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-center text-white font-bold"
            />
            <span className="text-zinc-400">h</span>
          </div>
        </div>
      </div>

      {/* Capacity Overview Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
              Charge de la Semaine en Cours
            </div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
              <span>{currentWeekTotalHours}h planifiées</span>
              <span className="text-xs font-normal text-zinc-400">/ {weeklyCapacityHours}h de capacité disponible</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {weekSaturationPercent > 90 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Semaine proche de saturation ({weekSaturationPercent}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Rythme optimal ({weekSaturationPercent}%)
              </span>
            )}
          </div>
        </div>

        {/* Progress gauge */}
        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              weekSaturationPercent > 100
                ? 'bg-rose-500'
                : weekSaturationPercent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, weekSaturationPercent)}%` }}
          />
        </div>
      </div>

      {/* Daily Breakdown for this week */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Répartition Quotidienne de la Semaine
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDayHours.map((d) => {
            const isHeavy = d.hours >= 7;
            const barHeight = Math.min(100, (d.hours / 8) * 100);

            return (
              <div
                key={d.dateStr}
                className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-300">{d.dayName}</span>
                    <span className="text-[11px] text-zinc-500">{d.dateStr.split('-').slice(1).join('/')}</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {d.hours}h
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {d.tasks.length} tâche(s)
                  </div>
                </div>

                {/* Vertical visual bar indicator */}
                <div className="mt-3 pt-2 border-t border-zinc-800">
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHeavy ? 'bg-rose-500' : d.hours > 0 ? 'bg-amber-400' : 'bg-transparent'
                      }`}
                      style={{ width: `${barHeight}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution by Project & Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Project */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            Charge par Projet Actif
          </h3>

          <div className="space-y-3.5">
            {workloadByProject.map(({ project, hours, taskCount }) => {
              const projectShare = totalPendingHours > 0 ? Math.round((hours / totalPendingHours) * 100) : 0;
              return (
                <div key={project.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200 truncate">
                      {project.name}
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {hours}h ({projectShare}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${projectShare}%`,
                        backgroundColor: project.colorTag || '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Charge par Typologie de Design
          </h3>

          <div className="space-y-3.5">
            {Object.entries(workloadByType).map(([type, hours]) => {
              const share = totalPendingHours > 0 ? Math.round((hours / totalPendingHours) * 100) : 0;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">{type}</span>
                    <span className="font-mono text-zinc-300 font-bold">{hours}h ({share}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
