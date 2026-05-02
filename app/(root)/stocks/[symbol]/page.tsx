import WatchlistButton from "@/components/WatchlistButton";
import SymbolInfo from "@/components/stock/SymbolInfo";
import SignalSummary from "@/components/stock/SignalSummary";
import RiskMetrics from "@/components/stock/RiskMetrics";
import AIInsight from "@/components/stock/AIInsight";
import KeyStats from "@/components/stock/KeyStats";
import StockNews from "@/components/stock/StockNews";
import InteractiveChart from "@/components/charts/InteractiveChart";
import { getCandles } from "@/lib/actions/yahoo.actions";

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { isStockInWatchlist } from '@/lib/actions/watchlist.actions';

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const upper = symbol.toUpperCase();

    const [session, candleData] = await Promise.all([
        auth.api.getSession({ headers: await headers() }),
        getCandles(upper, '1y', '1d'),
    ]);
    const userId = session?.user?.id;
    const isInWatchlist = userId ? await isStockInWatchlist(userId, symbol) : false;
    const candles = candleData?.candles ?? [];

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <SymbolInfo symbol={upper} />
                    <InteractiveChart symbol={upper} initialCandles={candles} initialRange="1y" />
                    <AIInsight symbol={upper} />
                    <StockNews symbol={upper} />
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <WatchlistButton
                            symbol={upper}
                            company={upper}
                            isInWatchlist={isInWatchlist}
                            userId={userId}
                        />
                    </div>
                    <SignalSummary symbol={upper} />
                    <RiskMetrics symbol={upper} />
                    <KeyStats symbol={upper} />
                </div>
            </section>
        </div>
    );
}
