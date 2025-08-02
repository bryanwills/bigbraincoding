// Configuration for analytics and logging
import { join } from 'path';

export const config = {
  // Log file paths - can be overridden by environment variables
  logs: {
    // Base directory for logs (defaults to user's home directory)
    baseDir: process.env.LOGS_BASE_DIR || process.env.HOME || process.env.USERPROFILE || '/home',

    // NGINX log directory relative to base directory
    nginxDir: process.env.NGINX_LOGS_DIR || 'docker/nginx/logs',

    // Log file names (can be customized per domain)
    accessLog: process.env.ACCESS_LOG_NAME || 'bigbraincoding.com_access.log',
    trackingLog: process.env.TRACKING_LOG_NAME || 'bigbraincoding.com_tracking.log',
    ipTrackingLog: process.env.IP_TRACKING_LOG_NAME || 'bigbraincoding.com_ip_tracking.log',

    // Get full log directory path
    getNginxLogDir: () => {
      return join(config.logs.baseDir, config.logs.nginxDir);
    },

    // Get specific log file paths
    getLogFiles: () => {
      const logDir = config.logs.getNginxLogDir();
      return {
        access: join(logDir, config.logs.accessLog),
        tracking: join(logDir, config.logs.trackingLog),
        ipTracking: join(logDir, config.logs.ipTrackingLog)
      };
    }
  },

  // Analytics settings
  analytics: {
    // Timezone for analytics (defaults to Louisville timezone)
    timezone: process.env.ANALYTICS_TIMEZONE || 'America/Kentucky/Louisville',

    // Session timeout in minutes (default: 30 minutes)
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30'),

    // Bot detection settings
    botDetection: {
      // Minimum indicators to classify as bot
      minBotIndicators: parseInt(process.env.MIN_BOT_INDICATORS || '3'),

      // Maximum requests per IP to consider as human
      maxHumanRequests: parseInt(process.env.MAX_HUMAN_REQUESTS || '100')
    }
  }
};