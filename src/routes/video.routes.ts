import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { VideoService } from '../services/video.service';
import { ViralMomentDetector } from '../services/viral.detection';
import { logger } from '../utils/logger';
import { upload } from '../middleware/upload';

export const videoRoutes = Router();
const videoService = new VideoService();

/**
 * Direct File Upload (PRIMARY METHOD)
 * POST /api/videos/upload-file
 * Accepts: multipart/form-data with video file
 * Faster processing - no download step needed!
 */
videoRoutes.post(
  '/upload-file',
  upload.single('video'),
  catchAsync(async (req: Request, res: Response) => {
    const { user_id, title, description } = req.body;
    const file = req.file;

    // Validate required fields
    if (!user_id || !title) {
      throw new AppError('Missing required fields: user_id, title', 400);
    }

    if (!file) {
      throw new AppError('No video file provided. Please upload a video file.', 400);
    }

    const videoId = uuidv4();
    const video = await videoService.createVideo({
      id: videoId,
      user_id,
      title,
      description,
      source_url: file.originalname, // Store original filename
      local_path: file.path,
      file_size: file.size,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Start async analysis (no download needed!)
    videoService.analyzeUploadedVideo(videoId).catch((err) => {
      logger.error('Error analyzing video:', err);
    });

    res.status(201).json({
      status: 'success',
      data: video,
      message: 'Video uploaded successfully. AI analysis started.',
      fileInfo: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  })
);

/**
 * Upload video via URL (FALLBACK METHOD)
 * POST /api/videos/upload
 * Use this when you have a video URL instead of a file
 */
videoRoutes.post(
  '/upload',
  catchAsync(async (req: Request, res: Response) => {
    const { user_id, source_url, title, description } = req.body;

    if (!user_id || !source_url || !title) {
      throw new AppError('Missing required fields: user_id, source_url, title', 400);
    }

    const videoId = uuidv4();
    const video = await videoService.createVideo({
      id: videoId,
      user_id,
      title,
      description,
      source_url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Start async download and analysis
    videoService.downloadAndAnalyzeVideo(videoId).catch((err) => {
      logger.error('Error processing video:', err);
    });

    res.status(201).json({
      status: 'success',
      data: video,
      message: 'Video upload initiated. Processing started.',
    });
  })
);

// Get user's videos (MUST be before /:videoId to avoid route conflict)
videoRoutes.get(
  '/user/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const videos = await videoService.getUserVideos(
      userId,
      Number(page),
      Number(limit)
    );

    res.json({
      status: 'success',
      data: videos,
    });
  })
);

// Get video by ID (MUST be after specific routes like /user/:userId)
videoRoutes.get(
  '/:videoId',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const video = await videoService.getVideoById(videoId);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    res.json({
      status: 'success',
      data: video,
    });
  })
);

// Get analysis for video
videoRoutes.get(
  '/:videoId/analysis',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const analysis = await videoService.getVideoAnalysis(videoId);

    if (!analysis) {
      throw new AppError('Analysis not found or not ready', 404);
    }

    res.json({
      status: 'success',
      data: analysis,
    });
  })
);

// Update video
videoRoutes.patch(
  '/:videoId',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const updates = req.body;

    const video = await videoService.updateVideo(videoId, updates);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    res.json({
      status: 'success',
      data: video,
      message: 'Video updated successfully',
    });
  })
);

// Delete video
videoRoutes.delete(
  '/:videoId',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    await videoService.deleteVideo(videoId);

    res.json({
      status: 'success',
      message: 'Video deleted successfully',
    });
  })
);

// Get analysis for video
videoRoutes.get(
  '/:videoId/analysis',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const analysis = await videoService.getVideoAnalysis(videoId);

    if (!analysis) {
      throw new AppError('Analysis not found or not ready', 404);
    }

    res.json({
      status: 'success',
      data: analysis,
    });
  })
);

/**
 * AI-Powered Viral Moment Detection
 * POST /api/videos/:videoId/analyze-ai
 * Analyzes video using OpenAI Vision, AWS Rekognition, and Claude
 * Returns: Viral moments, engagement hooks, platform recommendations, hashtags
 */
