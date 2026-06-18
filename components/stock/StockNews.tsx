import { getNewsForSymbol } from '@/lib/actions/yahoo.actions';

function timeAgo(ts: number): string {
    if (!ts) return '';
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
}

export default async function StockNews({ symbol }: { symbol: string }) {
    const articles = await getNewsForSymbol(symbol, 8);

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Recent News</h3>
            {articles.length === 0 ? (
                <p className="text-sm text-gray-400">No recent news for {symbol}.</p>
            ) : (
                <ul className="space-y-3">
                    {articles.map((a) => (
                        <li key={a.link} className="border-b border-black/5 pb-3 last:border-0 last:pb-0">
                            <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm font-medium text-gray-100 hover:text-[#065f46]"
                            >
                                {a.title}
                            </a>
                            <p className="mt-1 text-xs text-gray-500">
                                {a.source}
                                {a.pubDate ? ` · ${timeAgo(a.pubDate)}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
