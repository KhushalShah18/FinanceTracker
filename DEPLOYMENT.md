# FinTrack Deployment Instructions for Azure

This document provides instructions for deploying the FinTrack finance tracking application to Azure Web App Service with Azure PostgreSQL.

## Prerequisites

1. An Azure account with an active subscription
2. Azure CLI installed (optional, but helpful)
3. Git installed on your local machine
4. Node.js installed on your local machine

## Step 1: Create an Azure Database for PostgreSQL

1. **Sign in to the Azure Portal**:
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Create a PostgreSQL flexible server**:
   - Click "Create a resource"
   - Search for "Azure Database for PostgreSQL" and select it
   - Choose "Flexible server" deployment option and click "Create"
   - Fill in the server details:
     - **Server name**: Choose a unique name (e.g., `fintrack-postgres`)
     - **Region**: Select the closest region to your users
     - **Version**: Choose PostgreSQL 14 (or latest available)
     - **Admin username**: Create a username (e.g., `postgres`)
     - **Password**: Create a strong password and save it securely
   - Click "Next: Networking"
   - Configure Networking:
     - **Connectivity method**: Select "Public access"
     - **Allow public access from any Azure service...**: Yes
     - Add your client IP address if you need to connect from your local machine
   - Click "Review + create" and then "Create"

3. **Create a database**:
   - Once the PostgreSQL server is deployed, navigate to it
   - Select "Databases" from the left menu
   - Click "Add" to create a new database
   - Name it `fintrack` and click "Save"

4. **Get the connection string**:
   - On your PostgreSQL server resource, go to "Connection strings"
   - Note down the PostgreSQL connection string
   - It will look like: `postgres://username:password@server-name.postgres.database.azure.com/fintrack?sslmode=require`

## Step 2: Create an Azure Web App

1. **Create a Web App**:
   - In the Azure Portal, click "Create a resource"
   - Search for "Web App" and select it
   - Click "Create"
   - Configure the Web App:
     - **Subscription**: Select your subscription
     - **Resource Group**: Use the same resource group as your PostgreSQL server
     - **Name**: Choose a unique name (e.g., `fintrack-app`)
     - **Publish**: Code
     - **Runtime stack**: Node 18 LTS (or latest LTS)
     - **Operating System**: Linux
     - **Region**: Same region as your PostgreSQL server
   - Click "Next: Deployment" and enable "Local Git" deployment option
   - Click "Review + create" and then "Create"

2. **Configure environment variables**:
   - Once the Web App is deployed, navigate to it
   - Go to "Configuration" in the left menu
   - Add the following Application settings:
     - **DATABASE_URL**: Your PostgreSQL connection string
     - **SESSION_SECRET**: A long random string for session encryption
     - **NODE_ENV**: `production`
   - Click "Save"

## Step 3: Configure Local Git Deployment

1. **Set up deployment credentials**:
   - In your Web App, go to "Deployment Center"
   - Choose "Local Git" as the source
   - Click "Save"
   - Configure deployment credentials if prompted:
     - Create a username and password for Git deployments

2. **Get Git repository URL**:
   - In the "Deployment Center", you should see the Git repository URL
   - Note this URL as you'll use it to push your code

## Step 4: Prepare Your Application for Deployment

1. **Configure your local Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Add Azure as a remote**:
   ```bash
   git remote add azure <your-azure-git-repo-url>
   ```

3. **Push your code to Azure**:
   ```bash
   git push azure main
   ```
   - You'll be prompted for the deployment credentials you created earlier
   - The deployment process will start automatically

## Step 5: Initialize the Database

The first deployment will automatically run your database migrations using the `drizzle-kit push` command that is configured in the package.json scripts.

## Step 6: Verify Your Deployment

1. Open your web app URL (e.g., `https://fintrack-app.azurewebsites.net`)
2. The application should be running and you should be able to:
   - Register an account
   - Log in
   - Add and manage financial transactions

## Troubleshooting

If you encounter issues:

1. **Check application logs**:
   - In your Web App resource, go to "App Service logs" and enable them
   - Then go to "Log stream" to see real-time logs

2. **Check deployment logs**:
   - In "Deployment Center", check the deployment history for errors

3. **Verify environment variables**:
   - Ensure all required environment variables are set correctly
   - Check for typos in the connection string

4. **Database connectivity**:
   - Ensure your Web App can connect to the PostgreSQL database
   - Check if the PostgreSQL server's firewall allows connections from Azure services

## Making Updates

To update your application:

1. Make your changes locally
2. Commit them: `git commit -am "Update description"`
3. Push to Azure: `git push azure main`

The deployment will be triggered automatically.
