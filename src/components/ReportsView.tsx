import React, { useState, useMemo } from 'react';
import { Project, Task, TaskStatus, ProjectType, PaymentStatus } from '../types';
import { calculateTaskUrgency, calculateProjectProgress, getTodayDateString } from '../utils/urgencyCalculator';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import {
  FileBarChart,
  Calendar,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  Printer,
  RotateCcw,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ReportsViewProps {
  projects: Project[];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onEditProject: (project: Project) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  tasks,
  onEditTask,
  onEditProject,
}) => {
  const today = getTodayDateString();

  // Filter States
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects'>('overview');

  // Project map for quick lookup
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Unique client list
  const clientList = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.client && p.client.trim()) set.add(p.client.trim());
    });
    return Array.from(set).sort();
  }, [projects]);

  // Unique project types
  const projectTypeList: ProjectType[] = [
    'Identité visuelle',
    'Réseaux sociaux',
    'Print',
    'Web',
    'Packaging',
    'Motion design',
    'Autre',
  ];

  // Quick Date Preset Handler
  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'this_month') {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      const lastDay = new Date(currentYear, currentMonth, 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'this_quarter') {
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const firstDay = new Date(currentYear, quarterStartMonth, 1);
      const lastDay = new Date(currentYear, quarterStartMonth + 3, 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      setDateFrom(`${currentYear}-01-01`);
      setDateTo(`${currentYear}-12-31`);
    } else if (preset === 'last_30_days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setDateFrom(past.toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    }
  };

  const handleResetFilters = () => {
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
    setSelectedClient('all');
    setSelectedProjectType('all');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setSearchQuery('');
  };

  // 1. Filter Projects based on selected criteria
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Client filter
      if (selectedClient !== 'all' && p.client !== selectedClient) {
        return false;
      }
      // Project Type filter
      if (selectedProjectType !== 'all' && p.type !== selectedProjectType) {
        return false;
      }
      // Payment status filter
      if (selectedPaymentStatus !== 'all' && p.paymentStatus !== selectedPaymentStatus) {
        return false;
      }
      // Search query in project
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Date range filter against project deadline or period
      if (dateFrom && p.deadline < dateFrom) {
        return false;
      }
      if (dateTo && p.startDate > dateTo) {
        return false;
      }
      return true;
    });
  }, [projects, selectedClient, selectedProjectType, selectedPaymentStatus, searchQuery, dateFrom, dateTo]);

  const filteredProjectIds = useMemo(() => new Set(filteredProjects.map((p) => p.id)), [filteredProjects]);

  // 2. Filter Tasks based on selected criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const project = projectMap.get(t.projectId);

      // Status filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }

      // Client filter (through project)
      if (selectedClient !== 'all') {
        if (!project || project.client !== selectedClient) {
          return false;
        }
      }

      // Project type filter (through project)
      if (selectedProjectType !== 'all') {
        if (!project || project.type !== selectedProjectType) {
          return false;
        }
      }

      // Payment status filter (through project)
      if (selectedPaymentStatus !== 'all') {
        if (!project || project.paymentStatus !== selectedPaymentStatus) {
          return false;
        }
      }

      // Date range filter against task dueDate
      if (dateFrom && t.dueDate < dateFrom) {
        return false;
      }
      if (dateTo && t.dueDate > dateTo) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        const matchProject = project ? project.name.toLowerCase().includes(q) : false;
        const matchClient = project ? project.client.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchDesc && !matchProject && !matchClient) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, projectMap, selectedStatus, selectedClient, selectedProjectType, selectedPaymentStatus, dateFrom, dateTo, searchQuery]);

  // Projects that are actually relevant to the filtered tasks or matched in filteredProjects
  const activeReportProjects = useMemo(() => {
    const taskProjectIds = new Set(filteredTasks.map((t) => t.projectId));
    return projects.filter((p) => filteredProjectIds.has(p.id) || taskProjectIds.has(p.id));
  }, [projects, filteredProjectIds, filteredTasks]);

  // 3. Computed Summary Metrics
  const summary = useMemo(() => {
    const totalTasksCount = filteredTasks.length;
    const completedTasks = filteredTasks.filter((t) => t.status === 'Terminé');
    const inProgressTasks = filteredTasks.filter((t) => t.status === 'En cours' || t.status === 'En révision');
    const waitingValidationTasks = filteredTasks.filter((t) => t.status === 'En attente de validation client');
    const todoTasks = filteredTasks.filter((t) => t.status === 'À faire');
    const overdueTasks = filteredTasks.filter((t) => {
      if (t.status === 'Terminé') return false;
      const urgency = calculateTaskUrgency(t, projectMap.get(t.projectId));
      return urgency.isOverdue;
    });

    const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

    // Total Budget of relevant projects (always in XOF)
    const totalBudget = activeReportProjects.reduce((acc, p) => acc + (p.budget || 0), 0);

    // Total estimated/spent hours on filtered tasks
    const totalHours = filteredTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

    // Average time spent per project
    const distinctProjectsCount = activeReportProjects.length;
    const avgHoursPerProject = distinctProjectsCount > 0 ? Number((totalHours / distinctProjectsCount).toFixed(1)) : 0;
    const avgHoursPerTask = totalTasksCount > 0 ? Number((totalHours / totalTasksCount).toFixed(1)) : 0;

    // Subtasks stats
    const totalSubtasks = filteredTasks.reduce((acc, t) => acc + t.subtasks.length, 0);
    const completedSubtasks = filteredTasks.reduce(
      (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
      0
    );

    return {
      totalTasksCount,
      completedTasksCount: completedTasks.length,
      inProgressTasksCount: inProgressTasks.length,
      waitingValidationTasksCount: waitingValidationTasks.length,
      todoTasksCount: todoTasks.length,
      overdueTasksCount: overdueTasks.length,
      completionRate,
      totalBudget,
      totalHours,
      distinctProjectsCount,
      avgHoursPerProject,
      avgHoursPerTask,
      totalSubtasks,
      completedSubtasks,
    };
  }, [filteredTasks, activeReportProjects, projectMap]);

  // Breakdown by Client
  const clientBreakdown = useMemo(() => {
    const map = new Map<string, { client: string; tasksCount: number; hours: number; budget: number }>();
    filteredTasks.forEach((t) => {
      const p = projectMap.get(t.projectId);
      const c = p ? p.client : 'Studio interne';
      const cur = map.get(c) || { client: c, tasksCount: 0, hours: 0, budget: p ? p.budget : 0 };
      cur.tasksCount += 1;
      cur.hours += t.estimatedHours || 0;
      map.set(c, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [filteredTasks, projectMap]);

  // Breakdown by Project Type
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, { type: string; tasksCount: number; hours: number }>();
    filteredTasks.forEach((t) => {
      const p = projectMap.get(t.projectId);
      const type = p ? p.type : 'Studio interne';
      const cur = map.get(type) || { type, tasksCount: 0, hours: 0 };
      cur.tasksCount += 1;
      cur.hours += t.estimatedHours || 0;
      map.set(type, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [filteredTasks, projectMap]);

  // Breakdown by Status
  const statusBreakdown = useMemo(() => {
    const statuses: TaskStatus[] = [
      'À faire',
      'En cours',
      'En attente de validation client',
      'En révision',
      'Terminé',
    ];
    return statuses.map((st) => {
      const count = filteredTasks.filter((t) => t.status === st).length;
      const pct = summary.totalTasksCount > 0 ? Math.round((count / summary.totalTasksCount) * 100) : 0;
      return { status: st, count, pct };
    });
  }, [filteredTasks, summary.totalTasksCount]);

  // Export functions
  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReportCSV = () => {
    const dateStamp = new Date().toISOString().split('T')[0];
    const headers = [
      'ID Tâche',
      'Titre Tâche',
      'Projet',
      'Client',
      'Type de Projet',
      'Statut Tâche',
      'Priorité',
      'Échéance',
      'Heures Estimées',
      'Budget Projet (XOF)',
      'Statut Facturation',
    ];

    const rows = filteredTasks.map((t) => {
      const p = projectMap.get(t.projectId);
      return [
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(p?.name || 'Studio interne').replace(/"/g, '""')}"`,
        `"${(p?.client || 'Interne').replace(/"/g, '""')}"`,
        `"${p?.type || 'Studio interne'}"`,
        `"${t.status}"`,
        `"${t.priority}"`,
        `"${t.dueDate}"`,
        `"${t.estimatedHours}"`,
        `"${p?.budget || 0}"`,
        `"${p?.paymentStatus || 'N/A'}"`,
      ];
    });

    const summarySection = [
      ['Rapport Personnalisé AgentDB - SIDIBE STUDIO', ''],
      ['Date de génération', new Date().toLocaleString('fr-FR')],
      ['Devise', 'Franc CFA (XOF) - Côte d’Ivoire'],
      ['Période', `${dateFrom || 'Début'} au ${dateTo || 'Fin'}`],
      ['Client filtré', selectedClient === 'all' ? 'Tous les clients' : selectedClient],
      ['Type de projet filtré', selectedProjectType === 'all' ? 'Tous les types' : selectedProjectType],
      ['Statut filtré', selectedStatus === 'all' ? 'Tous les statuts' : selectedStatus],
      ['Nombre total de tâches', summary.totalTasksCount.toString()],
      ['Budget total traité (XOF)', `${summary.totalBudget.toLocaleString('fr-FR')} XOF`],
      ['Temps total estimé (Heures)', `${summary.totalHours}h`],
      ['Temps moyen par projet', `${summary.avgHoursPerProject}h`],
      ['Nombre de projets traités', summary.distinctProjectsCount.toString()],
      ['Taux de complétion', `${summary.completionRate}%`],
      ['', ''],
      headers,
      ...rows,
    ];

    const csvContent = '\uFEFF' + summarySection.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentdb-rapport-personnalise-${dateStamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReportJSON = () => {
    const dateStamp = new Date().toISOString().split('T')[0];
    const reportData = {
      workspace: 'SIDIBE STUDIO — AgentDB Workspace',
      reportTitle: 'Rapport Personnalisé d’Activité Studio',
      generatedAt: new Date().toISOString(),
      currency: 'XOF (Franc CFA Côte d’Ivoire)',
      filtersApplied: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        client: selectedClient,
        projectType: selectedProjectType,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
      },
      summaryMetrics: {
        totalTasks: summary.totalTasksCount,
        completedTasks: summary.completedTasksCount,
        completionRatePercent: summary.completionRate,
        totalBudgetXOF: summary.totalBudget,
        totalHours: summary.totalHours,
        averageHoursPerProject: summary.avgHoursPerProject,
        averageHoursPerTask: summary.avgHoursPerTask,
        projectsCount: summary.distinctProjectsCount,
      },
      projects: activeReportProjects,
      tasks: filteredTasks,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentdb-rapport-${dateStamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <FileBarChart className="w-4 h-4" />
              <span>AgentDB Espace Relationnel • Rapports Personnalisés</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-3">
              Générateur de Rapports Personnalisés
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Devise : XOF (Côte d'Ivoire)
              </span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-3xl">
              Analysez la productivité de votre studio graphique avec filtrage multicritères : plage de dates, client ciblé, type de design et statut d’exécution.
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer shadow-sm"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              onClick={handleExportReportCSV}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer shadow-sm"
              title="Exporter les données du rapport en CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportReportJSON}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer shadow-sm"
              title="Exporter le snapshot JSON"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Granular Filter Control Panel */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Critères de Filtrage du Rapport</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800 rounded-lg border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser les filtres</span>
            </button>
          </div>
        </div>

        {/* Date presets pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            Période rapide :
          </span>
          {[
            { id: 'all', label: 'Toutes les dates' },
            { id: 'this_month', label: 'Ce mois-ci' },
            { id: 'last_month', label: 'Mois dernier' },
            { id: 'this_quarter', label: 'Ce trimestre' },
            { id: 'this_year', label: 'Cette année' },
            { id: 'last_30_days', label: '30 derniers jours' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyDatePreset(preset.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                datePreset === preset.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Grid of 4 Main Filters: Dates, Client, Type, Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* 1. Date Range: From & To */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Plage de Dates</span>
              {(dateFrom || dateTo) && (
                <span className="text-[10px] text-amber-400 font-mono">Période active</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setDatePreset('custom');
                  }}
                  title="Date de début"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-zinc-500 block mt-0.5">Du</span>
              </div>
              <div>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setDatePreset('custom');
                  }}
                  title="Date de fin"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-zinc-500 block mt-0.5">Au</span>
              </div>
            </div>
          </div>

          {/* 2. Client Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Client Spécifique</span>
              <span className="text-[10px] text-zinc-500">{clientList.length} clients</span>
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tous les clients ({clientList.length})</option>
              {clientList.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-zinc-500 block">Filtrer les livrables par commanditaire</span>
          </div>

          {/* 3. Project Type Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Type de Projet
            </label>
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tous les types de design</option>
              {projectTypeList.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-zinc-500 block">Branding, Web, Print, Packaging...</span>
          </div>

          {/* 4. Task Status Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Statut des Tâches
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="En attente de validation client">En attente de validation client</option>
              <option value="En révision">En révision</option>
              <option value="Terminé">Terminé</option>
            </select>
            <span className="text-[10px] text-zinc-500 block">Filtrer par étape de production</span>
          </div>
        </div>

        {/* Secondary row: Search & Payment status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Recherche mots-clés dans le rapport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs text-zinc-400">Facturation :</span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts facturation</option>
              <option value="Devis signé">Devis signé</option>
              <option value="Acompte 30% versé">Acompte 30% versé</option>
              <option value="Acompte 50% versé">Acompte 50% versé</option>
              <option value="Facturé 100%">Facturé 100%</option>
              <option value="Soldé / Payé">Soldé / Payé</option>
              <option value="Non facturé">Non facturé</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary KPI Cards (RÉSUMÉ DES DONNÉES FILTRÉES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nombre de tâches */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Tâches Traitées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary.totalTasksCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>{summary.completedTasksCount} terminées</span>
            <span className="font-semibold text-emerald-400">{summary.completionRate}% complété</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.completionRate}%` }}
            />
          </div>
          {summary.overdueTasksCount > 0 && (
            <div className="mt-2 text-[10px] text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{summary.overdueTasksCount} tâche(s) en retard dans ce filtre</span>
            </div>
          )}
        </div>

        {/* KPI 2: Budget total traité (en XOF Côte d'Ivoire) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Budget Total Traité</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight font-mono">
            {summary.totalBudget.toLocaleString('fr-FR')} <span className="text-lg font-bold text-amber-300">XOF</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
            <span>Devise studio</span>
            <span className="text-zinc-200 font-mono text-[11px]">Franc CFA (XOF)</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 truncate">
            {summary.distinctProjectsCount} projet(s) concerné(s) par le filtre
          </div>
        </div>

        {/* KPI 3: Temps moyen passé par projet */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Temps Moyen / Projet</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">
            {summary.avgHoursPerProject} <span className="text-lg font-normal text-zinc-400">heures</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Temps total filtré</span>
            <strong className="text-blue-400 font-mono">{summary.totalHours}h cumulées</strong>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Moyenne de {summary.avgHoursPerTask}h par tâche individuelle
          </div>
        </div>

        {/* KPI 4: Projets Couverts & Sous-tâches */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Portefeuille Projets</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary.distinctProjectsCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Sous-étapes validées</span>
            <span className="font-mono text-zinc-300">{summary.completedSubtasks} / {summary.totalSubtasks}</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            {summary.waitingValidationTasksCount} retour(s) client(s) en attente
          </div>
        </div>
      </div>

      {/* 4. Analytical Breakdown Bars & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Répartition par Statut des Tâches
          </h3>
          <div className="space-y-3">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.status}</span>
                  <span className="text-zinc-400 font-mono">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'Terminé'
                        ? 'bg-emerald-400'
                        : item.status === 'En cours'
                        ? 'bg-blue-400'
                        : item.status === 'En attente de validation client'
                        ? 'bg-purple-400'
                        : item.status === 'En révision'
                        ? 'bg-amber-400'
                        : 'bg-zinc-500'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload by Client */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Temps de Travail par Client
          </h3>
          {clientBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Aucune donnée pour ce filtre.</p>
          ) : (
            <div className="space-y-3">
              {clientBreakdown.slice(0, 5).map((item) => {
                const maxHours = clientBreakdown[0]?.hours || 1;
                const pct = Math.round((item.hours / maxHours) * 100);
                return (
                  <div key={item.client} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium truncate max-w-[180px]">
                        {item.client}
                      </span>
                      <span className="text-amber-400 font-mono font-bold">
                        {item.hours}h ({item.tasksCount} tâches)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Workload by Project Type */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Volume par Type de Design
          </h3>
          {typeBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Aucune donnée pour ce filtre.</p>
          ) : (
            <div className="space-y-3">
              {typeBreakdown.map((item) => {
                const totalH = summary.totalHours || 1;
                const pct = Math.round((item.hours / totalH) * 100);
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium">{item.type}</span>
                      <span className="text-purple-300 font-mono">
                        {item.hours}h • {item.tasksCount} tâche(s)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Detailed Tables Switcher: Tasks & Projects in Report */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vue Complète Tâches ({filteredTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Projets Associés ({activeReportProjects.length})
            </button>
          </div>

          <div className="text-xs text-zinc-400">
            Affichage des résultats filtrés selon vos critères
          </div>
        </div>

        {activeTab === 'overview' ? (
          /* Tasks Details Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Tâche</th>
                  <th className="py-3 px-4">Projet & Client</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Urgence</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4 font-mono">Heures</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-500">
                      Aucune tâche ne correspond à cette combinaison de filtres.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    const urgency = calculateTaskUrgency(task, project);

                    return (
                      <tr key={task.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => onEditTask(task)}
                            className="font-bold text-zinc-100 hover:text-amber-400 cursor-pointer"
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {project ? (
                            <div>
                              <span
                                className="px-2 py-0.5 rounded-full border text-[10px] font-semibold inline-block max-w-[170px] truncate"
                                style={{
                                  borderColor: `${project.colorTag}40`,
                                  backgroundColor: `${project.colorTag}15`,
                                  color: project.colorTag,
                                }}
                              >
                                {project.name}
                              </span>
                              <div className="text-[10px] text-zinc-400 mt-0.5">
                                Client : <strong>{project.client}</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500">Studio interne</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[11px] text-zinc-400">
                            {project?.type || 'Interne'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={task.status} size="sm" />
                        </td>

                        <td className="py-3 px-4">
                          <UrgencyBadge urgency={urgency} />
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className={urgency.isOverdue ? 'text-rose-400 font-bold' : ''}>
                            {task.dueDate}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-zinc-200">
                          {task.estimatedHours}h
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onEditTask(task)}
                            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs cursor-pointer"
                          >
                            Éditer
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Projects Details Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Projet</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Budget Traité (XOF)</th>
                  <th className="py-3 px-4">Statut Paiement</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Tâches Associées</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {activeReportProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-500">
                      Aucun projet ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                ) : (
                  activeReportProjects.map((project) => {
                    const projectTasks = filteredTasks.filter((t) => t.projectId === project.id);
                    const progress = calculateProjectProgress(projectTasks);
                    const projectHours = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

                    return (
                      <tr key={project.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-zinc-100">
                          <div
                            onClick={() => onEditProject(project)}
                            className="hover:text-amber-400 cursor-pointer"
                          >
                            {project.name}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-zinc-300 font-medium">
                          {project.client}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                            {project.type}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-400">
                            {project.budget.toLocaleString('fr-FR')} {project.currency || 'XOF'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-zinc-400 font-mono text-[11px]">
                            {project.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                          {project.startDate} → {project.deadline}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[11px] text-zinc-300">
                            <strong>{projectTasks.length}</strong> tâche(s) • <strong className="text-blue-400 font-mono">{projectHours}h</strong>
                          </div>
                          <div className="w-20 bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1 border border-zinc-800">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${progress.percent}%`,
                                backgroundColor: project.colorTag || '#f59e0b',
                              }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onEditProject(project)}
                            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs cursor-pointer"
                          >
                            Éditer
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
