import {
  Workspace,
  WorkspacePalette,
  AppShortcut,
  WorkspaceDomain,
  ProformaInvoice,
  PaymentReceipt,
} from '../types';

const STORAGE_KEY_WORKSPACES = 'sidibe_studio_workspaces_v2';
const STORAGE_KEY_ACTIVE_WORKSPACE = 'sidibe_studio_active_workspace_id_v2';
const STORAGE_KEY_PROFORMAS = 'sidibe_studio_proformas_v2';
const STORAGE_KEY_RECEIPTS = 'sidibe_studio_receipts_v2';

export const PALETTE_PRESETS: WorkspacePalette[] = [
  {
    id: 'amber',
    name: 'Ambre Doré Studio',
    primary: '#f59e0b',
    primaryName: 'Ambre',
    accent: '#fbbf24',
    bgGlow: 'rgba(245, 158, 11, 0.18)',
  },
  {
    id: 'emerald',
    name: 'Émeraude Abidjan',
    primary: '#10b981',
    primaryName: 'Émeraude',
    accent: '#34d399',
    bgGlow: 'rgba(16, 185, 129, 0.18)',
  },
  {
    id: 'blue',
    name: 'Bleu Saphir Tech',
    primary: '#3b82f6',
    primaryName: 'Bleu',
    accent: '#60a5fa',
    bgGlow: 'rgba(59, 130, 246, 0.18)',
  },
  {
    id: 'purple',
    name: 'Pourpre Cyber Luxe',
    primary: '#8b5cf6',
    primaryName: 'Pourpre',
    accent: '#a78bfa',
    bgGlow: 'rgba(139, 92, 246, 0.18)',
  },
  {
    id: 'coral',
    name: 'Corail Sunset',
    primary: '#f97316',
    primaryName: 'Corail',
    accent: '#fb923c',
    bgGlow: 'rgba(249, 115, 22, 0.18)',
  },
  {
    id: 'rose',
    name: 'Rose Fushia Néon',
    primary: '#ec4899',
    primaryName: 'Rose',
    accent: '#f472b6',
    bgGlow: 'rgba(236, 72, 153, 0.18)',
  },
  {
    id: 'cyan',
    name: 'Cyan Électrique',
    primary: '#06b6d4',
    primaryName: 'Cyan',
    accent: '#22d3ee',
    bgGlow: 'rgba(6, 182, 212, 0.18)',
  },
  {
    id: 'gold',
    name: 'Or Somptueux',
    primary: '#eab308',
    primaryName: 'Or',
    accent: '#facc15',
    bgGlow: 'rgba(234, 179, 8, 0.18)',
  },
];

export const DEFAULT_APP_SHORTCUTS: AppShortcut[] = [
  {
    id: 'app-figma',
    name: 'Figma',
    iconName: 'Figma',
    url: 'https://figma.com',
    category: 'Design',
    description: 'Interface & prototypes',
  },
  {
    id: 'app-illustrator',
    name: 'Adobe Illustrator',
    iconName: 'Illustrator',
    url: 'https://adobe.com/illustrator',
    category: 'Design',
    description: 'Vecteurs & logos',
  },
  {
    id: 'app-photoshop',
    name: 'Adobe Photoshop',
    iconName: 'Photoshop',
    url: 'https://adobe.com/photoshop',
    category: 'Design',
    description: 'Retouche & compositing',
  },
  {
    id: 'app-canva',
    name: 'Canva Pro',
    iconName: 'Canva',
    url: 'https://canva.com',
    category: 'Design',
    description: 'Visuels réseaux sociaux',
  },
  {
    id: 'app-notion',
    name: 'Notion',
    iconName: 'Notion',
    url: 'https://notion.so',
    category: 'Organisation',
    description: 'Documentation & wikis',
  },
  {
    id: 'app-drive',
    name: 'Google Drive',
    iconName: 'Drive',
    url: 'https://drive.google.com',
    category: 'Cloud & Fichiers',
    description: 'Stockage & livrables',
  },
  {
    id: 'app-github',
    name: 'GitHub',
    iconName: 'Github',
    url: 'https://github.com',
    category: 'Dev & Tech',
    description: 'Repositories & code',
  },
  {
    id: 'app-wave',
    name: 'Wave Business CI',
    iconName: 'PhoneCall',
    url: 'https://wave.com',
    category: 'Autre',
    description: 'Règlements mobiles Côte d\'Ivoire',
  },
];

