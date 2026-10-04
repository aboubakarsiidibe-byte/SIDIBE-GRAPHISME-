import React, { useState } from 'react';
import { Task, Project, TaskStatus, PriorityLevel, Subtask, GraphicToolCategory } from '../types';
import { getTodayDateString, calculateTaskUrgency } from '../utils/urgencyCalculator';
import { UrgencyBadge } from './UrgencyBadge';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

interface TaskModalProps {
  task?: Task | null;
  projects: Project[];
  defaultProjectId?: string;
  defaultDate?: string;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  projects,
  defaultProjectId,
  defaultDate,
  defaultStatus,
  onClose,
  onSave,
}) => {
  const isEditing = !!task;
  const today = getTodayDateString();

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [projectId, setProjectId] = useState(
    task?.projectId || defaultProjectId || (projects[0]?.id ?? 'studio-interne')
  );
  const [status, setStatus] = useState<TaskStatus>(
    task?.status || defaultStatus || 'À faire'
  );
  const [priority, setPriority] = useState<PriorityLevel>(task?.priority || 'Moyenne');
  const [dueDate, setDueDate] = useState(task?.dueDate || defaultDate || today);
  const [estimatedHours, setEstimatedHours] = useState<number>(task?.estimatedHours || 3);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Graphic tool link for this task
  const [graphicToolType, setGraphicToolType] = useState<GraphicToolCategory>(
    task?.graphicTool?.tool || 'Figma'
  );
  const [graphicToolUrl, setGraphicToolUrl] = useState(task?.graphicTool?.url || '');
  const [graphicToolLabel, setGraphicToolLabel] = useState(task?.graphicTool?.label || '');

  // Live urgency preview
  const previewTask: Task = {
    id: task?.id || 'preview',
    projectId,
    title: title || 'Aperçu',
    status,
    dueDate,
    estimatedHours,
    priority,
    subtasks,
    tags: [],
    createdAt: task?.createdAt || today,
  };
  const selectedProject = projects.find((p) => p.id === projectId);
  const previewUrgency = calculateTaskUrgency(previewTask, selectedProject);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      status,
      priority,
      dueDate,
      estimatedHours: Number(estimatedHours) || 1,
      subtasks,
      graphicTool: graphicToolUrl.trim()
        ? {
            tool: graphicToolType,
            url: graphicToolUrl.trim().startsWith('http')
              ? graphicToolUrl.trim()
              : `https://${graphicToolUrl.trim()}`,
            label: graphicToolLabel.trim() || undefined,
          }
        : undefined,
      clientValidationRequestedDate:
        status === 'En attente de validation client' && !task?.clientValidationRequestedDate
          ? today
          : task?.clientValidationRequestedDate,
      completedAt: status === 'Terminé' && !task?.completedAt ? new Date().toISOString() : task?.completedAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEditing ? 'Modifier la Tâche' : 'Nouvelle Tâche Studio'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-400">Urgence calculée en temps réel :</span>
              <UrgencyBadge urgency={previewUrgency} />
            </div>
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Titre de la tâche <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Création des déclinaisons logos & typographies"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Project Association */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Projet Associé
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="studio-interne">Studio interne (Organisation / Marketing)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Description & Consignes
            </label>
            <textarea
              rows={2}
              placeholder="Détails techniques, calques, résolutions, instructions de révision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status, Priority, DueDate, Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="En attente de validation client">En attente de validation client</option>
                <option value="En révision">En révision</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Priorité Manuelle
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Urgente">Urgente 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Date d'échéance <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Charge estimée (Heures)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="40"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Graphic Tool & File Attachment */}
          <div className="border-t border-zinc-800 pt-3">
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Outil ou Maquette Graphique Rattachée (Optionnel)</span>
              </span>
              {graphicToolUrl && (
                <span className="text-[10px] text-emerald-400 font-medium">Lien rattaché</span>
              )}
            </label>
            <p className="text-[11px] text-zinc-400 mb-2">
              Liez directement cette tâche à une maquette Figma, un template Canva, ou un PSD pour y accéder en 1 clic.
            </p>

            {/* Quick tool selector pills */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {(['Figma', 'Photoshop', 'Illustrator', 'Canva', 'Google Drive', 'InDesign', 'After Effects'] as GraphicToolCategory[]).map(
                (tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => {
                      setGraphicToolType(tool);
                      if (!graphicToolLabel) {
                        setGraphicToolLabel(`Maquette ${tool}`);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${
                      graphicToolType === tool
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
                    }`}
                  >
                    {tool}
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="URL du fichier (ex: https://figma.com/...)"
                value={graphicToolUrl}
                onChange={(e) => setGraphicToolUrl(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="text"
                placeholder="Libellé du bouton (ex: Ouvrir Frame #3)"
                value={graphicToolLabel}
                onChange={(e) => setGraphicToolLabel(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="border-t border-zinc-800 pt-3">
            <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span>Étapes & Sous-tâches (Checklist)</span>
              <span className="text-[11px] text-zinc-500 font-normal">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length} validées
              </span>
            </label>

            {/* Existing subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(s.id)}
                      className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                    >
                      {s.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                      )}
                      <span className={s.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                        {s.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input to add new subtask */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nouvelle sous-étape (ex: Export PDF HD 300dpi)..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer shrink-0"
              >
                + Ajouter
              </button>
            </div>
          </div>

          {/* Footer buttons */}
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
              {isEditing ? 'Enregistrer les modifications' : 'Créer la Tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
