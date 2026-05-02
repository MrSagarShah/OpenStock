'use client';

import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, type IChartApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@/lib/actions/yahoo.actions';

interface LineAreaChartProps {
    candles: Candle[];
    height?: number;
    title?: string;
}

export default function LineAreaChart({ candles, height = 400, title }: LineAreaChartProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

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
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#0FEDBE',
            topColor: 'rgba(15, 237, 190, 0.35)',
            bottomColor: 'rgba(15, 237, 190, 0)',
            lineWidth: 2,
        });

        series.setData(
            candles.map((c) => ({
                time: c.time as UTCTimestamp,
                value: c.close,
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
        <div className="w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            {title && <h3 className="mb-3 text-lg font-semibold text-gray-100">{title}</h3>}
            {candles.length === 0 ? (
                <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
                    No price history available.
                </div>
            ) : (
                <div ref={containerRef} style={{ width: '100%', height }} />
            )}
        </div>
    );
}
