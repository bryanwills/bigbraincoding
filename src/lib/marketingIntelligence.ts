// Marketing Intelligence and Lead Qualification System
export interface VisitorProfile {
  ip: string;
  sessionId: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalTimeOnSite: number;
  pagesVisited: string[];
  engagementScore: number;
  leadScore: number;
  deviceConsistency: boolean;
  highEngagementPages: string[];
  conversionEvents: string[];
  timeBasedPatterns: {
    averageSessionDuration: number;
    preferredVisitTimes: string[];
    returnVisitor: boolean;
  };
}

export interface LeadQualification {
  isQualified: boolean;
  leadScore: number;
  qualificationReason: string;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high';
  nextBestAction: string;
}

export interface SalesIntelligence {
  highValueVisitors: VisitorProfile[];
  conversionOpportunities: {
    visitor: VisitorProfile;
    opportunity: string;
    confidence: number;
  }[];
  marketInsights: {
    topPerformingPages: string[];
    commonUserJourneys: string[][];
    devicePreferences: Record<string, number>;
    timeBasedTrends: Record<string, number>;
  };
}

class MarketingIntelligenceService {
  private visitorProfiles: Map<string, VisitorProfile> = new Map();
  private highEngagementThresholds = {
    timeOnSite: 300000, // 5 minutes
    pagesVisited: 3,
    engagementScore: 0.7,
    leadScore: 0.6
  };

  /**
   * Update visitor profile with new session data
   */
  public updateVisitorProfile(sessionData: {
    ip: string;
    sessionId: string;
    pages: string[];
    timeOnSite: number;
    engagementMetrics?: Record<string, number>;
  }): void {
    const { ip, sessionId, pages, timeOnSite, engagementMetrics } = sessionData;

    const existingProfile = this.visitorProfiles.get(ip);
    const now = new Date().toISOString();

    const engagementScore = this.calculateEngagementScore({
      timeOnSite,
      pagesVisited: pages.length,
      engagementMetrics
    });

    const leadScore = this.calculateLeadScore({
      engagementScore,
      totalVisits: (existingProfile?.totalVisits || 0) + 1,
      timeOnSite,
      pagesVisited: pages.length,
      highValuePages: this.getHighValuePages(pages)
    });

    const profile: VisitorProfile = {
      ip,
      sessionId,
      firstVisit: existingProfile?.firstVisit || now,
      lastVisit: now,
      totalVisits: (existingProfile?.totalVisits || 0) + 1,
      totalTimeOnSite: (existingProfile?.totalTimeOnSite || 0) + timeOnSite,
      pagesVisited: [...new Set([...(existingProfile?.pagesVisited || []), ...pages])],
      engagementScore,
      leadScore,
      deviceConsistency: this.checkDeviceConsistency(existingProfile),
      highEngagementPages: this.identifyHighEngagementPages(pages),
      conversionEvents: this.trackConversionEvents(pages),
      timeBasedPatterns: this.analyzeTimePatterns(existingProfile, now, timeOnSite)
    };

    this.visitorProfiles.set(ip, profile);
  }

  /**
   * Calculate engagement score based on visitor behavior
   */
  private calculateEngagementScore(data: {
    timeOnSite: number;
    pagesVisited: number;
    engagementMetrics?: Record<string, number>;
  }): number {
    const { timeOnSite, pagesVisited, engagementMetrics } = data;

    let score = 0;

    // Time on site factor (0-40 points)
    const timeScore = Math.min(timeOnSite / this.highEngagementThresholds.timeOnSite, 1) * 40;
    score += timeScore;

    // Pages visited factor (0-30 points)
    const pagesScore = Math.min(pagesVisited / this.highEngagementThresholds.pagesVisited, 1) * 30;
    score += pagesScore;

    // Engagement metrics factor (0-30 points)
    if (engagementMetrics) {
      const scrollDepth = engagementMetrics.scrollDepth || 0;
      const clicks = engagementMetrics.clicks || 0;
      const mouseMovements = engagementMetrics.mouseMovements || 0;

      const engagementScore = (
        (scrollDepth / 100) * 10 +
        Math.min(clicks / 10, 1) * 10 +
        Math.min(mouseMovements / 50, 1) * 10
      );
      score += engagementScore;
    }

    return Math.min(score / 100, 1);
  }

