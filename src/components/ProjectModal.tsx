import React, { useState } from 'react';
import { Project, ProjectType, PaymentStatus, ProjectLink } from '../types';
import { getTodayDateString } from '../utils/urgencyCalculator';
import {
  X,
  Plus,
  Trash2,
  FolderOpen,
  Link as LinkIcon,
  CreditCard,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onSave,
}) => {
  const isEditing = !!project;
  const today = getTodayDateString();

  const [name, setName] = useState(project?.name || '');
  const [client, setClient] = useState(project?.client || '');
  const [clientEmail, setClientEmail] = useState(project?.clientEmail || '');
  const [type, setType] = useState<ProjectType>(project?.type || 'Identité visuelle');
  const [budget, setBudget] = useState<number>(project?.budget ?? 0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    project?.paymentStatus || 'Devis signé'
  );
  const [startDate, setStartDate] = useState(project?.startDate || today);
  const [deadline, setDeadline] = useState(project?.deadline || today);
  const [notesBrief, setNotesBrief] = useState(project?.notesBrief || '');
  const [colorTag, setColorTag] = useState(project?.colorTag || '#f59e0b');

  // Links state
  const [links, setLinks] = useState<ProjectLink[]>(project?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<ProjectLink['category']>('Figma');

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setLinks([
      ...links,
      {
        id: `link-${Date.now()}`,
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
        category: newLinkCategory,
      },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;

    onSave({
      name: name.trim(),
      client: client.trim(),
      clientEmail: clientEmail.trim() || undefined,
      type,
      budget: Number(budget) || 0,
      currency: 'XOF',
      paymentStatus,
      startDate,
      deadline,
      notesBrief,
      colorTag,
      links,
    });
  };

  const COLOR_OPTIONS = [
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colorTag }}
            />
            <h3 className="text-lg font-bold text-white">
              {isEditing ? 'Modifier le Projet' : 'Nouveau Projet de Design'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nom du Projet <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Refonte Identité Visuelle — Maison Kalia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Client & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Client / Entreprise <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: Bloom Architecture (Sophie Martin)"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email de contact client
              </label>
              <input
                type="email"
                placeholder="contact@client.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Type of Project & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Type de Projet
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Identité visuelle">Identité visuelle</option>
                <option value="Réseaux sociaux">Réseaux sociaux</option>
                <option value="Print">Print</option>
                <option value="Web">Web</option>
                <option value="Packaging">Packaging</option>
                <option value="Motion design">Motion design</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Budget / Tarif (XOF - F CFA)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Statut Facturation
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Devis signé">Devis signé</option>
                <option value="Acompte 30% versé">Acompte 30% versé</option>
                <option value="Acompte 50% versé">Acompte 50% versé</option>
                <option value="Facturé 100%">Facturé 100%</option>
                <option value="Soldé / Payé">Soldé / Payé</option>
                <option value="Non facturé">Non facturé</option>
              </select>
            </div>
          </div>

          {/* Dates: Start & Delivery Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Date de Début
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Date de Livraison (Deadline Finale) <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Pastille de couleur visuelle
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColorTag(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    colorTag === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Brief & Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Notes & Brief Créatif
            </label>
            <textarea
              rows={3}
              placeholder="Contraintes typographiques, univers chromatique, exigences techniques, format livrables..."
              value={notesBrief}
              onChange={(e) => setNotesBrief(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Associated Files / Links */}
          <div className="border-t border-zinc-800 pt-3">
            <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span>Fichiers & Liens Associés (Drive, Figma, Notion, Brand kit...)</span>
              <span className="text-[11px] text-zinc-500 font-normal">{links.length} lien(s)</span>
            </label>

            {/* List existing links */}
            {links.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300">
                        {link.category}
                      </span>
                      <span className="font-semibold text-zinc-200">{link.title}</span>
                      <span className="text-zinc-500 text-[10px] truncate max-w-[200px]">{link.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Graphic Presets */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Presets rapides :</span>
              {[
                { label: '+ Figma', cat: 'Figma', title: 'Figma - Maquettes & Prototypes' },
                { label: '+ Photoshop', cat: 'Photoshop', title: 'Photoshop - Fichier PSD & Retouches' },
                { label: '+ Illustrator', cat: 'Illustrator', title: 'Illustrator - Vecteurs & Logo AI' },
                { label: '+ Canva', cat: 'Canva', title: 'Canva - Visuels & Templates' },
                { label: '+ Drive', cat: 'Google Drive', title: 'Google Drive - Dossier Assets' },
                { label: '+ Moodboard', cat: 'Pinterest', title: 'Pinterest - Planche de tendances' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setNewLinkCategory(preset.cat as any);
                    setNewLinkTitle(preset.title);
                  }}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer border border-zinc-750"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Add new link line */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Titre du lien (ex: Figma Maquettes)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="URL (https://...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <select
                value={newLinkCategory}
                onChange={(e) => setNewLinkCategory(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300"
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
                <option value="Notion">Notion</option>
                <option value="Autre">Autre</option>
              </select>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer shrink-0"
              >
                + Ajouter
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Créer le Projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
