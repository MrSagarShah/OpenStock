import Link from 'next/link';
import { getQuotes } from '@/lib/actions/yahoo.actions';

interface QuoteListProps {
    title?: string;
    symbols: string[];
}

export default async function QuoteList({ title, symbols }: QuoteListProps) {
    const data = await getQuotes(symbols);

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 backdrop-blur-md">
            {title && <h3 className="mb-4 text-lg font-semibold text-gray-100">{title}</h3>}
            <ul className="divide-y divide-white/5">
                {data.map((row) => {
                    const up = row.change >= 0;
                    return (
                        <li key={row.symbol}>
                            <Link
                                href={`/stocks/${row.symbol}`}
                                className="flex items-center gap-3 py-2.5 hover:bg-white/5 rounded px-2 -mx-2 transition-colors"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded bg-white/5 text-[10px] font-semibold text-gray-300">
                                    {row.symbol.slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-100">{row.symbol}</span>
                                        <span className="truncate text-xs text-gray-400">{row.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-100">
                                        {row.currency === 'USD' ? '$' : ''}
                                        {row.price.toFixed(2)}
                                    </div>
                                    <div className={`text-sm ${up ? 'text-[#065f46]' : 'text-red-400'}`}>
                                        {up ? '+' : ''}
                                        {row.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
                {data.length === 0 && (
                    <li className="py-8 text-center text-sm text-gray-400">No data available.</li>
                )}
            </ul>
        </div>
    );
}
