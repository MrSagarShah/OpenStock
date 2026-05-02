import QuoteList from "@/components/market/QuoteList";
import TopMovers from "@/components/market/TopMovers";
import Heatmap from "@/components/market/Heatmap";

const TECH = ['AAPL', 'GOOGL', 'MSFT', 'META', 'ORCL', 'INTC', 'NVDA', 'AMZN'];
const FINANCIAL = ['JPM', 'WFC', 'BAC', 'HSBC', 'C', 'MA', 'V', 'GS'];
const CONSUMER = ['WMT', 'T', 'DIS', 'KO', 'NKE', 'MCD', 'SBUX', 'COST'];

const Home = () => {
    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="w-full home-section">
                <Heatmap />
            </section>

            <section className="grid w-full gap-8 home-section md:grid-cols-2 xl:grid-cols-3">
                <QuoteList title="Technology" symbols={TECH} />
                <QuoteList title="Financial" symbols={FINANCIAL} />
                <QuoteList title="Consumer & Services" symbols={CONSUMER} />
            </section>

            <section className="w-full home-section">
                <TopMovers />
            </section>
        </div>
    )
}

export default Home;
