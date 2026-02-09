/**
 * Analytics Aggregator
 * Unified analytics across YouTube, Twitch, and Rumble
 */

export interface PlatformAnalytics {
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  engagementRate: number;
  avgWatchDuration?: number;
  clickThroughRate?: number;
  conversionRate?: number;
  timestamp: Date;
}

export interface AggregatedAnalytics {
  youtube?: {
    videoId: string;
    analytics: PlatformAnalytics;
  };
  twitch?: {
    videoId: string;
    analytics: PlatformAnalytics;
  };
  rumble?: {
    videoId: string;
    analytics: PlatformAnalytics;
  };
  combined: {
    totalViews: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPlatform: string;
    platformBreakdown: Record<string, number>;
  };
}

/**
 * YouTube Analytics Parser
 */
export class YouTubeAnalyticsParser {
  parseResponse(apiResponse: any): PlatformAnalytics {
    const stats = apiResponse.items?.[0]?.statistics || {};

    const viewCount = parseInt(stats.viewCount || '0', 10);
    const likeCount = parseInt(stats.likeCount || '0', 10);
    const commentCount = parseInt(stats.commentCount || '0', 10);

    const totalEngagement = likeCount + commentCount;
    const engagementRate = viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

    return {
      viewCount,
      likeCount,
      commentCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      timestamp: new Date(),
    };
  }

  async getDetailedAnalytics(videoId: string, accessToken: string): Promise<any> {
    // YouTube Analytics API requires additional setup
    // This is a simplified example
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,processingDetails&id=${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return response.json();
  }
}

/**
 * Twitch Analytics Parser
 */
export class TwitchAnalyticsParser {
  parseResponse(apiResponse: any): PlatformAnalytics {
    const data = apiResponse.data?.[0] || {};

    const viewCount = parseInt(data.views || '0', 10);
    const engagementRate = parseFloat(data.engagement_rate || '0');

    return {
      viewCount,
      engagementRate,
      timestamp: new Date(),
    };
  }

