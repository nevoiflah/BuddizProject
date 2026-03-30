import { callDataAuth } from './api';
import type { Order } from '../types';

export async function getUserOrders(): Promise<Order[]> {
    const data = await callDataAuth<{ items: Order[] }>('getUserOrders');
    return data.items;
}
