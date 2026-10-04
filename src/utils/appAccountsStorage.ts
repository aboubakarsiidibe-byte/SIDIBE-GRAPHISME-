import { ConnectedAppAccount, AppAccountCategory } from '../types';

const STORAGE_KEY_APP_ACCOUNTS = 'sidibe_studio_app_accounts_v1';

export const DEFAULT_APP_ACCOUNTS: ConnectedAppAccount[] = [
  {
    id: 'acc-photoshop',
    appKey: 'photoshop',
    appName: 'Adobe Photoshop & Creative Cloud',
    category: 'Suite Adobe',
    iconKey: 'photoshop',
    brandColor: '#31A8FF',
    loginUrl: 'https://auth.services.adobe.com/en_US/deeplink.html',
    officialPortalUrl: 'https://creativecloud.adobe.com/apps/photoshop',
    appProtocol: 'photoshop://',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    accountUsername: 'Aboubakar Sidibe',
    planType: 'Formule Creative Cloud & Photoshop Officielle',
    syncEnabled: true,
    lastConnectedAt: 'Actif aujourd\'hui',
    passwordHint: 'Protégé par Web Crypto SHA-256',
    notes: 'Liaison directe Photoshop PC activée via le protocole OS. Synchronisation des Cloud Documents PSD et des bibliothèques Adobe CC.',
  },
  {
    id: 'acc-illustrator',
    appKey: 'illustrator',
    appName: 'Adobe Illustrator',
    category: 'Suite Adobe',
    iconKey: 'illustrator',
    brandColor: '#FF9A00',
    loginUrl: 'https://auth.services.adobe.com',
    officialPortalUrl: 'https://creativecloud.adobe.com/apps/illustrator',
    appProtocol: 'illustrator://',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    accountUsername: 'Aboubakar Sidibe',
    planType: 'Licence Adobe CC Vectoriel',
    syncEnabled: true,
    lastConnectedAt: 'Actif',
    notes: 'Création de logos, typographies vectorielles et identités visuelles.',
  },
  {
    id: 'acc-figma',
    appKey: 'figma',
    appName: 'Figma & FigJam',
    category: 'Design & UI',
    iconKey: 'figma',
    brandColor: '#F24E1E',
    loginUrl: 'https://www.figma.com/login',
    officialPortalUrl: 'https://www.figma.com',
    appProtocol: 'figma://',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    accountUsername: 'sidibe_design',
    planType: 'Figma Professional Studio',
    syncEnabled: true,
    lastConnectedAt: 'Actif',
    notes: 'Design systems, maquettes web interactives et fiches projets.',
  },
  {
    id: 'acc-canva',
    appKey: 'canva',
    appName: 'Canva Pro Studio',
    category: 'Design & UI',
    iconKey: 'canva',
    brandColor: '#00C4CC',
    loginUrl: 'https://www.canva.com/login',
    officialPortalUrl: 'https://www.canva.com',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    accountUsername: 'Studio Sidibe',
    planType: 'Canva Pro Entreprise',
    syncEnabled: true,
    lastConnectedAt: 'Actif',
    notes: 'Visuels réseaux sociaux rapides, carrousels et templates clients.',
  },
  {
    id: 'acc-googledrive',
    appKey: 'googledrive',
    appName: 'Google Drive & Workspace',
    category: 'Stockage & Fichiers',
    iconKey: 'googledrive',
    brandColor: '#4285F4',
    loginUrl: 'https://accounts.google.com/signin',
    officialPortalUrl: 'https://drive.google.com',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    planType: 'Google Workspace Cloud 2 To',
    syncEnabled: true,
    lastConnectedAt: 'Actif',
    notes: 'Dossiers partagés clients, livrables haute résolution et archives devis.',
  },
  {
    id: 'acc-notion',
    appKey: 'notion',
    appName: 'Notion Workspace',
    category: 'Organisation & Notes',
    iconKey: 'notion',
    brandColor: '#1A1A1A',
    loginUrl: 'https://www.notion.so/login',
    officialPortalUrl: 'https://www.notion.so',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    planType: 'Notion Plus / Team',
    syncEnabled: false,
    lastConnectedAt: 'Actif',
    notes: 'Cahiers des charges, fiches briefs clients et documentation interne.',
  },
  {
    id: 'acc-indesign',
    appKey: 'indesign',
    appName: 'Adobe InDesign',
    category: 'Suite Adobe',
    iconKey: 'indesign',
    brandColor: '#FF3366',
    loginUrl: 'https://auth.services.adobe.com',
    officialPortalUrl: 'https://creativecloud.adobe.com/apps/indesign',
    isConnected: false,
    planType: 'Non connecté',
    syncEnabled: false,
    notes: 'Édition, catalogues, brochures et mise en page print.',
  },
  {
    id: 'acc-aftereffects',
    appKey: 'aftereffects',
    appName: 'Adobe After Effects',
    category: 'Suite Adobe',
    iconKey: 'aftereffects',
    brandColor: '#9999FF',
    loginUrl: 'https://auth.services.adobe.com',
    officialPortalUrl: 'https://creativecloud.adobe.com/apps/aftereffects',
    isConnected: false,
    planType: 'Non connecté',
    syncEnabled: false,
    notes: 'Motion graphics, animations de logo et vidéos promotionnelles.',
  },
  {
    id: 'acc-behance',
    appKey: 'behance',
    appName: 'Behance Portfolio (Adobe)',
    category: 'Portfolio & Inspiration',
    iconKey: 'behance',
    brandColor: '#053EFF',
    loginUrl: 'https://www.behance.net/login',
    officialPortalUrl: 'https://www.behance.net',
    isConnected: true,
    accountEmail: 'aboubakarsiidibe@gmail.com',
    planType: 'Adobe Portfolio Pro',
    syncEnabled: true,
    lastConnectedAt: 'Actif',
    notes: 'Vitrine en ligne des créations du Studio et études de cas.',
  },
  {
    id: 'acc-pinterest',
    appKey: 'pinterest',
    appName: 'Pinterest Business',
    category: 'Portfolio & Inspiration',
    iconKey: 'pinterest',
    brandColor: '#E60023',
    loginUrl: 'https://www.pinterest.com/login',
    officialPortalUrl: 'https://www.pinterest.com',
    isConnected: false,
    planType: 'Non connecté',
    syncEnabled: false,
    notes: 'Moodboards, tableaux d\'inspiration et références graphiques.',
  },
  {
    id: 'acc-dropbox',
    appKey: 'dropbox',
    appName: 'Dropbox Business',
    category: 'Stockage & Fichiers',
    iconKey: 'dropbox',
    brandColor: '#0061FF',
    loginUrl: 'https://www.dropbox.com/login',
    officialPortalUrl: 'https://www.dropbox.com',
    isConnected: false,
    planType: 'Non connecté',
    syncEnabled: false,
    notes: 'Transferts volumineux et archives fichiers imprimeurs.',
  },
];

