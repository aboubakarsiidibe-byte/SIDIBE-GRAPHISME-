import { User, AuthSession } from '../types';
import { generateSalt, hashPassword, verifyPassword } from './crypto';

const STORAGE_KEY_USERS = 'sidibe_studio_users_v2';
const STORAGE_KEY_SESSION = 'sidibe_studio_session_v2';

// Seed initial admin user if no users exist
export async function initializeAuth(): Promise<User[]> {
  const existing = loadUsers();
  if (existing.length > 0) return existing;

  const defaultSalt = generateSalt();
  const defaultHash = await hashPassword('Sidibe@2026!', defaultSalt);

  const initialAdmin: User = {
    id: 'user-admin-sidibe',
    email: 'aboubakarsiidibe@gmail.com',
    fullName: 'Aboubakar Sidibé',
    role: 'Directeur Général & DA',
    phone: '+225 07 88 99 00 11',
    companyName: 'SIDIBE STUDIO',
    avatarColor: '#f59e0b',
    passwordHash: defaultHash,
    passwordSalt: defaultSalt,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    workspaces: ['workspace-default'],
    currentWorkspaceId: 'workspace-default',
  };

  saveUsers([initialAdmin]);
  return [initialAdmin];
}

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading users', e);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users', e);
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Check expiry
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch (e) {
    console.error('Error loading session', e);
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}

export async function registerUser(data: {
  email: string;
  fullName: string;
  password: string;
  role?: string;
  phone?: string;
  companyName?: string;
}): Promise<{ user: User; session: AuthSession }> {
  const users = loadUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Un compte existe déjà avec cette adresse email.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(data.password, salt);

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const workspaceId = `workspace-${Date.now()}`;

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: data.fullName.trim(),
    role: data.role?.trim() || 'Directeur de Création',
    phone: data.phone?.trim() || '',
    companyName: data.companyName?.trim() || 'Mon Espace Pro',
    avatarColor,
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    workspaces: [workspaceId],
    currentWorkspaceId: workspaceId,
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  const session: AuthSession = {
    token: `token-${Date.now()}-${generateSalt(8)}`,
    userId: newUser.id,
    email: newUser.email,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };
  saveSession(session);

  return { user: newUser, session };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; session: AuthSession }> {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Identifiants incorrects ou compte inexistant.');
  }

  const isValid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!isValid) {
    throw new Error('Mot de passe incorrect.');
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUsers(users.map((u) => (u.id === user.id ? user : u)));

  const session: AuthSession = {
    token: `token-${Date.now()}-${generateSalt(8)}`,
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  saveSession(session);

  return { user, session };
}

export function getCurrentUser(): User | null {
  const session = loadSession();
  if (!session) {
    const users = loadUsers();
    return users[0] || null;
  }
  const users = loadUsers();
  return users.find((u) => u.id === session.userId) || users[0] || null;
}

export const loadCurrentUser = getCurrentUser;
export const logoutUser = clearSession;

export function updateCurrentUserProfile(
  userId: string,
  data: Partial<Pick<User, 'fullName' | 'role' | 'phone' | 'companyName' | 'currentWorkspaceId' | 'workspaces'>>
): User | null {
  const users = loadUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return null;

  const updated: User = {
    ...target,
    ...data,
  };

  saveUsers(users.map((u) => (u.id === userId ? updated : u)));
  return updated;
}

// ================= SÉCURITÉ RENFORCÉE & PROTECTION DES MOTS DE PASSE =================
const STORAGE_KEY_STUDIO_LOCKED = 'sidibe_studio_locked_v1';
const STORAGE_KEY_BRUTE_FORCE = 'sidibe_studio_auth_attempts_v1';

interface BruteForceTracker {
  attempts: number;
  lockedUntil: number; // timestamp
}

export function getBruteForceStatus(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRUTE_FORCE);
    if (!raw) return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    const tracker: BruteForceTracker = JSON.parse(raw);
    const now = Date.now();
    if (tracker.lockedUntil && tracker.lockedUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((tracker.lockedUntil - now) / 1000),
        attempts: tracker.attempts,
      };
    }
    return { isLocked: false, remainingSeconds: 0, attempts: tracker.attempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

export function recordFailedAuthAttempt(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const status = getBruteForceStatus();
    const newAttempts = status.attempts + 1;
    let lockedUntil = 0;

    // After 5 failed attempts, lock for 45 seconds to prevent automated brute-force attacks
    if (newAttempts >= 5) {
      lockedUntil = Date.now() + 45 * 1000;
    }

    const tracker: BruteForceTracker = {
      attempts: newAttempts,
      lockedUntil,
    };
    localStorage.setItem(STORAGE_KEY_BRUTE_FORCE, JSON.stringify(tracker));

    return {
      isLocked: lockedUntil > Date.now(),
      remainingSeconds: lockedUntil > Date.now() ? 45 : 0,
      attempts: newAttempts,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 1 };
  }
}

export function resetFailedAuthAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_BRUTE_FORCE);
  } catch (e) {
    console.error('Error resetting brute force tracker', e);
  }
}

/**
 * Vérifie le mot de passe de l'utilisateur actuel (avec Web Crypto SHA-256 + sel)
 */
export async function verifyCurrentUserPassword(password: string): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;

  const bruteForce = getBruteForceStatus();
  if (bruteForce.isLocked) {
    throw new Error(`Sécurité activée : trop de tentatives erronées. Veuillez patienter ${bruteForce.remainingSeconds}s.`);
  }

  const isValid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!isValid) {
    recordFailedAuthAttempt();
    return false;
  }

  resetFailedAuthAttempts();
  return true;
}

/**
 * Modifie le mot de passe de manière sécurisée en vérifiant l'ancien mot de passe
 */
export async function changeUserPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const users = loadUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    throw new Error('Utilisateur introuvable.');
  }

  const isOldValid = await verifyPassword(oldPassword, target.passwordSalt, target.passwordHash);
  if (!isOldValid) {
    throw new Error("L'ancien mot de passe saisi est incorrect.");
  }

  if (newPassword.length < 8) {
    throw new Error('Le nouveau mot de passe doit comporter au moins 8 caractères.');
  }

  // Generate new cryptographic salt & SHA-256 hash
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  target.passwordSalt = newSalt;
  target.passwordHash = newHash;

  saveUsers(users.map((u) => (u.id === userId ? target : u)));
  return { success: true, message: 'Mot de passe modifié avec succès et chiffré en SHA-256.' };
}

// Studio Screen Lock state (Verrouillage par mot de passe du Studio)
export function isStudioLocked(): boolean {
  try {
    // If user asked to disable locking, return false by default
    const stored = localStorage.getItem(STORAGE_KEY_STUDIO_LOCKED);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setStudioLockedState(locked: boolean): void {
  try {
    if (locked) {
      localStorage.setItem(STORAGE_KEY_STUDIO_LOCKED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_STUDIO_LOCKED);
    }
  } catch (e) {
    console.error('Error setting studio lock state', e);
  }
}
