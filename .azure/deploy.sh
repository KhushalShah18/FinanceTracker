#!/bin/bash

# ----------------------
# Custom Deployment Script
# ----------------------

# Fail on any error
set -e

# ----------------------
# Print node/npm version
# ----------------------
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# ----------------------
# Install dependencies
# ----------------------
echo "Installing dependencies..."
npm install --production=false

# ----------------------
# Build the application
# ----------------------
echo "Building the application..."
npm run build

# ----------------------
# Run database migrations
# ----------------------
echo "Running database migrations..."
npm run db:push

echo "Deployment complete!"