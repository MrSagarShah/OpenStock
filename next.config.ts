import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    // Served as the "Markets" section under goodthoughts.in/markets. basePath is
    // build-time: it prefixes routes AND _next asset URLs so everything resolves
    // behind the Traefik PathPrefix(/markets) router (no StripPrefix).
    basePath: '/markets',
    assetPrefix: '/markets',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'static2.finnhub.io',
                port: '',
                pathname: '/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
