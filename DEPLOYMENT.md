# Deployment Guide for FinTrack

This guide provides step-by-step instructions for deploying the FinTrack application to Azure App Service using PostgreSQL.

## Prerequisites

1. **Azure Account** - You need an active Azure subscription.
2. **Azure CLI** - Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) on your local machine.
3. **Git** - Make sure Git is installed on your development machine.
4. **Node.js** - Version 18+ is required.

## Step 1: Set Up Azure PostgreSQL Database

1. Log in to the Azure Portal: https://portal.azure.com
2. Create a new Azure Database for PostgreSQL:
   - Click "Create a resource"
   - Search for "Azure Database for PostgreSQL"
   - Select "Azure Database for PostgreSQL Flexible Server"
   - Click "Create"

3. Fill in the required details:
   - **Server name**: Choose a unique name (e.g., `fintrack-db`)
   - **Region**: Choose a region close to your users
   - **Admin username**: Create an admin username
   - **Password**: Create a secure password
   - **Version**: Choose PostgreSQL 15 or higher

4. Under "Networking", enable "Allow public access from any Azure service and resources within Azure"
5. Click "Review + create", then "Create"

6. Once the database is created, you'll need to create a database:
   - Go to your PostgreSQL server
   - Click on "Databases" in the left sidebar
   - Click "Add"
   - Enter a name for your database (e.g., `fintrack`)
   - Click "Save"

## Step 2: Set Up Azure App Service

1. In the Azure Portal, create a new App Service:
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"

2. Fill in the required details:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Use the same resource group as your database
   - **Name**: Choose a unique name (e.g., `fintrack-app`)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Same as your database
   - **App Service Plan**: Create a new plan or use an existing one
   - **Pricing Plan**: Choose an appropriate plan (B1 is a good starting point)

3. Click "Review + create", then "Create"

## Step 3: Configure Deployment Settings

1. Go to your App Service:
   - Click on "Deployment Center" in the left sidebar
   - Select "Local Git" as the source
   - Click "Save"

2. Note the Git clone URL provided, it should look like: 
   `https://<username>@<app-name>.scm.azurewebsites.net/<app-name>.git`

3. Configure deployment credentials:
   - Click on "Deployment Credentials" in the left sidebar
   - Choose "User Credentials"
   - Set a username and password to use for deployments
   - Click "Save"

## Step 4: Configure Environment Variables

1. In your App Service, go to "Configuration":
   - Click on "Application settings" tab
   - Click "New application setting" to add each of the following:

   ```
   DATABASE_URL=postgres://<username>:<password>@<server-name>.postgres.database.azure.com:5432/<database-name>?sslmode=require
   NODE_ENV=production
   SESSION_SECRET=<generate-a-long-random-string>
   ```

   Replace `<username>`, `<password>`, `<server-name>`, and `<database-name>` with your actual database credentials.
   
   **Important**: Ensure the hostname uses periods instead of slashes (e.g., `fintrack-db.postgres.database.azure.com`)

2. Click "Save" to apply the settings.

## Step 5: Prepare Application for Deployment

1. In your local development environment, prepare your application:

   ```bash
   # Build the frontend assets
   npm run build
   
   # Run the deploy script to copy the built assets to the server/public directory
   node scripts/deploy.js
   ```

2. The deploy script will copy the built frontend files to the `server/public` directory, which will be served by the Express server in production.

## Step 6: Deploy to Azure

1. Set up your local Git repository (if you haven't already):

   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. Add Azure as a remote repository:

   ```bash
   git remote add azure <git-clone-url-from-step-3>
   ```

3. Push to Azure:

   ```bash
   git push azure main
   ```

   This will upload your code to Azure and trigger the deployment process.

## Step 7: Verify Deployment

1. Once the deployment is complete, visit your application URL: `https://<app-name>.azurewebsites.net`

2. If you encounter any issues, check the logs in the Azure portal:
   - Go to your App Service
   - Click "Log stream" in the left sidebar to see real-time logs
   - Or click "Advanced Tools" (Kudu) for more detailed diagnostics

## Additional Configuration for Production

### Configure SSL/TLS

By default, Azure App Service provides an HTTPS endpoint with a `*.azurewebsites.net` certificate. If you're using a custom domain:

1. Go to your App Service
2. Click "Custom domains" in the left sidebar
3. Click "Add binding" to add your custom domain
4. Set up TLS/SSL binding for your custom domain

### Set Up Continuous Deployment (Optional)

For continuous deployment from GitHub or Azure DevOps:

1. Go to your App Service
2. Click "Deployment Center" in the left sidebar
3. Select your source (GitHub, Azure DevOps, etc.)
4. Follow the prompts to connect your repository

### Monitoring and Scaling

1. Set up monitoring:
   - Go to your App Service
   - Click "Application Insights" to enable detailed monitoring

2. Configure scaling:
   - Click "Scale up" to choose a different pricing tier
   - Click "Scale out" to configure autoscaling rules

## Troubleshooting

### Database Connection Issues

- Make sure the `DATABASE_URL` format is correct with the proper hostname format
- Ensure your database's firewall rules allow Azure services to access it
- Check the database connection string is properly formatted with the right credentials

### Application Not Starting

- Check the logs in the Azure portal using "Log stream"
- Verify that the `NODE_ENV` is set to "production"
- Make sure all required environment variables are set correctly

### Static Files Not Being Served

- Ensure the build process completed successfully
- Verify that the deploy script copied the files to the `server/public` directory
- Check if the web.config file is correctly set up to handle Node.js applications

## Support

If you encounter any issues not covered in this guide, please contact our support team or create an issue in the project repository.