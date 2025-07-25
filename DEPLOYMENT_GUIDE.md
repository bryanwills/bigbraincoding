# Big Brain Coding - Static Site Deployment Guide

## 🎯 **Overview**

This guide explains how to deploy your Next.js website as a static site that works with your existing NGINX setup. No running Node.js processes required!

## 📋 **Prerequisites**

- NGINX configured for `/var/www/bigbraincoding.com/html`
- PHP support enabled in NGINX (for tracking)
- Node.js and npm installed

## 🚀 **Quick Deployment**

### **Option 1: Automated Deployment (Recommended)**

```bash
# Run the deployment script
./scripts/deploy.sh
```

This script will:
1. Install dependencies
2. Build the static site
3. Create a backup of current site
4. Deploy to NGINX directory
5. Set proper permissions
6. Verify deployment

### **Option 2: Manual Deployment**

```bash
# 1. Install dependencies
npm install

# 2. Build static site
npm run build

# 3. Copy to NGINX directory
sudo cp -r out/* /var/www/bigbraincoding.com/html/

# 4. Set permissions
sudo chown -R www-data:www-data /var/www/bigbraincoding.com/html/
sudo chmod -R 755 /var/www/bigbraincoding.com/html/
```

## 🔧 **Configuration Files**

### **Next.js Configuration (`next.config.js`)**
- `output: 'export'` - Enables static export
- `images: { unoptimized: true }` - Required for static export
- `trailingSlash: true` - Ensures proper routing

### **NGINX Configuration**
Make sure your NGINX config includes:

```nginx
server {
    listen 80;
    server_name bigbraincoding.com www.bigbraincoding.com;
    root /var/www/bigbraincoding.com/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Handle tracking API
    location /api/tracking.php {
        try_files $uri =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## 📊 **Tracking System**

### **How It Works**
1. **Client-side tracking** - `public/tracking.js` collects visitor data
2. **PHP handler** - `public/api/tracking.php` receives and logs data
3. **Local storage** - Data saved to `~/bigbraincoding.com/YYYY/MM/DD/`

### **What Gets Tracked**
- ✅ Page views and navigation
- ✅ Click events and interactions
- ✅ Form submissions
- ✅ Scroll depth and engagement
- ✅ Device and browser information
- ✅ Session duration and return visits
- ✅ IP addresses and geolocation
- ✅ Performance metrics

### **Analyzing Data**
```bash
# Basic analysis
node scripts/analyze-tracking.js

# Enhanced analysis with performance metrics
node scripts/enhanced-analysis.js
```

## 🔄 **Update Process**

### **For Regular Updates**
```bash
# 1. Make your changes to the code
# 2. Test locally: npm run dev
# 3. Deploy: ./scripts/deploy.sh
```

### **For Emergency Rollback**
```bash
# Find the latest backup
ls -la /tmp/bigbraincoding-backup-*

# Restore from backup
sudo cp -r /tmp/bigbraincoding-backup-YYYYMMDD-HHMMSS/* /var/www/bigbraincoding.com/html/
```

## 🛠️ **Troubleshooting**

### **Build Issues**
```bash
# Clear Next.js cache
rm -rf .next out
npm run build
```

### **Permission Issues**
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/bigbraincoding.com/html/
sudo chmod -R 755 /var/www/bigbraincoding.com/html/
```

### **Tracking Not Working**
1. Check browser console for errors
2. Verify PHP is enabled in NGINX
3. Check file permissions on tracking directory
4. Test tracking endpoint: `curl -X POST https://bigbraincoding.com/api/tracking.php`

### **NGINX Issues**
```bash
# Test NGINX configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx

# Check NGINX logs
sudo tail -f /var/log/nginx/error.log
```

## 📈 **Performance Benefits**

### **Static Site Advantages**
- ⚡ **Faster loading** - No server-side rendering
- 🔒 **Better security** - No server-side code execution
- 💰 **Lower costs** - No server resources needed
- 📱 **Better caching** - Static files cache better
- 🚀 **CDN ready** - Easy to deploy to CDN

### **Tracking Benefits**
- 📊 **Real-time analytics** - No external dependencies
- 🔒 **Privacy focused** - Data stays on your server
- 💾 **No data limits** - Store as much as you want
- 🎯 **Custom insights** - Track exactly what you need

## 🔮 **Future Enhancements**

### **Possible Additions**
- 📧 **Email reports** - Daily/weekly summaries
- 📊 **Real-time dashboard** - Live analytics interface
- 🎨 **Heat maps** - Click and scroll visualization
- 🔄 **A/B testing** - Track different page versions
- 📱 **Mobile app** - Analytics on the go

## 📞 **Support**

If you encounter issues:
1. Check the NGINX error logs
2. Verify file permissions
3. Test the tracking endpoint manually
4. Review the deployment script output

## 🎉 **Success Indicators**

After deployment, you should see:
- ✅ Site loads at `https://bigbraincoding.com`
- ✅ All pages work without 404s
- ✅ Tracking data appears in `~/bigbraincoding.com/`
- ✅ No console errors in browser
- ✅ Fast page load times

---

**Happy deploying! 🚀**