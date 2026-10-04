import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
  Laptop,
  Cloud,
  Layers,
  Globe,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Zap,
  FolderOpen,
} from 'lucide-react';
import { ConnectedAppAccount, AppAccountCategory, Workspace, User } from '../types';
import {
  loadAppAccounts,
  updateAppAccount,
  addCustomAppAccount,
  removeAppAccount,
  disconnectAllAccounts,
  openOfficialAppLogin,
  launchDesktopAppProtocol,
} from '../utils/appAccountsStorage';

interface AppAccountsViewProps {
  workspace: Workspace;
  currentUser: User | null;
  onOpenPhotoshopDirect?: () => void;
  onOpenSecurityPrivacy?: () => void;
  onLockStudio?: () => void;
}

export const AppAccountsView: React.FC<AppAccountsViewProps> = ({
  workspace,
  currentUser,
  onOpenPhotoshopDirect,
  onOpenSecurityPrivacy,
  onLockStudio,
}) => {
  const [accounts, setAccounts] = useState<ConnectedAppAccount[]>(() => loadAppAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'disconnected'>('all');

  // Editing account state
  const [editingAccount, setEditingAccount] = useState<ConnectedAppAccount | null>(null);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  // New Custom App Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<AppAccountCategory>('Design & UI');
  const [newAppLoginUrl, setNewAppLoginUrl] = useState('');
  const [newAppEmail, setNewAppEmail] = useState(currentUser?.email || '');
  const [newAppPlan, setNewAppPlan] = useState('Licence Standard');
  const [newAppColor, setNewAppColor] = useState('#8B5CF6');

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleToggleConnect = (acc: ConnectedAppAccount) => {
    const nextConnected = !acc.isConnected;
    const updated = updateAppAccount(acc.id, {
      isConnected: nextConnected,
      accountEmail: acc.accountEmail || currentUser?.email || 'aboubakarsiidibe@gmail.com',
    });
    setAccounts(updated);
    showNotification(
      nextConnected
        ? `Compte ${acc.appName} connecté avec succès.`
        : `Compte ${acc.appName} déconnecté.`
    );
  };

  const handleOpenLogin = (acc: ConnectedAppAccount) => {
    openOfficialAppLogin(acc);
    showNotification(`Redirection sécurisée vers la page d'authentification officielle de ${acc.appName}...`);
  };

  const handleLaunchProtocol = (protocol: string, name: string) => {
    const success = launchDesktopAppProtocol(protocol);
    if (success) {
      showNotification(`Ouverture de ${name} sur votre PC en cours...`);
    } else {
      showNotification(`Impossible d'envoyer la commande à ${name}.`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const updated = updateAppAccount(editingAccount.id, {
      accountEmail: editingAccount.accountEmail,
      accountUsername: editingAccount.accountUsername,
      planType: editingAccount.planType,
      syncEnabled: editingAccount.syncEnabled,
      passwordHint: editingAccount.passwordHint,
      apiKeyOrToken: editingAccount.apiKeyOrToken,
      notes: editingAccount.notes,
      isConnected: true,
    });
    setAccounts(updated);
    setEditingAccount(null);
    showNotification(`Paramètres du compte ${editingAccount.appName} enregistrés.`);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppLoginUrl.trim()) return;

    const updated = addCustomAppAccount({
      appKey: `custom-${Date.now()}`,
      appName: newAppName.trim(),
      category: newAppCategory,
      iconKey: 'custom',
      brandColor: newAppColor,
      loginUrl: newAppLoginUrl.trim(),
      officialPortalUrl: newAppLoginUrl.trim(),
      isConnected: true,
      accountEmail: newAppEmail.trim() || undefined,
      planType: newAppPlan.trim(),
      syncEnabled: false,
    });
    setAccounts(updated);
    setIsAddCustomOpen(false);
    setNewAppName('');
    setNewAppLoginUrl('');
    showNotification(`Application "${newAppName}" ajoutée et rattachée avec succès.`);
  };

  const handleDisconnectAll = () => {
    if (window.confirm('Voulez-vous vraiment déconnecter l\'ensemble des sessions d\'applications de ce studio ?')) {
      const updated = disconnectAllAccounts();
      setAccounts(updated);
      showNotification('Toutes les applications ont été déconnectées du studio.');
    }
  };

  const photoshopAccount = accounts.find((a) => a.appKey === 'photoshop') || accounts[0];

  // Filtering
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.accountEmail && acc.accountEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (acc.planType && acc.planType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Toutes' || acc.category === selectedCategory;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'connected' && acc.isConnected) ||
      (filterStatus === 'disconnected' && !acc.isConnected);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const connectedCount = accounts.filter((a) => a.isConnected).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto w-full">
      {/* SUCCESS NOTIFICATION BANNER */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            Fermer
          </button>
        </div>
      )}

      {/* TOP HEADER & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Espace Connexion Logiciels & Comptes
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {connectedCount} / {accounts.length} Connectés
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Authentifiez votre compte officiel Adobe Photoshop, Creative Cloud, Figma, Canva et vos espaces de stockage pour travailler sans friction.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddCustomOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une App</span>
          </button>

          {onOpenSecurityPrivacy && (
            <button
              onClick={onOpenSecurityPrivacy}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Coffre Sécurisé</span>
            </button>
          )}

          {onLockStudio && (
            <button
              onClick={onLockStudio}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Verrouiller l'écran de travail"
            >
              <Lock className="w-4 h-4" />
              <span>Verrouiller Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* SPECIAL HERO SECTION: ADOBE PHOTOSHOP & CREATIVE CLOUD ID */}
      {photoshopAccount && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10192e] via-zinc-900 to-zinc-950 border-2 border-[#31A8FF]/40 p-5 sm:p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#31A8FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Info Photoshop */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#001E36] border-2 border-[#31A8FF] flex items-center justify-center text-[#31A8FF] font-black text-2xl shadow-lg shadow-[#31A8FF]/20 shrink-0">
                  Ps
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Adobe Photoshop & Compte Creative Cloud
                    </h2>
                    {photoshopAccount.isConnected ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Compte Adobe Connecté
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-700/50 text-zinc-400 border border-zinc-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-zinc-400" />
                        Non Connecté
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">
                    Synchronisation directe avec vos maquettes PSD, bibliothèques CC Libraries, palettes couleurs et polices Adobe Fonts.
                  </p>
                </div>
              </div>

              {/* Status details bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Email Compte Adobe ID
                  </div>
                  <div className="text-white font-medium truncate mt-0.5">
                    {photoshopAccount.accountEmail || 'Non configuré'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Formule & Licence
                  </div>
                  <div className="text-[#31A8FF] font-bold truncate mt-0.5">
                    {photoshopAccount.planType || 'Creative Cloud Officiel'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Liaison PC & Protocole
                  </div>
                  <div className="text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-emerald-400" />
                    <span>Protocole photoshop:// Prêt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons Photoshop */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
              <button
                onClick={() => handleOpenLogin(photoshopAccount)}
                className="px-4 py-2.5 rounded-xl bg-[#31A8FF] hover:bg-[#2096ec] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#31A8FF]/25 transition-all active:scale-95 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Connexion Officielle Adobe ID</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>

              {onOpenPhotoshopDirect ? (
                <button
                  onClick={onOpenPhotoshopDirect}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-[#31A8FF]/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-[#31A8FF]" />
                  <span>Ouvrir Fichiers PSD sur ce PC</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLaunchProtocol('photoshop://', 'Adobe Photoshop')}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-[#31A8FF]/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Laptop className="w-4 h-4 text-[#31A8FF]" />
                  <span>Lancer Photoshop PC</span>
                </button>
              )}

              <button
                onClick={() => setEditingAccount(photoshopAccount)}
                className="px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700/80 transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Paramètres du Compte</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY GUARANTEE BAR */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              <span>Protection & Confidentialité Absolue des Mots de Passe</span>
              <span className="text-[10px] text-emerald-400 font-normal">● Chiffrement Local Actif</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Aucun mot de passe ni identifiant n'est partagé ou transmis vers l'extérieur. Toutes les authentifications s'exécutent sur les portails sécurisés officiels des éditeurs (Adobe, Figma, Google, Canva).
            </p>
          </div>
        </div>

        <button
          onClick={handleDisconnectAll}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Déconnecter toutes les sessions
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/70 p-3 rounded-2xl border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une application ou un compte (Photoshop, Figma, Canva, Drive...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['Toutes', 'Suite Adobe', 'Design & UI', 'Stockage & Fichiers', 'Organisation & Notes', 'Portfolio & Inspiration'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tous ({accounts.length})
          </button>
          <button
            onClick={() => setFilterStatus('connected')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Connectés ({connectedCount})
          </button>
          <button
            onClick={() => setFilterStatus('disconnected')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterStatus === 'disconnected'
                ? 'bg-zinc-800 text-zinc-300'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Non connectés ({accounts.length - connectedCount})
          </button>
        </div>
      </div>

      {/* ALL APPLICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isPs = acc.appKey === 'photoshop';

          return (
            <div
              key={acc.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 sm:p-5 relative group ${
                acc.isConnected
                  ? 'bg-zinc-900/90 border-zinc-700/80 hover:border-zinc-600 shadow-sm'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 opacity-90'
              }`}
            >
              {/* Card top */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 border border-white/10"
                      style={{ backgroundColor: acc.brandColor }}
                    >
                      {acc.appName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {acc.appName}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {acc.category}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {acc.isConnected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connecté
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Non connecté
                      </span>
                    )}
                  </div>
                </div>

                {/* Account info snippet */}
                <div className="mt-3.5 space-y-1.5 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Email / ID :</span>
                    <span className="text-zinc-300 font-medium truncate max-w-[180px]">
                      {acc.accountEmail || 'Non renseigné'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Formule :</span>
                    <span className="text-purple-300 font-bold truncate max-w-[180px]">
                      {acc.planType || 'Standard'}
                    </span>
                  </div>

                  {acc.notes && (
                    <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-zinc-800/80 truncate">
                      {acc.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons bottom */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenLogin(acc)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Ouvrir le portail d'authentification officiel de cet éditeur"
                  >
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Se connecter</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </button>

                  {acc.appProtocol && (
                    <button
                      onClick={() => handleLaunchProtocol(acc.appProtocol!, acc.appName)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-all cursor-pointer"
                      title={`Lancer l'application de bureau installée sur ce PC (${acc.appProtocol})`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAccount(acc)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Configurer les identifiants et options"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleConnect(acc)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      acc.isConnected
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {acc.isConnected ? 'Déconnecter' : 'Lier'}
                  </button>

                  {acc.id.startsWith('acc-custom') && (
                    <button
                      onClick={() => {
                        const updated = removeAppAccount(acc.id);
                        setAccounts(updated);
                        showNotification(`Application "${acc.appName}" retirée.`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer cette application personnalisée"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <KeyRound className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">Aucune application trouvée</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Aucun résultat pour cette recherche ou cette catégorie. Modifiez vos filtres ou ajoutez une nouvelle application.
          </p>
        </div>
      )}

      {/* EDIT / CONFIGURE ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{ backgroundColor: editingAccount.brandColor }}
                >
                  {editingAccount.appName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Paramètres : {editingAccount.appName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Configuration locale sécurisée du compte
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-zinc-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email du compte officiel
                </label>
                <input
                  type="email"
                  value={editingAccount.accountEmail || ''}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, accountEmail: e.target.value })
                  }
                  placeholder="ex: aboubakarsiidibe@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom d'utilisateur / Identifiant Studio
                </label>
                <input
                  type="text"
                  value={editingAccount.accountUsername || ''}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, accountUsername: e.target.value })
                  }
                  placeholder="ex: sidibe_design"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Formule ou Licence
                  </label>
                  <input
                    type="text"
                    value={editingAccount.planType || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, planType: e.target.value })
                    }
                    placeholder="ex: Licence Pro / Équipe"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingAccount.category}
                    className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-400"
                  />
                </div>
              </div>

              {/* Password hint & safety note */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aide-mémoire Mot de Passe (Coffre Local)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordHint(!showPasswordHint)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showPasswordHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPasswordHint ? 'Masquer' : 'Afficher'}</span>
                  </button>
                </div>
                <input
                  type={showPasswordHint ? 'text' : 'password'}
                  value={editingAccount.passwordHint || ''}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, passwordHint: e.target.value })
                  }
                  placeholder="Indice sécurisé conservé uniquement sur votre machine"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Les mots de passe réels ne transitent jamais sur le serveur. Ce champ sert de rappel local chiffré.
                </p>
              </div>

              {/* Cloud Sync toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Synchronisation Cloud Active</div>
                    <div className="text-[10px] text-zinc-400">
                      Synchronise les assets et bibliothèques rattachés à ce compte
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editingAccount.syncEnabled ?? true}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, syncEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-zinc-900 border-zinc-700 cursor-pointer"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notes internes du Studio
                </label>
                <textarea
                  rows={2}
                  value={editingAccount.notes || ''}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, notes: e.target.value })
                  }
                  placeholder="Notes sur les accès, règles d'équipe ou projets rattachés..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleOpenLogin(editingAccount)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ouvrir Login Officiel</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Enregistrer les Accès
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM APP MODAL */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ajouter une Application</h3>
                  <p className="text-xs text-zinc-400">Rattachez un logiciel ou service externe</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="text-zinc-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom du Logiciel ou Service *
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="ex: Midjourney, Cinema 4D, DaVinci Resolve, Freepik..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value as AppAccountCategory)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Suite Adobe">Suite Adobe</option>
                  <option value="Design & UI">Design & UI</option>
                  <option value="Stockage & Fichiers">Stockage & Fichiers</option>
                  <option value="Organisation & Notes">Organisation & Notes</option>
                  <option value="Portfolio & Inspiration">Portfolio & Inspiration</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Lien de connexion officiel (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={newAppLoginUrl}
                  onChange={(e) => setNewAppLoginUrl(e.target.value)}
                  placeholder="https://app.example.com/login"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email de connexion
                  </label>
                  <input
                    type="email"
                    value={newAppEmail}
                    onChange={(e) => setNewAppEmail(e.target.value)}
                    placeholder="email@studio.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Formule / Licence
                  </label>
                  <input
                    type="text"
                    value={newAppPlan}
                    onChange={(e) => setNewAppPlan(e.target.value)}
                    placeholder="ex: Pro Studio"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ajouter l'Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
