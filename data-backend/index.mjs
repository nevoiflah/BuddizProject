import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand, PutCommand, DeleteCommand, UpdateCommand,
    ScanCommand, QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { createPublicKey, createVerify } from 'crypto';

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
    USERS: 'BUDDIZ-Users',
    BEERS: 'BUDDIZ-Beers',
    USER_FAVORITES: 'BUDDIZ-UserFavorites',
    ORDERS: 'BUDDIZ-Orders',
};

const USER_POOL_ID = "eu-north-1_22Rg2ivGc";
const COGNITO_ISSUER = `https://cognito-idp.eu-north-1.amazonaws.com/${USER_POOL_ID}`;
const JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;
let cachedJwks = null;

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// --- JWT HELPERS ---
async function getJwks() {
    if (cachedJwks) return cachedJwks;
    const res = await fetch(JWKS_URL);
    cachedJwks = await res.json();
    return cachedJwks;
}

function base64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}

async function verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const header = JSON.parse(base64urlDecode(parts[0]));
    const payload = JSON.parse(base64urlDecode(parts[1]));
    if (payload.exp < Date.now() / 1000) throw new Error('Token expired');
    if (payload.iss !== COGNITO_ISSUER) throw new Error('Invalid issuer');
    const jwks = await getJwks();
    const jwk = jwks.keys.find(k => k.kid === header.kid);
    if (!jwk) throw new Error('No matching key found');
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    const sig = Buffer.from(parts[2].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    if (!verifier.verify(publicKey, sig)) throw new Error('Invalid signature');
    return payload;
}

async function authenticate(event) {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing authorization token');
    return verifyToken(authHeader.slice(7));
}

async function requireAdmin(event) {
    const payload = await authenticate(event);
    const result = await docClient.send(new GetCommand({ TableName: TABLES.USERS, Key: { id: payload.email } }));
    if (!result.Item || result.Item.role !== 'ADMIN') throw new Error('Insufficient permissions');
    return payload;
}

function ok(body) {
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(body) };
}
function err(status, message) {
    return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) };
}

// --- HANDLER ---
export const handler = async (event) => {
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return err(400, 'Invalid JSON');
    }

    const { action } = body;

    try {
        // --- PUBLIC ---
        if (action === 'getBeers') {
            const response = await docClient.send(new ScanCommand({ TableName: TABLES.BEERS }));
            return ok({ items: response.Items || [] });
        }

        // --- USER AUTH REQUIRED ---
        let caller;
        try {
            caller = await authenticate(event);
        } catch (authErr) {
            return err(401, authErr.message);
        }
        const callerEmail = caller.email;

        if (action === 'getUserProfile') {
            const response = await docClient.send(new GetCommand({ TableName: TABLES.USERS, Key: { id: callerEmail } }));
            return ok({ item: response.Item || null });
        }

        if (action === 'updateUserProfile') {
            const { name, username } = body;
            await docClient.send(new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { id: callerEmail },
                UpdateExpression: "set #n = :name, username = :username",
                ExpressionAttributeNames: { "#n": "name" },
                ExpressionAttributeValues: { ":name": name, ":username": username },
            }));
            return ok({ success: true });
        }

        if (action === 'getFavorites') {
            const response = await docClient.send(new QueryCommand({
                TableName: TABLES.USER_FAVORITES,
                KeyConditionExpression: "userId = :uid",
                ExpressionAttributeValues: { ":uid": callerEmail },
            }));
            const items = (response.Items || []).map(i => i.product).filter(Boolean);
            return ok({ items });
        }

        if (action === 'addFavorite') {
            const { product } = body;
            await docClient.send(new PutCommand({
                TableName: TABLES.USER_FAVORITES,
                Item: { userId: callerEmail, productId: product.id, product },
            }));
            return ok({ success: true });
        }

        if (action === 'removeFavorite') {
            const { productId } = body;
            await docClient.send(new DeleteCommand({
                TableName: TABLES.USER_FAVORITES,
                Key: { userId: callerEmail, productId },
            }));
            return ok({ success: true });
        }

        if (action === 'getUserOrders') {
            const response = await docClient.send(new ScanCommand({
                TableName: TABLES.ORDERS,
                FilterExpression: "userId = :email",
                ExpressionAttributeValues: { ":email": callerEmail },
            }));
            const items = (response.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return ok({ items });
        }

        // --- ADMIN REQUIRED ---
        try {
            await requireAdmin(event);
        } catch (adminErr) {
            return err(403, adminErr.message);
        }

        if (action === 'getAllUsers') {
            const response = await docClient.send(new ScanCommand({ TableName: TABLES.USERS }));
            return ok({ items: response.Items || [] });
        }

        if (action === 'getAllProducts') {
            const response = await docClient.send(new ScanCommand({ TableName: TABLES.BEERS }));
            return ok({ items: response.Items || [] });
        }

        if (action === 'getAllOrders') {
            const response = await docClient.send(new ScanCommand({ TableName: TABLES.ORDERS }));
            return ok({ items: response.Items || [] });
        }

        if (action === 'updateUserRole') {
            const { userId, newRole } = body;
            await docClient.send(new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { id: userId },
                UpdateExpression: "set #r = :role",
                ExpressionAttributeNames: { "#r": "role" },
                ExpressionAttributeValues: { ":role": newRole },
            }));
            return ok({ success: true });
        }

        return err(400, `Unknown action: ${action}`);

    } catch (error) {
        console.error(`Error handling action "${action}":`, error);
        return err(500, error.message);
    }
};
