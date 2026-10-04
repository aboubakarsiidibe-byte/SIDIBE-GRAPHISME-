import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  HardDrive,
  AlertTriangle,
  Key,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { User, Workspace } from '../types';
import {
  changeUserPassword,
  getBruteForceStatus,
  resetFailedAuthAttempts,
} from '../utils/authStorage';
import { evaluatePasswordStrength } from '../utils/crypto';

interface SecurityPrivacyModalProps {
  currentUser: User | null;
  workspace: Workspace;
  onClose: () => void;
  onLockStudio: () => void;
}

export const SecurityPrivacyModal: React.FC<SecurityPrivacyModalProps> = ({
  currentUser,
  workspace,
  onClose,
  onLockStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'password' | 'sandbox'>('overview');

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const newPwdStrength = evaluatePasswordStrength(newPassword);
  const bruteForce = getBruteForceStatus();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setMessage(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setMessage({ text: 'Veuillez remplir tous les champs.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Les deux nouveaux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }

    if (newPwdStrength.score < 2) {
      setMessage({
        text: 'Le mot de passe doit comporter au moins 8 caractères, une majuscule et un chiffre pour garantir votre sécurité.',
        type: 'error',
      });
      return;
    }

    setIsChanging(true);
    try {
      const res = await changeUserPassword(currentUser.id, oldPassword, newPassword);
      setMessage({ text: res.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ text: err.message, type: 'error' });
      } else {
        setMessage({ text: 'Erreur lors de la modification du mot de passe.', type: 'error' });
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Centre de Sécurité & Confidentialité</h3>
              <p className="text-xs text-zinc-400">
                Protection des mots de passe, interdiction des fuites de données et respect anti-piratage.
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

        {/* Sub-tabs */}
        <div className="grid grid-cols-3 bg-zinc-950 border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'text-emerald-400 border-emerald-400 bg-zinc-900/60'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bouclier Actif</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'text-amber-400 border-amber-400 bg-zinc-900/60'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Modifier Mot de Passe</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'text-blue-400 border-blue-400 bg-zinc-900/60'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Stockage 100% Local</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-red-500/10 border-red-500/30 text-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Système Sécurisé, Confidentialité Protégée
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                    Toutes vos informations (fichiers Photoshop, identifiants, projets et factures en Franc CFA) sont protégées par un cloisonnement local strict.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Mots de Passe
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      SHA-256 + Sel
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Chiffré en continu via l'API Web Crypto du navigateur. Jamais stocké en texte clair.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      Zéro Partage Externe
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                      Local 100%
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Aucune transmission vers des tiers. Vos fichiers restent sur votre PC.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
                      Anti-Brute Force
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Actif (Max 5)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Blocage automatique temporaire en cas de tentatives d'intrusion répétées.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      Anti-Piratage Adobe
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                      Conforme
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Connexion directe via le protocole officiel <code className="text-zinc-300">photoshop://</code>. Aucun crack.
                  </p>
                </div>
              </div>

              {/* Action: Verrouiller le Studio Maintenant */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Verrouillage Rapide du Studio</div>
                  <div className="text-[11px] text-zinc-400">
                    Protégez immédiatement votre écran par mot de passe si vous quittez votre poste.
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onLockStudio();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verrouiller l'écran</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MODIFIER MOT DE PASSE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ancien mot de passe actuel :
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe actuel..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nouveau mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères, majuscule, chiffre..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 pr-10 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Niveau de sécurité :</span>
                      <span className="font-bold" style={{ color: newPwdStrength.color }}>
                        {newPwdStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${((newPwdStrength.score + 1) / 5) * 100}%`,
                          backgroundColor: newPwdStrength.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Confirmer le nouveau mot de passe :
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChanging}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isChanging ? 'Chiffrement en cours...' : 'Mettre à jour mon mot de passe'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: STOCKAGE LOCAL & ANTI-PARTAGE */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-300">
                  <HardDrive className="w-4 h-4" />
                  <span>Architecture Hors-Ligne & Zéro Partage d'Information</span>
                </div>
                <p className="leading-relaxed">
                  Cette application est conçue selon le principe "Local-First". Toutes vos données sont hébergées dans la mémoire locale de votre navigateur sur votre propre machine.
                </p>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aucun traçage d'activité ni analyse tierce.</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aucune transmission des devis, factures CFA ou briefs clients.</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fichiers Photoshop (.psd) traités exclusivement en local sur votre PC.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sécurité maximale active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