export const INITIAL_DEFAULT_WORKSPACE: Workspace = {
  id: 'workspace-default',
  ownerId: 'user-admin-sidibe',
  name: 'SIDIBE STUDIO',
  tagline: 'Studio Graphique & Direction Artistique',
  domain: 'Studio Graphique & Design',
  currency: 'XOF',
  palette: PALETTE_PRESETS[0],
  dashboardConfig: {
    domain: 'Studio Graphique & Design',
    visibleWidgets: {
      kpiFinancial: true,
      urgencies: true,
      todayTomorrow: true,
      projectPipeline: true,
      appShortcuts: true,
      billingQuick: true,
      workloadWeek: true,
      clientValidation: true,
    },
  },
  appShortcuts: DEFAULT_APP_SHORTCUTS,
  billingInfo: {
    companyName: 'SIDIBE STUDIO CI',
    tagline: 'Création visuelle, Branding & Développement',
    address: 'Cocody Deux Plateaux Vallons, Rue des Jardins',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    phone: '+225 07 88 99 00 11',
    email: 'contact@sidibestudio.ci',
    taxId: 'CI-ABJ-2024-B-1428',
    bankOrMobileMoney: 'Wave & Orange Money : +225 07 88 99 00 11 | Virement SGBCI',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ================= WORKSPACES =================
export function loadWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (!raw) {
      saveWorkspaces([INITIAL_DEFAULT_WORKSPACE]);
      return [INITIAL_DEFAULT_WORKSPACE];
    }
    const parsed: Workspace[] = JSON.parse(raw);
    if (parsed.length === 0) {
      saveWorkspaces([INITIAL_DEFAULT_WORKSPACE]);
      return [INITIAL_DEFAULT_WORKSPACE];
    }
    return parsed;
  } catch (e) {
    console.error('Error loading workspaces', e);
    return [INITIAL_DEFAULT_WORKSPACE];
  }
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
  } catch (e) {
    console.error('Error saving workspaces', e);
  }
}

export function loadActiveWorkspaceId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_WORKSPACE);
    return id || 'workspace-default';
  } catch {
    return 'workspace-default';
  }
}

export function saveActiveWorkspaceId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_WORKSPACE, id);
  } catch (e) {
    console.error('Error saving active workspace ID', e);
  }
}

export function getActiveWorkspace(): Workspace {
  const workspaces = loadWorkspaces();
  const activeId = loadActiveWorkspaceId();
  return workspaces.find((w) => w.id === activeId) || workspaces[0] || INITIAL_DEFAULT_WORKSPACE;
}

