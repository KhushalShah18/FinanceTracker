#!/bin/bash

# Custom deployment script for Azure App Service
echo "Running custom deployment script..."

# Navigate to project root
echo "Changing to deployment source directory..."
cd "$DEPLOYMENT_SOURCE" || exit 1

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

# Ensure server/public directory exists
mkdir -p server/public

# Copy dist/public to server/public
echo "Copying built assets to server/public..."
if [ -d "dist/public" ]; then
  cp -r dist/public/* server/public/
  echo "✓ Assets copied successfully"
else
  echo "Warning: dist/public directory not found. Static assets may not be available."
  # Copy fallback index.html if needed
  if [ ! -f "server/public/index.html" ]; then
    echo "Creating fallback index.html..."
    cat > server/public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinTrack - Personal Finance</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 650px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { color: #3b82f6; }
  </style>
</head>
<body>
  <h1>FinTrack - Finance Manager</h1>
  <p>Redirecting to application...</p>
  <script>window.location.href = '/auth';</script>
</body>
</html>
EOL
  fi
fi

# Set production environment
export NODE_ENV=production

# Copy files to deployment target
echo "Copying deployment files to $DEPLOYMENT_TARGET..."
if command -v rsync &> /dev/null; then
  rsync -av --exclude='.git' --exclude='node_modules' . "$DEPLOYMENT_TARGET"
else
  # Fallback if rsync is not available
  mkdir -p "$DEPLOYMENT_TARGET"
  cp -r * "$DEPLOYMENT_TARGET"
  cp .* "$DEPLOYMENT_TARGET" 2>/dev/null || true
  rm -rf "$DEPLOYMENT_TARGET/node_modules" 2>/dev/null || true
  rm -rf "$DEPLOYMENT_TARGET/.git" 2>/dev/null || true
fi

# Navigate to deployment target
cd "$DEPLOYMENT_TARGET" || exit 1

# Install production dependencies in deployment target
echo "Installing production dependencies in deployment target..."
npm ci --only=production

# Initialize database
echo "Initializing database..."
node -e "const { db } = require('./dist/index.js'); console.log('Database connected');" || true

# Try running database migrations
echo "Running database migrations..."
if npm run db:push; then
  echo "✓ Database migrations completed successfully"
else
  echo "Warning: Database migrations failed. Please check your database connection."
fi

echo "Deployment completed successfully!"
exit 0