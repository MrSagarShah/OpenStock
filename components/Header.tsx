import Link from "next/link";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { searchStocks } from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User | null }) => {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0FEDBE] text-gray-900 font-black text-lg">GT</span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-lg font-bold text-gray-100">Good Thoughts</span>
                        <span className="text-xs font-medium tracking-widest text-[#0FEDBE] uppercase">Stocks</span>
                    </span>
                </Link>
                <nav className="hidden sm:block">
                    <NavItems initialStocks={initialStocks} />
                </nav>

                {user ? (
                    <UserDropdown user={user} initialStocks={initialStocks} />
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href="/sign-in">
                            <Button variant="ghost" className="text-gray-300 hover:text-teal-500">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="bg-teal-500 text-gray-900 hover:bg-teal-400">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};
export default Header;
