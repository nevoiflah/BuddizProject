#!/bin/bash

# Configuration
FUNCTION_NAME="BuddizPayPal"
ROLE_NAME="BuddizPayPalRole"
REGION="eu-north-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# PayPal Credentials (Loaded from .env in parent directory)
if [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Fallback/Check
if [ -z "$VITE_PAYPAL_CLIENT_ID" ] || [ -z "$PAYPAL_CLIENT_SECRET" ]; then
    echo "Error: PayPal credentials not found. Please check ../.env"
    exit 1
fi

PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID


# 1. Create IAM Role if not exists
echo "Creating IAM Role..."
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
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
}' || true

# 2. Attach Policies (Basic Execution + DynamoDB Full Access for simplicity)
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

echo "Waiting for role propagation..."
sleep 10

# 3. Zip the code
echo "Zipping code..."
zip -r function.zip index.mjs

# 4. Create or Update Function
echo "Deploying Lambda..."
if aws lambda get-function --function-name $FUNCTION_NAME > /dev/null 2>&1; then
    aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://function.zip
    aws lambda update-function-configuration --function-name $FUNCTION_NAME \
        --environment "Variables={PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET,PAYPAL_MODE=sandbox}"
else
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --environment "Variables={PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET,PAYPAL_MODE=sandbox}"
fi

# 5. Create Function URL (Public)
echo "Configuring Function URL..."
aws lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --cors '{"AllowOrigins": ["*"], "AllowMethods": ["POST"], "AllowHeaders": ["Content-Type"]}' || true

# 6. Public Permission (Critical for Function URL)
echo "Adding permission for public access..."
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE || true

# 7. Get URL
FUNC_URL=$(aws lambda get-function-url-config --function-name $FUNCTION_NAME --query FunctionUrl --output text)
echo "------------------------------------------------"
echo "DEPLOYMENT COMPLETE"
echo "Lambda URL: $FUNC_URL"
echo "------------------------------------------------"
