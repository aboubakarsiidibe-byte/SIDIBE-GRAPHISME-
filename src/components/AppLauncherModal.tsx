import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Palette,
  Code,
  Folder,
  Globe,
  Terminal,
  Laptop,
  Video,
  Database,
  PhoneCall,
  Layout,
  Cpu,
  Check,
} from 'lucide-react';
import { AppShortcut } from '../types';

interface AppLauncherModalProps {
  shortcuts: AppShortcut[];
  onClose: () => void;
  onSaveShortcuts: (updatedShortcuts: AppShortcut[]) => void;
}

const AVAILABLE_ICONS: Array<{
  name: string;
  label: string;
  component: React.ComponentType<{ className?: string }>;
}> = [
  { name: 'Figma', label: 'Figma / Prototype', component: Layout },
  { name: 'Illustrator', label: 'Illustrator / Vecteur', component: Palette },
  { name: 'Photoshop', label: 'Photoshop / Image', component: Layers },
  { name: 'Canva', label: 'Canva / Graphisme', component: Sparkles },
  { name: 'Github', label: 'GitHub / Code', component: Code },
  { name: 'Notion', label: 'Notion / Notes', component: Folder },
  { name: 'Drive', label: 'Drive / Fichiers', component: Globe },
  { name: 'Terminal', label: 'Terminal / CLI', component: Terminal },
  { name: 'Video', label: 'Vidéo / Motion', component: Video },
  { name: 'Database', label: 'Base de données', component: Database },
  { name: 'PhoneCall', label: 'Mobile Money / Wave', component: PhoneCall },
  { name: 'Laptop', label: 'Logiciel Desktop', component: Laptop },
  { name: 'Cpu', label: 'IA & Tech', component: Cpu },
];

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  shortcuts,
  onClose,
  onSaveShortcuts,
}) => {
  const [list, setList] = useState<AppShortcut[]>(shortcuts);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding new app
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('Figma');
  const [category, setCategory] = useState<AppShortcut['category']>('Design');
  const [description, setDescription] = useState('');

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let validUrl = url.trim();
    if (validUrl && !validUrl.startsWith('http://') && !validUrl.startsWith('https://') && !validUrl.includes('://')) {
      validUrl = `https://${validUrl}`;
    }

    const newApp: AppShortcut = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      url: validUrl || '#',
      iconName,
      category,
      description: description.trim() || undefined,
    };

    const updated = [...list, newApp];
    setList(updated);
    onSaveShortcuts(updated);

    // Reset form
    setName('');
    setUrl('');
    setDescription('');
    setIsAdding(false);
  };

  const handleDeleteApp = (id: string) => {
    const updated = list.filter((a) => a.id !== id);
    setList(updated);
    onSaveShortcuts(updated);
  };

  const getIconComponent = (iconKey: string) => {
    const item = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === iconKey.toLowerCase());
    return item ? item.component : Layout;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Icônes & Applications du Studio</h3>
              <p className="text-xs text-zinc-400">Configurez vos raccourcis favoris (Figma, Photoshop, Illustrator, Drive, etc.)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Apps Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Vos Applications ({list.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAdding ? 'Fermer le formulaire' : 'Ajouter une application'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((app) => {
                const IconComp = getIconComponent(app.iconName);
                return (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                          <span>{app.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-normal">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {app.description || app.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {app.url && app.url !== '#' && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
                          title="Ouvrir l'application"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Supprimer l'application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New App Form */}
          {isAdding && (
            <form
              onSubmit={handleAddApp}
              className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Nouvelle application ou outil
                </span>
                <span className="text-[11px] text-zinc-500">Ajout rapide au dock</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nom de l'application *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Blender, Slack, Behance..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AppShortcut['category'])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Design">Design & Création</option>
                    <option value="Dev & Tech">Dev & Tech</option>
                    <option value="Organisation">Organisation & Wiki</option>
                    <option value="Communication">Communication & Chat</option>
                    <option value="Cloud & Fichiers">Cloud & Fichiers</option>
                    <option value="Autre">Autre Outil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Lien / URL d'accès
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Description courte
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Rendu 3D, Mockups clients..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Choisissez l'icône associée
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((icon) => {
                    const Comp = icon.component;
                    const isSelected = iconName === icon.name;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setIconName(icon.name)}
                        className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <Comp className="w-4 h-4" />
                        <span className="text-[10px] truncate max-w-full">{icon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer l'application</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500">
          <span>Ces applications s'afficheront directement sur le tableau de bord et l'en-tête de votre espace.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
