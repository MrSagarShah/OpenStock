'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuotes, type YahooQuote } from '@/lib/actions/yahoo.actions';

export default function WatchlistQuotes({ symbols }: { symbols: string[] }) {
    const [rows, setRows] = useState<YahooQuote[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!symbols || symbols.length === 0) {
            setRows([]);
            return;
        }
        setRows(null);
        getQuotes(symbols)
            .then((data) => {
                if (!cancelled) setRows(data);
            })
            .catch(() => {
                if (!cancelled) setRows([]);
            });
        return () => {
            cancelled = true;
        };
    }, [symbols]);

    if (!symbols || symbols.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-black/10 bg-white/70 text-sm text-gray-400 backdrop-blur-md">
                Add stocks to your watchlist to see live quotes.
            </div>
        );
    }

    if (rows === null) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-black/10 bg-white/70 text-sm text-gray-400 backdrop-blur-md">
                Loading quotes…
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white/70 backdrop-blur-md">
            <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                        <th className="px-4 py-3 text-left">Symbol</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Change</th>
                        <th className="px-4 py-3 text-right">%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.map((row) => {
                        const up = row.change >= 0;
                        return (
                            <tr key={row.symbol} className="hover:bg-white/5">
                                <td className="px-4 py-3">
                                    <Link href={`/stocks/${row.symbol}`} className="font-medium text-gray-100">
                                        {row.symbol}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{row.name}</td>
                                <td className="px-4 py-3 text-right text-gray-100">
                                    {row.currency === 'USD' ? '$' : ''}
                                    {row.price.toFixed(2)}
                                </td>
                                <td className={`px-4 py-3 text-right ${up ? 'text-[#059669]' : 'text-red-400'}`}>
                                    {up ? '+' : ''}
                                    {row.change.toFixed(2)}
                                </td>
                                <td className={`px-4 py-3 text-right ${up ? 'text-[#059669]' : 'text-red-400'}`}>
                                    {up ? '+' : ''}
                                    {row.changePercent.toFixed(2)}%
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
