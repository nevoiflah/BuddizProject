import { callDataAuth } from './api';
import type { Product } from '../types';

export async function getFavorites(): Promise<Product[]> {
    const data = await callDataAuth<{ items: Product[] }>('getFavorites');
    return data.items;
}

export async function addFavorite(product: Product): Promise<void> {
    await callDataAuth('addFavorite', { product });
}

export async function removeFavorite(productId: string): Promise<void> {
    await callDataAuth('removeFavorite', { productId });
}
