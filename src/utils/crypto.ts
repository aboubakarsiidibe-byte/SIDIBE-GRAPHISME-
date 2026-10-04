/**
 * Utilitaires cryptographiques pour la sécurité des comptes utilisateurs.
 * Hachage salé via Web Crypto API (SHA-256) pour garantir qu'aucun mot de passe
 * n'est stocké en clair.
 */

export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const salted = `${salt}:${password}:sidibe_secure_token_v1`;
  const encoder = new TextEncoder();
  const data = encoder.encode(salted);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Fallback bitwise hash if subtle is unavailable
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === expectedHash;
}

export interface PasswordStrength {
  score: number; // 0 à 4
  label: 'Très faible' | 'Faible' | 'Moyen' | 'Robuste' | 'Excellente sécurité';
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasLength) score += 1;
  if (hasUpper && hasLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial && password.length >= 10) score += 1;

  const labels: PasswordStrength['label'][] = [
    'Très faible',
    'Faible',
    'Moyen',
    'Robuste',
    'Excellente sécurité',
  ];

  const colors = [
    'text-red-400 bg-red-500/20 border-red-500/30',
    'text-orange-400 bg-orange-500/20 border-orange-500/30',
    'text-amber-400 bg-amber-500/20 border-amber-500/30',
    'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}
