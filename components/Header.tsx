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
                {/* Brand lives in the shared GoodThoughtsShell above; this bar is
                    the Markets section's own sub-nav. */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Markets</span>
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
