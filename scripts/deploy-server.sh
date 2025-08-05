#!/bin/bash

# Big Brain Coding - Server-Side Deployment Script
# This script builds and deploys the Next.js application with server-side functionality
# for analytics features that require API routes and dynamic data processing

set -e  # Exit on any error

# Configuration
PROJECT_DIR="$(pwd)"
BUILD_DIR=".next"
DEPLOY_DIR="/var/www/bigbraincoding.com/html"
PORT=3000

echo "🚀 Big Brain Coding - Server-Side Deployment"
echo "==========================================="
echo "📁 Project Directory: $PROJECT_DIR"
echo "📦 Build Directory: $BUILD_DIR"
echo "🌐 Deploy Directory: $DEPLOY_DIR"
echo "🔌 Port: $PORT"
echo ""

# Step 1: Install dependencies
echo "🔧 Step 1: Installing dependencies..."
npm install

# Step 2: Build the Next.js application
echo ""
echo "🔨 Step 2: Building Next.js application..."
npm run build

# Step 3: Create backup of current deployment
echo ""
echo "📋 Step 3: Creating backup of current deployment..."
BACKUP_DIR="/tmp/bigbraincoding-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_ARCHIVE="$BACKUP_DIR.tar.bz2"
if [ -d "$DEPLOY_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "📦 Compressing backup to save disk space..."
    tar -cjf "$BACKUP_ARCHIVE" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
    rm -rf "$BACKUP_DIR"
    echo "✅ Compressed backup created at: $BACKUP_ARCHIVE"
else
    echo "ℹ️  No existing deployment to backup"
fi

# Step 4: Deploy application files
echo ""
echo "📤 Step 4: Deploying application files..."

# Create deploy directory if it doesn't exist
sudo mkdir -p "$DEPLOY_DIR"

# Copy necessary files for server-side deployment
echo "📁 Copying application files..."
sudo cp -r "$BUILD_DIR" "$DEPLOY_DIR/"
sudo cp package.json "$DEPLOY_DIR/"
sudo cp package-lock.json "$DEPLOY_DIR/"
sudo cp next.config.js "$DEPLOY_DIR/"
sudo cp -r public "$DEPLOY_DIR/"
sudo cp -r src "$DEPLOY_DIR/"

# Step 5: Set proper permissions
echo ""
echo "🔐 Step 5: Setting permissions..."
sudo chown -R $USER:$USER "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
echo "✅ Permissions set"

# Step 6: Install production dependencies in deploy directory
echo ""
echo "📦 Step 6: Installing production dependencies..."
cd "$DEPLOY_DIR"
npm ci --only=production
cd "$PROJECT_DIR"

# Step 7: Create PM2 ecosystem file for process management
echo ""
echo "⚙️  Step 7: Setting up process management..."
cat > "$DEPLOY_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'bigbraincoding',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$DEPLOY_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    }
  }]
}
EOF

# Step 8: Stop existing PM2 process if running
echo ""
echo "🛑 Step 8: Managing PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 stop bigbraincoding 2>/dev/null || true
    pm2 delete bigbraincoding 2>/dev/null || true
    echo "✅ Stopped existing PM2 process"
else
    echo "ℹ️  PM2 not found, installing..."
    npm install -g pm2
fi

# Step 9: Start the application with PM2
echo ""
echo "🚀 Step 9: Starting application with PM2..."
cd "$DEPLOY_DIR"
pm2 start ecosystem.config.js
pm2 save
cd "$PROJECT_DIR"

# Step 10: Configure nginx to proxy to the Node.js application
echo ""
echo "🌐 Step 10: Configuring nginx proxy..."
NGINX_CONFIG="/etc/nginx/sites-available/bigbraincoding.com"
sudo tee "$NGINX_CONFIG" > /dev/null << EOF
server {
    listen 80;
    server_name bigbraincoding.com www.bigbraincoding.com;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site and restart nginx
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Step 11: Verify deployment
echo ""
echo "✅ Step 11: Verifying deployment..."
sleep 5  # Give the application time to start

if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    echo "✅ Application is running on port $PORT"
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your site should now be live at: https://bigbraincoding.com"
    echo "📊 Analytics features are now active!"
    echo "🔧 PM2 process: bigbraincoding"
    echo "📈 Monitor with: pm2 monit"
else
    echo "❌ Error: Application is not responding on port $PORT"
    echo "🔍 Check logs with: pm2 logs bigbraincoding"
    exit 1
fi

echo ""
echo "🎉 Server-side deployment complete!"
echo ""
echo "📋 Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs bigbraincoding - View application logs"
echo "  pm2 restart bigbraincoding - Restart application"
echo "  pm2 monit          - Monitor all processes"