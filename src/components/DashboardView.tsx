import React from 'react';
import {
  Project,
  Task,
  ActiveView,
  TaskStatus,
  Workspace,
  ProformaInvoice,
  PaymentReceipt,
  AppShortcut,
} from '../types';
import {
  calculateTaskUrgency,
  calculateProjectProgress,
} from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Clock,
  TrendingUp,
  FolderOpen,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Receipt,
  Plus,
  Layout,
  Palette,
  Layers,
  Code,
  Folder,
  Globe,
  Terminal,
  Laptop,
  Video,
  Database,
  PhoneCall,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface DashboardViewProps {
  workspace: Workspace;
  projects: Project[];
  tasks: Task[];
  proformas: ProformaInvoice[];
  receipts: PaymentReceipt[];
  onViewChange: (view: ActiveView) => void;
  onEditTask: (task: Task) => void;
  onEditProject: (project: Project) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTask: () => void;
  onOpenNewProforma: () => void;
  onOpenNewReceipt: () => void;
  onOpenAppLauncher: () => void;
  onOpenWorkspaceModal: () => void;
  onOpenPaletteModal: () => void;
}

const SHORTCUT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  figma: Layout,
  illustrator: Palette,
  photoshop: Layers,
  canva: Sparkles,
  github: Code,
  notion: Folder,
  drive: Globe,
  terminal: Terminal,
  video: Video,
  database: Database,
  phonecall: PhoneCall,
  laptop: Laptop,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  projects,
  tasks,
  proformas,
  receipts,
  onViewChange,
  onEditTask,
  onEditProject,
  onToggleSubtask,
  onUpdateTaskStatus,
  onOpenNewTask,
  onOpenNewProforma,
  onOpenNewReceipt,
  onOpenAppLauncher,
  onOpenWorkspaceModal,
  onOpenPaletteModal,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const primaryColor = workspace.palette.primary;
  const visibleWidgets = workspace.dashboardConfig.visibleWidgets;

  // Metrics
  const activeProjects = projects.filter((p) => !p.archived);
  const totalBudget = activeProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const visibleProjects = activeProjects.slice(0, 4);
  const completedTasks = tasks.filter((t) => t.status === 'Terminé');
  const pendingTasks = tasks.filter((t) => t.status !== 'Terminé');

  // Urgency sorted
  const sortedPendingTasks = [...pendingTasks]
    .map((task) => {
      const project = projectMap.get(task.projectId);
      const urgency = calculateTaskUrgency(task, project);
      return { task, project, urgency };
    })
    .sort((a, b) => b.urgency.score - a.urgency.score);

  const criticalTasks = sortedPendingTasks.filter((item) => item.urgency.level === 'Critique');
  const todayTasks = sortedPendingTasks.filter((item) => item.urgency.isDueToday);
  const overdueTasks = sortedPendingTasks.filter((item) => item.urgency.isOverdue);

  // Status breakdown count
  const statusCounts: Record<TaskStatus, number> = {
    'À faire': tasks.filter((t) => t.status === 'À faire').length,
    'En cours': tasks.filter((t) => t.status === 'En cours').length,
    'En attente de validation client': tasks.filter(
      (t) => t.status === 'En attente de validation client'
    ).length,
    'En révision': tasks.filter((t) => t.status === 'En révision').length,
    Terminé: completedTasks.length,
  };

  const globalCompletionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Financial metrics from proformas & receipts
  const totalProformaAmount = proformas.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalCollectedReceipts = receipts.reduce((acc, r) => acc + r.amountPaid, 0);

  const getShortcutIcon = (iconName: string) => {
    const found = SHORTCUT_ICON_MAP[iconName.toLowerCase()];
    return found || Layout;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Domain Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div
          className="absolute right-0 top-0 w-96 h-full pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at top right, ${primaryColor}, transparent 70%)`,
          }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs uppercase font-bold text-zinc-300 tracking-wider">
                Espace Actif : {workspace.domain}
              </span>
              <span className="text-zinc-600">•</span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                Palette : {workspace.palette.name}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>{workspace.name}</span>
              <button
                onClick={onOpenWorkspaceModal}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Personnaliser cet espace de travail"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
              {workspace.tagline} — Gestion des priorités créatives, des factures proforma et reçus
              de paiement en Franc CFA (XOF).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewChange('today')}
              className="px-4 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Aujourd'hui ({todayTasks.length})</span>
            </button>

            <button
              onClick={() => onViewChange('graphic-tools')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-semibold text-xs border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Studio Graphique</span>
            </button>

            <button
              onClick={onOpenNewProforma}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Proforma</span>
            </button>

            <button
              onClick={onOpenNewReceipt}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-semibold text-xs border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Reçu</span>
            </button>
          </div>
        </div>

        {/* Urgent Alert Banner if overdue tasks */}
        {overdueTasks.length > 0 && visibleWidgets.urgencies && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <Flame className="w-4 h-4 shrink-0 text-rose-400 animate-bounce" />
              <span>
                <strong>Attention :</strong> {overdueTasks.length} tâche(s) en retard nécessitant
                une action prioritaire ou relance client.
              </span>
            </div>
            <button
              onClick={() => onViewChange('overdue')}
              className="text-rose-200 font-semibold underline underline-offset-2 hover:text-white shrink-0 cursor-pointer"
            >
              Traiter les retards →
            </button>
          </div>
        )}
      </div>

      {/* APP SHORTCUTS DOCK (ICÔNES D'APPLICATIONS) */}
      {visibleWidgets.appShortcuts && (
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" style={{ color: primaryColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Dock des Applications & Outils Favoris
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                {workspace.appShortcuts.length} apps
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onViewChange('graphic-tools')}
                className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer text-purple-400"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Studio Graphique Pro</span>
              </button>

              <button
                onClick={onOpenAppLauncher}
                className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                style={{ color: primaryColor }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gérer les Icônes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {workspace.appShortcuts.map((app) => {
              const IconComp = getShortcutIcon(app.iconName);
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
                  title={`${app.name} (${app.category})`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform shadow-inner border border-zinc-800"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <span style={{ color: primaryColor }}>
                      <IconComp className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate max-w-full">
                    {app.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-full">
                    {app.category}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {visibleWidgets.kpiFinancial && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Projets Actifs</span>
              <FolderOpen className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {activeProjects.length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
              <span className="font-semibold" style={{ color: primaryColor }}>
                {totalBudget.toLocaleString('fr-FR')} XOF
              </span>
              <span>budgets</span>
            </div>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Devis Proforma Émis</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {totalProformaAmount.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans text-zinc-400">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">{proformas.length} devis au total</div>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Reçus Encaissés (XOF)</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
              {totalCollectedReceipts.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans text-zinc-400">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Wave, MoMo, Espèces, Virement</div>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Taux d'achèvement</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {globalCompletionRate}%
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${globalCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Priority Radar & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Urgent Tasks (Calculated Urgency Engine) */}
        {visibleWidgets.urgencies && (
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: primaryColor }} />
                  Radar d'Urgence Automatique
                </h3>
                <p className="text-xs text-zinc-400">
                  Classement dynamique des livrables selon deadlines critiques et coefficient client
                </p>
              </div>
              <button
                onClick={onOpenNewTask}
                className="text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: primaryColor }}
              >
                + Ajouter tâche
              </button>
            </div>

            <div className="space-y-2.5">
              {sortedPendingTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-zinc-200">Aucune tâche prioritaire</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Votre file de travail est à jour. Ajoutez une tâche quand un nouveau livrable arrive.
                  </p>
                  <button
                    onClick={onOpenNewTask}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-zinc-950 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nouvelle tâche
                  </button>
                </div>
              ) : sortedPendingTasks.slice(0, 5).map(({ task, project, urgency }) => {
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UrgencyBadge urgency={urgency} />
                        <StatusBadge
                          status={task.status}
                          size="sm"
                          interactive
                          onClick={() => {
                            const nextStatus: Record<TaskStatus, TaskStatus> = {
                              'À faire': 'En cours',
                              'En cours': 'En attente de validation client',
                              'En attente de validation client': 'En révision',
                              'En révision': 'Terminé',
                              Terminé: 'À faire',
                            };
                            onUpdateTaskStatus(task.id, nextStatus[task.status]);
                          }}
                        />
                        {project && (
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full border truncate max-w-[200px]"
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

                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          onClick={() => onEditTask(task)}
                          className="text-sm font-semibold text-zinc-100 hover:text-amber-400 transition-colors cursor-pointer truncate"
                        >
                          {task.title}
                        </h4>

                        {task.graphicTool && (
                          <a
                            href={task.graphicTool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
                            title={`Ouvrir dans ${task.graphicTool.tool}`}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>{task.graphicTool.label || task.graphicTool.tool}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          Échéance : <strong className="text-zinc-300">{task.dueDate}</strong>
                        </span>
                        <span>•</span>
                        <span>{task.estimatedHours}h estimées</span>
                        {task.subtasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length} sous-tâches
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onEditTask(task)}
                        className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'Terminé')}
                        className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40 transition-colors cursor-pointer"
                        title="Marquer comme terminé"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>{pendingTasks.length} tâches en cours dans votre espace</span>
              <button
                onClick={() => onViewChange('table')}
                className="font-medium flex items-center gap-1 cursor-pointer hover:underline"
                style={{ color: primaryColor }}
              >
                Voir la table AgentDB complète <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Quick Projects Overview & Quick Invoices */}
        <div className="space-y-6">
          {/* Projects Pipeline widget */}
          {visibleWidgets.projectPipeline && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Avancement Projets
                </h3>
                <button
                  onClick={() => onViewChange('projects')}
                  className="text-xs font-medium cursor-pointer hover:underline"
                  style={{ color: primaryColor }}
                >
                  Tous ({projects.length})
                </button>
              </div>

              <div className="space-y-4">
                {visibleProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-5 text-center">
                    <FolderOpen className="w-7 h-7 mx-auto text-zinc-500 mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">Aucun projet actif</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Créez votre premier projet pour suivre son avancement ici.
                    </p>
                  </div>
                ) : visibleProjects.map((project) => {
                  const projectTasks = tasks.filter((t) => t.projectId === project.id);
                  const progress = calculateProjectProgress(projectTasks);
                  return (
                    <div
                      key={project.id}
                      onClick={() => onEditProject(project)}
                      className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors truncate">
                          {project.name}
                        </span>
                        <span className="font-bold text-zinc-300">{progress.percent}%</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                        <span>{project.client}</span>
                        <span className="text-zinc-500">Livraison : {project.deadline}</span>
                      </div>

                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress.percent}%`,
                            backgroundColor: project.colorTag || primaryColor,
                          }}
                        />
                      </div>

                      {project.links && project.links.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-zinc-800/60">
                          {project.links.slice(0, 3).map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 flex items-center gap-1"
                              title={`${link.title} (${link.category})`}
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                              <span>{link.category}</span>
                            </a>
                          ))}
                          {project.links.length > 3 && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              +{project.links.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Billing Generator Widget */}
          {visibleWidgets.billingQuick && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Facturation & Reçus XOF</span>
                </h3>
                <button
                  onClick={() => onViewChange('billing')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Gérer tout
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Émettez des devis proforma avec TVA ou délivrez des reçus de paiement avec Wave et
                Orange Money.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onOpenNewProforma}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 flex flex-col items-center text-center gap-1 cursor-pointer transition-all hover:bg-zinc-850"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-200">+ Devis Proforma</span>
                </button>

                <button
                  onClick={onOpenNewReceipt}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-emerald-500/60 flex flex-col items-center text-center gap-1 cursor-pointer transition-all hover:bg-zinc-850"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200">+ Reçu Client</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
