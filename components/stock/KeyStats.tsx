import { getQuote } from '@/lib/actions/yahoo.actions';

function fmtNum(v: number | undefined, digits = 2): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return v.toLocaleString('en-US', { maximumFractionDigits: digits });
}

function fmtVolume(v: number | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`;
    return v.toString();
}

export default async function KeyStats({ symbol }: { symbol: string }) {
    const q = await getQuote(symbol);
    if (!q) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm text-gray-400 backdrop-blur-md">
                Key stats unavailable.
            </div>
        );
    }

    const rows: [string, string][] = [
        ['Previous Close', fmtNum(q.previousClose)],
        ['Day Range', q.dayLow && q.dayHigh ? `${fmtNum(q.dayLow)} – ${fmtNum(q.dayHigh)}` : '—'],
        ['52W Range', q.fiftyTwoWeekLow && q.fiftyTwoWeekHigh ? `${fmtNum(q.fiftyTwoWeekLow)} – ${fmtNum(q.fiftyTwoWeekHigh)}` : '—'],
        ['Volume', fmtVolume(q.volume)],
        ['Exchange', q.exchange || '—'],
        ['Currency', q.currency || '—'],
    ];

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Key Stats</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {rows.map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                        <dt className="text-gray-400">{k}</dt>
                        <dd className="text-gray-100">{v}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
