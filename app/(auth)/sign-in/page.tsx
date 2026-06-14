'use client';

import { useEffect } from 'react';

// The Markets section uses the SINGLE shared Good Thoughts login at /auth
// (Supabase), not openstock's native better-auth. Anyone landing on the old
// /sign-in route is sent to the shared login. window.location (origin-relative)
// is used deliberately so it bypasses the Next basePath (/markets) and hits the
// shell's /auth at the site root.
export default function SignInRedirect() {
  useEffect(() => {
    window.location.replace('/auth');
  }, []);
  return null;
}
