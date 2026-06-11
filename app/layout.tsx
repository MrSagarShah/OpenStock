import type { Metadata } from "next";
import { Inter, Lora, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import {Toaster} from "@/components/ui/sonner";
import GoodThoughtsShell from "@/components/GoodThoughtsShell";
import "./globals.css";

// Inter = UI/engine voice, Lora = editorial/headline voice (Digital Curator).
// Keep the --font-geist-* variable names so globals.css @theme mappings still resolve.
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Good Thoughts Stocks",
  description: "Good Thoughts Stocks — track US market prices, explore charts, and manage your watchlist. A companion to Good Thoughts Financial for Indian markets.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${lora.variable} ${geistMono.variable} antialiased`}
            >
                <GoodThoughtsShell current="markets" />
                {children}
                <Toaster/>
                <Analytics />
            </body>
        </html>
    );
}
