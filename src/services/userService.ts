import { callDataAuth } from './api';
import type { User } from '../types';

export async function getUserProfile(): Promise<User | null> {
    const data = await callDataAuth<{ item: User | null }>('getUserProfile');
    return data.item;
}

export async function updateUserProfile(fields: { name: string; username: string }): Promise<void> {
    await callDataAuth('updateUserProfile', fields);
}
