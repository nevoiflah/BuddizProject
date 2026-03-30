import { callDataAuth } from './api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LAMBDA_URLS } from '../constants/aws';
import type { User, Product, Order } from '../types';

async function getIdToken(): Promise<string> {
    const { tokens } = await fetchAuthSession();
    return tokens!.idToken!.toString();
}

async function callAdmin<T>(action: string, body?: object): Promise<T> {
    const token = await getIdToken();
    const response = await fetch(LAMBDA_URLS.DATA, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...body }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data as T;
}

export async function getAllUsers(): Promise<User[]> {
    const data = await callAdmin<{ items: User[] }>('getAllUsers');
    return data.items;
}

export async function getAllProducts(): Promise<Product[]> {
    const data = await callAdmin<{ items: Product[] }>('getAllProducts');
    return data.items;
}

export async function getAllOrders(): Promise<Order[]> {
    const data = await callAdmin<{ items: Order[] }>('getAllOrders');
    return data.items;
}

export async function updateUserRole(userId: string, newRole: string): Promise<void> {
    await callAdmin('updateUserRole', { userId, newRole });
}

export async function deleteUser(email: string, userId: string): Promise<void> {
    const token = await getIdToken();
    const response = await fetch(LAMBDA_URLS.ADMIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, userId }),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete user');
    }
}

export async function approveOrder(order: Pick<Order, 'id' | 'userId' | 'paypalOrderId' | 'authorizationId'>): Promise<{ status: string }> {
    const token = await getIdToken();
    const response = await fetch(LAMBDA_URLS.PAYPAL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approveOrder', orderID: order.id, userId: order.userId, paypalOrderId: order.paypalOrderId, authorizationId: order.authorizationId }),
    });
    return response.json();
}

export async function denyOrder(order: Pick<Order, 'id' | 'userId' | 'authorizationId'>): Promise<{ status: string }> {
    const token = await getIdToken();
    const response = await fetch(LAMBDA_URLS.PAYPAL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'denyOrder', orderID: order.id, userId: order.userId, authorizationId: order.authorizationId }),
    });
    return response.json();
}
