import { getMetrics } from '@/lib/actions/finnhub.actions';

function fmt(v: unknown, digits = 2) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
    return v.toFixed(digits);
}

function fmtPct(v: unknown) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
    return `${v.toFixed(2)}%`;
}

export default async function FinancialsCard({ symbol }: { symbol: string }) {
    const data = await getMetrics(symbol);
    const m = data?.metric ?? {};

    const sections: { title: string; rows: [string, string][] }[] = [
        {
            title: 'Valuation',
            rows: [
                ['P/E (TTM)', fmt(m.peTTM ?? m.peBasicExclExtraTTM)],
                ['P/B', fmt(m.pbAnnual ?? m.pbQuarterly)],
                ['P/S (TTM)', fmt(m.psTTM)],
                ['EV/EBITDA', fmt(m['currentEv/freeCashFlowTTM'])],
            ],
        },
        {
            title: 'Profitability',
            rows: [
                ['ROE (TTM)', fmtPct(m.roeTTM)],
                ['ROA (TTM)', fmtPct(m.roaTTM)],
                ['Net Margin', fmtPct(m.netProfitMarginTTM)],
                ['Gross Margin', fmtPct(m.grossMarginTTM)],
            ],
        },
        {
            title: 'Per Share',
            rows: [
                ['EPS (TTM)', fmt(m.epsBasicExclExtraItemsTTM ?? m.epsTTM)],
                ['Revenue / Share', fmt(m.revenuePerShareTTM)],
                ['Book / Share', fmt(m.bookValuePerShareAnnual)],
                ['Dividend Yield', fmtPct(m.dividendYieldIndicatedAnnual)],
            ],
        },
        {
            title: 'Price Range',
            rows: [
                ['52W High', fmt(m['52WeekHigh'])],
                ['52W Low', fmt(m['52WeekLow'])],
                ['Beta', fmt(m.beta)],
                ['10D Avg Volume', m['10DayAverageTradingVolume'] ? `${(m['10DayAverageTradingVolume']).toFixed(2)}M` : '—'],
            ],
        },
    ];

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Financials</h3>
            {!data ? (
                <p className="text-sm text-gray-400">Financial metrics unavailable.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {sections.map((s) => (
                        <div key={s.title}>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {s.title}
                            </h4>
                            <dl className="space-y-2 text-sm">
                                {s.rows.map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <dt className="text-gray-400">{k}</dt>
                                        <dd className="text-gray-100">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
