'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
    createChart,
    CandlestickSeries,
    AreaSeries,
    LineSeries,
    HistogramSeries,
    type IChartApi,
    type UTCTimestamp,
} from 'lightweight-charts';
import { getCandles, type Candle } from '@/lib/actions/yahoo.actions';
import { sma } from '@/lib/indicators';

type ChartType = 'candles' | 'area' | 'line';
type Range = '1mo' | '3mo' | '6mo' | '1y' | '5y';

interface Props {
    symbol: string;
    initialCandles: Candle[];
    initialRange?: Range;
    height?: number;
}

const RANGES: { key: Range; label: string }[] = [
    { key: '1mo', label: '1M' },
    { key: '3mo', label: '3M' },
    { key: '6mo', label: '6M' },
    { key: '1y', label: '1Y' },
    { key: '5y', label: '5Y' },
];

const TYPES: { key: ChartType; label: string }[] = [
    { key: 'candles', label: 'Candles' },
    { key: 'area', label: 'Area' },
    { key: 'line', label: 'Line' },
];

export default function InteractiveChart({ symbol, initialCandles, initialRange = '1y', height = 520 }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [range, setRange] = useState<Range>(initialRange);
    const [type, setType] = useState<ChartType>('candles');
    const [showSMA, setShowSMA] = useState(true);
    const [candles, setCandles] = useState<Candle[]>(initialCandles);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        if (range === initialRange) return;
        startTransition(async () => {
            const data = await getCandles(symbol, range, range === '5y' ? '1wk' : '1d');
            setCandles(data?.candles ?? []);
        });
    }, [range, symbol, initialRange]);

    useEffect(() => {
        if (!containerRef.current || candles.length === 0) return;

        const chart: IChartApi = createChart(containerRef.current, {
            layout: { background: { color: 'transparent' }, textColor: '#DBDBDB' },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.05)' },
                horzLines: { color: 'rgba(255,255,255,0.05)' },
            },
            width: containerRef.current.clientWidth,
            height,
            timeScale: { timeVisible: true, secondsVisible: false },
            rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
            crosshair: { mode: 1 },
        });

        if (type === 'candles') {
            const s = chart.addSeries(CandlestickSeries, {
                upColor: '#0FEDBE',
                downColor: '#ef4444',
                borderUpColor: '#0FEDBE',
                borderDownColor: '#ef4444',
                wickUpColor: '#0FEDBE',
                wickDownColor: '#ef4444',
            });
            s.setData(
                candles.map((c) => ({
                    time: c.time as UTCTimestamp,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                }))
            );

            const vol = chart.addSeries(HistogramSeries, {
                priceFormat: { type: 'volume' },
                priceScaleId: 'vol',
            });
            chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            vol.setData(
                candles.map((c) => ({
                    time: c.time as UTCTimestamp,
                    value: c.volume,
                    color: c.close >= c.open ? 'rgba(15, 237, 190, 0.35)' : 'rgba(239, 68, 68, 0.35)',
                }))
            );
        } else if (type === 'area') {
            const s = chart.addSeries(AreaSeries, {
                lineColor: '#0FEDBE',
                topColor: 'rgba(15, 237, 190, 0.35)',
                bottomColor: 'rgba(15, 237, 190, 0)',
                lineWidth: 2,
            });
            s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })));
        } else {
            const s = chart.addSeries(LineSeries, {
                color: '#0FEDBE',
                lineWidth: 2,
            });
            s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })));
        }

        if (showSMA && candles.length >= 20) {
            const closes = candles.map((c) => c.close);
            const overlays: { period: number; color: string }[] = [
                { period: 20, color: '#fbbf24' },
                { period: 50, color: '#60a5fa' },
                { period: 200, color: '#c084fc' },
            ];
            for (const { period, color } of overlays) {
                if (candles.length < period) continue;
                const values = sma(closes, period);
                const s = chart.addSeries(LineSeries, {
                    color,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    title: `SMA ${period}`,
                });
                s.setData(
                    candles
                        .map((c, i) => ({ time: c.time as UTCTimestamp, value: values[i] }))
                        .filter((d): d is { time: UTCTimestamp; value: number } => d.value != null)
                );
            }
        }

        chart.timeScale().fitContent();

        const onResize = () => {
            if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            chart.remove();
        };
    }, [candles, type, height, showSMA]);

    return (
        <div className="w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-100">{symbol}</h3>
                <div className="flex items-center gap-2">
                    <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        {TYPES.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setType(t.key)}
                                className={`px-3 py-1 text-xs font-medium transition-colors ${
                                    type === t.key
                                        ? 'bg-[#0FEDBE] text-gray-900'
                                        : 'text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowSMA((v) => !v)}
                        className={`rounded-lg border border-white/10 px-3 py-1 text-xs font-medium transition-colors ${
                            showSMA
                                ? 'bg-[#0FEDBE] text-gray-900'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                        title="Toggle SMA 20 / 50 / 200 overlay"
                    >
                        SMA
                    </button>
                    <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        {RANGES.map((r) => (
                            <button
                                key={r.key}
                                onClick={() => setRange(r.key)}
                                disabled={pending}
                                className={`px-3 py-1 text-xs font-medium transition-colors ${
                                    range === r.key
                                        ? 'bg-[#0FEDBE] text-gray-900'
                                        : 'text-gray-300 hover:bg-white/10'
                                } ${pending && range !== r.key ? 'opacity-50' : ''}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {candles.length === 0 ? (
                <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
                    {pending ? 'Loading…' : 'No price history available.'}
                </div>
            ) : (
                <div ref={containerRef} style={{ width: '100%', height }} />
            )}
        </div>
    );
}
