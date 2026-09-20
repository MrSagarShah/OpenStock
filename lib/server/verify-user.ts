// Server-side identity for Markets: never trust an identity sent by the browser.
// The caller sends its shared-login (GoTrue) access token; we ask GoTrue who it belongs
// to and use the verified, confirmed email as the owner key (the existing convention).
const GOTRUE_URL = (process.env.GOTRUE_INTERNAL_URL || 'http://ipo-gotrue:9999').replace(/\/$/, '');

const cache = new Map<string, { email: string; exp: number }>();

export async function requireUserEmail(token: string): Promise<string> {
    if (!token || token.split('.').length !== 3) {
        throw new Error('Please sign in to continue');
    }
    const hit = cache.get(token);
    if (hit && hit.exp > Date.now()) return hit.email;

    let res: Response;
    try {
        res = await fetch(`${GOTRUE_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    } catch {
        throw new Error('Sign-in service unavailable, try again shortly');
    }
    if (!res.ok) throw new Error('Your session expired — please sign in again');

    const user = await res.json();
    const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
    if (!email || !(user.email_confirmed_at || user.confirmed_at)) {
        throw new Error('Please confirm your email address first');
    }
    if (cache.size > 500) cache.clear();
    cache.set(token, { email, exp: Date.now() + 30_000 });
    return email;
}
