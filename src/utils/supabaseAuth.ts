import { getCloudSyncConfig } from './cloudSync';

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
}

const STORAGE_KEY = 'sidibe_supabase_session_v1';

function saveSupabaseSession(session: SupabaseSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSupabaseSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

export function clearSupabaseSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isSupabaseAuthAvailable(): boolean {
  return getCloudSyncConfig() !== null;
}

async function authRequest(path: string, body?: unknown): Promise<Response> {
  const config = getCloudSyncConfig();
  if (!config) throw new Error('Supabase n’est pas configuré dans cette application.');

  return fetch(`${config.url}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function parseAuthResponse(response: Response): Promise<SupabaseSession> {
  if (!response.ok) {
    let message = 'Échec de l’authentification Supabase.';
    try {
      const payload = await response.json() as { msg?: string; message?: string; error_description?: string };
      message = payload.error_description || payload.msg || payload.message || message;
    } catch {
      // Keep the generic message when the response is not JSON.
    }
    throw new Error(message);
  }

  const session = await response.json() as SupabaseSession;
  if (!session.access_token || !session.user?.id) {
    throw new Error('Réponse Supabase invalide : session utilisateur absente.');
  }
  saveSupabaseSession(session);
  return session;
}

export async function signInToSupabase(email: string, password: string): Promise<SupabaseSession> {
  return parseAuthResponse(
    await authRequest('token?grant_type=password', { email: email.trim().toLowerCase(), password })
  );
}

export async function signUpToSupabase(
  email: string,
  password: string,
  fullName?: string
): Promise<SupabaseSession | null> {
  const response = await authRequest('signup', {
    email: email.trim().toLowerCase(),
    password,
    data: fullName ? { full_name: fullName } : undefined,
  });

  if (!response.ok) {
    let message = 'Impossible de créer le compte Supabase.';
    try {
      const payload = await response.json() as { msg?: string; message?: string; error_description?: string };
      message = payload.error_description || payload.msg || payload.message || message;
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }

  const payload = await response.json() as Partial<SupabaseSession> & { user?: SupabaseUser };
  if (!payload.access_token) {
    return null;
  }

  const session = payload as SupabaseSession;
  if (!session.user?.id) throw new Error('Compte créé mais utilisateur Supabase introuvable.');
  saveSupabaseSession(session);
  return session;
}

export async function refreshSupabaseSession(): Promise<SupabaseSession | null> {
  const current = loadSupabaseSession();
  if (!current?.refresh_token) return null;

  try {
    const response = await authRequest('token?grant_type=refresh_token', {
      refresh_token: current.refresh_token,
    });
    return await parseAuthResponse(response);
  } catch {
    clearSupabaseSession();
    return null;
  }
}

export async function getValidSupabaseSession(): Promise<SupabaseSession | null> {
  const current = loadSupabaseSession();
  if (!current) return null;

  const expiresAt = current.expires_at
    ? current.expires_at * 1000
    : Date.now() + Math.max(current.expires_in - 30, 0) * 1000;

  if (expiresAt > Date.now() + 30_000) return current;
  return refreshSupabaseSession();
}

export async function signOutFromSupabase(): Promise<void> {
  const config = getCloudSyncConfig();
  const current = loadSupabaseSession();

  if (config && current?.access_token) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${current.access_token}`,
      },
    }).catch(() => undefined);
  }

  clearSupabaseSession();
}
