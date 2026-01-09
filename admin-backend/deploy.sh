#!/bin/bash

# Configuration
FUNCTION_NAME="BuddizAdminDeleteUser"
ROLE_NAME="BuddizAdminDeleteRole"
POLICY_NAME="BuddizAdminDeletePolicy"
REGION="eu-north-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Navigate to script directory
cd "$(dirname "$0")"

echo "Deploying $FUNCTION_NAME..."

# 1. Create Trust Policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create Role (if not exists)
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json || echo "Role exists"

# 3. Create Permission Policy
cat > permission-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminDeleteUser"
            ],
            "Resource": "arn:aws:cognito-idp:$REGION:$ACCOUNT_ID:userpool/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:$REGION:$ACCOUNT_ID:table/BUDDIZ-Users"
        }
    ]
}
EOF

# 4. Attach Policy
aws iam put-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME --policy-document file://permission-policy.json

# 5. Zip Code
# Rename to .mjs for ESM support in Lambda
cp deleteUser.js index.mjs
zip -r function.zip index.mjs

# 6. Create/Update Function
# Sleep to allow role propagation
echo "Waiting for role propagation..."
sleep 5

aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs20.x \
    --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --region $REGION \
    || aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION

# 7. Create Function URL
echo "Creating Function URL..."
aws lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --cors '{"AllowOrigins": ["*"], "AllowMethods": ["POST"]}' \
    || echo "URL config exists"

# 8. Get URL
URL=$(aws lambda get-function-url-config --function-name $FUNCTION_NAME --query FunctionUrl --output text)
echo "Function URL: $URL"

# Cleanup
rm trust-policy.json permission-policy.json function.zip index.mjs
