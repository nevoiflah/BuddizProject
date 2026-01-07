# Buddiz Project

## Overview

Buddiz is a modern, single-page web application (SPA) designed for browsing and ordering beverages. It features a responsive user interface, secure user authentication, and real-time data integration with AWS cloud services. The application provides a seamless experience for users to manage their profiles, view product catalogs, maintain a shopping cart, and track favorites.

## Architecture and Technology Stack

The project relies on a serverless architecture leveraging Amazon Web Services (AWS) for backend operations and a React-based frontend.

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router
- **State Management**: React Context API
- **Styling**: CSS Modules / Vanilla CSS
- **Icons**: Lucide React

### Backend and Cloud Infrastructure (AWS)
- **Authentication**: AWS Cognito (User Pools & Identity Pools)
- **Database**: AWS DynamoDB (NoSQL)
- **Functions**: AWS Lambda (serverless compute for backend triggers)
- **Storage**: AWS S3 (Static asset hosting)
- **Content Delivery**: AWS CloudFront (CDN)
- **SDK**: AWS SDK for JavaScript (v3)

## Key Features

1.  **User Authentication**
    - Secure registration and login flows using AWS Cognito.
    - Automated user profile creation via AWS Lambda triggers upon email confirmation.
    - Role-based access control (User vs. Admin).

2.  **Product Catalogue**
    - Dynamic retrieval of product data (beers) from DynamoDB.
    - Real-time inventory and pricing display.

3.  **Shopping Cart and Favorites**
    - Persistent shopping cart state.
    - Server-side synchronization of user favorites using DynamoDB (`BUDDIZ-UserFavorites`), allowing persistence across devices.

4.  **Admin Dashboard**
    - Dedicated interface for administrators to view analytics and user data.
    - Protected routes ensuring only authorized personnel can access sensitive information.

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- AWS CLI configured with appropriate credentials

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/nevoiflah/BuddizProject.git
    cd BuddizProject
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Ensure AWS credentials are set up in your environment or AWS CLI to allow the AWS SDK to access DynamoDB and Cognito resources.

4.  **Run the application**
    ```bash
    npm run dev
    ```

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be generated in the `dist` directory, ready for deployment to AWS S3 or any static hosting provider.

## Deployment

The application is configured for deployment via AWS S3 and CloudFront.

1.  **Build the project**
    ```bash
    npm run build
    ```

2.  **Sync to S3**
    ```bash
    aws s3 sync dist s3://<your-bucket-name>
    ```

3.  **Invalidate CloudFront Cache**
    ```bash
    aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"
    ```

## License

This project is proprietary and confidential. Unauthorized copying or distribution of these files is strictly prohibited.
