import { getCandles, getNewsForSymbol, getQuote } from '@/lib/actions/yahoo.actions';
import { analyzeSignals, computeRisk } from '@/lib/indicators';
import { callAIProviderWithFallback } from '@/lib/ai-provider';
import { Sparkles } from 'lucide-react';

function hasAIKey(): boolean {
    return Boolean(
        process.env.GEMINI_API_KEY ||
            process.env.MINIMAX_API_KEY ||
            process.env.SIRAY_API_KEY
    );
}

async function generateInsight(symbol: string): Promise<string | null> {
    const [quote, candleData, news] = await Promise.all([
        getQuote(symbol),
        getCandles(symbol, '1y', '1d'),
        getNewsForSymbol(symbol, 5),
    ]);

    const candles = candleData?.candles ?? [];
    if (!quote || candles.length < 20) return null;

    const signals = analyzeSignals(candles);
    const risk = computeRisk(candles);

    const headlines = news.slice(0, 5).map((n) => `- ${n.title} (${n.source})`).join('\n');

    const prompt = `You are a concise financial analyst. In 3-4 short sentences, summarize the current state of ${symbol} (${quote.name}) and what traders might consider. Use the data provided — do NOT give specific buy/sell advice or price targets.

PRICE:
- Current: ${quote.price.toFixed(2)} ${quote.currency}
- Change today: ${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)
- 52W range: ${quote.fiftyTwoWeekLow?.toFixed(2) ?? '?'} – ${quote.fiftyTwoWeekHigh?.toFixed(2) ?? '?'}

TECHNICAL SIGNALS:
- Aggregate verdict: ${signals.label} (${signals.bullish} bullish / ${signals.bearish} bearish signals)
- Key signals: ${signals.signals.map((s) => `${s.name} ${s.verdict}`).join('; ')}

RISK (1Y):
- Annualized volatility: ${risk.volatility?.toFixed(1)}%
- Max drawdown: ${risk.maxDrawdown?.toFixed(1)}%
- 1Y return: ${risk.yearReturn?.toFixed(1)}%
- Position in 52W range: ${risk.rangePosition?.toFixed(0)}%

RECENT HEADLINES:
${headlines || '(none)'}

End with one sentence describing what a cautious investor should watch next. Plain prose, no markdown, no bullet points.`;

    try {
        return await callAIProviderWithFallback(prompt);
    } catch (e) {
        console.error('AI insight failed', e);
        return null;
    }
}

export default async function AIInsight({ symbol }: { symbol: string }) {
    if (!hasAIKey()) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#0FEDBE]" />
                    <h3 className="text-lg font-semibold text-gray-100">AI Insight</h3>
                </div>
                <p className="text-sm text-gray-400">
                    AI insights are unavailable. Configure <code className="rounded bg-white/5 px-1 text-xs">GEMINI_API_KEY</code> in the server environment to enable natural-language summaries.
                </p>
            </div>
        );
    }

    const text = await generateInsight(symbol);

    return (
        <div className="rounded-xl border border-[#0FEDBE]/20 bg-gradient-to-br from-black/50 to-[#0FEDBE]/5 p-5 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-[#0FEDBE]" />
                <h3 className="text-lg font-semibold text-gray-100">AI Insight</h3>
            </div>
            {text ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{text}</p>
            ) : (
                <p className="text-sm text-gray-400">AI summary temporarily unavailable.</p>
            )}
            <p className="mt-3 border-t border-white/10 pt-3 text-xs text-gray-500">
                Generated from price data, technicals, and recent headlines. Not financial advice.
            </p>
        </div>
    );
}
