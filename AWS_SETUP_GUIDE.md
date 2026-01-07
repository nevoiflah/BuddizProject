# AWS Setup Guide for Buddiz

To create the "buckets" for your website (one for storing images and one for hosting the site itself), we use the **AWS Amplify CLI**.

## 1. Prerequisites
Ensure you have the CLI installed and configured:
```bash
npm install -g @aws-amplify/cli
amplify configure
```

## 2. Initialize the Project
If you haven't already:
```bash
amplify init
```
*Follow the prompts (Project name: buddiz, Environment: dev, Editor: Visual Studio Code, etc.)*

## 3. Create a Bucket for Storage (Images/Uploads)
This bucket is for storing product images or user profile pictures.

1. Run the command:
   ```bash
   amplify add storage
   ```
2. Select **Content (Images, audio, video, etc.)**.
3. Give it a friendly name (e.g., `buddizImages`).
4. Provide a bucket name (must be globally unique).
5. Who should have access?
   - **Auth/Guest users**: Select `Auth and guest users` so everyone can view beer images, but only admin/users can upload (you can refine permissions later).

## 4. Create a Bucket for Hosting (The Website)
This bucket acts as the web server for your React app.

1. Run the command:
   ```bash
   amplify add hosting
   ```
2. Select **Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)** - *Recommended for easiest setup*.
   - OR select **Amazon CloudFront and S3** for a purely manual bucket approach.

3. Run publish to deploy:
   ```bash
   amplify publish
   ```

## 5. Verify
- Go to the **AWS Console** -> **S3** to see your new buckets.
- Go to **AWS Console** -> **Amplify** to see your deployment.
