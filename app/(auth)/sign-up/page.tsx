'use client';

import { useEffect } from 'react';

// The Markets section uses the SINGLE shared Good Thoughts login at /auth
// (Supabase), not openstock's native better-auth. Anyone landing on the old
// /sign-up route is sent to the shared login (which has its own create-account
// toggle). Origin-relative so it bypasses the Next basePath (/markets).
export default function SignUpRedirect() {
  useEffect(() => {
    window.location.replace('/auth');
  }, []);
  return null;
}
