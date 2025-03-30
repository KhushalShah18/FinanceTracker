#!/bin/bash

# Custom deployment script for Azure App Service
echo "Running custom deployment script..."

# Navigate to project root
echo "Changing to repo root directory..."
cd "$DEPLOYMENT_SOURCE" || exit 1

# Make scripts executable
chmod +x scripts/*.js

# Update package.json with Azure deployment scripts
echo "Adding Azure deployment scripts to package.json..."
node scripts/update-package.js

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

# Run the deploy script to copy frontend assets to server/public
echo "Copying built assets to server/public..."
node scripts/deploy.js

# Sync files to deployment directory
echo "Copying deployment files to $DEPLOYMENT_TARGET..."
rsync -av --exclude='.git' --exclude='node_modules' . "$DEPLOYMENT_TARGET"

# Navigate to deployment target
cd "$DEPLOYMENT_TARGET" || exit 1

# Install production dependencies in deployment target
echo "Installing production dependencies in deployment target..."
npm ci --only=production

# Run database migrations
echo "Running database migrations..."
npm run db:push

echo "Deployment completed successfully!"
exit 0