import React, { useState, useEffect } from 'react';
import {
  Project,
  Task,
  ActiveView,
  TaskStatus,
  Workspace,
  WorkspacePalette,
  AppShortcut,
  User,
  ProformaInvoice,
  PaymentReceipt,
  ProjectLink,
} from './types';
import {
  loadProjects,
  saveProjects,
  loadTasks,
  saveTasks,
  resetStudioData,
  exportWorkspaceJSON,
  importWorkspaceJSON,
  exportTasksCSV,
} from './utils/storage';
import {
  loadWorkspaces,
  saveWorkspaces,
  loadActiveWorkspaceId,
  saveActiveWorkspaceId,
  loadProformas,
  saveProformas,
  createOrUpdateProforma,
  deleteProforma as removeProformaStorage,
  loadReceipts,
  saveReceipts,
  createOrUpdateReceipt,
  deleteReceipt as removeReceiptStorage,
  updateWorkspace,
  createWorkspace,
  INITIAL_DEFAULT_WORKSPACE,
} from './utils/workspaceStorage';
import { loadCurrentUser, logoutUser, isStudioLocked, setStudioLockedState } from './utils/authStorage';
import { pushWorkspaceSnapshot } from './utils/cloudSync';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TodayView } from './components/TodayView';
import { OverdueView } from './components/OverdueView';
import { WeekView } from './components/WeekView';
import { CalendarView } from './components/CalendarView';
import { WorkloadView } from './components/WorkloadView';
import { ProjectProgressView } from './components/ProjectProgressView';
import { KanbanView } from './components/KanbanView';
import { TableView } from './components/TableView';
import { ReportsView } from './components/ReportsView';
import { BillingView } from './components/BillingView';
import { GraphicToolsView } from './components/GraphicToolsView';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { PaletteModal } from './components/PaletteModal';
import { AppLauncherModal } from './components/AppLauncherModal';
import { ProformaModal } from './components/ProformaModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PhotoshopDirectModal } from './components/PhotoshopDirectModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { StudioLockScreen } from './components/StudioLockScreen';
import { AppAccountsView } from './components/AppAccountsView';

