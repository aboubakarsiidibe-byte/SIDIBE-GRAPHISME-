import React from 'react';
import {
  Menu,
  Sparkles,
  Flame,
  CheckCircle2,
  Briefcase,
  Plus,
  FolderPlus,
  LayoutDashboard,
  Layers,
  FileText,
  CalendarCheck,
  AlertTriangle,
  CalendarRange,
  Calendar,
  BarChart3,
  TrendingUp,
  Kanban,
  Table2,
  FileBarChart,
  User as UserIcon,
  ShieldCheck,
  Lock,
  KeyRound,
  Image as ImageIcon,
} from 'lucide-react';
import { ActiveView, Project, Task, Workspace, User } from '../types';
import { calculateTaskUrgency } from '../utils/urgencyCalculator';

interface TopHeaderProps {
  activeView: ActiveView;
  projects: Project[];
  tasks: Task[];
  activeWorkspace: Workspace;
  currentUser: User | null;
  onOpenMobileSidebar: () => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenLogoModal?: () => void;
  onOpenPhotoshopDirect?: () => void;
  onOpenSecurityPrivacy?: () => void;
  onLockStudio?: () => void;
  onNavigateToAppAccounts?: () => void;
}

const viewMeta: Record<ActiveView, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  dashboard: { label: 'Tableau de bord', icon: LayoutDashboard },
  'graphic-tools': { label: 'Studio Graphique & Maquettes', icon: Layers },
  'app-accounts': { label: 'Comptes & Connexions Apps', icon: KeyRound },
  billing: { label: 'Facturation & Devis CFA', icon: FileText },
  today: { label: "Tâches d'aujourd'hui", icon: CalendarCheck },
  overdue: { label: 'Tâches en retard', icon: AlertTriangle },
  week: { label: 'Planning de la semaine', icon: CalendarRange },
  calendar: { label: 'Calendrier des deadlines', icon: Calendar },
  workload: { label: 'Charge de travail', icon: BarChart3 },
  projects: { label: 'Progression des projets', icon: TrendingUp },
  kanban: { label: 'Tableau Kanban', icon: Kanban },
  table: { label: 'Table de données AgentDB', icon: Table2 },
  reports: { label: 'Rapports & Statistiques', icon: FileBarChart },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  projects,
  tasks,
  activeWorkspace,
  currentUser,
  onOpenMobileSidebar,
  onOpenNewTask,
  onOpenNewProject,
  onOpenLogoModal,
  onOpenPhotoshopDirect,
  onOpenSecurityPrivacy,
  onLockStudio,
  onNavigateToAppAccounts,
}) => {
  const currentViewInfo = viewMeta[activeView] || { label: 'Workspace', icon: LayoutDashboard };
  const ViewIcon = currentViewInfo.icon;

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const urgentTasksCount = tasks.filter((t) => {
    if (t.status === 'Terminé') return false;
    const urgency = calculateTaskUrgency(t);
    return urgency.isOverdue || urgency.isDueToday || urgency.level === 'Critique';
  }).length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Terminé').length;

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-4 lg:px-8 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & breadcrumbs / view title */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            title="Ouvrir toutes les options"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="p-1.5 rounded-lg shrink-0"
              style={{
                backgroundColor: `${activeWorkspace.palette.primary}20`,
                color: activeWorkspace.palette.primary,
              }}
            >
              <ViewIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                <span className="max-w-[22vw] truncate sm:max-w-none">{activeWorkspace.name}</span>
                <span>/</span>
                <span className="text-zinc-400">Options</span>
              </div>
              <h1 className="max-w-[42vw] truncate text-sm md:text-base font-bold text-white tracking-tight leading-none">
                {currentViewInfo.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Quick Studio Metrics & Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 sm:gap-3">
          {/* Quick Metrics (hidden on very small screens) */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-zinc-900/60 border border-zinc-800/70 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Budget:{' '}
                <strong className="text-zinc-200">
                  {totalBudget.toLocaleString('fr-FR')} {activeWorkspace.currency}
                </strong>
              </span>
            </div>

            <div className="w-px h-3 bg-zinc-800" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Urgences:{' '}
                <strong className={urgentTasksCount > 0 ? 'text-amber-400 font-bold' : 'text-zinc-200'}>
                  {urgentTasksCount}
                </strong>
              </span>
            </div>

            <div className="w-px h-3 bg-zinc-800" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Terminées:{' '}
                <strong className="text-emerald-400">{completedTasksCount}</strong>
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {onOpenLogoModal && (
              <button
                onClick={onOpenLogoModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
                title="Insérer ou modifier le logo du Studio"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">{activeWorkspace.logoUrl ? 'Logo Studio ✓' : 'Insérer Logo'}</span>
              </button>
            )}

            {onNavigateToAppAccounts && (
              <button
                onClick={onNavigateToAppAccounts}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all active:scale-95 cursor-pointer"
                title="Espace Connexion Logiciels & Comptes Créatifs (Photoshop, Figma, Canva...)"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Comptes & Apps</span>
              </button>
            )}

            {onOpenPhotoshopDirect && (
              <button
                onClick={onOpenPhotoshopDirect}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#31A8FF]/15 hover:bg-[#31A8FF]/25 text-[#31A8FF] font-bold text-xs border border-[#31A8FF]/30 transition-all active:scale-95 cursor-pointer"
                title="Connexion directe avec Adobe Photoshop sur votre PC"
              >
                <span className="w-4 h-4 rounded bg-[#31A8FF] text-white flex items-center justify-center font-black text-[9px] leading-none shrink-0">
                  Ps
                </span>
                <span className="hidden sm:inline">Photoshop PC</span>
              </button>
            )}

            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-zinc-950 shadow-sm active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: activeWorkspace.palette.primary }}
              title="Ajouter une nouvelle tâche"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Tâche</span>
            </button>

            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95 cursor-pointer"
              title="Créer un nouveau projet"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Projet</span>
            </button>

            {onOpenSecurityPrivacy && (
              <button
                onClick={onOpenSecurityPrivacy}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer"
                title="Sécurité, Anti-Piratage & Protection des mots de passe"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {onLockStudio && (
              <button
                onClick={onLockStudio}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer"
                title="Verrouiller l'écran du Studio (Mot de passe requis)"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