  async getDetailedAnalytics(videoId: string, accessToken: string, clientId: string): Promise<any> {
    const response = await fetch(
      `https://api.twitch.tv/helix/analytics/videos?video_id=${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-ID': clientId,
        },
      }
    );

    return response.json();
  }
}

/**
 * Rumble Analytics Parser
 */
export class RumbleAnalyticsParser {
  parseResponse(apiResponse: any): PlatformAnalytics {
    const data = apiResponse.data || {};

    const viewCount = parseInt(data.views || '0', 10);
    const shares = parseInt(data.shares || '0', 10);

    const engagementRate = viewCount > 0 ? (shares / viewCount) * 100 : 0;

    return {
      viewCount,
      shareCount: shares,
      engagementRate: Math.round(engagementRate * 100) / 100,
      timestamp: new Date(),
    };
  }
}

/**
 * Analytics Aggregator
 */
export class AnalyticsAggregator {
  private youtubeParser = new YouTubeAnalyticsParser();
  private twitchParser = new TwitchAnalyticsParser();
  private rumbleParser = new RumbleAnalyticsParser();

  /**
   * Aggregate analytics from multiple platforms
   */
  aggregate(results: {
    youtube?: { videoId: string; data: any };
    twitch?: { videoId: string; data: any };
    rumble?: { videoId: string; data: any };
  }): AggregatedAnalytics {
    const aggregated: AggregatedAnalytics = {
      combined: {
        totalViews: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        topPlatform: 'none',
        platformBreakdown: {},
      },
    };

    let count = 0;
    let totalEngagementRate = 0;

    // Process YouTube
    if (results.youtube?.data) {
      const analytics = this.youtubeParser.parseResponse(results.youtube.data);
      aggregated.youtube = {
        videoId: results.youtube.videoId,
        analytics,
      };
      aggregated.combined.totalViews += analytics.viewCount;
      totalEngagementRate += analytics.engagementRate;
      aggregated.combined.platformBreakdown['youtube'] = analytics.viewCount;
      count++;
    }

    // Process Twitch
    if (results.twitch?.data) {
      const analytics = this.twitchParser.parseResponse(results.twitch.data);
      aggregated.twitch = {
        videoId: results.twitch.videoId,
        analytics,
      };
      aggregated.combined.totalViews += analytics.viewCount;
      totalEngagementRate += analytics.engagementRate;
      aggregated.combined.platformBreakdown['twitch'] = analytics.viewCount;
      count++;
    }

    // Process Rumble
    if (results.rumble?.data) {
      const analytics = this.rumbleParser.parseResponse(results.rumble.data);
      aggregated.rumble = {
        videoId: results.rumble.videoId,
        analytics,
      };
      aggregated.combined.totalViews += analytics.viewCount;
      totalEngagementRate += analytics.engagementRate;
      aggregated.combined.platformBreakdown['rumble'] = analytics.viewCount;
      count++;
    }

    // Calculate averages
    if (count > 0) {
      aggregated.combined.avgEngagementRate = Math.round((totalEngagementRate / count) * 100) / 100;
    }

    // Find top platform
    let topViews = 0;
    for (const [platform, views] of Object.entries(aggregated.combined.platformBreakdown)) {
      if (views > topViews) {
        topViews = views as number;
        aggregated.combined.topPlatform = platform;
      }
    }

    return aggregated;
  }

  /**
   * Get trend analysis
   */
  calculateTrends(
    current: PlatformAnalytics,
    previous: PlatformAnalytics
  ): { viewGrowth: number; engagementTrend: string } {
    const viewGrowth = previous.viewCount > 0 ? ((current.viewCount - previous.viewCount) / previous.viewCount) * 100 : 0;

    let engagementTrend = 'stable';
    if (current.engagementRate > previous.engagementRate * 1.1) {
      engagementTrend = 'increasing';
    } else if (current.engagementRate < previous.engagementRate * 0.9) {
      engagementTrend = 'decreasing';
    }

    return {
      viewGrowth: Math.round(viewGrowth * 100) / 100,
      engagementTrend,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(analytics: AggregatedAnalytics): string {
    const report: string[] = ['=== Platform Performance Report ===\n'];

    if (analytics.youtube) {
      report.push(`YouTube:`);
      report.push(`  Views: ${analytics.youtube.analytics.viewCount.toLocaleString()}`);
      report.push(`  Likes: ${analytics.youtube.analytics.likeCount?.toLocaleString()}`);
      report.push(`  Comments: ${analytics.youtube.analytics.commentCount?.toLocaleString()}`);
      report.push(`  Engagement Rate: ${analytics.youtube.analytics.engagementRate}%\n`);
    }

    if (analytics.twitch) {
      report.push(`Twitch:`);
      report.push(`  Views: ${analytics.twitch.analytics.viewCount.toLocaleString()}`);
      report.push(`  Engagement Rate: ${analytics.twitch.analytics.engagementRate}%\n`);
    }

    if (analytics.rumble) {
      report.push(`Rumble:`);
      report.push(`  Views: ${analytics.rumble.analytics.viewCount.toLocaleString()}`);
      report.push(`  Shares: ${analytics.rumble.analytics.shareCount?.toLocaleString()}`);
      report.push(`  Engagement Rate: ${analytics.rumble.analytics.engagementRate}%\n`);
    }

    report.push(`Combined Metrics:`);
    report.push(`  Total Views: ${analytics.combined.totalViews.toLocaleString()}`);
    report.push(`  Avg Engagement Rate: ${analytics.combined.avgEngagementRate}%`);
    report.push(`  Top Platform: ${analytics.combined.topPlatform}`);

    return report.join('\n');
  }
}

export default {
  YouTubeAnalyticsParser,
  TwitchAnalyticsParser,
  RumbleAnalyticsParser,
  AnalyticsAggregator,
};
