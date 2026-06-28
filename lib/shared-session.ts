// Reads the platform's SHARED login session — the self-hosted GoTrue/Supabase
// session that the /auth page and the IPO app issue, stored in
// localStorage['gt-auth']. This is the single source of truth for "who is
// logged in" across every Good Thoughts section; Markets must read THIS, not
// its old better-auth (MongoDB) session.
//
// Mirrors GoodThoughtsShell.readSessionUser(). Client-only (localStorage).

const AUTH_STORAGE_KEY = 'gt-auth';

export interface SharedSessionUser {
  email: string;
  id: string;   // stable user key; falls back to email
  name: string | null;
}

export function readSharedSession(): SharedSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const u = parsed?.user || parsed?.currentSession?.user || parsed?.session?.user;
    if (!u?.email) return null;
    const meta = u.user_metadata || {};
    return {
      email: u.email,
      id: u.id || u.sub || u.email,
      name: meta.full_name || meta.name || null,
    };
  } catch {
    return null;
  }
}

// Where to send a logged-out user to sign in: the SHARED /auth at the site root
// (NOT under the /markets basePath). Returns origin-relative so it works on
// stage + apex. Pass a post-login redirect target.
export function sharedLoginUrl(redirectTo = '/markets/watchlist'): string {
  return `/auth?redirect=${encodeURIComponent(redirectTo)}`;
}
