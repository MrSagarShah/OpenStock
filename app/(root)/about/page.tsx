import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Good Thoughts Stocks',
    description: 'About Good Thoughts Stocks — US market tracking companion to Good Thoughts Financial.',
};

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-3xl py-12 text-gray-200">
            <div className="mb-8 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0FEDBE] text-gray-900 font-black text-xl">GT</span>
                <div>
                    <h1 className="text-3xl font-bold">Good Thoughts Stocks</h1>
                    <p className="text-sm text-[#0FEDBE]">A Good Thoughts product</p>
                </div>
            </div>

            <p className="mb-4 text-gray-300">
                Good Thoughts Stocks tracks US-listed equities with live prices, candlestick charts, technical signals, and watchlists — all served from a single lean stack, with no paywalls and no third-party redirects.
            </p>

            <p className="mb-4 text-gray-300">
                For Indian listed companies (NSE/BSE), visit our companion product{' '}
                <a href="https://financial.goodthoughts.in" className="text-[#0FEDBE] hover:underline">
                    Good Thoughts Financial
                </a>
                . Together they cover the two markets most of our users care about.
            </p>

            <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-100">Data sources</h2>
            <ul className="list-disc space-y-1 pl-6 text-gray-300">
                <li>Prices and charts: Yahoo Finance public chart API</li>
                <li>Technical signals (SMA, RSI): computed locally from daily candles</li>
                <li>Charting: TradingView Lightweight Charts (open-source, renders locally — no external links)</li>
            </ul>

            <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-100">Disclaimer</h2>
            <p className="text-gray-300">
                Good Thoughts Stocks is for informational purposes only. It is not financial advice. Market data may be delayed.
            </p>
        </div>
    );
}
