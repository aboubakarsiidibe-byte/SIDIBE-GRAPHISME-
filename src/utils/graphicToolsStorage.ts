import { ConnectedGraphicTool, GraphicToolCategory } from '../types';

const STORAGE_KEY_GRAPHIC_TOOLS = 'sidibe_studio_graphic_tools_v1';

export const INITIAL_GRAPHIC_TOOLS: ConnectedGraphicTool[] = [
  {
    id: 'tool-figma',
    name: 'Figma',
    category: 'Vectoriel & Maquettes',
    iconKey: 'figma',
    color: '#F24E1E',
    defaultUrl: 'https://www.figma.com',
    appProtocol: 'figma://',
    customStudioUrl: 'https://www.figma.com',
    isConnected: true,
    description: 'Conception UI/UX, maquettes interactives, FigJam et design systems collaboratifs.',
  },
  {
    id: 'tool-photoshop',
    name: 'Adobe Photoshop',
    category: 'Retouche & Bitmap',
    iconKey: 'photoshop',
    color: '#31A8FF',
    defaultUrl: 'https://creativecloud.adobe.com/apps/photoshop',
    appProtocol: 'photoshop://',
    customStudioUrl: 'https://creativecloud.adobe.com',
    isConnected: true,
    description: 'Retouche d\'images haute résolution, compositions visuelles complexes et affiches raster.',
  },
  {
    id: 'tool-illustrator',
    name: 'Adobe Illustrator',
    category: 'Vectoriel & Maquettes',
    iconKey: 'illustrator',
    color: '#FF9A00',
    defaultUrl: 'https://creativecloud.adobe.com/apps/illustrator',
    appProtocol: 'illustrator://',
    customStudioUrl: 'https://creativecloud.adobe.com',
    isConnected: true,
    description: 'Création de logos, typographies vectorielles, identités de marque et illustrations.',
  },
  {
    id: 'tool-canva',
    name: 'Canva',
    category: 'Templates Rapides',
    iconKey: 'canva',
    color: '#00C4CC',
    defaultUrl: 'https://www.canva.com',
    customStudioUrl: 'https://www.canva.com',
    isConnected: true,
    description: 'Création rapide de visuels pour les réseaux sociaux, présentations et templates clients.',
  },
  {
    id: 'tool-indesign',
    name: 'Adobe InDesign',
    category: 'Mise en page & Print',
    iconKey: 'indesign',
    color: '#FF3366',
    defaultUrl: 'https://creativecloud.adobe.com/apps/indesign',
    customStudioUrl: 'https://creativecloud.adobe.com',
    isConnected: false,
    description: 'Mise en page professionnelle de brochures, catalogues, magazines et supports d\'impression.',
  },
  {
    id: 'tool-aftereffects',
    name: 'Adobe After Effects',
    category: 'Motion & Vidéo',
    iconKey: 'aftereffects',
    color: '#9999FF',
    defaultUrl: 'https://creativecloud.adobe.com/apps/aftereffects',
    customStudioUrl: 'https://creativecloud.adobe.com',
    isConnected: false,
    description: 'Animation graphique de logos, transitions vidéos, habillages TV et motion design publicitaire.',
  },
  {
    id: 'tool-spline',
    name: 'Spline 3D',
    category: '3D & Rendu',
    iconKey: 'spline',
    color: '#FF5C93',
    defaultUrl: 'https://spline.design',
    customStudioUrl: 'https://spline.design',
    isConnected: false,
    description: 'Modélisation 3D temps réel, intégrations interactives web et visuels 3D stylisés.',
  },
  {
    id: 'tool-blender',
    name: 'Blender 3D',
    category: '3D & Rendu',
    iconKey: 'blender',
    color: '#EA7600',
    defaultUrl: 'https://www.blender.org',
    customStudioUrl: 'https://www.blender.org',
    isConnected: false,
    description: 'Packshots 3D, animation volumique, simulations et rendus photoréalistes pour packaging.',
  },
];

export interface CreativeResource {
  id: string;
  name: string;
  category: 'Typographie' | 'Couleurs & Palettes' | 'Images & Banques' | 'Icônes & Vecteurs' | 'Inspiration & Moodboard';
  url: string;
  description: string;
  badge: string;
}

