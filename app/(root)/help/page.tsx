import { Metadata } from 'next';
import { HelpCircle, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Help | Good Thoughts Stocks',
    description: 'Help and FAQs for Good Thoughts Stocks.',
};

export default function HelpPage() {
    const faqs = [
        {
            question: 'What does Good Thoughts Stocks cover?',
            answer: 'US-listed equities (NYSE, NASDAQ). For Indian listed stocks (NSE/BSE), visit Good Thoughts Financial at financial.goodthoughts.in.',
        },
        {
            question: 'How do I add stocks to my watchlist?',
            answer: 'Search for a symbol via the Search field in the header, open the stock detail page, and click "Add to Watchlist".',
        },
        {
            question: 'Where does the market data come from?',
            answer: 'Prices and historical candles come from Yahoo Finance. Technical signals (SMA, RSI) are computed locally from daily candles. Data may be delayed.',
        },
        {
            question: 'Is this financial advice?',
            answer: 'No. Good Thoughts Stocks is an informational tool. Always do your own research or consult a certified professional.',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            <div className="text-center pt-16 pb-12 space-y-4">
                <div className="inline-flex p-3 bg-[#0FEDBE]/10 rounded-2xl border border-[#0FEDBE]/20 mb-4">
                    <HelpCircle className="text-[#0FEDBE] h-8 w-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">How can we help?</h1>
                <p className="text-xl text-gray-400">Quick answers below.</p>
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">Frequently Asked Questions</h2>
                <div className="grid gap-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-colors">
                            <h3 className="font-semibold text-lg text-gray-200 mb-2 flex items-start gap-3">
                                <Lightbulb size={20} className="text-[#0FEDBE]/60 mt-1 shrink-0" />
                                {faq.question}
                            </h3>
                            <p className="text-gray-400 leading-relaxed ml-8 pl-1 border-l-2 border-gray-800">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
