// Comprehensive visitor tracking system
export interface TrackingEvent {
  timestamp: string;
  sessionId: string;
  pageUrl: string;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
  deviceInfo: DeviceInfo;
  eventType: 'pageview' | 'click' | 'scroll' | 'form_submit' | 'session_start' | 'session_end' | 'error' | 'performance' | 'engagement';
  eventData?: Record<string, unknown>;
  timeOnPage?: number;
  scrollDepth?: number;
  performance?: PerformanceMetrics;
  engagement?: EngagementMetrics;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  language: string;
  timezone: string;
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  pageViews: number;
  totalTimeOnSite: number;
  pages: string[];
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface EngagementMetrics {
  mouseMovements: number;
  keyStrokes: number;
  scrollEvents: number;
  clicks: number;
  formInteractions: number;
  timeOnPage: number;
  bounceRate: boolean;
  returnVisitor: boolean;
}

class TrackingService {
  private sessionId: string;
  private sessionStartTime: number;
  private pageStartTime: number;
  private lastActivity: number;
  private sessionData: SessionData;
  private isTracking = false;
  private engagementMetrics: EngagementMetrics;
  private performanceMetrics: PerformanceMetrics | null = null;
  private mouseMovementCount = 0;
  private keyStrokeCount = 0;
  private scrollEventCount = 0;
  private clickCount = 0;
  private formInteractionCount = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
    this.lastActivity = Date.now();
    this.sessionData = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      totalTimeOnSite: 0,
      pages: []
    };

    this.engagementMetrics = {
      mouseMovements: 0,
      keyStrokes: 0,
      scrollEvents: 0,
      clicks: 0,
      formInteractions: 0,
      timeOnPage: 0,
      bounceRate: true,
      returnVisitor: this.isReturnVisitor()
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isReturnVisitor(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('bigbraincoding_visitor') !== null;
  }

  private markAsReturnVisitor(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bigbraincoding_visitor', 'true');
  }

    private capturePerformanceMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    if (!navigation) return null;

    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
    const cls = performance.getEntriesByType('layout-shift')[0];

    return {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint: lcp ? lcp.startTime : 0,
      cumulativeLayoutShift: cls ? (cls as PerformanceEntry & { value: number }).value : 0,
      firstInputDelay: 0, // Would need to be calculated from user interactions
      timeToInteractive: navigation.domInteractive - navigation.fetchStart
    };
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Browser detection
    let browser = 'Unknown';
    let browserVersion = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    // OS detection
    let os = 'Unknown';
    let osVersion = 'Unknown';

    if (userAgent.includes('Windows')) {
      os = 'Windows';
      osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
      osVersion = userAgent.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
      osVersion = 'Unknown';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
      osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
      osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    }

    // Device type detection
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (userAgent.includes('Mobile')) {
      deviceType = 'mobile';
    } else if (userAgent.includes('Tablet') || (viewport.width >= 768 && viewport.width <= 1024)) {
      deviceType = 'tablet';
    }

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private async logEvent(event: TrackingEvent): Promise<void> {
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error('Failed to log tracking event:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging tracking event:', error);
    }
  }

