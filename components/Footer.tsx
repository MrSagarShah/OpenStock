import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white border-t border-gray-800">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#059669] text-gray-900 font-black text-lg">GT</span>
                            <span className="flex flex-col leading-tight">
                                <span className="text-lg font-bold text-gray-100">Good Thoughts</span>
                                <span className="text-xs font-medium tracking-widest text-[#059669] uppercase">Stocks</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Good Thoughts Stocks — track US market prices, explore charts and technicals, and manage your watchlist. For Indian markets, visit{' '}
                            <a href="https://financial.goodthoughts.in" className="text-[#059669] hover:underline">Good Thoughts Financial</a>.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <a href="https://financial.goodthoughts.in" className="text-gray-400 hover:text-white transition-colors">
                                    Good Thoughts Financial
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="text-gray-400 text-sm text-center">
                        © {new Date().getFullYear()} Good Thoughts. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
