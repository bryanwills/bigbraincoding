// Big Brain Coding - Static Site Tracking
// This script handles tracking for the static site deployment

(function() {
  'use strict';

  // Configuration
  const TRACKING_ENDPOINT = '/api/tracking.php';
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Session management
  let sessionId = localStorage.getItem('bbc_session_id') || generateSessionId();
  let sessionStartTime = parseInt(localStorage.getItem('bbc_session_start') || Date.now());
  let lastActivity = Date.now();
  let pageStartTime = Date.now();

  // Initialize session
  if (!localStorage.getItem('bbc_session_id')) {
    localStorage.setItem('bbc_session_id', sessionId);
    localStorage.setItem('bbc_session_start', sessionStartTime.toString());
  }

  // Generate session ID
  function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get device info
  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const screen = window.screen;

    let deviceType = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Android.*Tablet/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      deviceType,
      browser,
      screenWidth: screen.width,
      screenHeight: screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Send tracking data
  function sendTrackingData(eventData) {
    const data = {
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceInfo: getDeviceInfo(),
      ...eventData
    };

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_ENDPOINT, JSON.stringify(data));
    } else {
      // Fallback to fetch
      fetch(TRACKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(console.error);
    }
  }

  // Track page view
  function trackPageView() {
    const timeOnPage = Date.now() - pageStartTime;

    sendTrackingData({
      eventType: 'pageview',
      timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
      eventData: {
        pageTitle: document.title,
        pagePath: window.location.pathname
      }
    });

    pageStartTime = Date.now();
    lastActivity = Date.now();
  }

  // Track clicks
  function trackClick(event) {
    const target = event.target;
    const timeOnPage = Date.now() - pageStartTime;

    sendTrackingData({
      eventType: 'click',
      timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
      eventData: {
        element: target.tagName.toLowerCase(),
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        elementText: target.textContent?.substring(0, 100) || undefined,
        x: event.clientX,
        y: event.clientY
      }
    });

    lastActivity = Date.now();
  }

  // Track form submissions
  function trackFormSubmit(event) {
    const form = event.target;
    const timeOnPage = Date.now() - pageStartTime;

    sendTrackingData({
      eventType: 'form_submit',
      timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
      eventData: {
        formId: form.id || undefined,
        formAction: form.action || undefined,
        formMethod: form.method || undefined
      }
    });

    lastActivity = Date.now();
  }

  // Track scroll depth
  let maxScrollDepth = 0;
  function trackScroll() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((scrollTop / docHeight) * 100);

    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      const timeOnPage = Date.now() - pageStartTime;

      sendTrackingData({
        eventType: 'scroll',
        timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
        eventData: {
          scrollDepth: scrollDepth,
          maxScrollDepth: maxScrollDepth
        }
      });
    }

    lastActivity = Date.now();
  }

  // Session management
  function checkSessionTimeout() {
    const now = Date.now();
    if (now - lastActivity > SESSION_TIMEOUT) {
      // Session expired, start new session
      sessionId = generateSessionId();
      sessionStartTime = now;
      localStorage.setItem('bbc_session_id', sessionId);
      localStorage.setItem('bbc_session_start', sessionStartTime.toString());
    }
    lastActivity = now;
  }

  // Initialize tracking
  function initTracking() {
    // Track initial page view
    trackPageView();

    // Set up event listeners
    document.addEventListener('click', trackClick);
    document.addEventListener('submit', trackFormSubmit);
    document.addEventListener('scroll', trackScroll);

    // Check session timeout periodically
    setInterval(checkSessionTimeout, 60000); // Every minute

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Page hidden, track session end
        const sessionDuration = Date.now() - sessionStartTime;
        sendTrackingData({
          eventType: 'session_end',
          eventData: {
            sessionDuration: sessionDuration
          }
        });
      } else {
        // Page visible again, track new page view
        trackPageView();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStartTime;
      sendTrackingData({
        eventType: 'session_end',
        eventData: {
          sessionDuration: sessionDuration
        }
      });
    });
  }

  // Start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }

  // Expose tracking function globally for custom events
  window.trackEvent = function(eventType, eventData) {
    const timeOnPage = Date.now() - pageStartTime;
    sendTrackingData({
      eventType: eventType,
      timeOnPage: timeOnPage > 0 ? timeOnPage : undefined,
      eventData: eventData
    });
    lastActivity = Date.now();
  };

})();