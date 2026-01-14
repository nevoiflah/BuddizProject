#!/bin/bash

# Configuration
REGION="eu-north-1"
TABLE_NAME="BUDDIZ-Users"

echo "Fetching users from DynamoDB..."
# Scan the table to get all users and their roles
USERS_JSON=$(aws dynamodb scan --table-name $TABLE_NAME \
    --projection-expression "email, #r" \
    --expression-attribute-names '{"#r": "role"}' \
    --region $REGION --output json)

echo "Processing users..."

# Iterate through items using jq (assuming jq is installed, if not we'll use simple grep/awk fallback or node script might be better, but let's try bash with simple parsing or node)
# Actually, a node script is much safer/easier given the json output. Let's make this a node script wrapped in bash or just a node script.
# Sticking to bash as requested but using node for parsing to be robust.

cat <<EOF > verify_users.js
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { SESClient, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");

const client = new DynamoDBClient({ region: "$REGION" });
const ses = new SESClient({ region: "$REGION" });

async function run() {
    console.log("Scanning table $TABLE_NAME...");
    const data = await client.send(new ScanCommand({ TableName: "$TABLE_NAME" }));
    const users = data.Items; /* Attributes are { email: { S: '...' }, role: { S: '...' } } */

    for (const user of users) {
        const email = user.email.S;
        const role = user.role ? user.role.S : 'USER';
        
        console.log(\`Verifying \${email} (\${role})...\`);
        try {
            await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
            console.log(\`✅ Verification request sent to \${email}\`);
        } catch (err) {
            console.error(\`❌ Failed to verify \${email}: \${err.message}\`);
        }
    }
}

run();
EOF

echo "Installing temporary dependencies for checking..."
npm install @aws-sdk/client-dynamodb @aws-sdk/client-ses --no-save > /dev/null 2>&1

echo "Running verification script..."
node verify_users.js

rm verify_users.js
echo "Done! Please check your inboxes (including Spam) to confirm verification."
