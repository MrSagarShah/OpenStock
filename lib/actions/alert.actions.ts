'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { requireUserEmail } from '@/lib/server/verify-user';
import { revalidatePath } from 'next/cache';

// Owner is derived from the caller's verified shared-login token, never from the browser.

export async function createAlert(params: {
    token: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
}) {
    const userId = await requireUserEmail(params.token);
    const symbol = String(params.symbol || '').trim().toUpperCase();
    const targetPrice = Number(params.targetPrice);
    if (!symbol || symbol.length > 30) throw new Error('Invalid symbol');
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) throw new Error('Invalid target price');
    if (params.condition !== 'ABOVE' && params.condition !== 'BELOW') throw new Error('Invalid condition');
    try {
        await connectToDatabase();
        const newAlert = await Alert.create({
            userId,
            symbol,
            targetPrice,
            condition: params.condition,
            active: true,
        });
        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newAlert));
    } catch (error) {
        console.error('Error creating alert:', error);
        throw new Error('Failed to create alert');
    }
}

export async function getUserAlerts(token: string) {
    const userId = await requireUserEmail(token);
    try {
        await connectToDatabase();
        const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

export async function deleteAlert(token: string, alertId: string) {
    const userId = await requireUserEmail(token);
    try {
        await connectToDatabase();
        await Alert.findOneAndDelete({ _id: alertId, userId }); // only the owner's alert
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error deleting alert:', error);
        throw new Error('Failed to delete alert');
    }
}

export async function toggleAlert(token: string, alertId: string, active: boolean) {
    const userId = await requireUserEmail(token);
    try {
        await connectToDatabase();
        await Alert.findOneAndUpdate({ _id: alertId, userId }, { active });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error toggling alert:', error);
        throw new Error('Failed to update alert');
    }
}
