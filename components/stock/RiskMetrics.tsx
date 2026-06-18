import { getCandles } from '@/lib/actions/yahoo.actions';
import { computeRisk } from '@/lib/indicators';

function fmt(v: number | null, suffix = '', digits = 2): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return `${v.toFixed(digits)}${suffix}`;
}

function volLabel(v: number | null): string {
    if (v == null) return '';
    if (v < 20) return 'low';
    if (v < 40) return 'moderate';
    if (v < 60) return 'elevated';
    return 'high';
}

export default async function RiskMetrics({ symbol }: { symbol: string }) {
    const data = await getCandles(symbol, '1y', '1d');
    const candles = data?.candles ?? [];
    const r = computeRisk(candles);

    const pos = r.rangePosition ?? 0;

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Risk & Range</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-xs text-gray-400">Volatility (1Y ann.)</div>
                    <div className="text-lg font-semibold text-gray-100">
                        {fmt(r.volatility, '%')}{' '}
                        <span className="text-xs font-normal text-gray-500">{volLabel(r.volatility)}</span>
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Max Drawdown (1Y)</div>
                    <div className="text-lg font-semibold text-red-400">-{fmt(r.maxDrawdown, '%')}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">1Y Return</div>
                    <div className={`text-lg font-semibold ${(r.yearReturn ?? 0) >= 0 ? 'text-[#065f46]' : 'text-red-400'}`}>
                        {(r.yearReturn ?? 0) >= 0 ? '+' : ''}{fmt(r.yearReturn, '%')}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">52W Position</div>
                    <div className="text-lg font-semibold text-gray-100">{fmt(r.rangePosition, '%', 0)}</div>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>52W Low</span>
                    <span>52W High</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/5">
                    <div
                        className="absolute top-0 h-2 w-1 rounded-full bg-[#065f46] shadow-[0_0_10px_#065f46]"
                        style={{ left: `calc(${Math.max(0, Math.min(100, pos))}% - 2px)` }}
                    />
                </div>
            </div>

            <p className="mt-4 border-t border-black/10 pt-3 text-xs text-gray-500">
                Volatility is the annualized standard deviation of daily returns.
            </p>
        </div>
    );
}