export function updateWorkspace(workspaceId: string, data: Partial<Workspace>): Workspace {
  const workspaces = loadWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId);
  if (index === -1) {
    const newW: Workspace = {
      ...INITIAL_DEFAULT_WORKSPACE,
      ...data,
      id: workspaceId,
      updatedAt: new Date().toISOString(),
    };
    saveWorkspaces([...workspaces, newW]);
    return newW;
  }

  const updated: Workspace = {
    ...workspaces[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  workspaces[index] = updated;
  saveWorkspaces(workspaces);
  return updated;
}

export function createWorkspace(
  ownerId: string,
  data: {
    name: string;
    tagline?: string;
    domain?: WorkspaceDomain;
    palette?: WorkspacePalette;
    billingInfo?: Partial<Workspace['billingInfo']>;
  }
): Workspace {
  const workspaces = loadWorkspaces();
  const domain: WorkspaceDomain = data.domain || 'Studio Graphique & Design';
  const palette = data.palette || PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];

  const newWorkspace: Workspace = {
    id: `workspace-${Date.now()}`,
    ownerId,
    name: data.name.trim() || 'Mon Nouvel Espace Pro',
    tagline: data.tagline?.trim() || `Espace ${domain}`,
    domain,
    currency: 'XOF',
    palette,
    dashboardConfig: {
      domain,
      visibleWidgets: {
        kpiFinancial: true,
        urgencies: true,
        todayTomorrow: true,
        projectPipeline: true,
        appShortcuts: true,
        billingQuick: true,
        workloadWeek: true,
        clientValidation: true,
      },
    },
    appShortcuts: [...DEFAULT_APP_SHORTCUTS],
    billingInfo: {
      companyName: data.name.trim() || 'Mon Studio Pro',
      tagline: data.tagline || 'Services professionnels',
      address: data.billingInfo?.address || 'Abidjan, Côte d\'Ivoire',
      city: data.billingInfo?.city || 'Abidjan',
      country: "Côte d'Ivoire",
      phone: data.billingInfo?.phone || '+225 00 00 00 00',
      email: data.billingInfo?.email || 'contact@studio.ci',
      taxId: data.billingInfo?.taxId || '',
      bankOrMobileMoney: data.billingInfo?.bankOrMobileMoney || 'Wave & Orange Money',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveWorkspaces([...workspaces, newWorkspace]);
  saveActiveWorkspaceId(newWorkspace.id);
  return newWorkspace;
}

// ================= FACTURES PROFORMA =================
export function loadProformas(workspaceId?: string): ProformaInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFORMAS);
    if (!raw) return [];
    const parsed: ProformaInvoice[] = JSON.parse(raw);
    if (workspaceId) {
      return parsed.filter((p) => p.workspaceId === workspaceId);
    }
    return parsed;
  } catch (e) {
    console.error('Error loading proformas', e);
    return [];
  }
}

export function saveProformas(proformas: ProformaInvoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFORMAS, JSON.stringify(proformas));
  } catch (e) {
    console.error('Error saving proformas', e);
  }
}

export function createOrUpdateProforma(proforma: ProformaInvoice): ProformaInvoice {
  const all = loadProformas();
  const index = all.findIndex((p) => p.id === proforma.id);
  let updatedList: ProformaInvoice[];
  if (index >= 0) {
    updatedList = all.map((p) => (p.id === proforma.id ? proforma : p));
  } else {
    updatedList = [proforma, ...all];
  }
  saveProformas(updatedList);
  return proforma;
}

export function deleteProforma(proformaId: string): void {
  const all = loadProformas();
  saveProformas(all.filter((p) => p.id !== proformaId));
}

// ================= REÇUS DE PAIEMENT =================
export function loadReceipts(workspaceId?: string): PaymentReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEIPTS);
    if (!raw) return [];
    const parsed: PaymentReceipt[] = JSON.parse(raw);
    if (workspaceId) {
      return parsed.filter((r) => r.workspaceId === workspaceId);
    }
    return parsed;
  } catch (e) {
    console.error('Error loading receipts', e);
    return [];
  }
}

export function saveReceipts(receipts: PaymentReceipt[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(receipts));
  } catch (e) {
    console.error('Error saving receipts', e);
  }
}

export function createOrUpdateReceipt(receipt: PaymentReceipt): PaymentReceipt {
  const all = loadReceipts();
  const index = all.findIndex((r) => r.id === receipt.id);
  let updatedList: PaymentReceipt[];
  if (index >= 0) {
    updatedList = all.map((r) => (r.id === receipt.id ? receipt : r));
  } else {
    updatedList = [receipt, ...all];
  }
  saveReceipts(updatedList);
  return receipt;
}

export function deleteReceipt(receiptId: string): void {
  const all = loadReceipts();
  saveReceipts(all.filter((r) => r.id !== receiptId));
}
