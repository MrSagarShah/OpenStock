import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from "better-auth/cookies";

// Routes that REQUIRE authentication. Everything else is public.
const protectedPaths = [
    '/watchlist',
    '/settings',
    '/profile',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const needsAuth = protectedPaths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (!needsAuth) return NextResponse.next();

    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
