export type ProjectType =
  | 'Identité visuelle'
  | 'Réseaux sociaux'
  | 'Print'
  | 'Web'
  | 'Packaging'
  | 'Motion design'
  | 'Autre';

export type TaskStatus =
  | 'À faire'
  | 'En cours'
  | 'En attente de validation client'
  | 'En révision'
  | 'Terminé';

export type PaymentStatus =
  | 'Non facturé'
  | 'Devis signé'
  | 'Acompte 30% versé'
  | 'Acompte 50% versé'
  | 'Facturé 100%'
  | 'Soldé / Payé';

export type PriorityLevel = 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';

export type UrgencyLevel = 'Critique' | 'Haute' | 'Modérée' | 'Faible';

export interface CalculatedUrgency {
  score: number; // 0 à 100
  level: UrgencyLevel;
  badgeColor: string;
  reason: string;
  daysRemaining: number;
  isOverdue: boolean;
  isDueToday: boolean;
}

export type GraphicToolCategory =
  | 'Figma'
  | 'Photoshop'
  | 'Illustrator'
  | 'Canva'
  | 'InDesign'
  | 'After Effects'
  | 'Blender / 3D'
  | 'Google Drive'
  | 'Dropbox'
  | 'Pinterest'
  | 'Behance'
  | 'Notion'
  | 'Brand kit'
  | 'Autre';

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  category: GraphicToolCategory;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string; // ID du projet associé ou 'studio-interne'
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  estimatedHours: number;
  priority: PriorityLevel;
  subtasks: Subtask[];
  tags: string[];
  graphicTool?: {
    tool: GraphicToolCategory;
    url: string;
    label?: string;
  };
  clientValidationRequestedDate?: string; // Date à laquelle la validation a été demandée
  completedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientEmail?: string;
  clientPhone?: string;
  type: ProjectType;
  budget: number;
  currency: string;
  paymentStatus: PaymentStatus;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  links: ProjectLink[];
  notesBrief: string;
  colorTag: string;
  createdAt: string;
  archived?: boolean;
}

export type ActiveView =
  | 'dashboard'
  | 'graphic-tools'
  | 'app-accounts'
  | 'today'
  | 'overdue'
  | 'week'
  | 'calendar'
  | 'workload'
  | 'projects'
  | 'kanban'
  | 'table'
  | 'reports'
  | 'billing';

export type AppAccountCategory =
  | 'Suite Adobe'
  | 'Design & UI'
  | 'Stockage & Fichiers'
  | 'Organisation & Notes'
  | 'Portfolio & Inspiration'
  | 'Autre';

export interface ConnectedAppAccount {
  id: string;
  appKey: string;
  appName: string;
  category: AppAccountCategory;
  iconKey: string;
  brandColor: string;
  loginUrl: string;
  officialPortalUrl: string;
  appProtocol?: string;
  isConnected: boolean;
  accountEmail?: string;
  accountUsername?: string;
  planType?: string;
  syncEnabled?: boolean;
  lastConnectedAt?: string;
  passwordHint?: string;
  apiKeyOrToken?: string;
  notes?: string;
}

export interface ConnectedGraphicTool {
  id: string;
  name: string;
  category: 'Vectoriel & Maquettes' | 'Retouche & Bitmap' | 'Mise en page & Print' | 'Motion & Vidéo' | '3D & Rendu' | 'Templates Rapides';
  iconKey: string;
  color: string;
  defaultUrl: string;
  appProtocol?: string;
  customStudioUrl?: string;
  isConnected: boolean;
  description: string;
}

export interface WorkloadDay {
  date: string;
  dayName: string;
  dayNumber: number;
  tasks: Task[];
  totalHours: number;
  isToday: boolean;
}

// ================= USER & AUTH =================
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  companyName?: string;
  avatarColor: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  lastLogin?: string;
  workspaces: string[];
  currentWorkspaceId: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