  public startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.trackPageView();
    this.setupEventListeners();
    this.setupSessionTracking();
  }

  private trackPageView(): void {
    const timeOnPage = Date.now() - this.pageStartTime;

    // Capture performance metrics
    this.performanceMetrics = this.capturePerformanceMetrics();

    // Mark as return visitor
    this.markAsReturnVisitor();

    // Update engagement metrics
    this.engagementMetrics.timeOnPage = timeOnPage;
    this.engagementMetrics.bounceRate = this.sessionData.pageViews === 0;

    const event: TrackingEvent = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      eventType: 'pageview',
      timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
      performance: this.performanceMetrics ?? undefined,
      engagement: this.engagementMetrics
    };

    this.sessionData.pageViews++;
    this.sessionData.pages.push(window.location.pathname);
    this.sessionData.totalTimeOnSite += timeOnPage;
    this.sessionData.lastActivity = new Date().toISOString();

    this.logEvent(event);
    this.pageStartTime = Date.now();
  }

  private setupEventListeners(): void {
    // Track clicks
    document.addEventListener('click', (e) => {
      this.clickCount++;
      this.engagementMetrics.clicks = this.clickCount;

      const target = e.target as HTMLElement;
      const event: TrackingEvent = {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo(),
        eventType: 'click',
        eventData: {
          element: target.tagName.toLowerCase(),
          elementId: target.id || undefined,
          elementClass: target.className || undefined,
          elementText: target.textContent?.substring(0, 100) || undefined,
          x: e.clientX,
          y: e.clientY
        },
        engagement: this.engagementMetrics
      };
      this.logEvent(event);
    });

        // Track scroll depth
    let maxScrollDepth = 0;
    document.addEventListener('scroll', () => {
      this.scrollEventCount++;
      this.engagementMetrics.scrollEvents = this.scrollEventCount;

      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / docHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        const event: TrackingEvent = {
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          deviceInfo: this.getDeviceInfo(),
          eventType: 'scroll',
          eventData: {
            scrollDepth: scrollDepth,
            maxScrollDepth: maxScrollDepth
          },
          engagement: this.engagementMetrics
        };
        this.logEvent(event);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.formInteractionCount++;
      this.engagementMetrics.formInteractions = this.formInteractionCount;

      const form = e.target as HTMLFormElement;
      const event: TrackingEvent = {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo(),
        eventType: 'form_submit',
        eventData: {
          formId: form.id || undefined,
          formAction: form.action || undefined,
          formMethod: form.method || undefined
        },
        engagement: this.engagementMetrics
      };
      this.logEvent(event);
    });

    // Track mouse movements (throttled)
    let mouseMovementTimeout: NodeJS.Timeout;
    document.addEventListener('mousemove', () => {
      this.mouseMovementCount++;
      this.engagementMetrics.mouseMovements = this.mouseMovementCount;

      clearTimeout(mouseMovementTimeout);
      mouseMovementTimeout = setTimeout(() => {
        const event: TrackingEvent = {
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          deviceInfo: this.getDeviceInfo(),
          eventType: 'engagement',
          eventData: {
            mouseMovements: this.mouseMovementCount
          },
          engagement: this.engagementMetrics
        };
        this.logEvent(event);
      }, 5000); // Log every 5 seconds of mouse movement
    });

    // Track key strokes (throttled)
    let keyStrokeTimeout: NodeJS.Timeout;
    document.addEventListener('keydown', () => {
      this.keyStrokeCount++;
      this.engagementMetrics.keyStrokes = this.keyStrokeCount;

      clearTimeout(keyStrokeTimeout);
      keyStrokeTimeout = setTimeout(() => {
        const event: TrackingEvent = {
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          deviceInfo: this.getDeviceInfo(),
          eventType: 'engagement',
          eventData: {
            keyStrokes: this.keyStrokeCount
          },
          engagement: this.engagementMetrics
        };
        this.logEvent(event);
      }, 3000); // Log every 3 seconds of typing
    });
  }

  private setupSessionTracking(): void {
    // Track session start
    const sessionStartEvent: TrackingEvent = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      eventType: 'session_start'
    };
    this.logEvent(sessionStartEvent);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lastActivity = Date.now();
      } else {
        const timeAway = Date.now() - this.lastActivity;
        if (timeAway > 30000) { // 30 seconds
          this.trackPageView(); // Track as new page view if away for more than 30 seconds
        }
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      const sessionEndEvent: TrackingEvent = {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo(),
        eventType: 'session_end',
        eventData: {
          sessionDuration: Date.now() - this.sessionStartTime,
          timeOnPage: timeOnPage,
          totalPageViews: this.sessionData.pageViews,
          pagesVisited: this.sessionData.pages
        }
      };

      // Use sendBeacon for reliable delivery on page unload
      navigator.sendBeacon('/api/tracking', JSON.stringify(sessionEndEvent));
    });
  }

  public trackCustomEvent(eventName: string, eventData?: Record<string, unknown>): void {
    const event: TrackingEvent = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      eventType: 'click', // Using click as base type for custom events
      eventData: {
        customEvent: eventName,
        ...eventData
      }
    };
    this.logEvent(event);
  }
}

// Global tracking instance
let trackingService: TrackingService | null = null;

export const initTracking = (): void => {
  if (typeof window !== 'undefined' && !trackingService) {
    trackingService = new TrackingService();
    trackingService.startTracking();
  }
};

export const trackEvent = (eventName: string, eventData?: Record<string, unknown>): void => {
  if (trackingService) {
    trackingService.trackCustomEvent(eventName, eventData);
  }
};

export const getTrackingService = (): TrackingService | null => {
  return trackingService;
};