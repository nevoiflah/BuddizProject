import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const BASE_URL = process.env.PAYPAL_MODE === 'live' ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const data = await response.json();
    return data.access_token;
}

export const handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle Preflight options
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const { action } = body;

        if (action === "createOrder") {
            const { cart } = body;
            // Calculate total on backend for security
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5; // Fixed shipping

            const accessToken = await getAccessToken();
            const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [{
                        amount: {
                            currency_code: "ILS",
                            value: total.toFixed(2),
                        },
                    }],
                }),
            });

            const order = await response.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ id: order.id }),
            };
        }

        if (action === "captureOrder") {
            const { orderID, userEmail, cart } = body;
            const accessToken = await getAccessToken();

            const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (data.status === "COMPLETED") {
                // Payment successful. Now update Database.

                // 1. Decrement Stock
                for (const item of cart) {
                    try {
                        await docClient.send(new UpdateCommand({
                            TableName: "BUDDIZ-Beers",
                            Key: { id: item.id },
                            UpdateExpression: "set stock = stock - :qty",
                            ConditionExpression: "stock >= :qty",
                            ExpressionAttributeValues: { ":qty": item.quantity }
                        }));
                    } catch (err) {
                        console.error(`Failed to decrement stock for ${item.name}`, err);
                    }
                }

                // 2. Create Order
                const newOrder = {
                    orderId: orderID,
                    userId: userEmail,
                    items: cart,
                    total: data.purchase_units[0].payments.captures[0].amount.value,
                    status: 'Paid',
                    createdAt: new Date().toISOString(),
                    paypalOrderId: orderID,
                    currency: "ILS"
                };

                await docClient.send(new PutCommand({
                    TableName: "BUDDIZ-Orders",
                    Item: newOrder
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ status: "success", order: newOrder }),
                };
            }

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ status: "failed", details: data }),
            };
        }

    } catch (error) {
        console.error("Error processing PayPal request:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