export default function App() {
  // Persistence states
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => loadActiveWorkspaceId());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadCurrentUser());
  const [proformas, setProformas] = useState<ProformaInvoice[]>(() => loadProformas());
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => loadReceipts());

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterType, setActiveFilterType] = useState('all');

  // Active workspace derived
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || INITIAL_DEFAULT_WORKSPACE;

  // Task & Project Modals
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newTaskDefaultDate, setNewTaskDefaultDate] = useState<string | undefined>();
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<TaskStatus | undefined>();
  const [newTaskDefaultProjectId, setNewTaskDefaultProjectId] = useState<string | undefined>();

  // New Modals: Auth, Workspace, Palette, App Launcher, Proforma, Receipt
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'profile'>('login');

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);

  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);

  const [isProformaModalOpen, setIsProformaModalOpen] = useState(false);
  const [editingProforma, setEditingProforma] = useState<ProformaInvoice | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<PaymentReceipt | null>(null);
  const [initialProformaForReceipt, setInitialProformaForReceipt] = useState<ProformaInvoice | null>(
    null
  );

  // Photoshop Direct PC & Security Privacy Modals
  const [isPhotoshopDirectOpen, setIsPhotoshopDirectOpen] = useState(false);
  const [isSecurityPrivacyOpen, setIsSecurityPrivacyOpen] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => isStudioLocked());

  // Left Sidebar State (Toutes les options à gauche)
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveWorkspaces(workspaces);
  }, [workspaces]);

  useEffect(() => {
    saveActiveWorkspaceId(activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    saveProformas(proformas);
  }, [proformas]);

  useEffect(() => {
    saveReceipts(receipts);
  }, [receipts]);

  // Workspace Switch & Update
  const syncActiveWorkspaceToCloud = async (
    workspace: Workspace,
    nextProjects = projects,
    nextTasks = tasks
  ) => {
    try {
      await pushWorkspaceSnapshot(workspace, nextProjects, nextTasks);
    } catch (error) {
      console.warn('SIDIBE STUDIO cloud sync:', error);
    }
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
  };

  const handleOpenNewWorkspace = () => {
    setWorkspaceToEdit(null);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenEditWorkspace = () => {
    setWorkspaceToEdit(activeWorkspace);
    setIsWorkspaceModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    void syncActiveWorkspaceToCloud(activeWorkspace);
  };

  const handleSaveWorkspaceModal = (workspaceData: {
    name: string;
    tagline: string;
    domain: Workspace['domain'];
    palette: WorkspacePalette;
    dashboardConfig?: Workspace['dashboardConfig'];
    billingInfo: Workspace['billingInfo'];
  }) => {
    if (workspaceToEdit) {
      // Update existing
      const updated = updateWorkspace(workspaceToEdit.id, workspaceData);
      setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      void syncActiveWorkspaceToCloud(updated);
    } else {
      // Create new
      const created = createWorkspace(currentUser?.id || 'admin', workspaceData);
      setWorkspaces((prev) => [...prev, created]);
      setActiveWorkspaceId(created.id);
      void syncActiveWorkspaceToCloud(created);
    }
  };

  const handleSavePalette = (palette: WorkspacePalette) => {
    const updated = updateWorkspace(activeWorkspace.id, { palette });
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleSaveShortcuts = (appShortcuts: AppShortcut[]) => {
    const updated = updateWorkspace(activeWorkspace.id, { appShortcuts });
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' | 'profile' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Proforma Invoices Handlers
  const handleOpenNewProforma = () => {
    setEditingProforma(null);
    setIsProformaModalOpen(true);
  };

  const handleEditProforma = (proforma: ProformaInvoice) => {
    setEditingProforma(proforma);
    setIsProformaModalOpen(true);
  };

  const handleSaveProforma = (savedProforma: ProformaInvoice) => {
    createOrUpdateProforma(savedProforma);
    setProformas(loadProformas());
  };

  const handleDeleteProforma = (id: string) => {
    removeProformaStorage(id);
    setProformas(loadProformas());
  };

  // Receipts Handlers
  const handleOpenNewReceipt = () => {
    setEditingReceipt(null);
    setInitialProformaForReceipt(null);
    setIsReceiptModalOpen(true);
  };

  const handleEditReceipt = (receipt: PaymentReceipt) => {
    setEditingReceipt(receipt);
    setInitialProformaForReceipt(null);
    setIsReceiptModalOpen(true);
  };

  const handleCreateReceiptFromProforma = (proforma: ProformaInvoice) => {
    setEditingReceipt(null);
    setInitialProformaForReceipt(proforma);
    setIsReceiptModalOpen(true);
  };

  const handleSaveReceipt = (savedReceipt: PaymentReceipt) => {
    createOrUpdateReceipt(savedReceipt);
    setReceipts(loadReceipts());
  };

  const handleDeleteReceipt = (id: string) => {
    removeReceiptStorage(id);
    setReceipts(loadReceipts());
  };

  // Project CRUD
  const handleSaveProject = (data: Partial<Project>) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? ({ ...p, ...data } as Project) : p))
      );
      setEditingProject(null);
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: data.name || 'Nouveau projet',
        client: data.client || 'Client',
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        type: data.type || 'Identité visuelle',
        budget: data.budget || 0,
        currency: 'XOF',
        paymentStatus: data.paymentStatus || 'Devis signé',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        deadline: data.deadline || new Date().toISOString().split('T')[0],
        links: data.links || [],
        notesBrief: data.notesBrief || '',
        colorTag: data.colorTag || activeWorkspace.palette.primary,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProj, ...prev]);
      void syncActiveWorkspaceToCloud(activeWorkspace, [newProj, ...projects], tasks);
      setIsNewProjectOpen(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
  };

  const handleAddLinkToProject = (projectId: string, link: ProjectLink) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, links: [...(p.links || []), link] };
        }
        return p;
      })
    );
  };

  const handleRemoveLinkFromProject = (projectId: string, linkId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, links: (p.links || []).filter((l) => l.id !== linkId) };
        }
        return p;
      })
    );
  };

  // Task CRUD
  const handleSaveTask = (data: Partial<Task>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? ({ ...t, ...data } as Task) : t))
      );
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        projectId: data.projectId || (projects[0]?.id ?? 'studio-interne'),
        title: data.title || 'Nouvelle tâche',
        description: data.description,
        status: data.status || 'À faire',
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        startDate: data.startDate,
        estimatedHours: data.estimatedHours || 2,
        priority: data.priority || 'Moyenne',
        subtasks: data.subtasks || [],
        tags: data.tags || ['Design'],
        graphicTool: data.graphicTool,
        clientValidationRequestedDate: data.clientValidationRequestedDate,
        completedAt: data.completedAt,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      void syncActiveWorkspaceToCloud(activeWorkspace, projects, [newTask, ...tasks]);
      setIsNewTaskOpen(false);
      setNewTaskDefaultDate(undefined);
      setNewTaskDefaultStatus(undefined);
      setNewTaskDefaultProjectId(undefined);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const isNowDone = newStatus === 'Terminé';
        const isClientWait = newStatus === 'En attente de validation client';
        return {
          ...t,
          status: newStatus,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
          clientValidationRequestedDate: isClientWait
            ? t.clientValidationRequestedDate || new Date().toISOString().split('T')[0]
            : undefined,
        };
      })
    );
    void syncActiveWorkspaceToCloud(activeWorkspace, projects, tasks);
  };

  const handleUpdateTaskDueDate = (taskId: string, newDueDate: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t))
    );
    void syncActiveWorkspaceToCloud(activeWorkspace, projects, tasks);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return {
          ...t,
          subtasks: updatedSubtasks,
        };
      })
    );
    void syncActiveWorkspaceToCloud(activeWorkspace, projects, tasks);
  };

  // Quick Task Modal triggers
  const handleOpenNewTaskWithDate = (dateStr: string) => {
    setNewTaskDefaultDate(dateStr);
    setIsNewTaskOpen(true);
  };

  const handleOpenNewTaskWithStatus = (status: TaskStatus) => {
    setNewTaskDefaultStatus(status);
    setIsNewTaskOpen(true);
  };

  const handleOpenNewTaskForProject = (projectId: string) => {
    setNewTaskDefaultProjectId(projectId);
    setIsNewTaskOpen(true);
  };

  // Reset and Export
  const handleResetData = () => {
    const { projects: initialP, tasks: initialT } = resetStudioData();
    setProjects(initialP);
    setTasks(initialT);
  };

  const handleExportJSON = () => {
    exportWorkspaceJSON(projects, tasks);
  };

  const handleExportCSV = () => {
    exportTasksCSV(tasks, projects);
  };

  const handleImportJSON = async (file: File) => {
    try {
      const confirmed = window.confirm(
        'Restaurer cette sauvegarde remplacera les projets et tâches actuels. Continuer ?'
      );
      if (!confirmed) return;
      const restored = await importWorkspaceJSON(file);
      setProjects(restored.projects);
      setTasks(restored.tasks);
      window.alert(
        `Sauvegarde restaurée : ${restored.projects.length} projet(s) et ${restored.tasks.length} tâche(s).`
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? `Restauration impossible : ${error.message}`
          : 'Restauration impossible : fichier invalide.'
      );
    }
  };

  // Filter tasks with global search query if present
  const displayTasks = searchQuery.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex antialiased overflow-hidden">
      {/* Barre Latérale Gauche avec TOUTES les Options */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        projects={projects}
        tasks={tasks}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        currentUser={currentUser}
        proformasCount={proformas.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenNewProforma={handleOpenNewProforma}
        onOpenNewReceipt={handleOpenNewReceipt}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenNewWorkspace={handleOpenNewWorkspace}
        onOpenEditWorkspace={handleOpenEditWorkspace}
        onOpenPaletteModal={() => setIsPaletteModalOpen(true)}
        onOpenAppLauncher={() => setIsAppLauncherOpen(true)}
        onOpenAuthModal={(mode) => handleOpenAuth(mode)}
        onOpenPhotoshopDirect={() => setIsPhotoshopDirectOpen(true)}
        onOpenSecurityPrivacy={() => setIsSecurityPrivacyOpen(true)}
        onLockStudio={() => {
          setStudioLockedState(true);
          setIsLocked(true);
        }}
        onLogout={handleLogout}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Colonne Principale de Contenu à Droite */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopHeader
          activeView={activeView}
          projects={projects}
          tasks={tasks}
          activeWorkspace={activeWorkspace}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsSidebarMobileOpen(true)}
          onOpenNewTask={() => setIsNewTaskOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenPhotoshopDirect={() => setIsPhotoshopDirectOpen(true)}
          onOpenSecurityPrivacy={() => setIsSecurityPrivacyOpen(true)}
          onLockStudio={() => {
            setStudioLockedState(true);
            setIsLocked(true);
          }}
          onNavigateToAppAccounts={() => setActiveView('app-accounts')}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeView === 'dashboard' && (
          <DashboardView
            workspace={activeWorkspace}
            projects={projects}
            tasks={displayTasks}
            proformas={proformas}
            receipts={receipts}
            onViewChange={setActiveView}
            onEditTask={(task) => setEditingTask(task)}
            onEditProject={(proj) => setEditingProject(proj)}
            onToggleSubtask={handleToggleSubtask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewProforma={handleOpenNewProforma}
            onOpenNewReceipt={handleOpenNewReceipt}
            onOpenAppLauncher={() => setIsAppLauncherOpen(true)}
            onOpenWorkspaceModal={handleOpenEditWorkspace}
            onOpenPaletteModal={() => setIsPaletteModalOpen(true)}
          />
        )}

        {activeView === 'graphic-tools' && (
          <GraphicToolsView
            workspace={activeWorkspace}
            projects={projects}
            tasks={displayTasks}
            onOpenProject={(proj) => setEditingProject(proj)}
            onOpenTask={(task) => setEditingTask(task)}
            onAddLinkToProject={handleAddLinkToProject}
            onRemoveLinkFromProject={handleRemoveLinkFromProject}
            onOpenPhotoshopDirect={() => setIsPhotoshopDirectOpen(true)}
            onOpenSecurityPrivacy={() => setIsSecurityPrivacyOpen(true)}
            onNavigateToAppAccounts={() => setActiveView('app-accounts')}
          />
        )}

        {activeView === 'app-accounts' && (
          <AppAccountsView
            workspace={activeWorkspace}
            currentUser={currentUser}
            onOpenPhotoshopDirect={() => setIsPhotoshopDirectOpen(true)}
            onOpenSecurityPrivacy={() => setIsSecurityPrivacyOpen(true)}
            onLockStudio={() => {
              setStudioLockedState(true);
              setIsLocked(true);
            }}
          />
        )}

        {activeView === 'billing' && (
          <BillingView
            workspace={activeWorkspace}
            projects={projects}
            proformas={proformas}
            receipts={receipts}
            onNewProforma={handleOpenNewProforma}
            onEditProforma={handleEditProforma}
            onDeleteProforma={handleDeleteProforma}
            onNewReceipt={handleOpenNewReceipt}
            onEditReceipt={handleEditReceipt}
            onDeleteReceipt={handleDeleteReceipt}
            onCreateReceiptFromProforma={handleCreateReceiptFromProforma}
          />
        )}

        {activeView === 'today' && (
          <TodayView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
          />
        )}

        {activeView === 'overdue' && (
          <OverdueView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
            onUpdateTaskDueDate={handleUpdateTaskDueDate}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeView === 'week' && (
          <WeekView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
            onEditProject={(proj) => setEditingProject(proj)}
            onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
          />
        )}

        {activeView === 'workload' && (
          <WorkloadView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
          />
        )}

        {activeView === 'projects' && (
          <ProjectProgressView
            projects={projects}
            tasks={displayTasks}
            onEditProject={(proj) => setEditingProject(proj)}
            onEditTask={(task) => setEditingTask(task)}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenNewTaskForProject={handleOpenNewTaskForProject}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            tasks={displayTasks}
            projects={projects}
            onEditTask={(task) => setEditingTask(task)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
          />
        )}

        {activeView === 'table' && (
          <TableView
            projects={projects}
            tasks={displayTasks}
            onEditProject={(proj) => setEditingProject(proj)}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteProject={handleDeleteProject}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onExportCSV={handleExportCSV}
            onNavigateToReports={() => setActiveView('reports')}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            projects={projects}
            tasks={displayTasks}
            onEditTask={(task) => setEditingTask(task)}
            onEditProject={(proj) => setEditingProject(proj)}
          />
        )}
      </main>
      </div>

      {/* MODALS */}
      {/* 1. Project Modal */}
      {(isNewProjectOpen || editingProject) && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setIsNewProjectOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* 2. Task Modal */}
      {(isNewTaskOpen || editingTask) && (
        <TaskModal
          task={editingTask}
          projects={projects}
          defaultDate={newTaskDefaultDate}
          defaultStatus={newTaskDefaultStatus}
          defaultProjectId={newTaskDefaultProjectId}
          onClose={() => {
            setIsNewTaskOpen(false);
            setEditingTask(null);
            setNewTaskDefaultDate(undefined);
            setNewTaskDefaultStatus(undefined);
            setNewTaskDefaultProjectId(undefined);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* 3. Secure Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 4. Workspace Creation / Customization Modal */}
      {isWorkspaceModalOpen && (
        <WorkspaceModal
          workspace={workspaceToEdit}
          onClose={() => {
            setIsWorkspaceModalOpen(false);
            setWorkspaceToEdit(null);
          }}
          onSave={handleSaveWorkspaceModal}
        />
      )}

      {/* 5. Color Palette Modal */}
      {isPaletteModalOpen && (
        <PaletteModal
          currentPalette={activeWorkspace.palette}
          onClose={() => setIsPaletteModalOpen(false)}
          onSavePalette={handleSavePalette}
        />
      )}

      {/* 6. Custom App Launcher / Icon Manager */}
      {isAppLauncherOpen && (
        <AppLauncherModal
          shortcuts={activeWorkspace.appShortcuts}
          onClose={() => setIsAppLauncherOpen(false)}
          onSaveShortcuts={handleSaveShortcuts}
        />
      )}

      {/* 7. Proforma Invoice Modal (Facture Proforma & Devis PDF) */}
      {isProformaModalOpen && (
        <ProformaModal
          proforma={editingProforma}
          workspace={activeWorkspace}
          projects={projects}
          onClose={() => {
            setIsProformaModalOpen(false);
            setEditingProforma(null);
          }}
          onSave={handleSaveProforma}
          onCreateReceiptFromProforma={handleCreateReceiptFromProforma}
        />
      )}

      {/* 8. Receipt Modal (Reçu de Paiement & Encaissé PDF) */}
      {isReceiptModalOpen && (
        <ReceiptModal
          receipt={editingReceipt}
          initialProforma={initialProformaForReceipt}
          workspace={activeWorkspace}
          projects={projects}
          proformas={proformas}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setEditingReceipt(null);
            setInitialProformaForReceipt(null);
          }}
          onSave={handleSaveReceipt}
        />
      )}

      {/* 9. Direct Adobe Photoshop PC Modal */}
      {isPhotoshopDirectOpen && (
        <PhotoshopDirectModal
          workspace={activeWorkspace}
          projects={projects}
          onClose={() => setIsPhotoshopDirectOpen(false)}
          onLinkPsdToProject={(projectId, fileName, path) => {
            handleAddLinkToProject(projectId, {
              id: `link-psd-${Date.now()}`,
              title: fileName,
              url: `photoshop://open?url=${encodeURIComponent(path)}`,
              category: 'Photoshop',
            });
          }}
        />
      )}

      {/* 10. Security & Privacy Center Modal */}
      {isSecurityPrivacyOpen && (
        <SecurityPrivacyModal
          currentUser={currentUser}
          workspace={activeWorkspace}
          onClose={() => setIsSecurityPrivacyOpen(false)}
          onLockStudio={() => {
            setStudioLockedState(true);
            setIsLocked(true);
          }}
        />
      )}

      {/* 11. Studio Lock Screen (Protection anti-intrusion & mots de passe) */}
      {isLocked && (
        <StudioLockScreen
          currentUser={currentUser}
          workspace={activeWorkspace}
          onUnlocked={() => {
            setStudioLockedState(false);
            setIsLocked(false);
          }}
        />
      )}
    </div>
  );
}
