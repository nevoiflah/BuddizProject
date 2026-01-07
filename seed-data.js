import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const BEERS = [
    { id: '1', name: 'Golden Retriever Ale', style: 'Golden Ale', abv: '5.2%', price: 6.50, description: 'Smooth, friendly, and reliable.', stock: 100 },
    { id: '2', name: 'Barking Stout', style: 'Stout', abv: '7.0%', price: 7.50, description: 'Dark, bold, and full of character.', stock: 100 },
    { id: '3', name: 'Hoppy Hound IPA', style: 'IPA', abv: '6.8%', price: 7.00, description: 'Citrusy with a bite.', stock: 100 },
    { id: '4', name: 'Pug Porter', style: 'Porter', abv: '5.8%', price: 6.80, description: 'Small package, big flavor.', stock: 100 },
    { id: '5', name: 'Husky Lager', style: 'Lager', abv: '4.8%', price: 5.50, description: 'Crisp and refreshing for cold days.', stock: 100 },
    { id: '6', name: 'Bulldog Bitter', style: 'Bitter', abv: '4.5%', price: 6.00, description: 'Traditional and sturdy.', stock: 100 },
];

const ADMIN_USER = {
    id: 'nevo.iflah6@gmail.com', // Using email as ID for simplicity in manual setup, or could use Cognito Sub if known.
    username: 'NevoIflah',
    email: 'nevo.iflah6@gmail.com',
    role: 'ADMIN',
    loyaltyPoints: 9999
};

async function seed() {
    console.log("Seeding Beers...");
    for (const beer of BEERS) {
        try {
            await ddbDocClient.send(new PutCommand({
                TableName: "BUDDIZ-Beers",
                Item: beer
            }));
            console.log(`Added ${beer.name}`);
        } catch (err) {
            console.error(`Error adding ${beer.name}:`, err);
        }
    }

    console.log("Seeding Admin User...");
    try {
        await ddbDocClient.send(new PutCommand({
            TableName: "BUDDIZ-Users",
            Item: ADMIN_USER
        }));
        console.log("Added Admin User");
    } catch (err) {
        console.error("Error adding admin user:", err);
    }
}

seed();