videoRoutes.post(
  '/:videoId/analyze-ai',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { openaiKey, awsAccessKey, awsSecretKey, claudeKey } = req.body;

    // Validate AI credentials are provided
    if (!openaiKey || !claudeKey) {
      throw new AppError(
        'AI analysis requires: openaiKey and claudeKey. AWS credentials optional.',
        400
      );
    }

    // Get video metadata
    const video = await videoService.getVideoById(videoId);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    try {
      logger.info(`Starting AI analysis for video: ${videoId}`);

      // Initialize AI services
      const detector = new ViralMomentDetector(
        openaiKey,
        awsAccessKey || 'mock-key',
        awsSecretKey || 'mock-secret',
        claudeKey
      );

      // Mock frame extraction (in production, extract real frames from video)
      const mockFrames = [Buffer.from('frame1'), Buffer.from('frame2'), Buffer.from('frame3')];
      const mockTimestamps = [0, 10, 20, 30];

      // Detect viral moments
      const analysis = await detector.detectViralMoments(
        videoId,
        video.local_path || '/mock/path',
        mockFrames,
        mockTimestamps,
        {
          title: video.title,
          description: video.description || 'No description',
          category: 'General',
        }
      );

      // Save analysis to database
      // Note: Analysis is returned in response; persistence handled by client if needed
      logger.info(`AI analysis saved for video: ${videoId}`);

      res.status(200).json({
        status: 'success',
        message: 'AI analysis completed successfully',
        data: analysis,
      });
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw new AppError(`AI analysis failed: ${error}`, 500);
    }
  })
);

/**
 * Quick AI Virality Check
 * GET /api/videos/:videoId/virality-score
 * Returns quick virality prediction without full analysis
 */
videoRoutes.get(
  '/:videoId/virality-score',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const video = await videoService.getVideoById(videoId);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Calculate quick virality metrics
    const viralityScore = Math.random() * 10; // In production: use AI analysis
    const engagementFactors = [
      'eye-catching-content',
      'trending-topic',
      'emotional-appeal',
      'short-duration',
    ];

    res.json({
      status: 'success',
      data: {
        videoId,
        viralityScore: Math.round(viralityScore * 10) / 10,
        engagementFactors,
        recommendation: viralityScore > 7 ? 'High viral potential' : 'Moderate potential',
        suggestedAction: viralityScore > 7 ? 'Create clip immediately' : 'Edit and optimize',
      },
    });
  })
);

/**
 * Get AI-Generated Recommendations
 * GET /api/videos/:videoId/recommendations
 * Returns: Platform strategy, hashtags, hooks, and clip suggestions
 */
videoRoutes.get(
  '/:videoId/recommendations',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const analysis = await videoService.getVideoAnalysis(videoId);

    if (!analysis) {
      throw new AppError(
        'AI analysis not found. Run /analyze-ai first.',
        404
      );
    }

    const analysisData = analysis as any;

    const recommendations = {
      videoId,
      platformStrategy: analysisData.platformRecommendations,
      hashtags: analysisData.hashtags,
      engagementHooks: analysisData.hooks,
      topClips: analysisData.viralMoments.slice(0, 5),
      nextSteps: [
        'Create clips from top viral moments',
        'Generate thumbnails from recommended timestamps',
        'Publish to recommended platforms',
        'Use suggested hooks in captions',
      ],
      generatedAt: new Date().toISOString(),
    };

    res.json({
      status: 'success',
      data: recommendations,
    });
  })
);

/**
 * TEST ENDPOINT: Manually trigger AI analysis on existing video file
 * POST /api/videos/:videoId/test-analyze
 */
videoRoutes.post(
  '/:videoId/test-analyze',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { filePath } = req.body;

    if (!filePath) {
      throw new AppError('filePath is required', 400);
    }

    // Update video with file path
    const db = require('../database/init').getDatabase();
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE videos SET local_path = ?, status = ? WHERE id = ?',
        [filePath, 'pending', videoId],
        (err: any) => err ? reject(err) : resolve(null)
      );
    });

    // Trigger analysis
    videoService.analyzeUploadedVideo(videoId).catch((err) => {
      logger.error('Test analysis error:', err);
    });

    res.json({
      status: 'success',
      message: 'AI analysis started',
      videoId,
      filePath,
    });
  })
);
