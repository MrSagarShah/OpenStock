'use server';

// Yahoo Finance chart API — free, no key required.
// Returns OHLC suitable for lightweight-charts.

export interface Candle {
    time: number; // unix seconds (lightweight-charts uses UTC seconds)
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface CandleResponse {
    symbol: string;
    currency: string;
    exchange: string;
    candles: Candle[];
    meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        longName?: string;
    };
}

const UA = 'Mozilla/5.0 (compatible; OpenStock/1.0)';

export interface YahooQuote {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    dayHigh?: number;
    dayLow?: number;
    volume?: number;
    marketTime?: number;
}

async function fetchQuoteMeta(symbol: string): Promise<YahooQuote | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            symbol
        )}?interval=1d&range=5d`;
        const res = await fetch(url, {
            headers: { 'User-Agent': UA, Accept: 'application/json' },
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const m = result.meta ?? {};
        const price = m.regularMarketPrice ?? 0;
        const prev = m.chartPreviousClose ?? m.previousClose ?? price;
        const change = price - prev;
        const changePercent = prev ? (change / prev) * 100 : 0;
        return {
            symbol: m.symbol ?? symbol,
            name: m.longName ?? m.shortName ?? symbol,
            currency: m.currency ?? 'USD',
            exchange: m.exchangeName ?? m.fullExchangeName ?? '',
            price,
            previousClose: prev,
            change,
            changePercent,
            fiftyTwoWeekHigh: m.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: m.fiftyTwoWeekLow,
            dayHigh: m.regularMarketDayHigh,
            dayLow: m.regularMarketDayLow,
            volume: m.regularMarketVolume,
            marketTime: m.regularMarketTime,
        };
    } catch (e) {
        console.error('fetchQuoteMeta error', symbol, e);
        return null;
    }
}

export interface NewsItem {
    title: string;
    link: string;
    source: string;
    pubDate: number;
}

function decodeEntities(s: string): string {
    return s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}

function extractCData(s: string): string {
    const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return m ? m[1] : s;
}

export async function getNewsForSymbol(symbol: string, limit = 8): Promise<NewsItem[]> {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
            symbol + ' stock'
        )}&hl=en-US&gl=US&ceid=US:en`;
        const res = await fetch(url, {
            headers: { 'User-Agent': UA },
            next: { revalidate: 600 },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
        const parsed: NewsItem[] = items.slice(0, limit).map((block) => {
            const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
            const linkRaw = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '';
            const pubRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? '';
            const sourceRaw = block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? '';
            const title = decodeEntities(extractCData(titleRaw).trim());
            const link = decodeEntities(extractCData(linkRaw).trim());
            const source = decodeEntities(extractCData(sourceRaw).trim());
            const pubDate = pubRaw ? Date.parse(pubRaw.trim()) : 0;
            return { title, link, source, pubDate };
        });
        return parsed.filter((n) => n.title && n.link);
    } catch (e) {
        console.error('getNewsForSymbol error', symbol, e);
        return [];
    }
}

export async function getQuotes(symbols: string[]): Promise<YahooQuote[]> {
    if (!symbols || symbols.length === 0) return [];
    const results = await Promise.all(symbols.map((s) => fetchQuoteMeta(s.toUpperCase())));
    return results.filter((r): r is YahooQuote => r !== null);
}

export async function getQuote(symbol: string): Promise<YahooQuote | null> {
    return fetchQuoteMeta(symbol.toUpperCase());
}

export async function getCandles(
    symbol: string,
    range: '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '1y',
    interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<CandleResponse | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            symbol
        )}?interval=${interval}&range=${range}`;

        const res = await fetch(url, {
            headers: { 'User-Agent': UA, Accept: 'application/json' },
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;

        const timestamps: number[] = result.timestamp || [];
        const q = result.indicators?.quote?.[0] || {};
        const opens: (number | null)[] = q.open || [];
        const highs: (number | null)[] = q.high || [];
        const lows: (number | null)[] = q.low || [];
        const closes: (number | null)[] = q.close || [];
        const volumes: (number | null)[] = q.volume || [];

        const candles: Candle[] = [];
        for (let i = 0; i < timestamps.length; i++) {
            const o = opens[i], h = highs[i], l = lows[i], c = closes[i];
            if (o == null || h == null || l == null || c == null) continue;
            candles.push({
                time: timestamps[i],
                open: o,
                high: h,
                low: l,
                close: c,
                volume: volumes[i] ?? 0,
            });
        }

        return {
            symbol: result.meta?.symbol ?? symbol,
            currency: result.meta?.currency ?? 'USD',
            exchange: result.meta?.exchangeName ?? '',
            candles,
            meta: {
                regularMarketPrice: result.meta?.regularMarketPrice,
                previousClose: result.meta?.chartPreviousClose ?? result.meta?.previousClose,
                fiftyTwoWeekHigh: result.meta?.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: result.meta?.fiftyTwoWeekLow,
                longName: result.meta?.longName,
            },
        };
    } catch (e) {
        console.error('getCandles error', symbol, e);
        return null;
    }
}
