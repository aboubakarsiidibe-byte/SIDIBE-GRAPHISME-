import React, { useState } from 'react';
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
  Plus,
  FolderPlus,
  Receipt,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Layout,
  Sliders,
  SlidersHorizontal,
  Download,
  RotateCcw,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Briefcase,
  X,
  Sparkles,
  Lock,
  KeyRound,
  Image as ImageIcon,
} from 'lucide-react';
import { ActiveView, Task, Project, Workspace, User } from '../types';
import { calculateTaskUrgency } from '../utils/urgencyCalculator';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  projects: Project[];
  tasks: Task[];
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  currentUser: User | null;
  proformasCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenNewProforma?: () => void;
  onOpenNewReceipt?: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenNewWorkspace: () => void;
  onOpenEditWorkspace: () => void;
  onOpenLogoModal?: () => void;
  onOpenPaletteModal: () => void;
  onOpenAppLauncher: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register' | 'profile') => void;
  onOpenPhotoshopDirect?: () => void;
  onOpenSecurityPrivacy?: () => void;
  onLockStudio?: () => void;
  onLogout: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
  onResetData: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  projects,
  tasks,
  workspaces,
  activeWorkspace,
  currentUser,
  proformasCount = 0,
  searchQuery,
  onSearchChange,
  onOpenNewTask,
  onOpenNewProject,
  onOpenNewProforma,
  onOpenNewReceipt,
  onSelectWorkspace,
  onOpenNewWorkspace,
  onOpenEditWorkspace,
  onOpenLogoModal,
  onOpenPaletteModal,
  onOpenAppLauncher,
  onOpenAuthModal,
  onOpenPhotoshopDirect,
  onOpenSecurityPrivacy,
  onLockStudio,
  onLogout,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onResetData,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const primaryColor = activeWorkspace.palette.primary;

  // Counts calculation
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

  const handleNavClick = (viewId: ActiveView) => {
    onViewChange(viewId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const navSections: Array<{
    title: string;
    items: Array<{
      id: ActiveView;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      count?: number;
      badgeColor?: string;
      customBadge?: string;
    }>;
  }> = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: LayoutDashboard,
        },
        {
          id: 'graphic-tools',
          label: 'Studio Graphique',
          icon: Layers,
          customBadge: 'PRO',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        {
          id: 'app-accounts',
          label: 'Comptes & Logiciels',
          icon: KeyRound,
          customBadge: 'ADOBE + 10',
          badgeColor: 'bg-[#31A8FF]/20 text-[#31A8FF] border-[#31A8FF]/30 font-bold',
        },
        {
          id: 'billing',
          label: 'Facturation & Devis',
          icon: FileText,
          count: proformasCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      title: 'Délais & Urgence',
      items: [
        {
          id: 'today',
          label: "Aujourd'hui",
          icon: CalendarCheck,
          count: todayTasksCount,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold',
        },
        {
          id: 'overdue',
          label: 'En retard',
          icon: AlertTriangle,
          count: overdueTasksCount,
          badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse font-bold',
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
      ],
    },
    {
      title: 'Gestion & Suivi',
      items: [
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
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 text-zinc-300 select-none">
      {/* 1. Brand & Workspace Switcher Header */}
      <div className="p-3.5 border-b border-zinc-800/80 shrink-0 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all text-left group cursor-pointer"
              title="Changer ou configurer l'espace de travail"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-zinc-950 text-xs shadow-md shrink-0 transition-transform group-hover:scale-105 overflow-hidden"
                style={{ backgroundColor: activeWorkspace.logoUrl ? '#18181b' : primaryColor }}
              >
                {activeWorkspace.logoUrl || activeWorkspace.billingInfo.logoUrl ? (
                  <img
                    src={activeWorkspace.logoUrl || activeWorkspace.billingInfo.logoUrl}
                    alt={activeWorkspace.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  activeWorkspace.name.substring(0, 2).toUpperCase()
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      {activeWorkspace.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-colors" />
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {activeWorkspace.domain}
                  </div>
                </div>
              )}
            </button>

            {/* Workspace Dropdown */}
            {showWorkspaceMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowWorkspaceMenu(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Espaces du Studio ({workspaces.length})
                  </div>

                  <div className="max-h-60 overflow-y-auto px-1 space-y-1 my-1">
                    {workspaces.map((ws) => {
                      const isSelected = ws.id === activeWorkspace.id;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => {
                            onSelectWorkspace(ws.id);
                            setShowWorkspaceMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-white font-bold'
                              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{ backgroundColor: ws.palette.primary }}
                            />
                            <div className="min-w-0">
                              <div className="truncate">{ws.name}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{ws.domain}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                              style={{
                                color: ws.palette.primary,
                                backgroundColor: `${ws.palette.primary}20`,
                              }}
                            >
                              Actif
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-px bg-zinc-800 my-1.5" />

                  <div className="px-1.5 space-y-1">
                    <button
                      onClick={() => {
                        onOpenNewWorkspace();
                        setShowWorkspaceMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer un nouvel espace</span>
                    </button>

                    {onOpenLogoModal && (
                      <button
                        onClick={() => {
                          onOpenLogoModal();
                          setShowWorkspaceMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl text-amber-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Insérer / Modifier le Logo Studio</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenEditWorkspace();
                        setShowWorkspaceMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Configurer cet espace & facturation</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Global Search Input */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sidebar-search-input"
              type="text"
              placeholder="Rechercher tâche, client..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Action Buttons (+ Tâche, + Projet, Facturation) */}
      <div className={`p-3 shrink-0 ${isCollapsed ? 'px-2' : ''}`}>
        {!isCollapsed ? (
          <div className="space-y-1.5">
            <button
              id="sidebar-btn-new-task"
              onClick={onOpenNewTask}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-zinc-950 font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouvelle Tâche</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="sidebar-btn-new-project"
                onClick={onOpenNewProject}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-[11px] font-medium transition-all active:scale-[0.98] cursor-pointer"
                title="Créer un nouveau projet"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Nouveau Projet</span>
              </button>

              {onOpenNewProforma && (
                <button
                  onClick={onOpenNewProforma}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-[11px] font-medium transition-all active:scale-[0.98] cursor-pointer"
                  title="Créer un nouveau devis proforma"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">+ Devis CFA</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onOpenNewTask}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-950 shadow-md transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              title="Nouvelle Tâche"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={onOpenNewProject}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-amber-400 transition-all cursor-pointer"
              title="Nouveau Projet"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-zinc-800/80 mx-3 my-1 shrink-0" />

      {/* 4. Navigation Views Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
                  >
                    <span
                      style={{ color: isActive ? primaryColor : undefined }}
                      className="shrink-0"
                    >
                      <Icon className="w-4 h-4" />
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>

                        {item.customBadge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase border ${item.badgeColor}`}
                          >
                            {item.customBadge}
                          </span>
                        )}

                        {typeof item.count === 'number' && item.count > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                              item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 5. Creative Tools & Studio Dock Shortcuts */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Outils & Personnalisation
            </div>
          )}

          <div className="space-y-0.5">
            <button
              onClick={onOpenAppLauncher}
              title="Lanceur d'applications (Figma, Photoshop, Illustrator, Canva...)"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2.5' : ''
              }`}
            >
              <Layout className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">Apps & Outils Design</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Dock</span>
                </>
              )}
            </button>

            {onOpenPhotoshopDirect && (
              <button
                onClick={onOpenPhotoshopDirect}
                title="Liaison directe avec Adobe Photoshop sur votre PC"
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#31A8FF] bg-[#31A8FF]/10 hover:bg-[#31A8FF]/20 border border-[#31A8FF]/30 transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : ''
                }`}
              >
                <div className="w-4 h-4 rounded bg-[#31A8FF] text-white flex items-center justify-center font-black text-[9px] leading-none shrink-0 shadow-sm">
                  Ps
                </div>
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left font-bold">Photoshop PC (Direct)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </>
                )}
              </button>
            )}

            {onOpenSecurityPrivacy && (
              <button
                onClick={onOpenSecurityPrivacy}
                title="Sécurité, Anti-Piratage & Protection des mots de passe"
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">Sécurité & Mots de passe</span>
                )}
              </button>
            )}

            <button
              onClick={onOpenPaletteModal}
              title={`Palette de Couleurs : ${activeWorkspace.palette.primaryName}`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2.5' : ''
              }`}
            >
              <div
                className="w-4 h-4 rounded-full shadow-inner shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">Thème & Couleurs</span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[70px]">
                    {activeWorkspace.palette.primaryName}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={onOpenEditWorkspace}
              title="Paramètres de l'espace & Devise CFA"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2.5' : ''
              }`}
            >
              <Sliders className="w-4 h-4 text-zinc-400 shrink-0" />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">Paramètres Studio</span>
              )}
            </button>
          </div>
        </div>

        {/* 6. Exports & Data Backup */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Données & Exports
            </div>
          )}

          <div className="space-y-0.5">
            <button
              onClick={onExportJSON}
              title="Exporter toutes les données en JSON"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2' : ''
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate text-left">Export Sauvegarde (JSON)</span>}
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              title="Restaurer une sauvegarde JSON"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2' : ''
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {!isCollapsed && <span className="truncate text-left">Restaurer Sauvegarde (JSON)</span>}
            </button>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImportJSON(file);
                event.target.value = '';
              }}
            />

            <button
              onClick={onExportCSV}
              title="Exporter les tâches au format CSV"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-2' : ''
              }`}
            >
              <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {!isCollapsed && <span className="truncate text-left">Export Tâches (CSV)</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 7. Bottom User Profile & Collapse Toggle */}
      <div className="p-2 border-t border-zinc-800/80 shrink-0 bg-zinc-950/80">
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer text-left ${
                isCollapsed ? 'justify-center p-1.5' : ''
              }`}
              title="Menu du compte"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-950 font-black text-xs shadow-sm shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {currentUser.fullName.substring(0, 1).toUpperCase()}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-200 truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className={`w-full flex items-center gap-2 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold cursor-pointer ${
                isCollapsed ? 'justify-center p-1.5' : ''
              }`}
              title="Connexion / Compte"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span>Connexion Compte</span>}
            </button>
          )}

          {/* User Popover Menu */}
          {showUserMenu && currentUser && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute left-full bottom-0 ml-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 mb-2">
                  <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
                  <div className="text-[11px] text-zinc-400">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Compte vérifié SHA-256</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onOpenAuthModal('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modifier mon profil</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenEditWorkspace();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gérer le studio & devis</span>
                  </button>

                  {onOpenSecurityPrivacy && (
                    <button
                      onClick={() => {
                        onOpenSecurityPrivacy();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sécurité & Mots de passe</span>
                    </button>
                  )}

                  {onLockStudio && (
                    <button
                      onClick={() => {
                        onLockStudio();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verrouiller le Studio</span>
                    </button>
                  )}

                  <div className="h-px bg-zinc-800 my-1" />

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-full mt-1.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors text-xs font-medium cursor-pointer"
          title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1.5 text-[11px]">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Réduire le panneau</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 h-screen sticky top-0 z-30 ${
          isCollapsed ? 'w-18' : 'w-64 lg:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
