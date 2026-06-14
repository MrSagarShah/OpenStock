import Link from 'next/link';
import { getQuotes, type YahooQuote } from '@/lib/actions/yahoo.actions';

const SECTORS: Record<string, string[]> = {
    Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'ORCL', 'AMZN', 'INTC', 'AMD', 'CRM', 'ADBE', 'NFLX'],
    Financial: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'V', 'MA', 'AXP', 'HSBC'],
    Healthcare: ['JNJ', 'PFE', 'UNH', 'LLY', 'ABBV', 'MRK', 'TMO', 'ABT'],
    'Consumer & Retail': ['WMT', 'COST', 'NKE', 'MCD', 'SBUX', 'KO', 'PEP', 'DIS', 'HD', 'TGT'],
    Energy: ['XOM', 'CVX', 'COP', 'SLB'],
    Industrial: ['BA', 'CAT', 'GE', 'HON', 'UPS'],
};

// Returns the tile fill plus whether its text should be dark. Tiles are painted
// over a light (bg-white/70) card, so a low-magnitude move yields a low-alpha,
// near-white fill — white text on it was effectively invisible. Pick dark text
// whenever the fill is pale (alpha below the legibility threshold).
function tileStyle(pct: number): { bg: string; darkText: boolean } {
    const capped = Math.max(-5, Math.min(5, pct));
    if (capped === 0) return { bg: 'rgba(107, 114, 128, 0.4)', darkText: true };
    const a = Math.min(0.85, 0.2 + Math.abs(capped) / 5 * 0.65);
    // teal-green positive / red negative, deepened toward the brand emerald
    const bg = capped > 0 ? `rgba(6, 148, 112, ${a.toFixed(2)})` : `rgba(220, 38, 38, ${a.toFixed(2)})`;
    return { bg, darkText: a < 0.55 };
}

function Tile({ q }: { q: YahooQuote }) {
    const up = q.change >= 0;
    const { bg, darkText } = tileStyle(q.changePercent);
    const sym = darkText ? 'text-slate-900' : 'text-white drop-shadow';
    const pctText = darkText ? 'text-slate-800' : 'text-white/90';
    const priceText = darkText ? 'text-slate-700' : 'text-white/80';
    return (
        <Link
            href={`/stocks/${q.symbol}`}
            className="flex flex-col justify-between rounded-lg p-3 transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: bg, minHeight: 88 }}
            title={`${q.name} — ${q.price.toFixed(2)} (${up ? '+' : ''}${q.changePercent.toFixed(2)}%)`}
        >
            <span className={`text-sm font-bold ${sym}`}>{q.symbol}</span>
            <div className="text-right">
                <div className={`text-xs font-semibold ${pctText}`}>
                    {up ? '+' : ''}
                    {q.changePercent.toFixed(2)}%
                </div>
                <div className={`text-xs ${priceText}`}>${q.price.toFixed(2)}</div>
            </div>
        </Link>
    );
}

export default async function Heatmap() {
    const all = Array.from(new Set(Object.values(SECTORS).flat()));
    const quotes = await getQuotes(all);
    const bySymbol: Record<string, YahooQuote> = {};
    quotes.forEach((q) => (bySymbol[q.symbol] = q));

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Market Heatmap</h3>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded" style={{ background: 'rgba(220,38,38,0.8)' }} />
                        −5%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-gray-500/40" />0
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded" style={{ background: 'rgba(6,148,112,0.85)' }} />
                        +5%
                    </span>
                </div>
            </div>

            <div className="space-y-5">
                {Object.entries(SECTORS).map(([sector, symbols]) => {
                    const tiles = symbols.map((s) => bySymbol[s]).filter(Boolean) as YahooQuote[];
                    if (tiles.length === 0) return null;
                    return (
                        <div key={sector}>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {sector}
                            </h4>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                {tiles.map((q) => (
                                    <Tile key={q.symbol} q={q} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
