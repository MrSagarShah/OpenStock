import NavItems from "@/components/NavItems";
import { searchStocks } from "@/lib/actions/finnhub.actions";

// Markets section sub-nav. The product brand + the single sign-in/account live in
// the shared <GoodThoughtsShell> above this bar, and login is the shared /auth
// (Supabase) — so this header carries ONLY the Markets sub-nav (Dashboard /
// Search / Watchlist), like the Finance and IPO section sub-navs. No duplicate
// brand and no second (better-auth) Sign in/Sign up controls.
const Header = async ({ user: _user }: { user: User | null }) => {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper header-wrapper--subnav">
                <nav className="w-full">
                    <NavItems initialStocks={initialStocks} />
                </nav>
            </div>
        </header>
    );
};
export default Header;
