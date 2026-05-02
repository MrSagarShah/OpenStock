import { getNews } from '@/lib/actions/finnhub.actions';

export default async function NewsFeed({ symbols, title = 'Top Stories' }: { symbols?: string[]; title?: string }) {
    let articles: MarketNewsArticle[] = [];
    try {
        articles = await getNews(symbols);
    } catch {
        articles = [];
    }

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">{title}</h3>
            {articles.length === 0 ? (
                <p className="text-sm text-gray-400">No news available.</p>
            ) : (
                <ul className="space-y-4">
                    {articles.map((a) => (
                        <li key={a.id ?? a.url} className="flex gap-3">
                            {a.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={a.image}
                                    alt=""
                                    className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="line-clamp-2 text-sm font-medium text-gray-100 hover:text-[#0FEDBE]"
                                >
                                    {a.headline}
                                </a>
                                <p className="mt-1 text-xs text-gray-500">
                                    {a.source}
                                    {a.datetime ? ` · ${new Date(a.datetime * 1000).toLocaleDateString()}` : ''}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
