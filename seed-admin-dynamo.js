import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

const adminUser = {
    id: "c01c697c-20a1-709e-5eec-5b05ea616be6", // Copied from 'sub' in admin-create-user output
    username: "nevo.iflah6@gmail.com",
    name: "Nevo Iflah",
    email: "nevo.iflah6@gmail.com",
    isAdmin: true,
    loyaltyPoints: 1000
};

const seedAdmin = async () => {
    try {
        await docClient.send(new PutCommand({
            TableName: "BUDDIZ-Users",
            Item: adminUser
        }));
        console.log("Admin user seeded to DynamoDB successfully.");
    } catch (err) {
        console.error("Error seeding admin:", err);
    }
};

seedAdmin();
