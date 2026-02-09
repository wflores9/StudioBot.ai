import { getDatabase } from '../database/init';
import { Short } from '../types/models';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class ShortService {
  private db = getDatabase();

  async createShort(short: Short): Promise<Short> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO shorts (id, clip_id, user_id, title, description, duration, resolution, status, approved, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          short.id,
          short.clip_id,
          short.user_id,
          short.title,
          short.description,
          short.duration,
          short.resolution,
          short.status,
          short.approved ? 1 : 0,
          short.created_at,
          short.updated_at,
        ],
        function (err) {
          if (err) {
            logger.error('Error creating short:', err);
            reject(err);
          } else {
            resolve(short);
          }
        }
      );
    });
  }

  async getShortById(shortId: string): Promise<Short | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM shorts WHERE id = ?';
      this.db.get(query, [shortId], (err, row: any) => {
        if (err) {
          logger.error('Error getting short:', err);
          reject(err);
        } else {
          resolve(row ? { ...row, approved: Boolean(row.approved) } : null);
        }
      });
    });
  }

  async getUserShorts(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM shorts WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      this.db.all(query, [userId, limit, offset], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting shorts:', err);
          reject(err);
        } else {
          resolve({
            data: rows.map((r) => ({ ...r, approved: Boolean(r.approved) })),
            page,
            limit,
          });
        }
      });
    });
  }

  async approveShort(shortId: string, approved: boolean): Promise<Short | null> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE shorts SET approved = ?, updated_at = ? WHERE id = ?`;
      this.db.run(
        query,
        [approved ? 1 : 0, new Date().toISOString(), shortId],
        async (err) => {
          if (err) {
            logger.error('Error approving short:', err);
            reject(err);
          } else {
            const updated = await this.getShortById(shortId);
            resolve(updated);
          }
        }
      );
    });
  }

  async deleteShort(shortId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM shorts WHERE id = ?';
      this.db.run(query, [shortId], (err) => {
        if (err) {
          logger.error('Error deleting short:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async convertClipToShort(clipId: string, userId: string, title: string, description: string): Promise<Short | null> {
    try {
      // Get clip information
      const clip = await this.getClipFromDb(clipId);
      if (!clip) throw new Error('Clip not found');

      const shortId = require('uuid').v4();
      const shortsDir = process.env.OUTPUT_SHORTS_DIR || './output/shorts';
      if (!fs.existsSync(shortsDir)) {
        fs.mkdirSync(shortsDir, { recursive: true });
      }

      const outputPath = path.join(shortsDir, `${shortId}.mp4`);

      // Create short record
      const short: Short = {
        id: shortId,
        clip_id: clipId,
        user_id: userId,
        title,
        description,
        output_path: undefined,
        duration: clip.duration,
        resolution: '1080x1920',
        status: 'pending',
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const createdShort = await this.createShort(short);

      // Start async conversion
      this.processShortConversion(shortId, clip.output_path, outputPath).catch((err) => {
        logger.error('Error converting clip to short:', err);
      });

      return createdShort;
    } catch (error) {
      logger.error('Error creating short from clip:', error);
      return null;
    }
  }

  private async processShortConversion(shortId: string, _inputPath: string, outputPath: string): Promise<void> {
    try {
      await this.updateShort(shortId, { status: 'processing' });

      // Simulate video conversion using FFmpeg
      // ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:-1:-1:color=black" output.mp4
      await this.simulateShortConversion(outputPath);

      await this.updateShort(shortId, { status: 'ready', output_path: outputPath });
      logger.info(`Short ${shortId} conversion completed`);
    } catch (error) {
      logger.error(`Error processing short ${shortId}:`, error);
      await this.updateShort(shortId, { status: 'failed' });
    }
  }

  private async updateShort(shortId: string, updates: Partial<Short>): Promise<void> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['status', 'output_path', 'approved', 'duration'];
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
      values.push(shortId);

      const query = `UPDATE shorts SET ${updateClause}, updated_at = ? WHERE id = ?`;
      this.db.run(query, values, (err) => {
        if (err) {
          logger.error('Error updating short:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async getClipFromDb(clipId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clips WHERE id = ?';
      this.db.get(query, [clipId], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private async simulateShortConversion(outputPath: string): Promise<void> {
    return new Promise((resolve) => {
      fs.writeFileSync(outputPath, '');
      setTimeout(resolve, 1500);
    });
  }
}