  /**
   * Calculate lead score for qualification
   */
  private calculateLeadScore(data: {
    engagementScore: number;
    totalVisits: number;
    timeOnSite: number;
    pagesVisited: number;
    highValuePages: string[];
  }): number {
    const { engagementScore, totalVisits, timeOnSite, pagesVisited, highValuePages } = data;

    let score = 0;

    // Engagement factor (0-30 points)
    score += engagementScore * 30;

    // Return visitor factor (0-20 points)
    if (totalVisits > 1) {
      score += Math.min(totalVisits / 5, 1) * 20;
    }

    // Time investment factor (0-25 points)
    const timeScore = Math.min(timeOnSite / (this.highEngagementThresholds.timeOnSite * 2), 1) * 25;
    score += timeScore;

    // High-value page factor (0-25 points)
    const highValueScore = Math.min(highValuePages.length / 3, 1) * 25;
    score += highValueScore;

    return Math.min(score / 100, 1);
  }

  /**
   * Identify high-value pages that indicate serious interest
   */
  private getHighValuePages(pages: string[]): string[] {
    const highValuePagePatterns = [
      '/services',
      '/projects',
      '/contact',
      '/about',
      '/pricing',
      '/quote'
    ];

    return pages.filter(page =>
      highValuePagePatterns.some(pattern => page.includes(pattern))
    );
  }

  /**
   * Check device consistency across visits
   */
  private checkDeviceConsistency(existingProfile?: VisitorProfile): boolean {
    // For now, assume consistent if profile exists
    // In a real implementation, you'd compare device fingerprints
    return !!existingProfile;
  }

  /**
   * Identify pages that indicate high engagement
   */
  private identifyHighEngagementPages(pages: string[]): string[] {
    const engagementIndicators = [
      'contact',
      'services',
      'projects',
      'about',
      'pricing'
    ];

    return pages.filter(page =>
      engagementIndicators.some(indicator => page.includes(indicator))
    );
  }

  /**
   * Track conversion events
   */
  private trackConversionEvents(pages: string[]): string[] {
    const conversionEvents: string[] = [];

    if (pages.includes('/contact')) {
      conversionEvents.push('contact_page_visited');
    }

    if (pages.includes('/services')) {
      conversionEvents.push('services_page_visited');
    }

    if (pages.includes('/projects')) {
      conversionEvents.push('portfolio_viewed');
    }

    return conversionEvents;
  }

  /**
   * Analyze time-based patterns
   */
  private analyzeTimePatterns(
    existingProfile: VisitorProfile | undefined,
    currentVisit: string,
    sessionDuration: number
  ): VisitorProfile['timeBasedPatterns'] {
    const now = new Date(currentVisit);
    const visitHour = now.getHours();

    const patterns: VisitorProfile['timeBasedPatterns'] = {
      averageSessionDuration: existingProfile?.timeBasedPatterns.averageSessionDuration || sessionDuration,
      preferredVisitTimes: existingProfile?.timeBasedPatterns.preferredVisitTimes || [],
      returnVisitor: !!existingProfile
    };

    // Update preferred visit times
    const hourString = `${visitHour}:00`;
    if (!patterns.preferredVisitTimes.includes(hourString)) {
      patterns.preferredVisitTimes.push(hourString);
    }

    // Update average session duration
    if (existingProfile) {
      const totalSessions = existingProfile.totalVisits;
      patterns.averageSessionDuration = (
        (existingProfile.timeBasedPatterns.averageSessionDuration * (totalSessions - 1) + sessionDuration) / totalSessions
      );
    }

    return patterns;
  }

  /**
   * Qualify a visitor as a lead
   */
  public qualifyLead(ip: string): LeadQualification {
    const profile = this.visitorProfiles.get(ip);

    if (!profile) {
      return {
        isQualified: false,
        leadScore: 0,
        qualificationReason: 'No visitor profile found',
        recommendedAction: 'Continue monitoring',
        urgency: 'low',
        nextBestAction: 'Wait for more engagement'
      };
    }

    const isQualified = profile.leadScore >= this.highEngagementThresholds.leadScore;
    const urgency = this.determineUrgency(profile);
    const recommendedAction = this.getRecommendedAction(profile);
    const nextBestAction = this.getNextBestAction(profile);

    return {
      isQualified,
      leadScore: profile.leadScore,
      qualificationReason: this.getQualificationReason(profile),
      recommendedAction,
      urgency,
      nextBestAction
    };
  }

