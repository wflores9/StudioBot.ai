import { Router, Request, Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { PlatformService } from '../services/platform.service';

export const platformRoutes = Router();
const platformService = new PlatformService();

// Connect platform
platformRoutes.post(
  '/:platformName/connect',
  catchAsync(async (req: Request, res: Response) => {
    const { platformName } = req.params;
    const { user_id, credentials } = req.body;

    if (!user_id || !credentials) {
      throw new AppError('Missing required fields: user_id, credentials', 400);
    }

    const validPlatforms = ['youtube', 'twitch', 'rumble'];
    if (!validPlatforms.includes(platformName)) {
      throw new AppError('Invalid platform. Supported: youtube, twitch, rumble', 400);
    }

    const platform = await platformService.connectPlatform(
      user_id,
      platformName as any,
      credentials
    );

    res.status(201).json({
      status: 'success',
      data: platform,
      message: `Connected to ${platformName} successfully`,
    });
  })
);

// Get connected platforms
platformRoutes.get(
  '/user/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const platforms = await platformService.getUserPlatforms(userId);

    res.json({
      status: 'success',
      data: platforms,
    });
  })
);

// Publish content to platform
platformRoutes.post(
  '/:platformName/publish',
  catchAsync(async (req: Request, res: Response) => {
    const { platformName } = req.params;
    const { user_id, content_id, content_type, metadata } = req.body;

    if (!user_id || !content_id || !content_type) {
      throw new AppError('Missing required fields', 400);
    }

    const distribution = await platformService.publishContent(
      user_id,
      platformName as any,
      content_id,
      content_type,
      metadata
    );

    res.status(201).json({
      status: 'success',
      data: distribution,
      message: `Publishing ${content_type} to ${platformName}...`,
    });
  })
);

// Get distribution history
platformRoutes.get(
  '/distributions/:contentId',
  catchAsync(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const distributions = await platformService.getDistributionHistory(contentId);

    res.json({
      status: 'success',
      data: distributions,
    });
  })
);

// Get platform analytics
platformRoutes.get(
  '/:platformName/analytics/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { platformName, userId } = req.params;
    const analytics = await platformService.getAnalytics(userId, platformName as any);

    res.json({
      status: 'success',
      data: analytics,
    });
  })
);

// Disconnect platform
platformRoutes.delete(
  '/:platformId',
  catchAsync(async (req: Request, res: Response) => {
    const { platformId } = req.params;
    await platformService.disconnectPlatform(platformId);

    res.json({
      status: 'success',
      message: 'Platform disconnected successfully',
    });
  })
);
