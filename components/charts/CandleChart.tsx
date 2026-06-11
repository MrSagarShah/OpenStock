'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@/lib/actions/yahoo.actions';

interface CandleChartProps {
    candles: Candle[];
    height?: number;
    title?: string;
}

export default function CandleChart({ candles, height = 500, title }: CandleChartProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hasData] = useState(candles.length > 0);

    useEffect(() => {
        if (!containerRef.current || candles.length === 0) return;

        const chart: IChartApi = createChart(containerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#DBDBDB',
            },
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

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#059669',
            downColor: '#ef4444',
            borderUpColor: '#059669',
            borderDownColor: '#ef4444',
            wickUpColor: '#059669',
            wickDownColor: '#ef4444',
        });

        candleSeries.setData(
            candles.map((c) => ({
                time: c.time as UTCTimestamp,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            }))
        );

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: 'rgba(41, 98, 255, 0.5)',
            priceFormat: { type: 'volume' },
            priceScaleId: 'vol',
        });
        chart.priceScale('vol').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });
        volumeSeries.setData(
            candles.map((c) => ({
                time: c.time as UTCTimestamp,
                value: c.volume,
                color: c.close >= c.open ? 'rgba(15, 237, 190, 0.35)' : 'rgba(239, 68, 68, 0.35)',
            }))
        );

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({ width: containerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [candles, height]);

    return (
        <div className="w-full rounded-xl border border-black/10 bg-white/70 p-4 backdrop-blur-md">
            {title && <h3 className="mb-3 text-lg font-semibold text-gray-100">{title}</h3>}
            {!hasData ? (
                <div
                    className="flex items-center justify-center text-sm text-gray-400"
                    style={{ height }}
                >
                    No price history available.
                </div>
            ) : (
                <div ref={containerRef} style={{ width: '100%', height }} />
            )}
        </div>
    );
}
