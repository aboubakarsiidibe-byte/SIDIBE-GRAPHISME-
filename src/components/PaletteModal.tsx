import React, { useState } from 'react';
import { X, Palette, Check, Sparkles, RefreshCw } from 'lucide-react';
import { WorkspacePalette } from '../types';
import { PALETTE_PRESETS } from '../utils/workspaceStorage';

interface PaletteModalProps {
  currentPalette: WorkspacePalette;
  onClose: () => void;
  onSavePalette: (palette: WorkspacePalette) => void;
}

export const PaletteModal: React.FC<PaletteModalProps> = ({
  currentPalette,
  onClose,
  onSavePalette,
}) => {
  const [selectedPalette, setSelectedPalette] = useState<WorkspacePalette>(currentPalette);
  const [customPrimary, setCustomPrimary] = useState(currentPalette.primary);
  const [isCustom, setIsCustom] = useState(
    !PALETTE_PRESETS.some((p) => p.primary.toLowerCase() === currentPalette.primary.toLowerCase())
  );

  const handleSelectPreset = (preset: WorkspacePalette) => {
    setSelectedPalette(preset);
    setCustomPrimary(preset.primary);
    setIsCustom(false);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomPrimary(hex);
    setIsCustom(true);
    setSelectedPalette({
      id: 'custom',
      name: 'Palette Personnalisée',
      primary: hex,
      primaryName: 'Personnalisée',
      accent: hex,
      bgGlow: `${hex}33`, // ~20% opacity in hex
    });
  };

  const handleApply = () => {
    onSavePalette(selectedPalette);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-950 font-bold shadow-sm"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Palette de Couleur de l'Espace</h3>
              <p className="text-xs text-zinc-400">Personnalisez l'ambiance visuelle et la signature de votre studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Live Preview Card */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Aperçu en direct du thème
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full border"
                style={{
                  color: selectedPalette.primary,
                  borderColor: `${selectedPalette.primary}66`,
                  backgroundColor: `${selectedPalette.primary}15`,
                }}
              >
                {selectedPalette.name}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-zinc-950 text-sm"
                  style={{ backgroundColor: selectedPalette.primary }}
                >
                  ST
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">SIDIBE STUDIO</div>
                  <div className="text-[11px] text-zinc-400">Accent dynamique appliqué aux boutons & badges</div>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-950 shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: selectedPalette.primary }}
              >
                Bouton Actif
              </button>
            </div>
          </div>

          {/* Preset Palettes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Palettes Studio Recommandées
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PALETTE_PRESETS.map((p) => {
                const isSelected = !isCustom && selectedPalette.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-zinc-800/80 border-white shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-6 h-6 rounded-full shadow-inner border border-black/30"
                        style={{ backgroundColor: p.primary }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{p.primary}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-300">Couleur Hexadécimale Personnalisée</h4>
                <p className="text-[11px] text-zinc-500">Définissez exactement le code couleur de votre charte graphique</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={customPrimary}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold text-zinc-950 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
            style={{ backgroundColor: selectedPalette.primary }}
          >
            <Check className="w-4 h-4" />
            <span>Appliquer cette palette</span>
          </button>
        </div>
      </div>
    </div>
  );
};
