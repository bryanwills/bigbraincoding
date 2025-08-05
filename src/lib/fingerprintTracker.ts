/* eslint-disable @typescript-eslint/no-explicit-any */
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface FingerprintData {
  timestamp: string;
  visitorId: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  deviceType: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cpuCores: number;
  memorySize: number;
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  plugins: string[];
  sessionId: string;
  pageUrl: string;
  referrer: string;
  timeOnPage: number;
  scrollDepth: number;
  interactions: {
    clicks: number;
    scrolls: number;
    formInteractions: number;
  };
}

class FingerprintTracker {
  private fpPromise: Promise<any> | null = null;
  private sessionId: string;
  private startTime: number;
  private interactions = {
    clicks: 0,
    scrolls: 0,
    formInteractions: 0
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeFingerprint();
    this.setupEventListeners();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeFingerprint() {
    try {
      this.fpPromise = FingerprintJS.load();
    } catch (error) {
      console.error('Failed to initialize FingerprintJS:', error);
    }
  }

  private setupEventListeners() {
    // Track clicks
    document.addEventListener('click', () => {
      this.interactions.clicks++;
    });

    // Track scrolls
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      this.interactions.scrolls++;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth();
      }, 100);
    });

    // Track form interactions
    document.addEventListener('input', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        this.interactions.formInteractions++;
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendFingerprintData();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.sendFingerprintData();
    });
  }

  private trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

    // Update scroll depth in session storage
    sessionStorage.setItem('scrollDepth', scrollDepth.toString());
  }

  private async getFingerprintData(): Promise<Partial<FingerprintData>> {
    try {
      if (!this.fpPromise) {
        throw new Error('FingerprintJS not initialized');
      }

      const fp = await this.fpPromise;
      const result: any = await fp.get();

      return {
        visitorId: result.visitorId,
        userAgent: navigator.userAgent,
        browser: this.getBrowserInfo(),
        deviceType: this.getDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        cpuCores: navigator.hardwareConcurrency || 0,
        memorySize: (performance as any).memory?.usedJSHeapSize || 0,
        canvas: this.getCanvasFingerprint(),
        webgl: this.getWebGLFingerprint(),
        audio: this.getAudioFingerprint(),
        fonts: this.getAvailableFonts(),
        plugins: Array.from(navigator.plugins).map(p => p.name),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        referrer: document.referrer,
        timeOnPage: Date.now() - this.startTime,
        scrollDepth: parseInt(sessionStorage.getItem('scrollDepth') || '0'),
        interactions: { ...this.interactions }
      };
    } catch (error) {
      console.error('Error getting fingerprint data:', error);
      return {};
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('FingerprintJS Canvas', 2, 2);
      return canvas.toDataURL();
    } catch (error) {
      return '';
    }
  }

    private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (!gl) return '';

      return gl.getParameter(gl.VENDOR) + '~' + gl.getParameter(gl.RENDERER);
    } catch (error) {
      return '';
    }
  }

  private getAudioFingerprint(): string {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0;
      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.001);

      return audioContext.sampleRate.toString();
    } catch (error) {
      return '';
    }
  }

  private getAvailableFonts(): string[] {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
      'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console'
    ];

    const availableFonts: string[] = [];

    for (const font of fontList) {
      let matched = 0;
      for (const baseFont of baseFonts) {
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        context.font = `${testSize} ${font}, ${baseFont}`;
        const baseWidth = context.measureText(testString).width;
        context.font = `${testSize} ${baseFont}`;
        const baseWidth2 = context.measureText(testString).width;

        if (baseWidth !== baseWidth2) {
          matched++;
        }
      }
      if (matched >= 2) {
        availableFonts.push(font);
      }
    }

    return availableFonts;
  }

  public async sendFingerprintData() {
    try {
      const fingerprintData = await this.getFingerprintData();

      const data: FingerprintData = {
        timestamp: new Date().toISOString(),
        ipAddress: '', // Will be set by server
        ...fingerprintData
      } as FingerprintData;

      // Send to our tracking API
      await fetch('/api/tracking/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

    } catch (error) {
      console.error('Error sending fingerprint data:', error);
    }
  }

  public async trackPageView(pageUrl: string) {
    try {
      const fingerprintData = await this.getFingerprintData();

      const data = {
        ...fingerprintData,
        timestamp: new Date().toISOString(),
        pageUrl,
        eventType: 'pageview'
      };

      await fetch('/api/tracking/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }
}

// Create a singleton instance
let fingerprintTracker: FingerprintTracker | null = null;

export function getFingerprintTracker(): FingerprintTracker {
  if (!fingerprintTracker) {
    fingerprintTracker = new FingerprintTracker();
  }
  return fingerprintTracker;
}

export function initializeFingerprintTracking() {
  if (typeof window !== 'undefined') {
    getFingerprintTracker();
  }
}