#!/bin/bash

# Big Brain Coding - Simple Server-Side Deployment
# This script starts the Next.js application with PM2 for analytics features

set -e  # Exit on any error

# Configuration
PROJECT_DIR="$(pwd)"
PORT=3000

echo "🚀 Big Brain Coding - Simple Server Deployment"
echo "============================================="
echo "📁 Project Directory: $PROJECT_DIR"
echo "🔌 Port: $PORT"
echo ""

# Step 1: Build the application
echo "🔨 Step 1: Building Next.js application..."
npm run build

# Step 2: Stop existing PM2 process if running
echo ""
echo "🛑 Step 2: Managing PM2 processes..."
pm2 stop bigbraincoding 2>/dev/null || true
pm2 delete bigbraincoding 2>/dev/null || true
echo "✅ Stopped existing PM2 process"

# Step 3: Start the application with PM2
echo ""
echo "🚀 Step 3: Starting application with PM2..."
pm2 start "npm start" --name bigbraincoding --cwd "$PROJECT_DIR"
pm2 save

# Step 4: Configure nginx to proxy to the Node.js application
echo ""
echo "🌐 Step 4: Configuring nginx proxy..."
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

# Step 5: Verify deployment
echo ""
echo "✅ Step 5: Verifying deployment..."
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