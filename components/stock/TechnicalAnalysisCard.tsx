import { getCandles, type Candle } from '@/lib/actions/yahoo.actions';

function sma(values: number[], period: number): number | null {
    if (values.length < period) return null;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function rsi(values: number[], period = 14): number | null {
    if (values.length < period + 1) return null;
    let gains = 0, losses = 0;
    for (let i = values.length - period; i < values.length; i++) {
        const diff = values[i] - values[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const avgG = gains / period, avgL = losses / period;
    if (avgL === 0) return 100;
    const rs = avgG / avgL;
    return 100 - 100 / (1 + rs);
}

function signal(label: string, value: string, tone: 'buy' | 'sell' | 'neutral') {
    const color =
        tone === 'buy' ? 'text-[#065f46]' : tone === 'sell' ? 'text-red-400' : 'text-gray-300';
    return (
        <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className={color}>{value}</span>
        </div>
    );
}

export default async function TechnicalAnalysisCard({ symbol }: { symbol: string }) {
    const ohlc = await getCandles(symbol, '6mo', '1d');
    const candles: Candle[] = ohlc?.candles ?? [];
    const closes = candles.map((c) => c.close);
    const last = closes[closes.length - 1];

    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const sma200 = sma(closes, 200);
    const rsi14 = rsi(closes, 14);

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Technical Analysis</h3>
            {candles.length === 0 ? (
                <p className="text-sm text-gray-400">Price history unavailable.</p>
            ) : (
                <div className="space-y-2">
                    {signal(
                        'Price vs 20-day SMA',
                        sma20 != null ? `${last.toFixed(2)} vs ${sma20.toFixed(2)}` : '—',
                        sma20 == null ? 'neutral' : last > sma20 ? 'buy' : 'sell'
                    )}
                    {signal(
                        'Price vs 50-day SMA',
                        sma50 != null ? `${last.toFixed(2)} vs ${sma50.toFixed(2)}` : '—',
                        sma50 == null ? 'neutral' : last > sma50 ? 'buy' : 'sell'
                    )}
                    {signal(
                        'Price vs 200-day SMA',
                        sma200 != null ? `${last.toFixed(2)} vs ${sma200.toFixed(2)}` : '—',
                        sma200 == null ? 'neutral' : last > sma200 ? 'buy' : 'sell'
                    )}
                    {signal(
                        'RSI (14)',
                        rsi14 != null ? rsi14.toFixed(1) : '—',
                        rsi14 == null ? 'neutral' : rsi14 > 70 ? 'sell' : rsi14 < 30 ? 'buy' : 'neutral'
                    )}
                </div>
            )}
        </div>
    );
}
