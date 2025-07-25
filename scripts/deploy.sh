#!/bin/bash

# Big Brain Coding - Static Site Deployment Script
# This script builds and deploys the static site to NGINX

set -e  # Exit on any error

# Configuration
NGINX_DIR="/var/www/bigbraincoding.com/html"
BUILD_DIR="out"
PROJECT_DIR="$(pwd)"

echo "🚀 Big Brain Coding - Static Deployment"
echo "======================================"
echo "📁 NGINX Directory: $NGINX_DIR"
echo "📦 Build Directory: $BUILD_DIR"
echo ""

# Step 1: Install dependencies
echo "🔧 Step 1: Installing dependencies..."
npm install

# Step 2: Build the static site
echo ""
echo "🔨 Step 2: Building static site..."
npm run build

# Step 3: Create backup of current site
echo ""
echo "📋 Step 3: Creating backup of current site..."
BACKUP_DIR="/tmp/bigbraincoding-backup-$(date +%Y%m%d-%H%M%S)"
if [ -d "$NGINX_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$NGINX_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "✅ Backup created at: $BACKUP_DIR"
else
    echo "ℹ️  No existing site to backup"
fi

# Step 4: Deploy to NGINX
echo ""
echo "📤 Step 4: Deploying to NGINX..."

# Create NGINX directory if it doesn't exist
sudo mkdir -p "$NGINX_DIR"

# Copy build files to NGINX directory
echo "📁 Copying build files..."
if [ -d "$BUILD_DIR" ]; then
    sudo cp -r "$BUILD_DIR"/* "$NGINX_DIR/"
    echo "✅ Build files copied successfully"
else
    echo "❌ Error: Build directory '$BUILD_DIR' not found"
    exit 1
fi

# Step 5: Set proper permissions
echo ""
echo "🔐 Step 5: Setting permissions..."
sudo chown -R $USER:$USER "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"
echo "✅ Permissions set"

# Step 6: Verify deployment
echo ""
echo "✅ Step 6: Verifying deployment..."
if [ -f "$NGINX_DIR/index.html" ]; then
    echo "✅ index.html found"
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your site should now be live at: https://bigbraincoding.com"
    echo "📊 Tracking system is active and logging to: ~/bigbraincoding.com/"
else
    echo "❌ Error: index.html not found in NGINX directory"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"