// ================= WORKSPACE & CUSTOMIZATION =================
export type WorkspaceDomain =
  | 'Studio Graphique & Design'
  | 'Développement Web & Tech'
  | 'Agence Marketing & Médias'
  | 'Architecture & BTP'
  | 'Freelance & Consulting'
  | 'Production Vidéo & Motion'
  | 'E-Commerce & Retail'
  | 'Autre Domaine';

export interface WorkspacePalette {
  id: string;
  name: string;
  primary: string; // Hex color e.g. #f59e0b
  primaryName: string; // Tailwind equivalent or descriptive
  accent: string;
  bgGlow: string;
}

export interface AppShortcut {
  id: string;
  name: string;
  iconName: string; // e.g. 'Figma', 'Illustrator', 'Photoshop', 'Canva', 'Github', 'Notion', 'Folder', 'Code', 'Globe', 'Drive'
  url: string;
  category: 'Design' | 'Dev & Tech' | 'Organisation' | 'Communication' | 'Cloud & Fichiers' | 'Autre';
  description?: string;
}

export interface DashboardConfig {
  domain: WorkspaceDomain;
  visibleWidgets: {
    kpiFinancial: boolean;
    urgencies: boolean;
    todayTomorrow: boolean;
    projectPipeline: boolean;
    appShortcuts: boolean;
    billingQuick: boolean;
    workloadWeek: boolean;
    clientValidation: boolean;
  };
}

export interface CompanyBillingInfo {
  companyName: string;
  tagline?: string;
  logoUrl?: string;
  address: string;
  city: string;
  country: string; // Default Côte d'Ivoire
  phone: string;
  email: string;
  taxId?: string; // N° RCCM / CC
  bankOrMobileMoney?: string; // e.g. "Wave / Orange Money : +225 07 00 00 00 00"
}

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  domain: WorkspaceDomain;
  currency: string; // 'XOF'
  palette: WorkspacePalette;
  dashboardConfig: DashboardConfig;
  appShortcuts: AppShortcut[];
  billingInfo: CompanyBillingInfo;
  createdAt: string;
  updatedAt: string;
}

// ================= FACTURE PROFORMA =================
export interface ProformaItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in XOF
  total: number;
}

export type ProformaStatus =
  | 'Brouillon'
  | 'Envoyée au client'
  | 'Acceptée & Signée'
  | 'Refusée'
  | 'Convertie en projet';

export interface ProformaInvoice {
  id: string;
  workspaceId: string;
  number: string; // e.g. 'PROFORMA-2026-001'
  title: string; // Objet de la prestation
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: ProformaItem[];
  subtotal: number; // Total HT en XOF
  discountPercent: number; // 0 à 100
  taxPercent: number; // 0 ou 18% etc.
  totalAmount: number; // Total Net en XOF
  paymentTerms: string;
  paymentMethods: string;
  notes?: string;
  status: ProformaStatus;
  createdAt: string;
}

// ================= REÇU DE PAIEMENT =================
export type PaymentMethod =
  | 'Wave Côte d\'Ivoire'
  | 'Orange Money'
  | 'MTN Mobile Money'
  | 'Espèces'
  | 'Virement bancaire'
  | 'Chèque'
  | 'Carte bancaire';

export type ReceiptPaymentType =
  | 'Acompte initial (30%)'
  | 'Acompte initial (50%)'
  | 'Règlement intermédiaire'
  | 'Solde final (100%)'
  | 'Paiement intégral';

export interface PaymentReceipt {
  id: string;
  workspaceId: string;
  receiptNumber: string; // e.g. 'RECU-2026-001'
  date: string; // YYYY-MM-DD
  clientName: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
  projectId?: string;
  projectName?: string;
  proformaId?: string;
  proformaNumber?: string;
  amountPaid: number; // in XOF
  paymentMethod: PaymentMethod;
  paymentType: ReceiptPaymentType;
  totalProjectAmount: number; // in XOF
  previouslyPaid: number; // in XOF
  remainingBalance: number; // in XOF
  paymentReference?: string; // N° de transaction Wave, Orange Money ou virement
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

