import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'API | Good Thoughts Stocks',
    description: 'Good Thoughts Stocks architecture and data sources.',
};

export default function ApiDocsPage() {
    return (
        <div className="mx-auto max-w-3xl py-12 text-gray-200">
            <h1 className="mb-6 text-3xl font-bold">Data Sources</h1>
            <p className="mb-4 text-gray-300">
                Good Thoughts Stocks is a Next.js application running on our own infrastructure. Market data is sourced from public endpoints:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-300">
                <li>
                    <span className="font-semibold text-gray-100">Prices & charts</span> —
                    Yahoo Finance public chart API (no key required).
                </li>
                <li>
                    <span className="font-semibold text-gray-100">Technical signals</span> —
                    SMA (20 / 50 / 200) and RSI (14) computed locally from daily candles.
                </li>
                <li>
                    <span className="font-semibold text-gray-100">Charting</span> —
                    TradingView Lightweight Charts (open-source, renders locally, no third-party iframes).
                </li>
            </ul>

            <h2 className="mt-10 mb-4 text-2xl font-semibold">Related product</h2>
            <p className="text-gray-300">
                For Indian equities (NSE/BSE), visit{' '}
                <a href="https://financial.goodthoughts.in" className="text-[#059669] hover:underline">
                    Good Thoughts Financial
                </a>
                .
            </p>
        </div>
    );
}
