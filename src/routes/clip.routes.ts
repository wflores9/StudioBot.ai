import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { ClipService } from '../services/clip.service';
import { logger } from '../utils/logger';

export const clipRoutes = Router();
const clipService = new ClipService();

// Create a clip from video
clipRoutes.post(
  '/create',
  catchAsync(async (req: Request, res: Response) => {
    const { video_id, user_id, title, description, start_time, end_time } = req.body;

    if (!video_id || !user_id || !title || start_time === undefined || end_time === undefined) {
      throw new AppError('Missing required fields', 400);
    }

    if (start_time >= end_time) {
      throw new AppError('start_time must be less than end_time', 400);
    }

    const clipId = uuidv4();
    const clip = await clipService.createClip({
      id: clipId,
      video_id,
      user_id,
      title,
      description,
      start_time,
      end_time,
      duration: end_time - start_time,
      status: 'pending',
      approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Start async processing
    clipService.processClip(clipId).catch((err) => {
      logger.error('Error processing clip:', err);
    });

    res.status(201).json({
      status: 'success',
      data: clip,
      message: 'Clip creation started',
    });
  })
);

// Get clips for video (MUST be before /:clipId)
clipRoutes.get(
  '/video/:videoId',
  catchAsync(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const clips = await clipService.getVideoClips(
      videoId,
      Number(page),
      Number(limit)
    );

    res.json({
      status: 'success',
      data: clips,
    });
  })
);

// Get clips for user (MUST be before /:clipId)
clipRoutes.get(
  '/user/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const clips = await clipService.getUserClips(
      userId,
      Number(page),
      Number(limit)
    );

    res.json({
      status: 'success',
      data: clips,
    });
  })
);

// Get clip by ID (MUST be after specific routes)
clipRoutes.get(
  '/:clipId',
  catchAsync(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    const clip = await clipService.getClipById(clipId);

    if (!clip) {
      throw new AppError('Clip not found', 404);
    }

    res.json({
      status: 'success',
      data: clip,
    });
  })
);

// Approve clip
clipRoutes.patch(
  '/:clipId/approve',
  catchAsync(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    const { approved, approval_notes } = req.body;

    const clip = await clipService.approveClip(clipId, approved, approval_notes);

    if (!clip) {
      throw new AppError('Clip not found', 404);
    }

    res.json({
      status: 'success',
      data: clip,
      message: `Clip ${approved ? 'approved' : 'rejected'}`,
    });
  })
);

// Delete clip
clipRoutes.delete(
  '/:clipId',
  catchAsync(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    await clipService.deleteClip(clipId);

    res.json({
      status: 'success',
      message: 'Clip deleted successfully',
    });
  })
);
