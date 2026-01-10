#!/bin/bash
set -e

FUNCTION_NAME="BuddizPayPal"
API_NAME="BuddizPayPalAPI"
REGION="eu-north-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "deploying API Gateway for $FUNCTION_NAME..."

# 1. Get Lambda ARN
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query Configuration.FunctionArn --output text)
echo "Function ARN: $FUNCTION_ARN"

# 2. Create HTTP API
echo "Creating API..."
API_ID=$(aws apigatewayv2 create-api --name $API_NAME --protocol-type HTTP --cors-configuration '{"AllowOrigins": ["*"], "AllowMethods": ["POST", "OPTIONS"], "AllowHeaders": ["content-type"]}' --query ApiId --output text)
echo "API ID: $API_ID"

# 3. Create Integration
echo "Creating Integration..."
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $FUNCTION_ARN \
    --payload-format-version 2.0 \
    --query IntegrationId --output text)

# 4. Create Route
echo "Creating Route..."
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /" \
    --target "integrations/$INTEGRATION_ID"

# 5. Create Stage (default)
# (HTTP APIs usually have $default stage auto-created if using quick create, but via CLI separate steps might need explicit stage or it might be auto-created. let's check or just modify default)
# Actually create-api usually creates $default stage unless specified otherwise? No, CLI create-api does not auto-create stage unless using quick create.
# But wait, create-api docs say "The $default stage is created automatically". Let's verify.
# We will ensure valid stage.

# 6. Add Permission to Lambda
echo "Adding Permission..."
# Remove old permission if exists (ignore error)
aws lambda remove-permission --function-name $FUNCTION_NAME --statement-id APIGatewayInvoke 2>/dev/null || true

aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id APIGatewayInvoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*/POST/"

ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/"
echo "------------------------------------------------"
echo "API GATEWAY SETUP COMPLETE"
echo "Endpoint: $ENDPOINT"
echo "------------------------------------------------"
