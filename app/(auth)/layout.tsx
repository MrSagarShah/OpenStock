import Link from "next/link";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) redirect('/')
    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#004532] text-gray-900 font-black text-lg">GT</span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-xl font-bold text-gray-100">Good Thoughts</span>
                        <span className="text-xs font-medium tracking-widest text-[#004532] uppercase">Stocks</span>
                    </span>
                </Link>

                <div className="pb-6 lg:pb-8 flex-1">
                    {children}
                </div>
            </section>
            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <blockquote className="auth-blockquote">
                        “Clarity for US markets, without barriers. A companion to Good Thoughts Financial for Indian stocks.”
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">— Good Thoughts</cite>
                            <p className="max-md:text-xs text-gray-500">goodthoughts.in</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-6 flex items-center justify-center">
                            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#004532] text-gray-900 font-black text-4xl">GT</span>
                        </div>
                        <p className="text-gray-400 max-w-sm">
                            Live US market quotes · Candlestick charts · Technical signals · Watchlists
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
export default Layout
