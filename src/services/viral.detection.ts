/**
 * Viral Moment Detection Service
 * Uses AI analysis to identify and rank viral moments in videos
 */

import { AIOrchestrator } from './ai.integration';

export interface ViralMoment {
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  reason: string;
  emotionalPeaks: string[];
  detectedObjects: string[];
  engagementFactors: string[];
  bestForPlatforms: string[];
  thumbnailTimestamp: number;
  clipRecommendation: string;
}

export interface VideoAnalysisResult {
  videoId: string;
  totalDuration: number;
  clipCount: number;
  totalViralityScore: number;
  viralMoments: ViralMoment[];
  topMoment: ViralMoment | null;
  platformRecommendations: {
    [platform: string]: {
      bestMoments: ViralMoment[];
      strategy: string;
      recommendedFrequency: string;
    };
  };
  hashtags: {
    [platform: string]: string[];
  };
  hooks: string[];
  analysisMetadata: {
    timestamp: string;
    processingTime: number;
    aiModelsUsed: string[];
  };
}

export class ViralMomentDetector {
  private aiOrchestrator: AIOrchestrator;

  constructor(
    openaiKey: string,
    awsAccessKey: string,
    awsSecretKey: string,
    claudeKey: string
  ) {
    this.aiOrchestrator = new AIOrchestrator(
      openaiKey,
      awsAccessKey,
      awsSecretKey,
      claudeKey
    );
  }

  /**
   * Analyze a video and detect viral moments
   * Returns clip recommendations with timestamps and reasons
   */
  async detectViralMoments(
    videoId: string,
    videoPath: string,
    frames: Buffer[],
    timestamps: number[],
    videoMetadata: { title: string; description: string; category: string }
  ): Promise<VideoAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log(`🎬 Starting viral moment detection for video: ${videoId}`);

      // Run complete AI analysis
      const aiAnalysis = await this.aiOrchestrator.analyzeVideoComplete(videoPath, frames, timestamps);

      // Extract and rank viral moments
      const viralMoments = this.extractViralMoments(
        aiAnalysis.analysis.aws,
        aiAnalysis.analysis.openai,
        videoMetadata
      );

      // Generate platform-specific recommendations
      const platformRecommendations = await this.generatePlatformRecommendations(
        viralMoments,
        videoMetadata
      );

      // Generate hashtags for each platform
      const hashtags = await this.generatePlatformHashtags(
        videoMetadata,
        viralMoments
      );

      // Generate hooks
      const hooks = await this.generateEngagementHooks(
        viralMoments,
        videoMetadata
      );

      const processingTime = Date.now() - startTime;

