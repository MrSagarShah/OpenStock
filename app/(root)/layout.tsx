import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Identity comes from the shared <GoodThoughtsShell> nav, which self-reads the
// shared login session (localStorage 'gt-auth') client-side. No server-side
// auth lookup here — Markets no longer runs its own better-auth session.
const Layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="min-h-screen text-gray-400">
            <Header user={null} />

            <div className="container py-10">
                {children}
            </div>

            <Footer />
        </main>
    );
};
export default Layout;