  /**
   * Determine urgency level for lead
   */
  private determineUrgency(profile: VisitorProfile): 'low' | 'medium' | 'high' {
    if (profile.leadScore >= 0.8) return 'high';
    if (profile.leadScore >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Get recommended action for lead
   */
  private getRecommendedAction(profile: VisitorProfile): string {
    if (profile.conversionEvents.includes('contact_page_visited')) {
      return 'Follow up on contact form submission';
    }

    if (profile.highEngagementPages.includes('/services')) {
      return 'Send personalized service proposal';
    }

    if (profile.highEngagementPages.includes('/projects')) {
      return 'Share relevant case studies';
    }

    return 'Send welcome email with value proposition';
  }

  /**
   * Get next best action
   */
  private getNextBestAction(profile: VisitorProfile): string {
    if (!profile.conversionEvents.includes('contact_page_visited')) {
      return 'Encourage contact page visit';
    }

    if (!profile.highEngagementPages.includes('/services')) {
      return 'Direct to services page';
    }

    if (!profile.highEngagementPages.includes('/projects')) {
      return 'Showcase portfolio';
    }

    return 'Maintain relationship with regular updates';
  }

  /**
   * Get qualification reason
   */
  private getQualificationReason(profile: VisitorProfile): string {
    const reasons: string[] = [];

    if (profile.engagementScore > 0.7) {
      reasons.push('High engagement');
    }

    if (profile.totalVisits > 2) {
      reasons.push('Return visitor');
    }

    if (profile.highEngagementPages.length > 0) {
      reasons.push('Viewed key pages');
    }

    if (profile.conversionEvents.length > 0) {
      reasons.push('Conversion events triggered');
    }

    return reasons.join(', ') || 'Limited engagement';
  }

  /**
   * Generate sales intelligence report
   */
  public generateSalesIntelligence(): SalesIntelligence {
    const profiles = Array.from(this.visitorProfiles.values());

    const highValueVisitors = profiles.filter(p => p.leadScore >= 0.6);

    const conversionOpportunities = profiles
      .filter(p => p.leadScore >= 0.4 && p.leadScore < 0.6)
      .map(visitor => ({
        visitor,
        opportunity: this.getConversionOpportunity(visitor),
        confidence: visitor.leadScore
      }));

    const marketInsights = this.generateMarketInsights(profiles);

    return {
      highValueVisitors,
      conversionOpportunities,
      marketInsights
    };
  }

  /**
   * Get conversion opportunity for visitor
   */
  private getConversionOpportunity(visitor: VisitorProfile): string {
    if (!visitor.conversionEvents.includes('contact_page_visited')) {
      return 'Contact page conversion';
    }

    if (!visitor.highEngagementPages.includes('/services')) {
      return 'Service interest qualification';
    }

    if (!visitor.highEngagementPages.includes('/projects')) {
      return 'Portfolio engagement';
    }

    return 'General engagement improvement';
  }

  /**
   * Generate market insights from visitor data
   */
  private generateMarketInsights(profiles: VisitorProfile[]): SalesIntelligence['marketInsights'] {
    const pageVisits: Record<string, number> = {};
    const devicePreferences: Record<string, number> = {};
    const timeBasedTrends: Record<string, number> = {};
    const userJourneys: string[][] = [];

    profiles.forEach(profile => {
      // Count page visits
      profile.pagesVisited.forEach(page => {
        pageVisits[page] = (pageVisits[page] || 0) + 1;
      });

      // Track user journeys
      userJourneys.push(profile.pagesVisited);

      // Time-based trends (simplified)
      profile.timeBasedPatterns.preferredVisitTimes.forEach(time => {
        timeBasedTrends[time] = (timeBasedTrends[time] || 0) + 1;
      });
    });

    return {
      topPerformingPages: Object.entries(pageVisits)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([page]) => page),
      commonUserJourneys: this.findCommonJourneys(userJourneys),
      devicePreferences,
      timeBasedTrends
    };
  }

  /**
   * Find common user journey patterns
   */
  private findCommonJourneys(journeys: string[][]): string[][] {
    const journeyCounts: Record<string, number> = {};

    journeys.forEach(journey => {
      const key = journey.join(' -> ');
      journeyCounts[key] = (journeyCounts[key] || 0) + 1;
    });

    return Object.entries(journeyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([journey]) => journey.split(' -> '));
  }

  /**
   * Get all visitor profiles
   */
  public getVisitorProfiles(): VisitorProfile[] {
    return Array.from(this.visitorProfiles.values());
  }

  /**
   * Get profile for specific IP
   */
  public getVisitorProfile(ip: string): VisitorProfile | undefined {
    return this.visitorProfiles.get(ip);
  }
}

// Export singleton instance
export const marketingIntelligenceService = new MarketingIntelligenceService();
export default marketingIntelligenceService;