import type { Candle } from '@/lib/actions/yahoo.actions';

export function sma(values: number[], period: number): (number | null)[] {
    const out: (number | null)[] = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        if (i >= period) sum -= values[i - period];
        out.push(i >= period - 1 ? sum / period : null);
    }
    return out;
}

export function ema(values: number[], period: number): (number | null)[] {
    const out: (number | null)[] = [];
    const k = 2 / (period + 1);
    let prev: number | null = null;
    for (let i = 0; i < values.length; i++) {
        if (i < period - 1) {
            out.push(null);
            continue;
        }
        if (prev == null) {
            const slice = values.slice(0, period);
            prev = slice.reduce((a, b) => a + b, 0) / period;
        } else {
            prev = values[i] * k + prev * (1 - k);
        }
        out.push(prev);
    }
    return out;
}

export function rsi(values: number[], period = 14): number | null {
    if (values.length < period + 1) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = values[i] - values[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    let avgG = gains / period, avgL = losses / period;
    for (let i = period + 1; i < values.length; i++) {
        const diff = values[i] - values[i - 1];
        const g = diff > 0 ? diff : 0;
        const l = diff < 0 ? -diff : 0;
        avgG = (avgG * (period - 1) + g) / period;
        avgL = (avgL * (period - 1) + l) / period;
    }
    if (avgL === 0) return 100;
    const rs = avgG / avgL;
    return 100 - 100 / (1 + rs);
}

export function macd(values: number[]): { macd: number | null; signal: number | null; histogram: number | null } {
    const ema12 = ema(values, 12);
    const ema26 = ema(values, 26);
    const macdLine = values.map((_, i) => {
        const a = ema12[i], b = ema26[i];
        return a != null && b != null ? a - b : null;
    });
    const cleanMacd = macdLine.filter((v): v is number => v != null);
    const signalLine = ema(cleanMacd, 9);
    const lastMacd = macdLine[macdLine.length - 1];
    const lastSignal = signalLine[signalLine.length - 1];
    return {
        macd: lastMacd,
        signal: lastSignal,
        histogram: lastMacd != null && lastSignal != null ? lastMacd - lastSignal : null,
    };
}

export interface SignalAnalysis {
    score: number;
    label: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    bullish: number;
    bearish: number;
    signals: { name: string; verdict: 'bull' | 'bear' | 'neutral'; detail: string }[];
}

export function analyzeSignals(candles: Candle[]): SignalAnalysis {
    const closes = candles.map((c) => c.close);
    const last = closes[closes.length - 1];
    const signals: SignalAnalysis['signals'] = [];
    let bull = 0, bear = 0;

    const sma20Arr = sma(closes, 20);
    const sma50Arr = sma(closes, 50);
    const sma200Arr = sma(closes, 200);
    const sma20 = sma20Arr[sma20Arr.length - 1];
    const sma50 = sma50Arr[sma50Arr.length - 1];
    const sma200 = sma200Arr[sma200Arr.length - 1];

    const addSma = (name: string, v: number | null) => {
        if (v == null) { signals.push({ name, verdict: 'neutral', detail: 'insufficient data' }); return; }
        if (last > v) { bull++; signals.push({ name, verdict: 'bull', detail: `price ${last.toFixed(2)} > ${v.toFixed(2)}` }); }
        else { bear++; signals.push({ name, verdict: 'bear', detail: `price ${last.toFixed(2)} < ${v.toFixed(2)}` }); }
    };
    addSma('Price vs 20-day SMA', sma20);
    addSma('Price vs 50-day SMA', sma50);
    addSma('Price vs 200-day SMA', sma200);

    if (sma50 != null && sma200 != null) {
        if (sma50 > sma200) { bull++; signals.push({ name: 'Golden Cross (50>200)', verdict: 'bull', detail: 'SMA50 above SMA200' }); }
        else { bear++; signals.push({ name: 'Death Cross (50<200)', verdict: 'bear', detail: 'SMA50 below SMA200' }); }
    }

    const rsiVal = rsi(closes, 14);
    if (rsiVal != null) {
        if (rsiVal > 70) { bear++; signals.push({ name: 'RSI (14)', verdict: 'bear', detail: `${rsiVal.toFixed(1)} — overbought` }); }
        else if (rsiVal < 30) { bull++; signals.push({ name: 'RSI (14)', verdict: 'bull', detail: `${rsiVal.toFixed(1)} — oversold` }); }
        else signals.push({ name: 'RSI (14)', verdict: 'neutral', detail: `${rsiVal.toFixed(1)} — neutral` });
    }

    const m = macd(closes);
    if (m.histogram != null) {
        if (m.histogram > 0) { bull++; signals.push({ name: 'MACD', verdict: 'bull', detail: `histogram ${m.histogram.toFixed(2)} — bullish` }); }
        else { bear++; signals.push({ name: 'MACD', verdict: 'bear', detail: `histogram ${m.histogram.toFixed(2)} — bearish` }); }
    }

    const total = bull + bear;
    const score = total === 0 ? 0 : (bull - bear) / total;
    const label: SignalAnalysis['label'] =
        score > 0.5 ? 'Strong Buy' : score > 0.15 ? 'Buy' : score < -0.5 ? 'Strong Sell' : score < -0.15 ? 'Sell' : 'Hold';

    return { score, label, bullish: bull, bearish: bear, signals };
}

export interface RiskMetrics {
    volatility: number | null;
    maxDrawdown: number | null;
    rangePosition: number | null;
    yearReturn: number | null;
}

export function computeRisk(candles: Candle[]): RiskMetrics {
    if (candles.length < 2) {
        return { volatility: null, maxDrawdown: null, rangePosition: null, yearReturn: null };
    }
    const closes = candles.map((c) => c.close);
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
        returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

    let peak = closes[0];
    let maxDD = 0;
    for (const v of closes) {
        if (v > peak) peak = v;
        const dd = (peak - v) / peak;
        if (dd > maxDD) maxDD = dd;
    }

    const high = Math.max(...closes);
    const low = Math.min(...closes);
    const last = closes[closes.length - 1];
    const rangePosition = high === low ? 50 : ((last - low) / (high - low)) * 100;
    const yearReturn = ((last - closes[0]) / closes[0]) * 100;

    return {
        volatility,
        maxDrawdown: maxDD * 100,
        rangePosition,
        yearReturn,
    };
}
