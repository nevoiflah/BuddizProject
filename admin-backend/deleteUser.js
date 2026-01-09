import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const cognito = new CognitoIdentityProviderClient({ region: "eu-north-1" });
const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(dynamo);

const USER_POOL_ID = "eu-north-1_22Rg2ivGc";
const TABLE_NAME = "BUDDIZ-Users";

export const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

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