export const CREATIVE_RESOURCES: CreativeResource[] = [
  {
    id: 'res-google-fonts',
    name: 'Google Fonts',
    category: 'Typographie',
    url: 'https://fonts.google.com',
    description: 'Bibliothèque libre de droits pour web et print avec prévisualisation personnalisée.',
    badge: 'Open Source',
  },
  {
    id: 'res-dafont',
    name: 'DaFont',
    category: 'Typographie',
    url: 'https://www.dafont.com/fr/',
    description: 'Des milliers de polices décoratives, scriptes, titrages et displays pour branding.',
    badge: 'Titres & Displays',
  },
  {
    id: 'res-coolors',
    name: 'Coolors Generator',
    category: 'Couleurs & Palettes',
    url: 'https://coolors.co',
    description: 'Générateur ultra-rapide de palettes chromatiques harmonieuses avec export hex/CSS.',
    badge: 'Chromatique',
  },
  {
    id: 'res-adobe-color',
    name: 'Adobe Color CC',
    category: 'Couleurs & Palettes',
    url: 'https://color.adobe.com/fr/create/color-wheel',
    description: 'Roue chromatique, extraction de palettes d\'après photos et conformité d\'accessibilité.',
    badge: 'Pro Adobe',
  },
  {
    id: 'res-unsplash',
    name: 'Unsplash',
    category: 'Images & Banques',
    url: 'https://unsplash.com',
    description: 'Photos haute résolution gratuites et sélection éditoriale pour maquettes et affiches.',
    badge: 'Haute Résolution',
  },
  {
    id: 'res-freepik',
    name: 'Freepik',
    category: 'Images & Banques',
    url: 'https://www.freepik.com',
    description: 'Vecteurs, PSD mockups, templates prêts à l\'emploi et photos de studio.',
    badge: 'Mockups & PSD',
  },
  {
    id: 'res-flaticon',
    name: 'Flaticon',
    category: 'Icônes & Vecteurs',
    url: 'https://www.flaticon.com',
    description: 'Pack d\'icônes vectorielles SVG, PNG et pictos pour chartes graphiques.',
    badge: 'SVG Vector',
  },
  {
    id: 'res-svg-repo',
    name: 'SVG Repo',
    category: 'Icônes & Vecteurs',
    url: 'https://www.svgrepo.com',
    description: 'Plus de 500 000 icônes SVG libres de droits pour vos compositions graphiques.',
    badge: 'Free SVG',
  },
  {
    id: 'res-behance',
    name: 'Behance',
    category: 'Inspiration & Moodboard',
    url: 'https://www.behance.net',
    description: 'Réseau mondial des créatifs pour découvrir des identités visuelles et packaging d\'exception.',
    badge: 'Direction Artistique',
  },
  {
    id: 'res-pinterest',
    name: 'Pinterest Design',
    category: 'Inspiration & Moodboard',
    url: 'https://www.pinterest.com',
    description: 'Création de moodboards clients, planches de tendances et veille esthétique.',
    badge: 'Moodboard',
  },
];

export function loadConnectedGraphicTools(): ConnectedGraphicTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRAPHIC_TOOLS);
    if (!raw) return INITIAL_GRAPHIC_TOOLS;
    const parsed: ConnectedGraphicTool[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_GRAPHIC_TOOLS;
    return parsed;
  } catch (e) {
    console.error('Erreur chargement outils graphiques', e);
    return INITIAL_GRAPHIC_TOOLS;
  }
}

export function saveConnectedGraphicTools(tools: ConnectedGraphicTool[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GRAPHIC_TOOLS, JSON.stringify(tools));
  } catch (e) {
    console.error('Erreur sauvegarde outils graphiques', e);
  }
}

export function updateGraphicToolConnection(
  toolId: string,
  updates: Partial<Pick<ConnectedGraphicTool, 'isConnected' | 'customStudioUrl'>>
): ConnectedGraphicTool[] {
  const current = loadConnectedGraphicTools();
  const updated = current.map((tool) => {
    if (tool.id === toolId) {
      return { ...tool, ...updates };
    }
    return tool;
  });
  saveConnectedGraphicTools(updated);
  return updated;
}

/**
 * Détecte automatiquement l'outil graphique à partir d'une URL collée
 */
