import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { ThumbnailService } from '../services/thumbnail.service';
import { logger } from '../utils/logger';

export const thumbnailRoutes = Router();
const thumbnailService = new ThumbnailService();

// Generate thumbnail for content
thumbnailRoutes.post(
  '/generate',
  catchAsync(async (req: Request, res: Response) => {
    const { source_id, source_type, timestamp } = req.body;

    if (!source_id || !source_type) {
      throw new AppError('Missing required fields: source_id, source_type', 400);
    }

    const validTypes = ['video', 'clip', 'short'];
    if (!validTypes.includes(source_type)) {
      throw new AppError('Invalid source_type. Must be one of: video, clip, short', 400);
    }

    const thumbnailId = uuidv4();
    const thumbnail = await thumbnailService.createThumbnail({
      id: thumbnailId,
      source_id,
      source_type,
      size: '1280x720',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Start async generation
    thumbnailService.generateThumbnail(thumbnailId, timestamp).catch((err) => {
      logger.error('Error generating thumbnail:', err);
    });

    res.status(201).json({
      status: 'success',
      data: thumbnail,
      message: 'Thumbnail generation started',
    });
  })
);

// Get thumbnails for user
thumbnailRoutes.get(
  '/user/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const thumbnails = await thumbnailService.getUserThumbnails(userId);

    res.json({
      status: 'success',
      data: thumbnails,
    });
  })
);

// Get thumbnail
thumbnailRoutes.get(
  '/:thumbnailId',
  catchAsync(async (req: Request, res: Response) => {
    const { thumbnailId } = req.params;
    const thumbnail = await thumbnailService.getThumbnailById(thumbnailId);

    if (!thumbnail) {
      throw new AppError('Thumbnail not found', 404);
    }

    res.json({
      status: 'success',
      data: thumbnail,
    });
  })
);

// Get thumbnails for content
thumbnailRoutes.get(
  '/source/:sourceId',
  catchAsync(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    const thumbnails = await thumbnailService.getThumbnailsForSource(sourceId);

    res.json({
      status: 'success',
      data: thumbnails,
    });
  })
);

// Download thumbnail file
thumbnailRoutes.get(
  '/:thumbnailId/download',
  catchAsync(async (req: Request, res: Response) => {
    const { thumbnailId } = req.params;
    const filePath = await thumbnailService.getThumbnailFilePath(thumbnailId);

    if (!filePath) {
      throw new AppError('Thumbnail file not found', 404);
    }

    res.download(filePath);
  })
);

// Delete thumbnail
thumbnailRoutes.delete(
  '/:thumbnailId',
  catchAsync(async (req: Request, res: Response) => {
    const { thumbnailId } = req.params;
    await thumbnailService.deleteThumbnail(thumbnailId);

    res.json({
      status: 'success',
      message: 'Thumbnail deleted successfully',
    });
  })
);
