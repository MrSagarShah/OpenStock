'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { requireUserEmail } from '@/lib/server/verify-user';
import { revalidatePath } from 'next/cache';

// Every action takes the caller's shared-login access token and derives the owner
// from it server-side. A userId/email supplied by the browser is never trusted.

const cleanSymbol = (s: string) => {
    const v = String(s || '').trim().toUpperCase();
    if (!v || v.length > 30) throw new Error('Invalid symbol');
    return v;
};

export async function addToWatchlist(token: string, symbol: string, company: string) {
    const userId = await requireUserEmail(token);
    const sym = cleanSymbol(symbol);
    try {
        await connectToDatabase();
        const newItem = await Watchlist.findOneAndUpdate(
            { userId, symbol: sym },
            { userId, symbol: sym, company: String(company || '').slice(0, 200), addedAt: new Date() },
            { upsert: true, new: true }
        );
        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newItem));
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw new Error('Failed to add to watchlist');
    }
}

export async function removeFromWatchlist(token: string, symbol: string) {
    const userId = await requireUserEmail(token);
    const sym = cleanSymbol(symbol);
    try {
        await connectToDatabase();
        await Watchlist.findOneAndDelete({ userId, symbol: sym });
        revalidatePath('/watchlist');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error('Failed to remove from watchlist');
    }
}

export async function getUserWatchlist(token: string) {
    const userId = await requireUserEmail(token);
    try {
        await connectToDatabase();
        const watchlist = await Watchlist.find({ userId }).sort({ addedAt: -1 });
        return JSON.parse(JSON.stringify(watchlist));
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}

export async function isStockInWatchlist(token: string, symbol: string) {
    try {
        const userId = await requireUserEmail(token);
        await connectToDatabase();
        const item = await Watchlist.findOne({ userId, symbol: cleanSymbol(symbol) });
        return !!item;
    } catch (error) {
        console.error('Error checking watchlist status:', error);
        return false;
    }
}
