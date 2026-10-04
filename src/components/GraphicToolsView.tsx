import React, { useState } from 'react';
import {
  Project,
  Task,
  ConnectedGraphicTool,
  GraphicToolCategory,
  Workspace,
  ProjectLink,
} from '../types';
import {
  loadConnectedGraphicTools,
  updateGraphicToolConnection,
  CREATIVE_RESOURCES,
  detectGraphicToolFromUrl,
} from '../utils/graphicToolsStorage';
import {
  Layout,
  Layers,
  Palette,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Plus,
  FolderOpen,
  Link as LinkIcon,
  Search,
  Sliders,
  Type,
  Image as ImageIcon,
  Compass,
  FileCode,
  Box,
  Monitor,
  Flame,
  Globe,
  Trash2,
  Check,
  Radio,
  KeyRound,
} from 'lucide-react';

interface GraphicToolsViewProps {
  workspace: Workspace;
  projects: Project[];
  tasks: Task[];
  onOpenProject: (project: Project) => void;
  onOpenTask: (task: Task) => void;
  onAddLinkToProject: (projectId: string, link: ProjectLink) => void;
  onRemoveLinkFromProject: (projectId: string, linkId: string) => void;
  onOpenPhotoshopDirect?: () => void;
  onOpenSecurityPrivacy?: () => void;
  onNavigateToAppAccounts?: () => void;
}

