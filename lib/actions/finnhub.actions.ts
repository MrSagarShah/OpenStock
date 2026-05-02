'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}

export { fetchJSON };

export async function getQuote(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        // No caching for real-time price
        return await fetchJSON<any>(url, 0);
    } catch (e) {
        console.error('Error fetching quote for', symbol, e);
        return null;
    }
}

export async function getMetrics(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) return null;
        const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`;
        return await fetchJSON<any>(url, 3600);
    } catch (e) {
        console.error('Error fetching metrics for', symbol, e);
        return null;
    }
}

export async function getRecommendation(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) return null;
        const url = `${FINNHUB_BASE_URL}/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        return await fetchJSON<any[]>(url, 3600);
    } catch (e) {
        console.error('Error fetching recommendation for', symbol, e);
        return null;
    }
}

export async function getCompanyProfile(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        // Cache profile for 24 hours
        return await fetchJSON<any>(url, 86400);
    } catch (e) {
        console.error('Error fetching profile for', symbol, e);
        return null;
    }
}

export async function getWatchlistData(symbols: string[]) {
    if (!symbols || symbols.length === 0) return [];

    // Fetch quotes and profiles in parallel
    const promises = symbols.map(async (sym) => {
        const [quote, profile] = await Promise.all([
            getQuote(sym),
            getCompanyProfile(sym)
        ]);

        return {
            symbol: sym,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            currency: profile?.currency || 'USD',
            name: profile?.name || sym,
            logo: profile?.logo,
            marketCap: profile?.marketCapitalization,
            peRatio: 0 // Finnhub 'quote' and 'profile2' don't easily give real-time PE. Might need 'metric' endpoint, but skipping for now to save rate limits.
        };
    });

    return await Promise.all(promises);
}


export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            throw new Error('FINNHUB API key is not configured');
        }
        const cleanSymbols = (symbols || [])
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        const maxArticles = 6;

        // If we have symbols, try to fetch company news per symbol and round-robin select
        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch (e) {
                        console.error('Error fetching company news for', sym, e);
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            // Round-robin up to 6 picks
            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;
                    collected.push(formatArticle(article, true, sym, round));
                    if (collected.length >= maxArticles) break;
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                // Sort by datetime desc
                collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
                return collected.slice(0, maxArticles);
            }
            // If none collected, fall through to general news
        }

        // General market news fallback or when no symbols provided
        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break; // cap early before final slicing
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;
    } catch (err) {
        console.error('getNews error:', err);
        throw new Error('Failed to fetch news');
    }
}

interface YahooSearchQuote {
    symbol?: string;
    shortname?: string;
    longname?: string;
    exchDisp?: string;
    quoteType?: string;
    typeDisp?: string;
    isYahooFinance?: boolean;
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const trimmed = typeof query === 'string' ? query.trim() : '';

        if (!trimmed) {
            return POPULAR_STOCK_SYMBOLS.slice(0, 10).map((sym) => ({
                symbol: sym.toUpperCase(),
                name: sym.toUpperCase(),
                exchange: 'US',
                type: 'Stock',
                isInWatchlist: false,
            }));
        }

        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(trimmed)}&quotesCount=15&newsCount=0`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GoodThoughtsStocks/1.0)', Accept: 'application/json' },
            next: { revalidate: 1800 },
        });
        if (!res.ok) {
            console.error('Yahoo search failed', res.status);
            return [];
        }
        const data = await res.json();
        const quotes: YahooSearchQuote[] = Array.isArray(data?.quotes) ? data.quotes : [];

        return quotes
            .filter((q) => q.isYahooFinance && q.symbol)
            .map((q) => ({
                symbol: (q.symbol ?? '').toUpperCase(),
                name: q.longname || q.shortname || q.symbol || '',
                exchange: q.exchDisp || 'US',
                type: q.typeDisp || q.quoteType || 'Stock',
                isInWatchlist: false,
            }))
            .slice(0, 15);
    } catch (err) {
        console.error('Error in stock search:', err);
        return [];
    }
});