export function detectGraphicToolFromUrl(url: string): GraphicToolCategory {
  const lower = url.toLowerCase();
  if (lower.includes('figma.com')) return 'Figma';
  if (lower.includes('canva.com')) return 'Canva';
  if (lower.includes('adobe.com') || lower.includes('photoshop')) {
    if (lower.includes('illustrator')) return 'Illustrator';
    if (lower.includes('indesign')) return 'InDesign';
    if (lower.includes('aftereffects')) return 'After Effects';
    return 'Photoshop';
  }
  if (lower.includes('drive.google.com')) return 'Google Drive';
  if (lower.includes('dropbox.com')) return 'Dropbox';
  if (lower.includes('pinterest.com')) return 'Pinterest';
  if (lower.includes('behance.net')) return 'Behance';
  if (lower.includes('notion.so') || lower.includes('notion.site')) return 'Notion';
  return 'Autre';
}

// ================= PHOTOSHOP CONNEXION DIRECTE PC LOCAL =================
const STORAGE_KEY_PHOTOSHOP_CONFIG = 'sidibe_studio_photoshop_local_config_v1';

export interface LocalPsdReference {
  id: string;
  name: string;
  pathOrName: string;
  sizeFormatted?: string;
  lastOpened: string;
  projectId?: string;
  projectName?: string;
}

export interface PhotoshopLocalConfig {
  isConnectedToLocalPc: boolean;
  preferredProtocol: 'photoshop://' | 'adobe-photoshop://' | 'custom';
  customExecutablePath?: string; // ex: C:\Program Files\Adobe\Adobe Photoshop 2024\Photoshop.exe
  localProjectsFolder?: string; // ex: D:\Studio_Sidibe\Affiches_PSD
  autoPromptOnPsdClick: boolean;
  recentPsdFiles: LocalPsdReference[];
  lastConnectionTest?: string;
}

export const DEFAULT_PHOTOSHOP_CONFIG: PhotoshopLocalConfig = {
  isConnectedToLocalPc: true,
  preferredProtocol: 'photoshop://',
  customExecutablePath: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Photoshop.exe',
  localProjectsFolder: 'C:\\Projets_Graphiques\\Photoshop_PSD',
  autoPromptOnPsdClick: true,
  recentPsdFiles: [
    {
      id: 'psd-affiche-vip',
      name: 'Affiche_Concert_Abidjan_2026_FormatA3.psd',
      pathOrName: 'C:\\Projets_Graphiques\\Affiche_Concert_Abidjan_2026.psd',
      sizeFormatted: '184 Mo',
      lastOpened: 'Aujourd\'hui',
      projectName: 'Campagne Publicitaire Abidjan Mall',
    },
    {
      id: 'psd-mockup-packaging',
      name: 'Mockup_Bouteille_Cosmetique_3D.psd',
      pathOrName: 'C:\\Projets_Graphiques\\Mockup_Bouteille.psd',
      sizeFormatted: '92 Mo',
      lastOpened: 'Hier',
      projectName: 'Packaging Gamme Karité Bio',
    },
  ],
};

export function loadPhotoshopConfig(): PhotoshopLocalConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOSHOP_CONFIG);
    if (!raw) return DEFAULT_PHOTOSHOP_CONFIG;
    return { ...DEFAULT_PHOTOSHOP_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PHOTOSHOP_CONFIG;
  }
}

export function savePhotoshopConfig(config: PhotoshopLocalConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PHOTOSHOP_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Erreur sauvegarde config Photoshop', e);
  }
}

/**
 * Déclenche le lancement direct de Photoshop sur le PC via le protocole officiel OS
 * Sans transmission de données, 100% exécuté sur l'ordinateur de l'utilisateur.
 */
export function launchDirectPhotoshop(filePath?: string): { success: boolean; url: string; message: string } {
  const config = loadPhotoshopConfig();
  const protocol = config.preferredProtocol || 'photoshop://';

  let targetUrl: string = protocol;
  if (filePath && filePath.trim()) {
    // Si un chemin de fichier ou template est fourni
    const cleanPath = filePath.trim();
    if (cleanPath.startsWith('photoshop://') || cleanPath.startsWith('file://')) {
      targetUrl = cleanPath;
    } else {
      targetUrl = `${protocol}open?url=${encodeURIComponent(cleanPath)}`;
    }
  }

  try {
    // Déclencheur direct du protocole OS natif
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mettre à jour l'horodatage du dernier test
    savePhotoshopConfig({
      ...config,
      isConnectedToLocalPc: true,
      lastConnectionTest: new Date().toISOString(),
    });

    return {
      success: true,
      url: targetUrl,
      message: 'Commande de lancement direct transmise à Adobe Photoshop sur votre PC.',
    };
  } catch (err) {
    return {
      success: false,
      url: targetUrl,
      message: 'Impossible de déclencher le protocole. Vérifiez les autorisations de votre navigateur.',
    };
  }
}

