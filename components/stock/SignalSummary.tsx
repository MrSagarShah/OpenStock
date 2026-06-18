import { getCandles } from '@/lib/actions/yahoo.actions';
import { analyzeSignals } from '@/lib/indicators';

export default async function SignalSummary({ symbol }: { symbol: string }) {
    const data = await getCandles(symbol, '1y', '1d');
    const candles = data?.candles ?? [];

    if (candles.length < 20) {
        return (
            <div className="rounded-xl border border-black/10 bg-white/70 p-5 text-sm text-gray-400 backdrop-blur-md">
                Insufficient price history for signals.
            </div>
        );
    }

    const a = analyzeSignals(candles);

    const verdictTone =
        a.label === 'Strong Buy' ? 'bg-[#065f46] text-gray-900'
        : a.label === 'Buy' ? 'bg-[#065f46]/30 text-[#065f46] border border-[#065f46]/40'
        : a.label === 'Strong Sell' ? 'bg-red-500 text-white'
        : a.label === 'Sell' ? 'bg-red-500/30 text-red-300 border border-red-500/40'
        : 'bg-white/10 text-gray-200 border border-black/10';

    const dotColor = (v: 'bull' | 'bear' | 'neutral') =>
        v === 'bull' ? 'bg-[#065f46]' : v === 'bear' ? 'bg-red-400' : 'bg-gray-500';

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-100">Signal Summary</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${verdictTone}`}>
                    {a.label}
                </span>
            </div>

            <div className="mb-4 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#065f46]" />
                    <span className="text-gray-300">{a.bullish} bullish</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="text-gray-300">{a.bearish} bearish</span>
                </div>
            </div>

            <ul className="space-y-2">
                {a.signals.map((s) => (
                    <li key={s.name} className="flex items-start justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${dotColor(s.verdict)}`} />
                            <span className="text-gray-200">{s.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 text-right">{s.detail}</span>
                    </li>
                ))}
            </ul>

            <p className="mt-4 border-t border-black/10 pt-3 text-xs text-gray-500">
                Signals are derived from price history. Not financial advice.
            </p>
        </div>
    );
}