      return {
        videoId,
        totalDuration: timestamps[timestamps.length - 1] || 0,
        clipCount: viralMoments.length,
        totalViralityScore: viralMoments.reduce((sum, m) => sum + m.viralityScore, 0) / viralMoments.length,
        viralMoments: viralMoments.sort((a, b) => b.viralityScore - a.viralityScore),
        topMoment: viralMoments.length > 0
          ? viralMoments.sort((a, b) => b.viralityScore - a.viralityScore)[0]
          : null,
        platformRecommendations,
        hashtags,
        hooks,
        analysisMetadata: {
          timestamp: new Date().toISOString(),
          processingTime,
          aiModelsUsed: ['AWS Rekognition', 'OpenAI Vision', 'Anthropic Claude'],
        },
      };
    } catch (error) {
      throw new Error(`Viral moment detection failed: ${error}`);
    }
  }

  /**
   * Extract and rank viral moments from AI analysis
   */
  private extractViralMoments(
    awsAnalysis: any,
    _openaiAnalysis: any,
    _videoMetadata: any
  ): ViralMoment[] {
    const moments: ViralMoment[] = [];

    // Analyze each AWS segment
    awsAnalysis.objectsAndActivities?.segments?.forEach((segment: any, _idx: number) => {
      // Calculate virality score based on multiple factors
      const emotionScore = this.calculateEmotionScore(segment.labels);
      const activityScore = this.calculateActivityScore(segment.activities);
      const objectScore = this.calculateObjectScore(segment.labels);

      const viralityScore = (emotionScore + activityScore + objectScore) / 3;

      if (viralityScore >= 6) {
        const moment: ViralMoment = {
          startTime: segment.startTime,
          endTime: segment.startTime + segment.duration,
          duration: segment.duration,
          viralityScore: Math.round(viralityScore * 10) / 10,
          reason: this.generateMomentReason(segment),
          emotionalPeaks: this.extractEmotionalPeaks(segment.labels),
          detectedObjects: this.extractObjects(segment.labels),
          engagementFactors: this.identifyEngagementFactors(segment),
          bestForPlatforms: this.recommendPlatforms(segment, viralityScore),
          thumbnailTimestamp: segment.startTime,
          clipRecommendation: `${segment.duration}-second clip starting at ${segment.startTime}s`,
        };

        moments.push(moment);
      }
    });

    return moments;
  }

  /**
   * Calculate emotion score (happiness, excitement, surprise)
   */
  private calculateEmotionScore(labels: any[]): number {
    const emotionKeywords = ['happy', 'excited', 'surprised', 'shocked', 'amazed', 'celebration'];
    let score = 0;

    labels.forEach((label) => {
      if (emotionKeywords.some(keyword => label.name?.toLowerCase().includes(keyword))) {
        score = Math.max(score, label.confidence * 10);
      }
    });

    return Math.min(score, 10);
  }

  /**
   * Calculate activity score (action, movement, engagement)
   */
  private calculateActivityScore(activities: string[]): number {
    const viralActivities = [
      'Running', 'Jumping', 'Dancing', 'Fighting', 'Falling', 'Reacting',
      'Crying', 'Laughing', 'Shouting', 'Gesturing', 'Performing', 'Winning'
    ];

    let score = 0;
    activities?.forEach((activity) => {
      if (viralActivities.includes(activity)) {
        score += 2;
      }
    });

    return Math.min(score, 10);
  }

  /**
   * Calculate object detection score
   */
  private calculateObjectScore(labels: any[]): number {
    const valuableObjects = ['Person', 'Outdoor', 'Animal', 'Vehicle', 'Accident', 'Fire'];
    let score = 0;

    labels.forEach((label) => {
      if (valuableObjects.includes(label.name)) {
        score = Math.max(score, label.confidence * 10);
      }
    });

    return Math.min(score, 10);
  }

  /**
   * Extract emotional peaks from segment
   */
  private extractEmotionalPeaks(labels: any[]): string[] {
    const emotionMap: { [key: string]: number } = {};

    labels.forEach((label) => {
      const name = label.name?.toLowerCase() || '';
      if (['happy', 'excited', 'sad', 'angry', 'surprised'].some(e => name.includes(e))) {
        emotionMap[label.name] = (emotionMap[label.name] || 0) + label.confidence;
      }
    });

    return Object.entries(emotionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key);
  }

  /**
   * Extract detected objects
   */
  private extractObjects(labels: any[]): string[] {
    return labels.slice(0, 5).map((l) => l.name);
  }

  /**
   * Identify engagement factors
   */
  private identifyEngagementFactors(segment: any): string[] {
    const factors: string[] = [];

    if (segment.confidence > 0.9) factors.push('high-confidence-detection');
    if (segment.activities?.length > 2) factors.push('multiple-activities');
    if (segment.labels?.some((l: any) => l.confidence > 0.95)) factors.push('strong-features');

    return factors;
  }

  /**
   * Recommend best platforms for this moment
   */
  private recommendPlatforms(segment: any, score: number): string[] {
    const platforms: string[] = [];

    if (score >= 8) platforms.push('YouTube Shorts', 'TikTok', 'Instagram Reels');
    if (score >= 7) platforms.push('YouTube', 'LinkedIn');
    if (segment.duration <= 15) platforms.push('TikTok');
    if (segment.activities?.includes('Talking')) platforms.push('LinkedIn', 'YouTube');

    return [...new Set(platforms)];
  }

  /**
   * Generate human-readable reason for virality
   */
  private generateMomentReason(segment: any): string {
    const activities = segment.activities?.slice(0, 2).join(' + ') || 'Activity';
    const objects = segment.labels?.slice(0, 2).map((l: any) => l.name).join(', ') || 'objects';
    return `High-engagement moment featuring ${activities} with ${objects}`;
  }

  /**
   * Generate platform-specific recommendations
   */
  private async generatePlatformRecommendations(
    moments: ViralMoment[],
    videoMetadata: any
  ): Promise<{ [platform: string]: any }> {
    const platforms = ['YouTube Shorts', 'TikTok', 'Instagram Reels', 'LinkedIn'];
    const recommendations: { [key: string]: any } = {};

    platforms.forEach((platform) => {
      const bestMoments = moments.filter((m) =>
        m.bestForPlatforms.includes(platform)
      );

      recommendations[platform] = {
        bestMoments: bestMoments.slice(0, 3),
        strategy: this.getPlatformStrategy(platform, videoMetadata),
        recommendedFrequency: this.getPostingFrequency(platform),
      };
    });

    return recommendations;
  }

  /**
   * Get platform-specific posting strategy
   */
  private getPlatformStrategy(platform: string, _metadata: any): string {
    const strategies: { [key: string]: string } = {
      'YouTube Shorts': 'Post 3-4x per week, focus on entertainment and education',
      'TikTok': 'Post 1-2x daily, use trending sounds and effects',
      'Instagram Reels': 'Post 2-3x per week, emphasize visual appeal',
      'LinkedIn': 'Post 2x per week, focus on professional insights',
    };
    return strategies[platform] || 'Post consistently with quality over quantity';
  }

  /**
   * Get recommended posting frequency
   */
  private getPostingFrequency(platform: string): string {
    const frequencies: { [key: string]: string } = {
      'TikTok': '1-2 per day',
      'YouTube Shorts': '3-4 per week',
      'Instagram Reels': '2-3 per week',
      'LinkedIn': '2-3 per week',
    };
    return frequencies[platform] || 'Variable';
  }

  /**
   * Generate platform-specific hashtags
   */
  private async generatePlatformHashtags(
    metadata: any,
    _moments: ViralMoment[]
  ): Promise<{ [platform: string]: string[] }> {
    const hashtags: { [key: string]: string[] } = {};

    const platforms = ['YouTube', 'TikTok', 'Instagram', 'LinkedIn'];

    platforms.forEach((platform) => {
      // Mock hashtag generation
      hashtags[platform] = [
        `#${metadata.category}`,
        `#viral`,
        `#trending`,
        `#${platform.toLowerCase()}`,
        `#shorts`,
        `#content`,
      ];
    });

    return hashtags;
  }

  /**
   * Generate engagement hooks
   */
  private async generateEngagementHooks(
    moments: ViralMoment[],
    _metadata: any
  ): Promise<string[]> {
    return [
      `Wait for the ${moments[0]?.duration || 15}s mark... 🤯`,
      `This moment will change everything`,
      `You won't believe what happens next`,
      `The twist nobody saw coming`,
      `This is why it went viral`,
    ];
  }
}

export default ViralMomentDetector;