/**
 * Télécharge un raccourci direct Windows (.url) permettant d'ouvrir Photoshop d'un double-clic
 */
export function downloadWindowsPhotoshopShortcut(): void {
  downloadApplicationShortcut('Photoshop', 'photoshop://', 'https://creativecloud.adobe.com/apps/photoshop');
}

/**
 * Lance n'importe quelle application graphique installée ou son portail web en direct
 */
export function launchDirectApplication(
  toolKey: string,
  filePathOrUrl?: string
): { success: boolean; url: string; message: string; method: 'protocol' | 'web' } {
  const normalized = toolKey.toLowerCase();
  let protocol = 'photoshop://';
  let defaultWeb = 'https://creativecloud.adobe.com';
  let appName = 'Adobe Photoshop';

  if (normalized.includes('figma')) {
    protocol = 'figma://';
    defaultWeb = 'https://www.figma.com';
    appName = 'Figma';
  } else if (normalized.includes('illustrator')) {
    protocol = 'illustrator://';
    defaultWeb = 'https://creativecloud.adobe.com/apps/illustrator';
    appName = 'Adobe Illustrator';
  } else if (normalized.includes('indesign')) {
    protocol = 'indesign://';
    defaultWeb = 'https://creativecloud.adobe.com/apps/indesign';
    appName = 'Adobe InDesign';
  } else if (normalized.includes('after') || normalized.includes('effects')) {
    protocol = 'aftereffects://';
    defaultWeb = 'https://creativecloud.adobe.com/apps/aftereffects';
    appName = 'Adobe After Effects';
  } else if (normalized.includes('blender')) {
    protocol = 'blender://';
    defaultWeb = 'https://www.blender.org';
    appName = 'Blender 3D';
  } else if (normalized.includes('canva')) {
    defaultWeb = 'https://www.canva.com';
    appName = 'Canva';
  }

  let targetUrl = protocol;
  if (filePathOrUrl && filePathOrUrl.trim()) {
    const clean = filePathOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      window.open(clean, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        url: clean,
        message: `Ouverture de la maquette ${appName} dans le navigateur.`,
        method: 'web',
      };
    } else {
      targetUrl = `${protocol}open?url=${encodeURIComponent(clean)}`;
    }
  }

  try {
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      url: targetUrl,
      message: `Commande de lancement direct transmise à ${appName} sur votre PC.`,
      method: 'protocol',
    };
  } catch {
    // Web fallback
    window.open(defaultWeb, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      url: defaultWeb,
      message: `Ouverture de ${appName} via le portail officiel.`,
      method: 'web',
    };
  }
}

/**
 * Télécharge un raccourci direct (.url) pour lancer n'importe quelle application
 */
export function downloadApplicationShortcut(appName: string, protocol: string, webUrl?: string): void {
  const content = `[InternetShortcut]\nURL=${protocol}\nIconIndex=0\n`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = appName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Lancer_${cleanName}_Direct.url`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Télécharge un script de lancement rapide pour Windows (.bat)
 */
export function downloadCreativeSuiteLauncherBatch(): void {
  const content = `@echo off
echo ===================================================
echo   SIDIBE STUDIO - LANCEUR D'APPLICATIONS GRAPHIQUES
echo ===================================================
echo 1. Lancer Adobe Photoshop
echo 2. Lancer Adobe Illustrator
echo 3. Lancer Adobe InDesign
echo 4. Lancer Figma
echo 5. Lancer Blender
echo 6. Quitter
echo ===================================================
set /p choix="Entrez votre choix (1-6) : "

if "%choix%"=="1" start "" "photoshop://"
if "%choix%"=="2" start "" "illustrator://"
if "%choix%"=="3" start "" "indesign://"
if "%choix%"=="4" start "" "figma://"
if "%choix%"=="5" start "" "blender://"
exit
`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Lancer_Suite_Graphique_Sidibe.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