export const GraphicToolsView: React.FC<GraphicToolsViewProps> = ({
  workspace,
  projects,
  tasks,
  onOpenProject,
  onOpenTask,
  onAddLinkToProject,
  onRemoveLinkFromProject,
  onOpenPhotoshopDirect,
  onOpenSecurityPrivacy,
  onNavigateToAppAccounts,
}) => {
  const [tools, setTools] = useState<ConnectedGraphicTool[]>(() => loadConnectedGraphicTools());
  const [activeTab, setActiveTab] = useState<'tools' | 'files' | 'resources'>('tools');
  const [resourceCategory, setResourceCategory] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');

  // Editing custom studio URL
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Quick Attach Modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachProjectId, setAttachProjectId] = useState(projects[0]?.id || '');
  const [attachTitle, setAttachTitle] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachCategory, setAttachCategory] = useState<GraphicToolCategory>('Figma');

  const primaryColor = workspace.palette.primary;

  // Toggle tool connection
  const handleToggleConnection = (tool: ConnectedGraphicTool) => {
    const updated = updateGraphicToolConnection(tool.id, {
      isConnected: !tool.isConnected,
    });
    setTools(updated);
  };

  const handleStartEditUrl = (tool: ConnectedGraphicTool) => {
    setEditingToolId(tool.id);
    setCustomUrlInput(tool.customStudioUrl || tool.defaultUrl);
  };

  const handleSaveCustomUrl = (toolId: string) => {
    if (!customUrlInput.trim()) return;
    const formatted = customUrlInput.trim().startsWith('http')
      ? customUrlInput.trim()
      : `https://${customUrlInput.trim()}`;
    const updated = updateGraphicToolConnection(toolId, {
      customStudioUrl: formatted,
    });
    setTools(updated);
    setEditingToolId(null);
  };

  // Auto-detect tool when pasting URL
  const handleUrlChange = (url: string) => {
    setAttachUrl(url);
    if (url.trim()) {
      const detected = detectGraphicToolFromUrl(url);
      setAttachCategory(detected);
      if (!attachTitle.trim()) {
        setAttachTitle(`Maquette ${detected}`);
      }
    }
  };

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachProjectId || !attachTitle.trim() || !attachUrl.trim()) return;

    const formattedUrl = attachUrl.trim().startsWith('http')
      ? attachUrl.trim()
      : `https://${attachUrl.trim()}`;

    const newLink: ProjectLink = {
      id: `link-${Date.now()}`,
      title: attachTitle.trim(),
      url: formattedUrl,
      category: attachCategory,
    };

    onAddLinkToProject(attachProjectId, newLink);
    setShowAttachModal(false);
    setAttachTitle('');
    setAttachUrl('');
    setActiveTab('files');
  };

  // Collect all graphic links from all projects
  const allProjectGraphicLinks = projects.flatMap((project) =>
    (project.links || []).map((link) => ({
      ...link,
      projectId: project.id,
      projectName: project.name,
      projectClient: project.client,
      projectColor: project.colorTag,
    }))
  );

  const connectedCount = tools.filter((t) => t.isConnected).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div
          className="absolute right-0 top-0 w-96 h-full pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at top right, ${primaryColor}, transparent 70%)`,
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs uppercase font-extrabold text-zinc-300 tracking-wider">
                Studio Graphique & Suite Créative
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{connectedCount} outils rattachés</span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>Raccordement aux Outils de Graphisme</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
              Centralisez vos logiciels de production (Figma, Photoshop, Illustrator, Canva, InDesign)
              et rattachez directement vos maquettes et assets aux projets de {workspace.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAttachModal(true)}
              className="px-4 py-2.5 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Rattacher une maquette / fichier</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Monitor className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <div className="text-lg font-black text-white">{connectedCount} / {tools.length}</div>
              <div className="text-[11px] text-zinc-400">Logiciels connectés</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{allProjectGraphicLinks.length}</div>
              <div className="text-[11px] text-zinc-400">Fichiers rattachés aux projets</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{CREATIVE_RESOURCES.length}</div>
              <div className="text-[11px] text-zinc-400">Banques de typographies & palettes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
          style={{
            borderColor: activeTab === 'tools' ? primaryColor : undefined,
          }}
        >
          <Layers className="w-4 h-4" style={{ color: activeTab === 'tools' ? primaryColor : undefined }} />
          <span>Mes Logiciels & Applications ({tools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'files'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" style={{ color: activeTab === 'files' ? primaryColor : undefined }} />
          <span>Fichiers & Maquettes des Projets ({allProjectGraphicLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" style={{ color: activeTab === 'resources' ? primaryColor : undefined }} />
          <span>Banques de Ressources Créatives ({CREATIVE_RESOURCES.length})</span>
        </button>

        {onNavigateToAppAccounts && (
          <button
            onClick={onNavigateToAppAccounts}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 ml-auto"
            title="Gérer les connexions et comptes officiels (Photoshop, Figma, Canva, Drive...)"
          >
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Comptes & Connexions Apps</span>
          </button>
        )}
      </div>

      {/* TAB 1: CONNECTED GRAPHIC TOOLS */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          {/* Bannière Spéciale Liaison Directe Photoshop sur ce PC */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#31A8FF]/15 via-zinc-900 to-zinc-900 border border-[#31A8FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#31A8FF] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#31A8FF]/20 shrink-0">
                Ps
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Adobe Photoshop installé sur ce PC</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Protocole Direct Prêt
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Lancez directement vos fichiers PSD d'affiches, maquettes et packagings dans Photoshop avec protection anti-piratage et zéro fuite de données.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenPhotoshopDirect && (
                <button
                  onClick={onOpenPhotoshopDirect}
                  className="px-4 py-2 rounded-xl bg-[#31A8FF] hover:bg-[#2096ec] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Lancer Photoshop & Gérer PSD</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Logiciels Graphiques Rattachés</h3>
              <p className="text-xs text-zinc-400">
                Activez vos outils et personnalisez l'URL directe de votre espace de travail ou équipe.
              </p>
            </div>
            <button
              onClick={() => setShowAttachModal(true)}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lier à un projet spécifique</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => {
              // Count linked projects for this tool
              const linkedProjectsCount = allProjectGraphicLinks.filter(
                (l) => l.category.toLowerCase() === tool.name.toLowerCase() || tool.name.toLowerCase().includes(l.category.toLowerCase())
              ).length;

              const isEditing = editingToolId === tool.id;

              return (
                <div
                  key={tool.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    tool.isConnected
                      ? 'bg-zinc-900/90 border-zinc-700/80 shadow-md'
                      : 'bg-zinc-900/40 border-zinc-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top: Icon, Status Switch */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-inner border border-zinc-700/50"
                        style={{ backgroundColor: `${tool.color}25`, borderColor: tool.color }}
                      >
                        <span style={{ color: tool.color }}>{tool.name.substring(0, 2).toUpperCase()}</span>
                      </div>

                      <button
                        onClick={() => handleToggleConnection(tool)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                          tool.isConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        <Radio className={`w-3 h-3 ${tool.isConnected ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
                        <span>{tool.isConnected ? 'Rattaché' : 'Désactivé'}</span>
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-white">{tool.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Studio link config */}
                    <div className="pt-2 border-t border-zinc-800/80">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveCustomUrl(tool.id)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingToolId(null)}
                              className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white text-[11px] cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="truncate max-w-[160px] text-zinc-400">
                            {tool.customStudioUrl || tool.defaultUrl}
                          </span>
                          <button
                            onClick={() => handleStartEditUrl(tool)}
                            className="text-amber-400 hover:underline shrink-0 cursor-pointer ml-1"
                          >
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Launchers */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={tool.customStudioUrl || tool.defaultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Ouvrir l'outil</span>
                      </a>

                      {tool.appProtocol && (
                        <a
                          href={tool.appProtocol}
                          className="px-2.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 transition-all cursor-pointer"
                          title="Lancer l'application de bureau"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                      <span>Projets liés : {linkedProjectsCount}</span>
                      {tool.isConnected && (
                        <span className="text-emerald-400 font-medium">Prêt pour production</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT GRAPHIC FILES */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Maquettes & Fichiers Graphiques Rattachés aux Projets</h3>
              <p className="text-xs text-zinc-400">
                Accès direct en 1 clic à vos maquettes Figma, fichiers Photoshop PSD, Illustrator AI, Canva et dossiers d'assets.
              </p>
            </div>

            <button
              onClick={() => setShowAttachModal(true)}
              className="px-3.5 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>+ Rattacher un nouveau fichier</span>
            </button>
          </div>

          {allProjectGraphicLinks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Aucun fichier graphique rattaché pour l'instant</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Rattachez vos maquettes Figma, fichiers Photoshop ou Canva directement aux projets de votre studio pour y accéder instantanément.
              </p>
              <button
                onClick={() => setShowAttachModal(true)}
                className="px-4 py-2 rounded-xl text-zinc-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4" />
                <span>Rattacher mon premier fichier</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {allProjectGraphicLinks.map((link) => {
                const targetProject = projects.find((p) => p.id === link.projectId);

                return (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-zinc-800/80 text-zinc-200 border-zinc-700">
                          {link.category}
                        </span>

                        {targetProject && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full border truncate max-w-[140px]"
                            style={{
                              borderColor: `${targetProject.colorTag}40`,
                              backgroundColor: `${targetProject.colorTag}15`,
                              color: targetProject.colorTag,
                            }}
                          >
                            {targetProject.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                          {link.title}
                        </h4>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5 truncate">
                          <span>Client :</span>
                          <strong className="text-zinc-300">{link.projectClient}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-500 font-mono truncate">
                        {link.url}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Ouvrir la maquette</span>
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`Détacher "${link.title}" du projet ?`)) {
                            onRemoveLinkFromProject(link.projectId, link.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Détacher ce fichier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATIVE RESOURCES & ASSET HUBS */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Banques de Ressources Créatives & Typographies</h3>
              <p className="text-xs text-zinc-400">
                Outils de recherche rapide pour typographies, palettes de couleurs, photos libres de droits et inspiration.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'Typographie', 'Couleurs & Palettes', 'Images & Banques', 'Icônes & Vecteurs', 'Inspiration & Moodboard'].map((cat) => (
              <button
                key={cat}
                onClick={() => setResourceCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  resourceCategory === cat
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat === 'all' ? 'Toutes les catégories' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREATIVE_RESOURCES.filter((res) => {
              const matchesCat = resourceCategory === 'all' || res.category === resourceCategory;
              const matchesSearch =
                !resourceSearch.trim() ||
                res.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
                res.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
                res.category.toLowerCase().includes(resourceSearch.toLowerCase());
              return matchesCat && matchesSearch;
            }).map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {res.category}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400">{res.badge}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {res.name}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{res.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Accéder au site</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: RATTACHER UNE MAQUETTE / FICHIER GRAPHIQUE */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-950 font-black text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rattacher un fichier graphique</h3>
                  <p className="text-xs text-zinc-400">
                    Associez une maquette Figma, Photoshop, Canva ou dossier Drive à un projet
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAttachModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttachment} className="space-y-4">
              {/* Project select */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Projet concerné *
                </label>
                <select
                  value={attachProjectId}
                  onChange={(e) => setAttachProjectId(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client})
                    </option>
                  ))}
                </select>
              </div>

              {/* URL with smart detection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Lien web ou URL de la maquette *
                </label>
                <input
                  type="text"
                  placeholder="https://www.figma.com/file/... ou https://canva.com/..."
                  value={attachUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  💡 Collez un lien Figma, Canva, Google Drive ou Adobe pour détecter automatiquement l'outil.
                </span>
              </div>

              {/* Title & Tool type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Titre du livrable / maquette *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maquette Mobile v2"
                    value={attachTitle}
                    onChange={(e) => setAttachTitle(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Type d'outil / logiciel
                  </label>
                  <select
                    value={attachCategory}
                    onChange={(e) => setAttachCategory(e.target.value as GraphicToolCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Figma">Figma</option>
                    <option value="Photoshop">Adobe Photoshop</option>
                    <option value="Illustrator">Adobe Illustrator</option>
                    <option value="Canva">Canva</option>
                    <option value="InDesign">Adobe InDesign</option>
                    <option value="After Effects">Adobe After Effects</option>
                    <option value="Blender / 3D">Blender / 3D</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="Dropbox">Dropbox</option>
                    <option value="Pinterest">Pinterest Moodboard</option>
                    <option value="Behance">Behance</option>
                    <option value="Brand kit">Charte / Brand Kit</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 cursor-pointer shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  Rattacher au projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
