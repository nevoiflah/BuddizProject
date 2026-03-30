import { callData } from './api';
import type { Product } from '../types';

export async function getBeers(): Promise<Product[]> {
    const data = await callData<{ items: Product[] }>('getBeers');
    return data.items;
}
