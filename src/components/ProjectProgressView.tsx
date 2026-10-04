import React, { useState } from 'react';
import { Project, Task, ProjectType } from '../types';
import { calculateProjectProgress, getTodayDateString, getDaysDifference } from '../utils/urgencyCalculator';
import { calculateProjectHealth } from '../utils/projectHealth';
import {
  TrendingUp,
  FolderPlus,
  ExternalLink,
  Calendar,
  CreditCard,
  User,
  Plus,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ProjectProgressViewProps {
  projects: Project[];
  tasks: Task[];
  onEditProject: (project: Project) => void;
  onEditTask: (task: Task) => void;
  onOpenNewProject: () => void;
  onOpenNewTaskForProject: (projectId: string) => void;
}

export const ProjectProgressView: React.FC<ProjectProgressViewProps> = ({
  projects,
  tasks,
  onEditProject,
  onEditTask,
  onOpenNewProject,
  onOpenNewTaskForProject,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const todayStr = getTodayDateString();

  const filteredProjects = selectedType === 'all'
    ? projects
    : projects.filter((p) => p.type === selectedType);

  const toggleExpand = (id: string) => {
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Suivi des Livrables & Avancement</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Progression par Projet
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Barres de progression calculées dynamiquement selon l'avancement des tâches, budgets engagés et briefs créatifs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les types de design</option>
            <option value="Identité visuelle">Identité visuelle</option>
            <option value="Réseaux sociaux">Réseaux sociaux</option>
            <option value="Print">Print</option>
            <option value="Web">Web</option>
            <option value="Packaging">Packaging</option>
            <option value="Motion design">Motion design</option>
          </select>

          <button
            onClick={onOpenNewProject}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const progress = calculateProjectProgress(projectTasks);
          const daysToDeadline = getDaysDifference(project.deadline, todayStr);
          const isOverdue = daysToDeadline < 0;
          const isExpanded = expandedProjectId === project.id;
          const health = calculateProjectHealth(project, tasks, todayStr);
          const healthScore = health.score;
          const healthLevel = health.level;
          const overdueTasks = health.overdueTasks;
          const validationTasks = health.validationTasks;
          const healthClass = healthLevel === 'Excellent'
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : healthLevel === 'Attention'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : healthLevel === 'Risque'
                ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

          return (
            <div
              key={project.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 transition-all shadow-lg"
            >
              {/* Top row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.colorTag || '#f59e0b' }}
                    />
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {project.type}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {project.paymentStatus}
                    </span>
                    {isOverdue ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Deadline dépassée ({Math.abs(daysToDeadline)}j de retard)
                      </span>
                    ) : daysToDeadline === 0 ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Livraison aujourd'hui !
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono">
                        J-{daysToDeadline} (Livraison : {project.deadline})
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onEditProject(project)}
                    className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                  >
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${healthClass}`}>
                      {healthLevel === 'Excellent' ? <CheckCircle2 className="w-3 h-3" /> : healthLevel === 'Bloqué' ? <AlertTriangle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      Santé : {healthLevel} · {healthScore}/100
                    </span>
                    {overdueTasks > 0 && <span className="text-[10px] text-rose-300">{overdueTasks} retard{overdueTasks > 1 ? 's' : ''}</span>}
                    {validationTasks > 0 && <span className="text-[10px] text-amber-300">{validationTasks} validation{validationTasks > 1 ? 's' : ''} client</span>}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      Client : <strong className="text-zinc-200">{project.client}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                      Budget : <strong className="text-amber-400">{project.budget.toLocaleString('fr-FR')} {project.currency}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Du {project.startDate} au {project.deadline}
                    </span>
                  </div>
                </div>

                {/* Progress Metric & Actions */}
                <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-zinc-100">
                      {progress.percent}%
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {progress.completedTasks} / {progress.totalTasks} tâches faites
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNewTaskForProject(project.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tâche</span>
                    </button>
                    <button
                      onClick={() => onEditProject(project)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                      title={isExpanded ? 'Réduire' : 'Afficher détails & brief'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-4 w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress.percent}%`,
                    backgroundColor: project.colorTag || '#f59e0b',
                  }}
                />
              </div>

              {/* Status pills breakdown */}
              <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                <span className="text-[11px]">Répartition :</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                  {progress.completedTasks} Terminée(s)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300">
                  {progress.inProgressTasks} En cours / Révision
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300">
                  {progress.waitingTasks} En attente client
                </span>
              </div>

              {/* Expanded Area: Brief, Links, and Task checklist */}
              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-zinc-800 space-y-4">
                  {/* Brief & Notes */}
                  {project.notesBrief && (
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Brief Créatif & Notes Studio</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {project.notesBrief}
                      </p>
                    </div>
                  )}

                  {/* Links / Files */}
                  {project.links.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Fichiers & Liens Liés</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {project.links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs text-zinc-200 hover:text-amber-400 transition-colors"
                          >
                            <span className="font-medium truncate">{link.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                              {link.category}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks list of this project */}
                  <div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                      Tâches du projet ({projectTasks.length})
                    </div>
                    {projectTasks.length === 0 ? (
                      <div className="text-xs text-zinc-500 py-2">
                        Aucune tâche enregistrée pour ce projet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {projectTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onEditTask(t)}
                            className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 flex items-center justify-between text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  t.status === 'Terminé' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <span
                                className={`font-medium truncate ${
                                  t.status === 'Terminé' ? 'line-through text-zinc-500' : 'text-zinc-200'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-zinc-400">
                              {t.graphicTool && (
                                <a
                                  href={t.graphicTool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
                                  title={`Ouvrir dans ${t.graphicTool.tool}`}
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  <span>{t.graphicTool.label || t.graphicTool.tool}</span>
                                </a>
                              )}
                              <span>Échéance: {t.dueDate}</span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
