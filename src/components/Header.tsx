import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  FolderPlus,
  Search,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Briefcase,
  ChevronDown,
  Palette,
  Layout,
  Layers,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sliders,
  FileText,
  Receipt,
} from 'lucide-react';
import { Project, Task, Workspace, User } from '../types';

interface HeaderProps {
  projects: Project[];
  tasks: Task[];
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenNewWorkspace: () => void;
  onOpenEditWorkspace: () => void;
  onOpenPaletteModal: () => void;
  onOpenAppLauncher: () => void;
  onNavigateToGraphicTools?: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register' | 'profile') => void;
  onLogout: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  tasks,
  workspaces,
  activeWorkspace,
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenNewTask,
  onOpenNewProject,
  onSelectWorkspace,
  onOpenNewWorkspace,
  onOpenEditWorkspace,
  onOpenPaletteModal,
  onOpenAppLauncher,
  onNavigateToGraphicTools,
  onOpenAuthModal,
  onLogout,
  onExportJSON,
  onExportCSV,
  onResetData,
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const primaryColor = activeWorkspace.palette.primary;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand Identity & Workspace Switcher */}
        <div className="flex items-center gap-3">
          {/* Workspace badge & selector */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left group cursor-pointer"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-zinc-950 text-sm shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {activeWorkspace.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white tracking-tight leading-none">
                    {activeWorkspace.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-none truncate max-w-[170px]">
                  {activeWorkspace.domain}
                </div>
              </div>
            </button>

            {/* Workspace Dropdown */}
            {showWorkspaceMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowWorkspaceMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Vos Espaces de Travail ({workspaces.length})
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
                              className="w-4 h-4 rounded-full shrink-0"
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
                      <Plus className="w-4 h-4" />
                      <span>Créer un nouvel espace</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenEditWorkspace();
                        setShowWorkspaceMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-zinc-400" />
                      <span>Configurer cet espace & facturation</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Toolbar: Palette, App Dock */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={onOpenPaletteModal}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Choisir la palette de couleur"
            >
              <div
                className="w-3.5 h-3.5 rounded-full shadow-inner"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="hidden lg:inline">{activeWorkspace.palette.primaryName}</span>
            </button>

            <button
              onClick={onOpenAppLauncher}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Applications du Studio (Figma, Photoshop, Drive...)"
            >
              <Layout className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Apps & Outils</span>
            </button>

            {onNavigateToGraphicTools && (
              <button
                onClick={onNavigateToGraphicTools}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-purple-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Studio Graphique & Maquettes Rattachées"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline">Studio Graphique</span>
              </button>
            )}
          </div>
        </div>

        {/* Center / Right: Search & Actions & User Profile */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl md:justify-end">
          <div className="relative flex-1 min-w-[170px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-input-global"
              type="text"
              placeholder="Rechercher tâche, client, projet..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-new-task"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tâche</span>
            </button>

            <button
              id="btn-new-project"
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs border border-zinc-700 transition-all active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Projet</span>
            </button>

            {/* Export & Reset Menu */}
            <div className="relative">
              <button
                id="btn-export-menu"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Options et exports"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1 z-50 text-xs">
                    <button
                      onClick={() => {
                        onExportJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      Exporter en JSON
                    </button>
                    <button
                      onClick={() => {
                        onExportCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      Exporter Tâches (CSV)
                    </button>
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Réinitialiser toutes les données de SIDIBE STUDIO à l’état initial de démonstration ?'
                          )
                        ) {
                          onResetData();
                          setShowExportMenu(false);
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Réinitialiser données démo
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* USER ACCOUNT BUTTON & POPUP */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-zinc-200 leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end leading-tight">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{currentUser.role}</span>
                    </div>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-950 font-black text-xs shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {currentUser.fullName.substring(0, 1)}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connexion / Compte</span>
                </button>
              )}

              {/* User dropdown */}
              {showUserMenu && currentUser && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
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
                        <span>Gérer mon studio & devis</span>
                      </button>

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
          </div>
        </div>
      </div>
    </header>
  );
};
