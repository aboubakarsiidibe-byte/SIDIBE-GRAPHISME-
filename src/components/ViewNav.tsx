import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  AlertTriangle,
  CalendarRange,
  Calendar,
  BarChart3,
  TrendingUp,
  Kanban,
  Table2,
  FileBarChart,
  FileText,
  Layers,
} from 'lucide-react';
import { ActiveView, Task, Project } from '../types';
import { calculateTaskUrgency } from '../utils/urgencyCalculator';

interface ViewNavProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  tasks: Task[];
  projects: Project[];
  proformasCount?: number;
  primaryColor?: string;
}

export const ViewNav: React.FC<ViewNavProps> = ({
  activeView,
  onViewChange,
  tasks,
  projects,
  proformasCount = 0,
  primaryColor = '#f59e0b',
}) => {
  // Counts
  const todayTasksCount = tasks.filter((t) => {
    if (t.status === 'Terminé') return false;
    const urgency = calculateTaskUrgency(t);
    return urgency.isDueToday;
  }).length;

  const overdueTasksCount = tasks.filter((t) => {
    if (t.status === 'Terminé') return false;
    const urgency = calculateTaskUrgency(t);
    return urgency.isOverdue;
  }).length;

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'graphic-tools',
      label: 'Outils Graphiques',
      icon: Layers,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'billing',
      label: 'Facturation (Devis & Reçus)',
      icon: FileText,
      count: proformasCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'today',
      label: "Aujourd'hui",
      icon: CalendarCheck,
      count: todayTasksCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'overdue',
      label: 'En retard',
      icon: AlertTriangle,
      count: overdueTasksCount,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
    },
    {
      id: 'week',
      label: 'Cette semaine',
      icon: CalendarRange,
    },
    {
      id: 'calendar',
      label: 'Calendrier deadlines',
      icon: Calendar,
    },
    {
      id: 'workload',
      label: 'Charge de travail',
      icon: BarChart3,
    },
    {
      id: 'projects',
      label: 'Progression projets',
      icon: TrendingUp,
      count: projects.length,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'kanban',
      label: 'Kanban statut',
      icon: Kanban,
    },
    {
      id: 'table',
      label: 'Table AgentDB',
      icon: Table2,
    },
    {
      id: 'reports',
      label: 'Rapports AgentDB',
      icon: FileBarChart,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/50 px-4 lg:px-8 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span style={{ color: isActive ? primaryColor : undefined }}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                    item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
