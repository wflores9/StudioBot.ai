import { getDatabase } from '../database/init';
import { Platform, Distribution, PlatformName } from '../types/models';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class PlatformService {
  private db = getDatabase();

  async connectPlatform(
    userId: string,
    platformName: PlatformName,
    credentials: any
  ): Promise<Platform> {
    const platformId = uuidv4();
    const platform: Platform = {
      id: platformId,
      user_id: userId,
      platform_name: platformName,
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      channel_id: credentials.channel_id,
      is_connected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO platforms (id, user_id, platform_name, access_token, refresh_token, channel_id, is_connected, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          platform.id,
          platform.user_id,
          platform.platform_name,
          platform.access_token,
          platform.refresh_token,
          platform.channel_id,
          platform.is_connected ? 1 : 0,
          platform.created_at,
          platform.updated_at,
        ],
        function (err) {
          if (err) {
            logger.error('Error connecting platform:', err);
            reject(err);
          } else {
            resolve(platform);
          }
        }
      );
    });
  }

  async getUserPlatforms(userId: string): Promise<Platform[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM platforms WHERE user_id = ? AND is_connected = 1';
      this.db.all(query, [userId], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting user platforms:', err);
          reject(err);
        } else {
          resolve(
            (rows || []).map((r) => ({
              ...r,
              is_connected: Boolean(r.is_connected),
            }))
          );
        }
      });
    });
  }

  async publishContent(
    _userId: string,
    platformName: PlatformName,
    contentId: string,
    contentType: 'clip' | 'short' | 'video',
    _metadata?: any
  ): Promise<Distribution> {
    const distributionId = uuidv4();
    const distribution: Distribution = {
      id: distributionId,
      content_id: contentId,
      content_type: contentType,
      platform_name: platformName,
      status: 'publishing',
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO distributions (id, content_id, content_type, platform_name, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          distribution.id,
          distribution.content_id,
          distribution.content_type,
          distribution.platform_name,
          distribution.status,
          distribution.created_at,
          distribution.updated_at,
        ],
        async (err) => {
          if (err) {
            logger.error('Error creating distribution:', err);
            reject(err);
          } else {
            // Start async publishing
            this.publishToProvider(
              platformName,
              contentId,
              contentType,
              distributionId,
              _metadata
            ).catch((err) => {
              logger.error('Error publishing to provider:', err);
            });
            resolve(distribution);
          }
        }
      );
    });
  }

  async getDistributionHistory(contentId: string): Promise<Distribution[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM distributions WHERE content_id = ? ORDER BY created_at DESC';
      this.db.all(query, [contentId], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting distributions:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async getAnalytics(userId: string, platformName: PlatformName): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          d.platform_name,
          COUNT(d.id) as total_posts,
          SUM(d.view_count) as total_views,
          AVG(d.view_count) as avg_views
        FROM distributions d
        WHERE d.platform_name = ? AND EXISTS (
          SELECT 1 FROM clips c WHERE c.id = d.content_id AND c.user_id = ?
        )
        GROUP BY d.platform_name
      `;
      this.db.get(query, [platformName, userId], (err, row: any) => {
        if (err) {
          logger.error('Error getting analytics:', err);
          reject(err);
        } else {
          resolve(
            row || {
              total_posts: 0,
              total_views: 0,
              avg_views: 0,
            }
          );
        }
      });
    });
  }

  async disconnectPlatform(platformId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE platforms SET is_connected = 0, updated_at = ? WHERE id = ?';
      this.db.run(query, [new Date().toISOString(), platformId], (err) => {
        if (err) {
          logger.error('Error disconnecting platform:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async publishToProvider(
    platformName: PlatformName,
    contentId: string,
    contentType: string,
    distributionId: string,
    _metadata?: any
  ): Promise<void> {
    try {
      // Simulate API calls to each platform
      logger.info(`Publishing ${contentType} ${contentId} to ${platformName}`);

      // In production, make actual API calls:
      // - YouTube: google-auth-library and youtube API
      // - Twitch: twitch API
      // - Rumble: rumble API

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update distribution status
      const query = `UPDATE distributions SET status = ?, platform_post_id = ?, published_at = ?, updated_at = ? WHERE id = ?`;
      this.db.run(
        query,
        [
          'published',
          `${platformName}_${contentId}`,
          new Date().toISOString(),
          new Date().toISOString(),
          distributionId,
        ],
        (err) => {
          if (err) {
            logger.error('Error updating distribution:', err);
          } else {
            logger.info(`Successfully published ${contentType} to ${platformName}`);
          }
        }
      );
    } catch (error) {
      logger.error('Error publishing to provider:', error);
      const query = `UPDATE distributions SET status = ?, updated_at = ? WHERE id = ?`;
      this.db.run(
        query,
        ['failed', new Date().toISOString(), distributionId],
        (err) => {
          if (err) logger.error('Error updating distribution status:', err);
        }
      );
    }
  }
}
