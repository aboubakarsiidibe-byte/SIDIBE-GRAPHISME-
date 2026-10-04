import React, { useState } from 'react';
import {
  X,
  Monitor,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  FileCode,
  Download,
  AlertTriangle,
  Play,
  Settings,
  Sparkles,
  Lock,
  HardDrive,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import {
  loadPhotoshopConfig,
  savePhotoshopConfig,
  launchDirectPhotoshop,
  downloadWindowsPhotoshopShortcut,
  downloadApplicationShortcut,
  downloadCreativeSuiteLauncherBatch,
  launchDirectApplication,
  PhotoshopLocalConfig,
  LocalPsdReference,
} from '../utils/graphicToolsStorage';
import { Workspace, Project } from '../types';

interface PhotoshopDirectModalProps {
  workspace: Workspace;
  projects: Project[];
  onClose: () => void;
  onLinkPsdToProject?: (projectId: string, fileName: string, path: string) => void;
}

const APPS_LIST = [
  { id: 'photoshop', name: 'Adobe Photoshop', short: 'Ps', color: '#31A8FF', protocol: 'photoshop://', web: 'https://creativecloud.adobe.com/apps/photoshop' },
  { id: 'illustrator', name: 'Adobe Illustrator', short: 'Ai', color: '#FF9A00', protocol: 'illustrator://', web: 'https://creativecloud.adobe.com/apps/illustrator' },
  { id: 'indesign', name: 'Adobe InDesign', short: 'Id', color: '#FF3366', protocol: 'indesign://', web: 'https://creativecloud.adobe.com/apps/indesign' },
  { id: 'figma', name: 'Figma', short: 'Fg', color: '#F24E1E', protocol: 'figma://', web: 'https://www.figma.com' },
  { id: 'canva', name: 'Canva', short: 'Cv', color: '#00C4CC', protocol: 'canva://', web: 'https://www.canva.com' },
  { id: 'aftereffects', name: 'After Effects', short: 'Ae', color: '#9999FF', protocol: 'aftereffects://', web: 'https://creativecloud.adobe.com/apps/aftereffects' },
  { id: 'blender', name: 'Blender 3D', short: 'Bl', color: '#EA7600', protocol: 'blender://', web: 'https://www.blender.org' },
];

export const PhotoshopDirectModal: React.FC<PhotoshopDirectModalProps> = ({
  workspace,
  projects,
  onClose,
  onLinkPsdToProject,
}) => {
  const [selectedApp, setSelectedApp] = useState(APPS_LIST[0]);
  const [config, setConfig] = useState<PhotoshopLocalConfig>(() => loadPhotoshopConfig());
  const [activeTab, setActiveTab] = useState<'launch' | 'files' | 'config' | 'security'>('launch');
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  // New local PSD input
  const [newPsdName, setNewPsdName] = useState('');
  const [newPsdPath, setNewPsdPath] = useState('');
  const [newPsdProject, setNewPsdProject] = useState(projects[0]?.id || '');
  const [showAddPsd, setShowAddPsd] = useState(false);

  // Folder configuration
  const [folderInput, setFolderInput] = useState(config.localProjectsFolder || 'C:\\Projets_Graphiques\\Photoshop_PSD');
  const [protocolInput, setProtocolInput] = useState(config.preferredProtocol || 'photoshop://');

  const primaryColor = workspace.palette.primary;

  const handleLaunchPhotoshop = (filePath?: string) => {
    setIsLaunching(true);
    setLaunchMessage(null);

    const res = launchDirectPhotoshop(filePath);
    setLaunchMessage(res.message);

    setTimeout(() => {
      setIsLaunching(false);
    }, 1200);
  };

  const handleSaveConfig = () => {
    const updated: PhotoshopLocalConfig = {
      ...config,
      localProjectsFolder: folderInput.trim(),
      preferredProtocol: protocolInput as 'photoshop://' | 'adobe-photoshop://' | 'custom',
    };
    savePhotoshopConfig(updated);
    setConfig(updated);
    setLaunchMessage('Paramètres de liaison locale enregistrés avec succès.');
  };

  const handleAddLocalPsd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPsdName.trim()) return;

    const targetProject = projects.find((p) => p.id === newPsdProject);
    const newRef: LocalPsdReference = {
      id: `psd-${Date.now()}`,
      name: newPsdName.trim().endsWith('.psd') ? newPsdName.trim() : `${newPsdName.trim()}.psd`,
      pathOrName: newPsdPath.trim() || `${config.localProjectsFolder}\\${newPsdName.trim()}`,
      sizeFormatted: 'Fichier local PC',
      lastOpened: 'À l\'instant',
      projectId: targetProject?.id,
      projectName: targetProject?.name,
    };

    const updatedRecent = [newRef, ...config.recentPsdFiles];
    const updatedConfig = { ...config, recentPsdFiles: updatedRecent };
    savePhotoshopConfig(updatedConfig);
    setConfig(updatedConfig);

    if (onLinkPsdToProject && targetProject) {
      onLinkPsdToProject(targetProject.id, newRef.name, newRef.pathOrName);
    }

    setNewPsdName('');
    setNewPsdPath('');
    setShowAddPsd(false);
  };

  const handleRemovePsd = (id: string) => {
    const updatedRecent = config.recentPsdFiles.filter((p) => p.id !== id);
    const updatedConfig = { ...config, recentPsdFiles: updatedRecent };
    savePhotoshopConfig(updatedConfig);
    setConfig(updatedConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#31A8FF]/20 border border-[#31A8FF]/40 flex items-center justify-center font-black text-[#31A8FF] text-lg shadow-sm">
              Ps
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Liaison Directe Adobe Photoshop (PC Local)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PC Prêt
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connexion directe entre votre espace de travail et votre logiciel Photoshop installé.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="grid grid-cols-4 bg-zinc-950/60 border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('launch')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'launch'
                ? 'text-[#31A8FF] border-[#31A8FF] bg-zinc-900/80'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Lancer Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'files'
                ? 'text-[#31A8FF] border-[#31A8FF] bg-zinc-900/80'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Fichiers PSD ({config.recentPsdFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'text-[#31A8FF] border-[#31A8FF] bg-zinc-900/80'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Dossier & Raccourci</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'text-emerald-400 border-emerald-400 bg-zinc-900/80'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sécurité & Confidentialité</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {launchMessage && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{launchMessage}</span>
              </div>
              <button
                onClick={() => setLaunchMessage(null)}
                className="text-xs text-blue-300 hover:text-white"
              >
                Fermer
              </button>
            </div>
          )}

          {/* TAB 1: LANCER DIRECT */}
          {activeTab === 'launch' && (
            <div className="space-y-6">
              {/* Grand bouton de lancement direct PC */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#31A8FF]/10 to-zinc-950 border border-[#31A8FF]/30 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#31A8FF] flex items-center justify-center text-white shadow-xl shadow-[#31A8FF]/20">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">Lancer Adobe Photoshop sur ce PC</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Déclenche instantanément l'application Photoshop installée sur votre système d'exploitation Windows ou Mac via le protocole sécurisé <code className="text-[#31A8FF] font-mono">{config.preferredProtocol}</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleLaunchPhotoshop()}
                    disabled={isLaunching}
                    className="px-6 py-3 rounded-xl bg-[#31A8FF] hover:bg-[#2094ea] text-white font-black text-sm shadow-lg shadow-[#31A8FF]/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isLaunching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                    <span>{isLaunching ? 'Lancement en cours...' : 'Ouvrir Photoshop Maintenant'}</span>
                  </button>

                  <button
                    onClick={downloadWindowsPhotoshopShortcut}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer"
                    title="Télécharger un raccourci Windows .url direct"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Télécharger Raccourci PC (.url)</span>
                  </button>
                </div>
              </div>

              {/* Raccourcis rapides vers fichiers PSD récents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#31A8FF]" />
                    <span>Ouvrir un PSD récent directement dans Photoshop :</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('files')}
                    className="text-xs text-[#31A8FF] hover:underline"
                  >
                    Voir tous ({config.recentPsdFiles.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {config.recentPsdFiles.slice(0, 4).map((psd) => (
                    <div
                      key={psd.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#31A8FF]/50 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#31A8FF] shrink-0" />
                          <span className="text-xs font-bold text-white truncate">{psd.name}</span>
                        </div>
                        {psd.projectName && (
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            Projet : {psd.projectName}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleLaunchPhotoshop(psd.pathOrName)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#31A8FF]/20 hover:bg-[#31A8FF] text-[#31A8FF] hover:text-white font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                        title="Ouvrir ce fichier dans Photoshop"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Ouvrir</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FICHIERS PSD DU STUDIO */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Fichiers PSD Locaux Rattachés</h4>
                  <p className="text-xs text-zinc-400">
                    Ces fichiers sont référencés sur votre disque dur et ne sont jamais téléversés sur un serveur distant.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPsd(!showAddPsd)}
                  className="px-3 py-1.5 rounded-xl bg-[#31A8FF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ajouter un PSD local</span>
                </button>
              </div>

              {showAddPsd && (
                <form
                  onSubmit={handleAddLocalPsd}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in"
                >
                  <h5 className="text-xs font-bold text-white">Référencer un fichier PSD de votre ordinateur</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Nom du fichier (.psd)</label>
                      <input
                        type="text"
                        value={newPsdName}
                        onChange={(e) => setNewPsdName(e.target.value)}
                        placeholder="Ex: Affiche_Campagne_2026.psd"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#31A8FF]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Associer au Projet</label>
                      <select
                        value={newPsdProject}
                        onChange={(e) => setNewPsdProject(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#31A8FF]"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.client})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Chemin complet sur le disque dur (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={newPsdPath}
                      onChange={(e) => setNewPsdPath(e.target.value)}
                      placeholder="Ex: C:\Projets\Affiches\Affiche_2026.psd"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#31A8FF]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddPsd(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#31A8FF] text-white font-bold text-xs cursor-pointer"
                    >
                      Enregistrer le PSD
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {config.recentPsdFiles.map((psd) => (
                  <div
                    key={psd.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#31A8FF]/20 border border-[#31A8FF]/30 flex items-center justify-center text-[#31A8FF] shrink-0 font-black text-xs">
                        PSD
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{psd.name}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 truncate mt-0.5">
                          <span className="font-mono text-zinc-500">{psd.pathOrName}</span>
                          {psd.projectName && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400">{psd.projectName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLaunchPhotoshop(psd.pathOrName)}
                        className="px-3 py-1.5 rounded-lg bg-[#31A8FF] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#2598ee] transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Ouvrir dans Photoshop</span>
                      </button>

                      <button
                        onClick={() => handleRemovePsd(psd.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                        title="Supprimer la référence"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURATION DOSSIER & RACCOURCIS */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#31A8FF]" />
                  <span>Emplacements et Protocoles PC</span>
                </h4>

                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">
                    Dossier local de travail des créations PSD :
                  </label>
                  <input
                    type="text"
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                    placeholder="C:\Users\VotreNom\Documents\Photoshop_Projets"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#31A8FF]"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Ce dossier sert de racine par défaut pour ouvrir vos fichiers d'affiches et maquettes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">
                    Protocole de déclenchement OS :
                  </label>
                  <select
                    value={protocolInput}
                    onChange={(e) => setProtocolInput(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#31A8FF]"
                  >
                    <option value="photoshop://">photoshop:// (Recommandé - Protocole officiel Adobe)</option>
                    <option value="adobe-photoshop://">adobe-photoshop:// (Creative Cloud Desktop)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Enregistrer les préférences
                  </button>
                </div>
              </div>

              {/* Raccourci Windows & Mac */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Raccourci Bureau Windows (.url)</span>
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Téléchargez un raccourci direct à placer sur votre bureau pour lancer Photoshop instantanément.
                  </p>
                </div>

                <button
                  onClick={downloadWindowsPhotoshopShortcut}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 shrink-0 cursor-pointer"
                >
                  Télécharger (.url)
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SÉCURITÉ, ANTI-PIRATAGE & PROTECTION */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Garantie de Sécurité, Anti-Piratage & Zéro Fuite de Données</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Conformément à vos exigences strictes, ce module est conçu avec une architecture fermée et sécurisée.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>1. Protection Absolue des Mots de Passe (SHA-256 avec Salage 128 bits)</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tous vos mots de passe sont hachés cryptographiquement via l'API Web Crypto native du navigateur. Aucun mot de passe n'est jamais stocké en texte clair ni accessible par des scripts tiers. Un verrou anti-brute force bloque automatiquement les attaques après 5 tentatives erronées.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span>2. Interdiction Formelle du Partage d'Informations (100% Hors-Ligne & Local)</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Zéro télémétrie, zéro serveur externe. Vos maquettes, vos factures proforma CFA, vos briefs clients et vos identifiants restent cantonnés à votre navigateur et votre machine locale. Aucune donnée n'est transmise sur Internet.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <AlertTriangle className="w-4 h-4 text-emerald-400" />
                    <span>3. Anti-Piratage & Respect Intégral des Licences Officielles</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    La liaison avec Photoshop utilise uniquement le protocole standard du système d'exploitation (<code className="text-[#31A8FF]">photoshop://</code>) pour communiquer avec votre installation légitime d'Adobe Photoshop sur votre PC. Aucun crack, injection de code ou contournement n'est toléré ni utilisé.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Liaison PC directe active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
