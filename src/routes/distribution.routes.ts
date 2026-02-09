/**
 * Distribution Routes - Handle content publishing and analytics
 */

import { Router, Request, Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { MultiPlatformPublisher, YouTubePublisher, TwitchPublisher, RumblePublisher } from '../services/platform.integrations';
import { getDatabase } from '../database/init';

const router = Router();

/**
 * POST /api/distributions/publish
 * Publish content to one or more platforms
 */
router.post(
  '/publish',
  catchAsync(async (req: Request, res: Response) => {
    const { contentId, contentType, platformNames } = req.body;
    const userId = (req as any).user?.id;

    if (!contentId || !contentType || !platformNames || !Array.isArray(platformNames)) {
      throw new AppError('Missing required fields: contentId, contentType, platformNames', 400);
    }

    const db = getDatabase();
    const results: any = {};

    // Get platform credentials
    const platforms = await new Promise<any[]>((resolve, reject) => {
      db.all(
        'SELECT * FROM platforms WHERE user_id = ? AND platform_name IN (?, ?, ?)',
        [userId, 'youtube', 'twitch', 'rumble'],
        (err: any, platforms: any[]) => {
          if (err) reject(err);
          else resolve(platforms || []);
        }
      );
    });

    // Create platform-specific publishers (optional, for offline support)
    if (platforms.length > 0) {
      const youtubeOAuth = platforms.find((p) => p.platform_name === 'youtube');
      const twitchOAuth = platforms.find((p) => p.platform_name === 'twitch');
      const rumbleOAuth = platforms.find((p) => p.platform_name === 'rumble');

      const publisher = new MultiPlatformPublisher();

      if (youtubeOAuth) {
        publisher.setYouTube(
          new YouTubePublisher(youtubeOAuth.access_token, process.env.YOUTUBE_API_KEY || '')
        );
      }

      if (twitchOAuth) {
        publisher.setTwitch(
          new TwitchPublisher(
            process.env.TWITCH_CLIENT_ID || '',
            twitchOAuth.access_token,
            userId
          )
        );
      }

      if (rumbleOAuth) {
        publisher.setRumble(new RumblePublisher(process.env.RUMBLE_API_KEY || '', process.env.RUMBLE_CHANNEL_ID || ''));
      }
    }

    // Record distribution in database for each platform
    for (const platform of platformNames) {
      const distributionId = `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        await new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO distributions (id, content_id, content_type, platform_name, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [distributionId, contentId, contentType, platform, 'processing'],
            (err: any) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        results[platform] = { status: 'ok', distributionId };
      } catch (err: any) {
        results[platform] = { status: 'error', message: err.message };
      }
    }

    res.json({
      status: 'ok',
      contentId,
      platforms: results,
      message: `Publishing to ${platformNames.length} platform(s)`,
    });
  })
);

/**
 * GET /api/distributions/analytics
 * Get aggregated analytics across platforms
 */
router.get(
  '/analytics',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { days = 30 } = req.query;
    const db = getDatabase();

    // Query distributions with metrics
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT 
          d.platform_name,
          d.view_count || 0 as views,
          d.engagement_count || 0 as engagement,
          CASE 
            WHEN d.view_count > 0 THEN (d.engagement_count * 100.0 / d.view_count)
            ELSE 0
          END as engagement_rate
         FROM distributions d
         LEFT JOIN videos v ON d.content_id = v.id
         WHERE v.user_id = ? AND d.created_at >= datetime('now', '-' || ? || ' days')
         ORDER BY d.created_at DESC`,
        [userId, days],
        (err: any, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Aggregate by platform
    const byPlatform: any = {};
    let totalViews = 0;
    let totalEngagement = 0;

    rows.forEach((row: any) => {
      const { platform_name, views, engagement } = row;

      if (!byPlatform[platform_name]) {
        byPlatform[platform_name] = { views: 0, engagement: 0, count: 0 };
      }

      byPlatform[platform_name].views += views;
      byPlatform[platform_name].engagement += engagement;
      byPlatform[platform_name].count += 1;

      totalViews += views;
      totalEngagement += engagement;
    });

    // Convert to arrays and calculate engagement rates
    const analytics = Object.entries(byPlatform).map(([platform, data]: any) => ({
      platform,
      views: data.views,
      engagement: data.engagement,
      engagementRate: data.views > 0 ? (data.engagement * 100) / data.views : 0,
      contentCount: data.count,
    }));

    const avgEngagementRate = totalViews > 0 ? (totalEngagement * 100) / totalViews : 0;

    res.json({
      status: 'ok',
      period: `Last ${days} days`,
      summary: {
        totalViews,
        totalEngagement,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        platformCount: Object.keys(byPlatform).length,
      },
      analytics,
      data: rows,
    });
  })
);

/**
 * GET /api/distributions
 * List all distributions for user
 */
router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const db = getDatabase();

    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT d.* FROM distributions d
         WHERE EXISTS (
           SELECT 1 FROM videos v WHERE d.content_id = v.id AND v.user_id = ?
           UNION
           SELECT 1 FROM clips c WHERE d.content_id = c.id AND c.user_id = ?
         )
         ORDER BY d.created_at DESC
         LIMIT 100`,
        [userId, userId],
        (err: any, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({
      status: 'ok',
      count: rows.length,
      data: rows,
    });
  })
);

/**
 * GET /api/distributions/:id
 * Get specific distribution details
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM distributions WHERE id = ?', [id], (err: any, row: any) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!row) {
      throw new AppError('Distribution not found', 404);
    }

    res.json({
      status: 'ok',
      data: row,
    });
  })
);

/**
 * PATCH /api/distributions/:id/status
 * Update distribution status
 */
router.patch(
  '/:id/status',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, viewCount, engagementCount, contentUrl } = req.body;
    const db = getDatabase();

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE distributions 
         SET status = ?, view_count = COALESCE(?, view_count), 
             engagement_count = COALESCE(?, engagement_count),
             content_url = COALESCE(?, content_url),
             updated_at = datetime('now')
         WHERE id = ?`,
        [status, viewCount, engagementCount, contentUrl, id],
        (err: any) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      status: 'ok',
      distributionId: id,
      updated: { status, viewCount, engagementCount, contentUrl },
    });
  })
);

/**
 * DELETE /api/distributions/:id
 * Delete a distribution record
 */
router.delete(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM distributions WHERE id = ?', [id], (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      status: 'ok',
      message: 'Distribution record deleted',
      distributionId: id,
    });
  })
);

export default router;
