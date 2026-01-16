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
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

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
        --environment "Variables={PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET,PAYPAL_MODE=live}"
else
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --environment "Variables={PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET,PAYPAL_MODE=live}"
fi

# 5. Create Function URL (Public)
# 5. Get API Gateway URL
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='BuddizPayPalAPI'].ApiId" --output text)
if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
    API_ENDPOINT=$(aws apigatewayv2 get-api --api-id $API_ID --query ApiEndpoint --output text)
    echo "------------------------------------------------"
    echo "DEPLOYMENT COMPLETE"
    echo "API Gateway URL: $API_ENDPOINT"
    echo "------------------------------------------------"
else
    echo "------------------------------------------------"
    echo "DEPLOYMENT COMPLETE (Code Updated)"
    echo "Warning: API Gateway 'BuddizPayPalAPI' not found."
    echo "------------------------------------------------"
fi
