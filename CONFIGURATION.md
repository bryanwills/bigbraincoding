# Analytics Configuration Guide

This document explains how to configure the analytics system for different environments and users.

## Environment Variables

The analytics system can be configured using environment variables. Here are the available options:

### Log File Configuration

- `LOGS_BASE_DIR`: Base directory for logs (defaults to user's home directory)
- `NGINX_LOGS_DIR`: NGINX log directory relative to base directory (default: `docker/nginx/logs`)
- `ACCESS_LOG_NAME`: Access log filename (default: `bigbraincoding.com_access.log`)
- `TRACKING_LOG_NAME`: Tracking log filename (default: `bigbraincoding.com_tracking.log`)
- `IP_TRACKING_LOG_NAME`: IP tracking log filename (default: `bigbraincoding.com_ip_tracking.log`)

### Analytics Configuration

- `ANALYTICS_TIMEZONE`: Timezone for analytics (default: `America/Kentucky/Louisville`)
- `SESSION_TIMEOUT`: Session timeout in minutes (default: `30`)
- `MIN_BOT_INDICATORS`: Minimum indicators to classify as bot (default: `3`)
- `MAX_HUMAN_REQUESTS`: Maximum requests per IP to consider as human (default: `100`)

## Example Configuration

### For a different user:
```bash
export LOGS_BASE_DIR="/home/johndoe"
export NGINX_LOGS_DIR="docker/nginx/logs"
export ACCESS_LOG_NAME="mywebsite.com_access.log"
export TRACKING_LOG_NAME="mywebsite.com_tracking.log"
export IP_TRACKING_LOG_NAME="mywebsite.com_ip_tracking.log"
export ANALYTICS_TIMEZONE="America/New_York"
```

### For a different timezone:
```bash
export ANALYTICS_TIMEZONE="Europe/London"
export SESSION_TIMEOUT="45"
```

### For different bot detection settings:
```bash
export MIN_BOT_INDICATORS="2"
export MAX_HUMAN_REQUESTS="200"
```

## Default Configuration

If no environment variables are set, the system uses these defaults:

- **Base Directory**: User's home directory (`$HOME` or `$USERPROFILE`)
- **NGINX Logs**: `~/docker/nginx/logs/`
- **Log Files**: `bigbraincoding.com_*.log`
- **Timezone**: `America/Kentucky/Louisville`
- **Session Timeout**: 30 minutes
- **Bot Detection**: 3 minimum indicators, 100 max human requests

## File Structure

The expected log file structure is:
```
$LOGS_BASE_DIR/
└── $NGINX_LOGS_DIR/
    ├── $ACCESS_LOG_NAME
    ├── $TRACKING_LOG_NAME
    └── $IP_TRACKING_LOG_NAME
```

## Deployment Notes

1. **Environment Variables**: Set these in your deployment environment (e.g., `.env` file, Docker environment, or server environment)
2. **File Permissions**: Ensure the web server has read access to the log files
3. **Timezone**: Use IANA timezone identifiers (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`)
4. **Log Rotation**: The system will work with rotated log files as long as they follow the naming convention

## Troubleshooting

### Common Issues:

1. **"No data to export"**: Check that log files exist and are readable
2. **"Invalid data structure"**: Verify log file format matches NGINX combined log format
3. **Timezone issues**: Ensure the timezone identifier is valid
4. **Permission denied**: Check file permissions on log directories

### Debug Mode:

Enable debug logging by setting:
```bash
export NODE_ENV="development"
```

This will provide detailed console output for troubleshooting.