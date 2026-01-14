import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, TransactWriteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: "eu-north-1" });

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

const SENDER_EMAIL = "nevo.iflah6@gmail.com"; // Admin email verified as sender

async function sendEmail(to, subject, body) {
    try {
        const command = new SendEmailCommand({
            Source: SENDER_EMAIL,
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: { Data: subject },
                Body: { Text: { Data: body } }
            }
        });
        await sesClient.send(command);
        console.log(`Email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: error.message };
    }
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

        if (action === "verifyUserIdentity") {
            const { email } = body;
            try {
                await sesClient.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ status: "verification_sent" }),
                };
            } catch (err) {
                console.error("Verification Error:", err);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: err.message }),
                };
            }
        }

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
                    intent: "AUTHORIZE",
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

        if (action === "createPendingOrder") {
            const { orderID, cart, userEmail } = body; // Removed authorizationID from input
            const accessToken = await getAccessToken();

            // 1. Authorize the Order with PayPal
            const authResponse = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/authorize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            const authData = await authResponse.json();

            if (authData.status !== "COMPLETED") {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ status: "failed", details: authData }),
                };
            }

            const authorizationID = authData.purchase_units[0].payments.authorizations[0].id;

            // 2. Calculate Total (Security check)
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5;

            // 3. Create Order in DB with PENDING status
            const newOrder = {
                id: orderID,
                userId: userEmail,
                items: cart,
                total: total.toFixed(2),
                status: 'PENDING_APPROVAL',
                createdAt: new Date().toISOString(),
                paypalOrderId: orderID,
                authorizationId: authorizationID,
                currency: "ILS"
            };

            await docClient.send(new PutCommand({
                TableName: "BUDDIZ-Orders",
                Item: newOrder
            }));

            // 4. Send Emails
            // Notify User
            await sendEmail(
                userEmail,
                "Order Received - Waiting for Approval",
                `Hello! Thank you for your order (${orderID}).\n\nYour payment has been authorized but not charged yet. We will review your order and notify you once it is approved.\n\nTotal: ₪${total.toFixed(2)}`
            );

            // Notify Admin
            await sendEmail(
                SENDER_EMAIL,
                "New Order Pending Approval",
                `New order received from ${userEmail}.\nOrder ID: ${orderID}\nTotal: ₪${total.toFixed(2)}\n\nPlease logs in to the Admin Dashboard to approve or deny.`
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: "success", order: newOrder }),
            };
        }

        if (action === "approveOrder") {
            const { orderID, userId, paypalOrderId, authorizationId } = body;
            const accessToken = await getAccessToken();

            // 1. Capture the Authorization
            let data;
            try {
                const response = await fetch(`${BASE_URL}/v2/payments/authorizations/${authorizationId}/capture`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ final_capture: true })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (errorText.includes("AUTHORIZATION_ALREADY_CAPTURED")) {
                        console.log("Authorization already captured. Proceeding to DB update.");
                        data = { status: "COMPLETED" };
                    } else {
                        throw new Error(`PayPal Capture Failed: ${response.status} ${errorText}`);
                    }
                } else {
                    data = await response.json();
                }
            } catch (err) {
                console.error("Capture Error:", err);
                throw err;
            }

            if (data.status === "COMPLETED") {
                // 2. Fetch Order
                const orderData = await docClient.send(new GetCommand({
                    TableName: "BUDDIZ-Orders",
                    Key: { id: orderID, userId: userId }
                }));

                if (!orderData.Item) {
                    throw new Error(`Order ${orderID} not found in DB`);
                }
                const order = orderData.Item;

                // 3. Atomic Transaction
                const transactItems = [];

                order.items.forEach(item => {
                    transactItems.push({
                        Update: {
                            TableName: "BUDDIZ-Beers",
                            Key: { id: item.id },
                            UpdateExpression: "set stock = stock - :qty",
                            ConditionExpression: "stock >= :qty",
                            ExpressionAttributeValues: { ":qty": item.quantity }
                        }
                    });
                });

                transactItems.push({
                    Update: {
                        TableName: "BUDDIZ-Orders",
                        Key: { id: orderID, userId: userId },
                        UpdateExpression: "set #s = :status",
                        ExpressionAttributeNames: { "#s": "status" },
                        ExpressionAttributeValues: { ":status": "Paid" }
                    }
                });

                try {
                    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
                } catch (dbErr) {
                    const failReason = dbErr.CancellationReasons ? JSON.stringify(dbErr.CancellationReasons) : dbErr.message;
                    throw new Error(`DB Transaction Failed: ${failReason}`);
                }

                // 4. Send Email
                await sendEmail(
                    order.userId,
                    "Order Approved!",
                    `Great news! Your order (${order.id}) has been approved and payment captured.\n\nThank you for shopping with Buddiz!`
                );

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ status: "success" }),
                };
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ status: "failed", details: data }),
                };
            }
        }

        if (action === "denyOrder") {
            const { orderID, userId, authorizationId } = body;
            const accessToken = await getAccessToken();

            // 1. Void the Authorization
            await fetch(`${BASE_URL}/v2/payments/authorizations/${authorizationId}/void`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            // 2. Update DB Status
            await docClient.send(new UpdateCommand({
                TableName: "BUDDIZ-Orders",
                Key: { id: orderID, userId: userId },
                UpdateExpression: "set #s = :status",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: { ":status": "Denied" }
            }));

            // 3. Send Email
            await sendEmail(
                userId,
                "Order Declined",
                `We regret to inform you that your order (${orderID}) has been declined. You have not been charged.`
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: "success" }),
            };
        }

    } catch (error) {
        console.error("Error processing PayPal request:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            }),
        };
    }
};
