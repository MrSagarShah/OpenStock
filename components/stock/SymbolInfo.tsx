import { getQuote } from '@/lib/actions/yahoo.actions';

function fmtPrice(v: number | undefined, currency = 'USD') {
    if (v == null || Number.isNaN(v)) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(v);
}

export default async function SymbolInfo({ symbol }: { symbol: string }) {
    const q = await getQuote(symbol);
    const up = (q?.change ?? 0) >= 0;

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 text-lg font-bold text-gray-300">
                    {symbol.slice(0, 2)}
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-semibold text-gray-100">{symbol.toUpperCase()}</h2>
                        {q?.exchange && <span className="text-xs text-gray-400">{q.exchange}</span>}
                    </div>
                    <p className="text-sm text-gray-300">{q?.name ?? '—'}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-100">
                        {fmtPrice(q?.price, q?.currency)}
                    </div>
                    <div className={up ? 'text-[#0FEDBE]' : 'text-red-400'}>
                        {up ? '+' : ''}
                        {q?.change != null ? q.change.toFixed(2) : '—'} ({up ? '+' : ''}
                        {q?.changePercent != null ? q.changePercent.toFixed(2) : '—'}%)
                    </div>
                    {q?.fiftyTwoWeekHigh && q?.fiftyTwoWeekLow && (
                        <div className="mt-1 text-xs text-gray-500">
                            52W: {q.fiftyTwoWeekLow.toFixed(2)} – {q.fiftyTwoWeekHigh.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
