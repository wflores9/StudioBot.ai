import { Router, Request, Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { ShortService } from '../services/short.service';

export const shortRoutes = Router();
const shortService = new ShortService();

// Create short from clip
shortRoutes.post(
  '/create',
  catchAsync(async (req: Request, res: Response) => {
    const { clip_id, user_id, title, description } = req.body;

    if (!clip_id || !user_id || !title) {
      throw new AppError('Missing required fields: clip_id, user_id, title', 400);
    }

    const short = await shortService.convertClipToShort(clip_id, user_id, title, description);

    if (!short) {
      throw new AppError('Failed to create short from clip', 500);
    }

    res.status(201).json({
      status: 'success',
      data: short,
      message: 'Short conversion started',
    });
  })
);

// Get short by ID
shortRoutes.get(
  '/:shortId',
  catchAsync(async (req: Request, res: Response) => {
    const { shortId } = req.params;
    const short = await shortService.getShortById(shortId);

    if (!short) {
      throw new AppError('Short not found', 404);
    }

    res.json({
      status: 'success',
      data: short,
    });
  })
);

// Get user's shorts
shortRoutes.get(
  '/user/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const shorts = await shortService.getUserShorts(userId, Number(page), Number(limit));

    res.json({
      status: 'success',
      data: shorts,
    });
  })
);

// Approve short
shortRoutes.patch(
  '/:shortId/approve',
  catchAsync(async (req: Request, res: Response) => {
    const { shortId } = req.params;
    const { approved } = req.body;

    const short = await shortService.approveShort(shortId, approved);

    if (!short) {
      throw new AppError('Short not found', 404);
    }

    res.json({
      status: 'success',
      data: short,
      message: `Short ${approved ? 'approved' : 'rejected'}`,
    });
  })
);

// Delete short
shortRoutes.delete(
  '/:shortId',
  catchAsync(async (req: Request, res: Response) => {
    const { shortId } = req.params;
    await shortService.deleteShort(shortId);

    res.json({
      status: 'success',
      message: 'Short deleted successfully',
    });
  })
);
