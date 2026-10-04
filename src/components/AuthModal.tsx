import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';
import { evaluatePasswordStrength } from '../utils/crypto';
import { registerUser, loginUser, updateCurrentUserProfile } from '../utils/authStorage';

interface AuthModalProps {
  currentUser: User | null;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register' | 'profile';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(
    currentUser && initialMode === 'profile' ? 'profile' : initialMode
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [role, setRole] = useState(currentUser?.role || 'Directeur Artistique');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || 'SIDIBE STUDIO');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwdStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password.trim() || !fullName.trim()) {
          throw new Error('Veuillez remplir tous les champs obligatoires.');
        }
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.');
        }
        if (pwdStrength.score < 2) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre pour garantir une sécurité optimale.');
        }

        const res = await registerUser({
          email,
          fullName,
          password,
          role,
          phone,
          companyName,
        });

        setSuccessMessage('Compte sécurisé créé avec succès !');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      } else if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Veuillez renseigner votre email et mot de passe.');
        }

        const res = await loginUser(email, password);
        setSuccessMessage('Connexion sécurisée réussie.');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      } else if (mode === 'profile' && currentUser) {
        const updated = updateCurrentUserProfile(currentUser.id, {
          fullName,
          role,
          phone,
          companyName,
        });
        if (updated) {
          setSuccessMessage('Profil mis à jour avec succès.');
          setTimeout(() => {
            onAuthSuccess(updated);
            onClose();
          }, 600);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Une erreur inattendue est survenue.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'register' && 'Créer un Compte Sécurisé'}
                {mode === 'login' && 'Connexion Sécurisée'}
                {mode === 'profile' && 'Mon Profil Utilisateur'}
              </h3>
              <p className="text-[11px] text-zinc-400">Authentification avec chiffrement salé SHA-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'profile' && (
          <div className="grid grid-cols-2 p-1.5 bg-zinc-950 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Créer un compte
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Se connecter
            </button>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full name (register & profile) */}
          {(mode === 'register' || mode === 'profile') && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nom complet & Prénoms *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="ex: Aboubakar Sidibé"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Email (login & register) */}
          {mode !== 'profile' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Adresse Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="nom@studio.ci"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Role & Company (register & profile) */}
          {(mode === 'register' || mode === 'profile') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Rôle / Fonction
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ex: Lead Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Studio / Entreprise
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ex: SIDIBE STUDIO"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone (register & profile) */}
          {(mode === 'register' || mode === 'profile') && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Téléphone (Optionnel)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="+225 07 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Password (login & register) */}
          {mode !== 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Mot de passe *
                </label>
                {mode === 'register' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${pwdStrength.color}`}>
                    Sécurité : {pwdStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength checklist on registration */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={pwdStrength.hasLength ? 'text-emerald-400' : 'text-zinc-500'}>
                      {pwdStrength.hasLength ? '✓' : '•'} 8 caractères minimum
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={pwdStrength.hasUpper && pwdStrength.hasLower ? 'text-emerald-400' : 'text-zinc-500'}>
                      {pwdStrength.hasUpper && pwdStrength.hasLower ? '✓' : '•'} Majuscules et minuscules
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={pwdStrength.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}>
                      {pwdStrength.hasNumber ? '✓' : '•'} Au moins un chiffre
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-300">Garantie Sécurité Cryptographique : </span>
              Vos identifiants sont protégés par un hachage salé SHA-256 via la Web Crypto API. Aucun mot de passe n'est stocké en clair.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {mode === 'register' && (isSubmitting ? 'Création en cours...' : 'Créer mon compte sécurisé')}
                {mode === 'login' && (isSubmitting ? 'Connexion...' : 'Se connecter en toute sécurité')}
                {mode === 'profile' && (isSubmitting ? 'Sauvegarde...' : 'Mettre à jour le profil')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
