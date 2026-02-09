/**
 * OAuth Routes - Handle OAuth callbacks and authorization flows
 */

import { Router, Request, Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { PlatformAuthManager } from '../services/oauth.service';
import { getDatabase } from '../database/init';

const router = Router();

// Initialize OAuth managers from environment
const platformAuthManager = new PlatformAuthManager(
  {
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || '',
  },
  {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    redirectUri: process.env.TWITCH_REDIRECT_URI || '',
  }
);

/**
 * GET /api/oauth/authorize/:platform
 * Initiate OAuth flow for a platform
 */
router.get(
  '/authorize/:platform',
  catchAsync(async (req: Request, res: Response) => {
    const { platform } = req.params;
    const returnUrl = (req.query.return_to as string) || '/dashboard';

    if (!['youtube', 'twitch', 'rumble'].includes(platform)) {
      throw new AppError('Invalid platform', 400);
    }

    try {
      const authUrl = platformAuthManager.getAuthorizationUrl(
        platform as 'youtube' | 'twitch' | 'rumble',
        returnUrl
      );

      res.json({
        status: 'ok',
        authUrl,
        platform,
      });
      return;
    } catch (error) {
      throw new AppError(`OAuth not configured for ${platform}`, 500);
    }
  })
);

/**
 * GET /api/oauth/callback/youtube
 * Handle YouTube OAuth callback
 */
router.get(
  '/callback/youtube',
  catchAsync(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new AppError('Missing authorization code or state', 400);
    }

    const result = await platformAuthManager.handleCallback('youtube', code as string, state as string);

    if (!result.valid) {
      return res.status(400).json({ error: 'Invalid authorization' });
    }

    // Save to database
    const db = getDatabase();
    const userId = (req as any).user?.id || 'unknown';

    db.run(
      `INSERT OR REPLACE INTO platforms (id, user_id, platform_name, access_token, refresh_token, is_connected, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        `${userId}-youtube`,
        userId,
        'youtube',
        result.token.access_token,
        result.token.refresh_token || '',
        1,
      ]
    );

    res.redirect(result.returnUrl || '/dashboard?platform=youtube&status=connected');
    return;
  })
);

/**
 * GET /api/oauth/callback/twitch
 * Handle Twitch OAuth callback
 */
router.get(
  '/callback/twitch',
  catchAsync(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new AppError('Missing authorization code or state', 400);
    }

    const result = await platformAuthManager.handleCallback('twitch', code as string, state as string);

    if (!result.valid) {
      return res.status(400).json({ error: 'Invalid authorization' });
    }

    // Save to database
    const db = getDatabase();
    const userId = (req as any).user?.id || 'unknown';

    db.run(
      `INSERT OR REPLACE INTO platforms (id, user_id, platform_name, access_token, refresh_token, is_connected, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        `${userId}-twitch`,
        userId,
        'twitch',
        result.token.access_token,
        result.token.refresh_token || '',
        1,
      ]
    );

    res.redirect(result.returnUrl || '/dashboard?platform=twitch&status=connected');
    return;
  })
);

/**
 * GET /api/oauth/disconnect/:platform
 * Disconnect a platform
 */
router.get(
  '/disconnect/:platform',
  catchAsync(async (req: Request, res: Response) => {
    const { platform } = req.params;
    const userId = (req as any).user?.id || 'unknown';

    const db = getDatabase();

    db.run('DELETE FROM platforms WHERE user_id = ? AND platform_name = ?', [userId, platform]);

    res.json({
      status: 'ok',
      message: `Disconnected from ${platform}`,
      platform,
    });
  })
);

export default router;
