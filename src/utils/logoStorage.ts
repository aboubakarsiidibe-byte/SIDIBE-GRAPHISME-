import { Workspace } from '../types';
import { updateWorkspace } from './workspaceStorage';

// High-end default SVG logo for SIDIBE STUDIO (encoded Data URL)
export const DEFAULT_SIDIBE_STUDIO_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none"><rect width="240" height="64" rx="12" fill="%2318181b"/><rect x="8" y="8" width="48" height="48" rx="10" fill="%23f97316"/><path d="M22 25C22 20.5817 25.5817 17 30 17H34C38.4183 17 42 20.5817 42 25C42 28.5 39 31 35 32C39 33 42 35.5 42 39C42 43.4183 38.4183 47 34 47H30C25.5817 47 22 43.4183 22 39" stroke="%23111113" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="16" r="3" fill="%23ffffff"/><text x="68" y="32" fill="%23f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" letter-spacing="0.08em">SIDIBE</text><text x="68" y="47" fill="%23f97316" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="11" letter-spacing="0.25em">STUDIO</text></svg>`;

export interface LogoPreset {
  id: string;
  name: string;
  style: string;
  dataUrl: string;
}

export const PRESET_LOGOS: LogoPreset[] = [
  {
    id: 'sidibe-orange',
    name: 'Sidibe Studio Pro (Orange & Noir)',
    style: 'Signature Studio',
    dataUrl: DEFAULT_SIDIBE_STUDIO_LOGO_SVG,
  },
  {
    id: 'sidibe-gold',
    name: 'Sidibe Luxury Gold',
    style: 'Luxe & Édition',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none"><rect width="240" height="64" rx="12" fill="%23111113"/><rect x="8" y="8" width="48" height="48" rx="10" fill="%23eab308"/><text x="32" y="40" fill="%23111113" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" text-anchor="middle">S</text><text x="68" y="32" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" letter-spacing="0.1em">SIDIBE</text><text x="68" y="47" fill="%23eab308" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" letter-spacing="0.25em">CREATIVE AGENCY</text></svg>`,
  },
  {
    id: 'sidibe-cyan',
    name: 'Sidibe Digital Tech',
    style: 'Tech & Digital',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none"><rect width="240" height="64" rx="12" fill="%2309090b"/><rect x="8" y="8" width="48" height="48" rx="10" fill="%2306b6d4"/><path d="M22 32L32 20L42 32L32 44Z" fill="%2309090b"/><text x="68" y="32" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="15" letter-spacing="0.06em">SIDIBE LAB</text><text x="68" y="47" fill="%2306b6d4" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="10" letter-spacing="0.2em">DESIGN %26 TECH</text></svg>`,
  },
  {
    id: 'sidibe-emerald',
    name: 'Sidibe Emeraude Abidjan',
    style: 'Corporate & Finance',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none"><rect width="240" height="64" rx="12" fill="%23064e3b"/><rect x="8" y="8" width="48" height="48" rx="10" fill="%2310b981"/><circle cx="32" cy="32" r="14" fill="%23064e3b"/><text x="32" y="38" fill="%2310b981" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" text-anchor="middle">SI</text><text x="68" y="32" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="15" letter-spacing="0.08em">SIDIBE CI</text><text x="68" y="47" fill="%2334d399" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" letter-spacing="0.2em">ABIDJAN STUDIO</text></svg>`,
  },
];

/**
 * Lit un fichier sélectionné par l'utilisateur et le compresse/convertit en Data URL Base64
 */
export function convertFileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné doit être une image (PNG, JPG, SVG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Erreur de lecture du fichier image.'));
        return;
      }

      // Si c'est un SVG ou une image déjà compacte (< 500 Ko), garder directement
      if (file.type === 'image/svg+xml' || file.size < 300 * 1024) {
        resolve(result);
        return;
      }

      // Sinon redimensionner proprement sur canvas pour préserver la mémoire localStorage
      const img = new Image();
      img.onload = () => {
        const maxWidth = 500;
        const maxHeight = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/png', 0.92);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Enregistre le logo dans l'espace de travail actif et dans les informations de facturation
 */
export function saveLogoToWorkspace(workspace: Workspace, logoUrl: string): Workspace {
  const updated: Workspace = {
    ...workspace,
    logoUrl,
    billingInfo: {
      ...workspace.billingInfo,
      logoUrl,
    },
    updatedAt: new Date().toISOString(),
  };
  return updateWorkspace(workspace.id, updated);
}

/**
 * Supprime le logo personnalisé de l'espace de travail
 */
export function removeLogoFromWorkspace(workspace: Workspace): Workspace {
  const updated: Workspace = {
    ...workspace,
    logoUrl: undefined,
    billingInfo: {
      ...workspace.billingInfo,
      logoUrl: undefined,
    },
    updatedAt: new Date().toISOString(),
  };
  return updateWorkspace(workspace.id, updated);
}
