import { getDatabase } from '../database/init';
import { Thumbnail } from '../types/models';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class ThumbnailService {
  private db = getDatabase();

  async createThumbnail(thumbnail: Thumbnail): Promise<Thumbnail> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO thumbnails (id, source_id, source_type, size, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          thumbnail.id,
          thumbnail.source_id,
          thumbnail.source_type,
          thumbnail.size,
          thumbnail.status,
          thumbnail.created_at,
          thumbnail.updated_at,
        ],
        function (err) {
          if (err) {
            logger.error('Error creating thumbnail:', err);
            reject(err);
          } else {
            resolve(thumbnail);
          }
        }
      );
    });
  }

  async getThumbnailById(thumbnailId: string): Promise<Thumbnail | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM thumbnails WHERE id = ?';
      this.db.get(query, [thumbnailId], (err, row: any) => {
        if (err) {
          logger.error('Error getting thumbnail:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async getThumbnailsForSource(sourceId: string): Promise<Thumbnail[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM thumbnails WHERE source_id = ? ORDER BY created_at DESC';
      this.db.all(query, [sourceId], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting thumbnails:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async getUserThumbnails(userId: string): Promise<Thumbnail[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.* FROM thumbnails t
        WHERE t.source_id IN (
          SELECT id FROM videos WHERE user_id = ?
          UNION
          SELECT id FROM clips WHERE user_id = ?
          UNION
          SELECT id FROM shorts WHERE user_id = ?
        )
        ORDER BY t.created_at DESC
      `;
      this.db.all(query, [userId, userId, userId], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting user thumbnails:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async getThumbnailFilePath(thumbnailId: string): Promise<string | null> {
    const thumbnail = await this.getThumbnailById(thumbnailId);
    if (!thumbnail || !thumbnail.output_path) {
      return null;
    }
    return thumbnail.output_path;
  }

  async deleteThumbnail(thumbnailId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM thumbnails WHERE id = ?';
      this.db.run(query, [thumbnailId], (err) => {
        if (err) {
          logger.error('Error deleting thumbnail:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async generateThumbnail(thumbnailId: string, _timestamp?: number): Promise<void> {
    try {
      const thumbnail = await this.getThumbnailById(thumbnailId);
      if (!thumbnail) throw new Error('Thumbnail not found');

      // Update status
      await this.updateThumbnail(thumbnailId, { status: 'processing' });

      const thumbnailsDir = process.env.OUTPUT_THUMBNAILS_DIR || './output/thumbnails';
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
      }

      const outputPath = path.join(
        thumbnailsDir,
        `${thumbnailId}_${thumbnail.source_type}_${thumbnail.size}.jpg`
      );

      // Simulate thumbnail generation
      // In production, use FFmpeg: ffmpeg -i input.mp4 -ss TIMESTAMP -vframes 1 output.jpg
      await this.simulateThumbnailGeneration(outputPath);

      await this.updateThumbnail(thumbnailId, { status: 'ready', output_path: outputPath });

      logger.info(`Thumbnail ${thumbnailId} generated successfully`);
    } catch (error) {
      logger.error(`Error generating thumbnail ${thumbnailId}:`, error);
      await this.updateThumbnail(thumbnailId, { status: 'failed' });
    }
  }

  private async updateThumbnail(thumbnailId: string, updates: Partial<Thumbnail>): Promise<void> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['status', 'output_path', 'size'];
      const updateClause = allowedFields
        .filter((field) => field in updates)
        .map((field) => `${field} = ?`)
        .join(', ');

      if (!updateClause) {
        resolve();
        return;
      }

      const values = allowedFields
        .filter((field) => field in updates)
        .map((field) => (updates as any)[field]);

      values.push(new Date().toISOString());
      values.push(thumbnailId);

      const query = `UPDATE thumbnails SET ${updateClause}, updated_at = ? WHERE id = ?`;
      this.db.run(query, values, (err) => {
        if (err) {
          logger.error('Error updating thumbnail:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async simulateThumbnailGeneration(outputPath: string): Promise<void> {
    return new Promise((resolve) => {
      fs.writeFileSync(outputPath, '');
      setTimeout(resolve, 500);
    });
  }
}
