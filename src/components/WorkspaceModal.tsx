import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Layers,
  Palette,
  Check,
  Building,
  MapPin,
  Phone,
  Mail,
  FileText,
  Sliders,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Workspace, WorkspaceDomain, WorkspacePalette } from '../types';
import { PALETTE_PRESETS } from '../utils/workspaceStorage';

interface WorkspaceModalProps {
  workspace?: Workspace | null;
  onClose: () => void;
  onSave: (workspaceData: {
    name: string;
    tagline: string;
    domain: WorkspaceDomain;
    palette: WorkspacePalette;
    dashboardConfig?: Workspace['dashboardConfig'];
    billingInfo: Workspace['billingInfo'];
  }) => void;
}

const DOMAINS: Array<{
  id: WorkspaceDomain;
  label: string;
  description: string;
}> = [
  {
    id: 'Studio Graphique & Design',
    label: 'Studio Graphique & Design',
    description: 'Identité visuelle, print, packaging, retours clients et délais créatifs',
  },
  {
    id: 'Développement Web & Tech',
    label: 'Développement Web & Tech',
    description: 'Sprints, code repositories, bugs, déploiements et suivi technique',
  },
  {
    id: 'Agence Marketing & Médias',
    label: 'Agence Marketing & Médias',
    description: 'Campagnes pub, calendrier réseaux sociaux, budgets et KPI d\'audience',
  },
  {
    id: 'Architecture & BTP',
    label: 'Architecture & BTP',
    description: 'Plans, phases de chantiers, maîtres d\'ouvrages et devis estimatifs',
  },
  {
    id: 'Freelance & Consulting',
    label: 'Freelance & Consulting',
    description: 'Gestion solo, facturation proforma, suivi des acomptes et charges',
  },
  {
    id: 'Production Vidéo & Motion',
    label: 'Production Vidéo & Motion',
    description: 'Tournages, storyboards, compositing et rendus d\'animation',
  },
  {
    id: 'E-Commerce & Retail',
    label: 'E-Commerce & Retail',
    description: 'Catalogues produits, fournisseurs, commandes et gestion des stocks',
  },
  {
    id: 'Autre Domaine',
    label: 'Autre Domaine d\'Activité',
    description: 'Espace polyvalent adaptable à tous les corps de métiers',
  },
];

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  workspace,
  onClose,
  onSave,
}) => {
  const isEditing = !!workspace;

  const [name, setName] = useState(workspace?.name || '');
  const [tagline, setTagline] = useState(workspace?.tagline || '');
  const [domain, setDomain] = useState<WorkspaceDomain>(
    workspace?.domain || 'Studio Graphique & Design'
  );
  const [selectedPalette, setSelectedPalette] = useState<WorkspacePalette>(
    workspace?.palette || PALETTE_PRESETS[0]
  );

  // Dashboard configuration
  const [visibleWidgets, setVisibleWidgets] = useState(
    workspace?.dashboardConfig?.visibleWidgets || {
      kpiFinancial: true,
      urgencies: true,
      todayTomorrow: true,
      projectPipeline: true,
      appShortcuts: true,
      billingQuick: true,
      workloadWeek: true,
      clientValidation: true,
    }
  );

  // Billing & Proforma details
  const [companyName, setCompanyName] = useState(
    workspace?.billingInfo?.companyName || workspace?.name || ''
  );
  const [address, setAddress] = useState(
    workspace?.billingInfo?.address || 'Abidjan, Côte d\'Ivoire'
  );
  const [city, setCity] = useState(workspace?.billingInfo?.city || 'Abidjan');
  const [country, setCountry] = useState(workspace?.billingInfo?.country || "Côte d'Ivoire");
  const [phone, setPhone] = useState(workspace?.billingInfo?.phone || '+225 07 00 00 00 00');
  const [email, setEmail] = useState(workspace?.billingInfo?.email || 'contact@studio.ci');
  const [taxId, setTaxId] = useState(workspace?.billingInfo?.taxId || '');
  const [bankOrMobileMoney, setBankOrMobileMoney] = useState(
    workspace?.billingInfo?.bankOrMobileMoney || 'Wave & Orange Money : +225 07 ...'
  );

  const [activeTab, setActiveTab] = useState<'general' | 'dashboard' | 'billing'>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      tagline: tagline.trim() || `Espace ${domain}`,
      domain,
      palette: selectedPalette,
      dashboardConfig: {
        domain,
        visibleWidgets,
      },
      billingInfo: {
        companyName: companyName.trim() || name.trim(),
        tagline: tagline.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
        email: email.trim(),
        taxId: taxId.trim() || undefined,
        bankOrMobileMoney: bankOrMobileMoney.trim(),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-zinc-950 shadow-sm"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? "Modifier l'Espace de Travail" : 'Créer un Nouvel Espace de Travail'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Personnalisez votre domaine d'activité, vos widgets et votre identité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'text-white border-amber-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            1. Général & Domaine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-white border-amber-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            2. Dashboard & Widgets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'text-white border-amber-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            3. Devis & Facturation
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GENERAL & DOMAINE */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nom de l'espace de travail *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: SIDIBE STUDIO, Kalia Creative..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!companyName) setCompanyName(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Slogan ou sous-titre
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Direction Artistique & Graphisme"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Domaine d'activité */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Domaine d'activité du studio ou de l'entreprise *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DOMAINS.map((d) => {
                    const isSelected = domain === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDomain(d.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800/90 border-amber-500/80 shadow-md'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-amber-400' : 'text-zinc-200'
                            }`}
                          >
                            {d.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{d.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Palette de couleur */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Palette de couleur de l'espace
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PALETTE_PRESETS.map((p) => {
                    const isSelected = selectedPalette.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPalette(p)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 border-white shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                        }`}
                        title={p.name}
                      >
                        <div
                          className="w-5 h-5 rounded-full shadow-inner"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span className="text-[10px] text-zinc-400 truncate max-w-full">
                          {p.primaryName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DASHBOARD & WIDGETS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Modules visibles sur le Tableau de Bord</span>
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Activez ou désactivez les blocs en fonction de votre flux de travail ({domain}) :
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'kpiFinancial' as const,
                    label: 'KPIs Financiers & Budgets (Franc CFA - XOF)',
                    desc: 'Affiche le chiffre d\'affaires total et les montants en attente de solde',
                  },
                  {
                    key: 'urgencies' as const,
                    label: 'Algorithme d\'Urgences & Tâches Critiques',
                    desc: 'Détection automatique des dates limites imminentes',
                  },
                  {
                    key: 'todayTomorrow' as const,
                    label: "Tâches d'Aujourd'hui & Échéances",
                    desc: 'Liste ciblée des priorités de la journée en cours',
                  },
                  {
                    key: 'projectPipeline' as const,
                    label: 'Progression & Pipeline des Projets',
                    desc: 'Barres d\'avancement en temps réel par projet actif',
                  },
                  {
                    key: 'appShortcuts' as const,
                    label: "Raccourcis & Icônes d'Applications (App Dock)",
                    desc: 'Accès en 1 clic vers Figma, Photoshop, Drive, GitHub, etc.',
                  },
                  {
                    key: 'billingQuick' as const,
                    label: 'Générateur Rapide Devis Proforma & Reçus',
                    desc: 'Boutons d\'émission instantanée pour la clientèle',
                  },
                  {
                    key: 'workloadWeek' as const,
                    label: 'Charge de Travail Hebdomadaire',
                    desc: 'Estimation horaire cumulée sur 7 jours glissants',
                  },
                  {
                    key: 'clientValidation' as const,
                    label: 'Suivi des Retours & Validations Clients',
                    desc: 'Alertes sur les livrables en attente de validation client',
                  },
                ].map((widget) => {
                  const checked = visibleWidgets[widget.key];
                  return (
                    <label
                      key={widget.key}
                      className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{widget.label}</div>
                        <div className="text-[11px] text-zinc-500">{widget.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setVisibleWidgets((prev) => ({
                            ...prev,
                            [widget.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-zinc-900 border-zinc-700"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FACTURATION & INFOS ENTREPRISE */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Informations de l'Émetteur pour Proformas & Reçus</span>
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Ces coordonnées apparaîtront automatiquement sur les devis proforma et les reçus de paiement en Franc CFA (XOF).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nom Commercial / Raison Sociale *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: SIDIBE STUDIO SARL"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    N° Registre / RCCM / CC (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: CI-ABJ-2024-B-1428"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Téléphone de contact *
                  </label>
                  <input
                    type="text"
                    placeholder="+225 07 88 99 00 11"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    placeholder="facturation@studio.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Adresse physique / Siège
                  </label>
                  <input
                    type="text"
                    placeholder="Cocody Deux Plateaux, Rue des Jardins, Abidjan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Modalités de règlement par défaut (Wave / Orange Money / Banque)
                  </label>
                  <input
                    type="text"
                    placeholder="Wave : +225 07 ... | Orange Money : +225 07 ... | Virement Bancaire"
                    value={bankOrMobileMoney}
                    onChange={(e) => setBankOrMobileMoney(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-zinc-950 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Check className="w-4 h-4" />
              <span>
                {isEditing ? "Enregistrer l'Espace" : "Créer l'Espace de Travail"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
