import { fetchAuthSession } from 'aws-amplify/auth';
import { LAMBDA_URLS } from '../constants/aws';

async function getIdToken(): Promise<string> {
    const { tokens } = await fetchAuthSession();
    return tokens!.idToken!.toString();
}

export async function callData<T>(action: string, body?: object): Promise<T> {
    const response = await fetch(LAMBDA_URLS.DATA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data as T;
}

export async function callDataAuth<T>(action: string, body?: object): Promise<T> {
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