export function loadAppAccounts(): ConnectedAppAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APP_ACCOUNTS);
    if (!raw) return DEFAULT_APP_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default accounts to ensure new fields or accounts are present
      const map = new Map<string, ConnectedAppAccount>();
      DEFAULT_APP_ACCOUNTS.forEach((a) => map.set(a.id, a));
      parsed.forEach((p: ConnectedAppAccount) => {
        if (p && p.id) {
          const def = map.get(p.id);
          map.set(p.id, { ...(def || {}), ...p });
        }
      });
      return Array.from(map.values());
    }
    return DEFAULT_APP_ACCOUNTS;
  } catch (err) {
    console.error('Erreur chargement des comptes d\'applications', err);
    return DEFAULT_APP_ACCOUNTS;
  }
}

export function saveAppAccounts(accounts: ConnectedAppAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APP_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Erreur sauvegarde des comptes d\'applications', err);
  }
}

export function updateAppAccount(id: string, updates: Partial<ConnectedAppAccount>): ConnectedAppAccount[] {
  const accounts = loadAppAccounts();
  const next = accounts.map((acc) => {
    if (acc.id === id) {
      return {
        ...acc,
        ...updates,
        lastConnectedAt: updates.isConnected ? new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : acc.lastConnectedAt,
      };
    }
    return acc;
  });
  saveAppAccounts(next);
  return next;
}

export function addCustomAppAccount(newAccount: Omit<ConnectedAppAccount, 'id'>): ConnectedAppAccount[] {
  const accounts = loadAppAccounts();
  const created: ConnectedAppAccount = {
    ...newAccount,
    id: `acc-custom-${Date.now()}`,
    isConnected: true,
    lastConnectedAt: 'Ajouté à l\'instant',
  };
  const next = [created, ...accounts];
  saveAppAccounts(next);
  return next;
}

export function removeAppAccount(id: string): ConnectedAppAccount[] {
  const accounts = loadAppAccounts();
  const next = accounts.filter((a) => a.id !== id);
  saveAppAccounts(next);
  return next;
}

export function disconnectAllAccounts(): ConnectedAppAccount[] {
  const accounts = loadAppAccounts();
  const next = accounts.map((a) => ({
    ...a,
    isConnected: false,
    lastConnectedAt: undefined,
  }));
  saveAppAccounts(next);
  return next;
}

/**
 * Ouvre la page d'authentification officielle de l'application dans un nouvel onglet sécurisé
 */
export function openOfficialAppLogin(account: ConnectedAppAccount): { success: boolean; url: string } {
  const url = account.loginUrl || account.officialPortalUrl;
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, url };
  } catch (e) {
    console.error('Erreur ouverture de login', e);
    return { success: false, url };
  }
}

/**
 * Lance l'application de bureau installée sur le PC via son protocole natif (ex: photoshop://, figma://)
 */
export function launchDesktopAppProtocol(protocol: string): boolean {
  try {
    const link = document.createElement('a');
    link.href = protocol;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Erreur lancement protocole', err);
    return false;
  }
}
