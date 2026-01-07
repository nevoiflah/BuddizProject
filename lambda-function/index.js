const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    try {
        if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
            const { userAttributes } = event.request;
            const email = userAttributes.email;
            const username = event.userName;

            // Default name if not provided (Cognito standard attributes)
            const name = userAttributes.name || userAttributes.given_name || username;

            const newUser = {
                id: email, // Key matches our existing schema
                email: email,
                username: username,
                name: name,
                role: 'USER',
                loyaltyPoints: 0,
                createdAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({
                TableName: "BUDDIZ-Users",
                Item: newUser
            }));

            console.log("Successfully created user profile in DynamoDB for:", email);
        }
    } catch (err) {
        console.error("Error creating user profile:", err);
        // Don't throw error to Cognito, or it might block the sign-up success? 
        // Actually, for PostConfirmation, throwing an error usually doesn't stop the flow but logs it.
        // Better to log and allow flow to proceed, or throw to retry? 
        // We'll log it.
        throw err;
    }

    return event;
};
