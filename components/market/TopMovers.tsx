import Link from 'next/link';
import { getQuotes } from '@/lib/actions/yahoo.actions';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

export default async function TopMovers({ limit = 30 }: { limit?: number }) {
    const symbols = POPULAR_STOCK_SYMBOLS.slice(0, limit);
    const data = await getQuotes(symbols);
    const sorted = [...data].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.slice(0, 8);
    const losers = sorted.slice(-8).reverse();

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Top Movers</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#065f46]">Gainers</h4>
                    <ul className="space-y-1.5">
                        {gainers.map((r) => (
                            <li key={r.symbol}>
                                <Link
                                    href={`/stocks/${r.symbol}`}
                                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-white/5"
                                >
                                    <span className="font-medium text-gray-100">{r.symbol}</span>
                                    <span className="text-[#065f46]">+{r.changePercent.toFixed(2)}%</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">Losers</h4>
                    <ul className="space-y-1.5">
                        {losers.map((r) => (
                            <li key={r.symbol}>
                                <Link
                                    href={`/stocks/${r.symbol}`}
                                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-white/5"
                                >
                                    <span className="font-medium text-gray-100">{r.symbol}</span>
                                    <span className="text-red-400">{r.changePercent.toFixed(2)}%</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
