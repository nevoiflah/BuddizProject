import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createPublicKey, createVerify } from 'crypto';

const cognito = new CognitoIdentityProviderClient({ region: "eu-north-1" });
const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(dynamo);

const USER_POOL_ID = "eu-north-1_22Rg2ivGc";
const TABLE_NAME = "BUDDIZ-Users";
const COGNITO_ISSUER = `https://cognito-idp.eu-north-1.amazonaws.com/${USER_POOL_ID}`;
const JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;
let cachedJwks = null;

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

async function verifyAdmin(event) {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing authorization token');
    const payload = await verifyToken(authHeader.slice(7));
    const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id: payload.email } }));
    if (!result.Item || result.Item.role !== 'ADMIN') throw new Error('Insufficient permissions');
    return payload;
}

export const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    try {
        await verifyAdmin(event);
    } catch (authErr) {
        return { statusCode: 403, body: JSON.stringify({ error: authErr.message }) };
    }

    // Support Function URL (body is string)
    let body = event.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error("Failed to parse body", e);
            return { statusCode: 400, body: "Invalid JSON" };
        }
    }

    const { email, userId } = body;

    if (!email || !userId) {
        return { statusCode: 400, body: "Missing email or userId" };
    }

    try {
        // 1. Delete from Cognito
        console.log(`Deleting from Cognito: ${email}`);
        try {
            await cognito.send(new AdminDeleteUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: email
            }));
        } catch (err) {
            console.warn("Cognito delete failed (maybe user not found):", err);
            // Continue to delete from DB anyway
        }

        // 2. Delete from DynamoDB
        console.log(`Deleting from DynamoDB: ${userId}`);
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id: userId }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User deleted successfully" })
        };
    } catch (error) {
        console.error("Delete failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
