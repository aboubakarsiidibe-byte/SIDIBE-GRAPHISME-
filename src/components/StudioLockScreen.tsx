import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { User, Workspace } from '../types';
import {
  verifyCurrentUserPassword,
  getBruteForceStatus,
  setStudioLockedState,
} from '../utils/authStorage';

interface StudioLockScreenProps {
  currentUser: User | null;
  workspace: Workspace;
  onUnlocked: () => void;
}

export const StudioLockScreen: React.FC<StudioLockScreenProps> = ({
  currentUser,
  workspace,
  onUnlocked,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState<number>(() => getBruteForceStatus().remainingSeconds);

  // Check cooldown interval
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    const bruteStatus = getBruteForceStatus();
    if (bruteStatus.isLocked) {
      setError(`Sécurité activée : patientez ${bruteStatus.remainingSeconds}s.`);
      setCooldown(bruteStatus.remainingSeconds);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await verifyCurrentUserPassword(password);
      if (isValid) {
        setStudioLockedState(false);
        onUnlocked();
      } else {
        const afterStatus = getBruteForceStatus();
        if (afterStatus.isLocked) {
          setCooldown(afterStatus.remainingSeconds);
          setError(`Trop de tentatives erronées. Verrouillé pendant ${afterStatus.remainingSeconds}s pour protéger vos données.`);
        } else {
          setError(`Mot de passe incorrect (${5 - afterStatus.attempts} tentatives restantes).`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors du déverrouillage.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* Lock Icon and Badges */}
        <div className="relative mx-auto w-20 h-20">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border"
            style={{
              backgroundColor: `${workspace.palette.primary}15`,
              borderColor: `${workspace.palette.primary}40`,
              color: workspace.palette.primary,
            }}
          >
            <Lock className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center border-2 border-zinc-900 shadow">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Studio info */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            Espace Protégé & Chiffré
          </span>
          <h2 className="text-xl font-black text-white mt-2">
            {workspace.name} est verrouillé
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Vos projets, devis CFA, maquettes Photoshop et informations clients sont protégés. Saisissez votre mot de passe pour reprendre le travail.
          </p>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3 text-left">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: currentUser.avatarColor || workspace.palette.primary }}
            >
              {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{currentUser.fullName}</div>
              <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cooldown > 0 || isVerifying}
              placeholder="Mot de passe du compte..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3.5 pr-11 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={cooldown > 0 || isVerifying}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-zinc-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: workspace.palette.primary }}
          >
            <Unlock className="w-4 h-4" />
            <span>
              {cooldown > 0
                ? `Verrouillage de sécurité (${cooldown}s)`
                : isVerifying
                ? 'Vérification sécurisée...'
                : 'Déverrouiller l\'Espace'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStudioLockedState(false);
              onUnlocked();
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Désactiver le verrouillage & Accéder au Studio
          </button>
        </form>

        <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protection cryptographique SHA-256 avec salage local</span>
        </div>
      </div>
    </div>
  );
};
