import React, { useState } from 'react';
import { Project, Task, TaskStatus, PaymentStatus } from '../types';
import { calculateTaskUrgency, calculateProjectProgress } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import {
  Table as TableIcon,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Plus,
  Download,
  FolderOpen,
  CheckSquare,
  ExternalLink,
  FileBarChart,
} from 'lucide-react';

interface TableViewProps {
  projects: Project[];
  tasks: Task[];
  onEditProject: (project: Project) => void;
  onEditTask: (task: Task) => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onExportCSV: () => void;
  onNavigateToReports?: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  projects,
  tasks,
  onEditProject,
  onEditTask,
  onDeleteProject,
  onDeleteTask,
  onUpdateTaskStatus,
  onOpenNewProject,
  onOpenNewTask,
  onExportCSV,
  onNavigateToReports,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects'>('tasks');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Sorting & Filtering for Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (projectMap.get(t.projectId)?.name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'dueDate') {
      comparison = a.dueDate.localeCompare(b.dueDate);
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'estimatedHours') {
      comparison = a.estimatedHours - b.estimatedHours;
    } else if (sortField === 'urgency') {
      const uA = calculateTaskUrgency(a, projectMap.get(a.projectId)).score;
      const uB = calculateTaskUrgency(b, projectMap.get(b.projectId)).score;
      comparison = uA - uB;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Filter & sort for projects
  const filteredProjects = projects.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <TableIcon className="w-4 h-4" />
            <span>AgentDB Espace Relationnel</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Table des Données Studio
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Base de données synchronisée : filtres granulaires, tri par colonnes et édition instantanée.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Table Tâches ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Table Projets ({projects.length})
            </button>
          </div>

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Ouvrir les Rapports Personnalisés AgentDB"
            >
              <FileBarChart className="w-3.5 h-3.5 text-amber-400" />
              <span>Rapports AgentDB</span>
            </button>
          )}

          <button
            onClick={activeTab === 'tasks' ? onOpenNewTask : onOpenNewProject}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeTab === 'tasks' ? '+ Tâche' : '+ Projet'}</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={activeTab === 'tasks' ? 'Filtrer tâches, projets...' : 'Filtrer projets, clients...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {activeTab === 'tasks' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="En attente de validation client">En attente client</option>
              <option value="En révision">En révision</option>
              <option value="Terminé">Terminé</option>
            </select>
          )}

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
            title="Exporter en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      {activeTab === 'tasks' ? (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Titre de la tâche</th>
                  <th className="py-3 px-4">Projet associé</th>
                  <th className="py-3 px-4">Statut</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('urgency')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Urgence Calculée</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Échéance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('estimatedHours')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Heures</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      Aucune tâche ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    const urgency = calculateTaskUrgency(task, project);

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-zinc-800/40 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div
                            onClick={() => onEditTask(task)}
                            className="font-bold text-zinc-100 hover:text-amber-300 cursor-pointer"
                          >
                            {task.title}
                          </div>
                          {task.subtasks.length > 0 && (
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} sous-tâches
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {project ? (
                            <span
                              className="px-2 py-0.5 rounded-full border text-[11px] font-medium inline-block max-w-[180px] truncate"
                              style={{
                                borderColor: `${project.colorTag}40`,
                                backgroundColor: `${project.colorTag}15`,
                                color: project.colorTag,
                              }}
                            >
                              {project.name}
                            </span>
                          ) : (
                            <span className="text-zinc-500">Studio interne</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                          >
                            <option value="À faire">À faire</option>
                            <option value="En cours">En cours</option>
                            <option value="En attente de validation client">En attente client</option>
                            <option value="En révision">En révision</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <UrgencyBadge urgency={urgency} />
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className={urgency.isOverdue ? 'text-rose-400 font-bold' : ''}>
                            {task.dueDate}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium">
                          {task.estimatedHours}h
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer la tâche "${task.title}" ?`)) {
                                  onDeleteTask(task.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Projects Table */
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Nom du Projet</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Type de Design</th>
                  <th className="py-3 px-4">Budget / Facturation</th>
                  <th className="py-3 px-4">Dates (Début → Fin)</th>
                  <th className="py-3 px-4">Progression</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProjects.map((project) => {
                  const projectTasks = tasks.filter((t) => t.projectId === project.id);
                  const progress = calculateProjectProgress(projectTasks);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-zinc-100">
                        <div
                          onClick={() => onEditProject(project)}
                          className="hover:text-amber-400 cursor-pointer"
                        >
                          {project.name}
                        </div>
                        {project.links.length > 0 && (
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {project.links.length} lien(s) / fichier(s) rattaché(s)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-300">
                        {project.client}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
                          {project.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400">
                          {project.budget.toLocaleString('fr-FR')} {project.currency || 'XOF'}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {project.paymentStatus}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {project.startDate} → {project.deadline}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${progress.percent}%`,
                                backgroundColor: project.colorTag || '#f59e0b',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold">
                            {progress.percent}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProject(project)}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le projet "${project.name}" et ses tâches ?`)) {
                                onDeleteProject(project.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
