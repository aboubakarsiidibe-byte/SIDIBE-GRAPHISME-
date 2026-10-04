import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Workspace } from '../types';
import {
  PRESET_LOGOS,
  convertFileToLogoDataUrl,
  saveLogoToWorkspace,
  removeLogoFromWorkspace,
  DEFAULT_SIDIBE_STUDIO_LOGO_SVG,
} from '../utils/logoStorage';

interface LogoModalProps {
  workspace: Workspace;
  onClose: () => void;
  onLogoUpdated: (updatedWorkspace: Workspace) => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({
  workspace,
  onClose,
  onLogoUpdated,
}) => {
  const [currentLogo, setCurrentLogo] = useState<string>(
    workspace.logoUrl || workspace.billingInfo.logoUrl || DEFAULT_SIDIBE_STUDIO_LOGO_SVG
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryColor = workspace.palette.primary;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const dataUrl = await convertFileToLogoDataUrl(file);
      setCurrentLogo(dataUrl);
      setSuccessMessage('Logo importé avec succès depuis votre appareil !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erreur lors de l'importation de l'image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (dataUrl: string) => {
    setCurrentLogo(dataUrl);
    setSuccessMessage('Modèle de logo appliqué !');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setCurrentLogo(url);
    setCustomUrlInput('');
    setSuccessMessage('Logo lié via URL !');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleSave = () => {
    const updated = saveLogoToWorkspace(workspace, currentLogo);
    onLogoUpdated(updated);
    onClose();
  };

  const handleRemove = () => {
    const updated = removeLogoFromWorkspace(workspace);
    onLogoUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Insertion & Gestion du Logo</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Studio & Factures
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Ce logo figurera sur vos Devis, Factures Proforma, Reçus et dans l'interface de travail.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current Logo Preview */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Aperçu en direct du logo sélectionné
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark BG preview */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center min-h-[120px] text-center">
                <span className="text-[10px] text-zinc-500 font-medium mb-3">Fond Sombre (Sidebar & Header)</span>
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Logo Aperçu"
                    className="max-h-16 max-w-full object-contain filter drop-shadow"
                  />
                ) : (
                  <div className="text-xs text-zinc-500">Aucun logo défini</div>
                )}
              </div>

              {/* Light BG preview (for Proforma/Devis/Receipt PDF) */}
              <div className="p-5 rounded-xl bg-white border border-zinc-200 flex flex-col items-center justify-center min-h-[120px] text-center shadow-sm">
                <span className="text-[10px] text-zinc-400 font-medium mb-3">Fond Papier Blanc (Devis & Reçus A4)</span>
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Logo Aperçu Papier"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-zinc-400">Aucun logo défini</div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Method 1: Local File from computer */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Importer une image depuis votre ordinateur / téléphone</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Formats supportés : PNG transparent, JPEG, SVG vectoriel ou WebP.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-amber-400/70 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{isUploading ? 'Traitement en cours...' : 'Choisir un fichier image (PNG, SVG, JPG)'}</span>
            </button>
          </div>

          {/* Upload Method 2: Image URL */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Ou coller l'URL d'un logo en ligne</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://monsite.com/logo.png"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Upload Method 3: Curated Design Studio Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Modèles Vectoriels Studio inclus
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_LOGOS.map((preset) => {
                const isSelected = currentLogo === preset.dataUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.dataUrl)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={preset.dataUrl}
                      alt={preset.name}
                      className="h-9 max-w-full object-contain"
                    />
                    <div className="text-[11px] font-semibold text-zinc-200 truncate w-full text-center">
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRemove}
            className="px-3.5 py-2 text-xs font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Retirer le logo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl text-zinc-950 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Enregistrer le Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
