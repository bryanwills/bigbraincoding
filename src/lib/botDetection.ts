// Bot Detection and Rate Limiting System
export interface BotDetectionConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  suspiciousUserAgents: string[];
  progressiveVerificationEnabled: boolean;
}

export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reason: string;
  requiresVerification: boolean;
  rateLimitExceeded: boolean;
}

export interface RateLimitInfo {
  requestsInLastMinute: number;
  requestsInLastHour: number;
  isRateLimited: boolean;
  resetTime: number;
}

class BotDetectionService {
  private requestCounts: Map<string, { minute: number; hour: number; lastReset: number }> = new Map();
  private config: BotDetectionConfig;

  constructor(config: Partial<BotDetectionConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      suspiciousUserAgents: [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
        'go-http-client', 'okhttp', 'apache-httpclient', 'postman', 'insomnia'
      ],
      progressiveVerificationEnabled: true,
      ...config
    };
  }

  /**
   * Analyze user agent for bot indicators
   */
  private analyzeUserAgent(userAgent: string): { isBot: boolean; confidence: number; reason: string } {
    const ua = userAgent.toLowerCase();

    // Check for known bot patterns
    for (const pattern of this.config.suspiciousUserAgents) {
      if (ua.includes(pattern)) {
        return {
          isBot: true,
          confidence: 0.9,
          reason: `Suspicious user agent pattern: ${pattern}`
        };
      }
    }

    // Check for missing common browser indicators
    const hasBrowserIndicators = ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox');
    if (!hasBrowserIndicators && ua.length < 50) {
      return {
        isBot: true,
        confidence: 0.7,
        reason: 'Missing browser indicators and short user agent'
      };
    }

    // Check for automation tools
    const automationTools = ['selenium', 'webdriver', 'phantomjs', 'headless'];
    for (const tool of automationTools) {
      if (ua.includes(tool)) {
        return {
          isBot: true,
          confidence: 0.95,
          reason: `Automation tool detected: ${tool}`
        };
      }
    }

    return {
      isBot: false,
      confidence: 0.1,
      reason: 'Appears to be legitimate browser'
    };
  }

  /**
   * Check rate limiting for IP address
   */
  private checkRateLimit(ip: string): RateLimitInfo {
    const now = Date.now();
    const minuteAgo = now - 60 * 1000;
    const hourAgo = now - 60 * 60 * 1000;

    const ipData = this.requestCounts.get(ip) || { minute: 0, hour: 0, lastReset: now };

    // Reset counters if needed
    if (now - ipData.lastReset > 60 * 60 * 1000) {
      ipData.minute = 0;
      ipData.hour = 0;
      ipData.lastReset = now;
    }

    // Increment counters
    ipData.minute++;
    ipData.hour++;

    this.requestCounts.set(ip, ipData);

    const isRateLimited =
      ipData.minute > this.config.maxRequestsPerMinute ||
      ipData.hour > this.config.maxRequestsPerHour;

    return {
      requestsInLastMinute: ipData.minute,
      requestsInLastHour: ipData.hour,
      isRateLimited,
      resetTime: ipData.lastReset + 60 * 60 * 1000
    };
  }

  /**
   * Main bot detection method
   */
  public detectBot(ip: string, userAgent: string, additionalData?: Record<string, unknown>): BotDetectionResult {
    // Check rate limiting first
    const rateLimitInfo = this.checkRateLimit(ip);

    // Analyze user agent
    const uaAnalysis = this.analyzeUserAgent(userAgent);

    // Additional heuristics
    let confidence = uaAnalysis.confidence;
    let reason = uaAnalysis.reason;
    let requiresVerification = false;

    // Check for suspicious behavior patterns
    if (additionalData) {
      // Check for rapid page changes
      if (additionalData.timeOnPage && (additionalData.timeOnPage as number) < 1000) {
        confidence = Math.min(confidence + 0.2, 1.0);
        reason += '; Rapid page navigation detected';
      }

      // Check for missing mouse movements (if available)
      if (additionalData.mouseMovements === 0) {
        confidence = Math.min(confidence + 0.1, 1.0);
        reason += '; No mouse movements detected';
      }
    }

    // Determine if verification is required
    if (this.config.progressiveVerificationEnabled && confidence > 0.5) {
      requiresVerification = true;
    }

    return {
      isBot: uaAnalysis.isBot || rateLimitInfo.isRateLimited,
      confidence,
      reason,
      requiresVerification,
      rateLimitExceeded: rateLimitInfo.isRateLimited
    };
  }

  /**
   * Generate verification challenge for suspicious activity
   */
  public generateVerificationChallenge(): { type: string; challenge: string; expiresAt: number } {
    const challenges = [
      { type: 'press_and_hold', challenge: 'Press and hold this button for 3 seconds' },
      { type: 'simple_math', challenge: 'What is 7 + 3?' },
      { type: 'checkbox', challenge: 'Check this box to continue' }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return {
      type: randomChallenge.type,
      challenge: randomChallenge.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
  }

  /**
   * Clean up old rate limit data
   */
  public cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [ip, data] of this.requestCounts.entries()) {
      if (data.lastReset < oneHourAgo) {
        this.requestCounts.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const botDetectionService = new BotDetectionService();

// Cleanup old data every hour
setInterval(() => {
  botDetectionService.cleanup();
}, 60 * 60 * 1000);

export default botDetectionService;