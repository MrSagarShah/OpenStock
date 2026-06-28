'use client';

import React, { useEffect, useState } from 'react';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import { getUserAlerts } from '@/lib/actions/alert.actions';
import { getNews } from '@/lib/actions/finnhub.actions';
import WatchlistManager from '@/components/watchlist/WatchlistManager';
import AlertsPanel from '@/components/watchlist/AlertsPanel';
import NewsGrid from '@/components/watchlist/NewsGrid';
import SearchCommand from '@/components/SearchCommand';
import { Loader2 } from 'lucide-react';
import { readSharedSession, sharedLoginUrl } from '@/lib/shared-session';

// Gated on the SHARED login session (localStorage 'gt-auth'), not better-auth.
// The session is client-only, so this page resolves the user in the browser,
// bounces logged-out visitors to the shared /auth, and loads the watchlist
// keyed by EMAIL (the stable identity across the platform).
export default function WatchlistPage() {
    const [status, setStatus] = useState<'checking' | 'ready'>('checking');
    const [email, setEmail] = useState<string>('');
    const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);

    useEffect(() => {
        const sess = readSharedSession();
        if (!sess?.email) {
            window.location.assign(sharedLoginUrl('/markets/watchlist'));
            return;
        }
        let active = true;
        (async () => {
            const [items, userAlerts, initialNews] = await Promise.all([
                getUserWatchlist(sess.email),
                getUserAlerts(sess.email),
                getNews(),
            ]);
            const symbols = items.map((item: any) => item.symbol);
            const relevantNews = symbols.length > 0 ? await getNews(symbols) : initialNews;
            if (!active) return;
            setEmail(sess.email);
            setWatchlistItems(items);
            setAlerts(userAlerts);
            setNews(relevantNews || []);
            setStatus('ready');
        })();
        return () => { active = false; };
    }, []);

    if (status === 'checking') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Watchlist
                    </h1>
                    <p className="text-gray-500 mt-1">Track your favorite stocks and manage alerts.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <SearchCommand renderAs="button" label="Add Stock" initialStocks={[]} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content - Watchlist Table */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-6">
                        <WatchlistManager initialItems={watchlistItems} userId={email} />
                    </div>

                    {/* News Section */}
                    <NewsGrid news={news} />
                </div>

                {/* Sidebar - Alerts */}
                <div className="lg:col-span-1">
                    <AlertsPanel alerts={alerts} />
                </div>
            </div>
        </div>
    );
}
