import { getDatabase } from '../database/init';
import { Clip } from '../types/models';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class ClipService {
  private db = getDatabase();

  async createClip(clip: Clip): Promise<Clip> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO clips (id, video_id, user_id, title, description, start_time, end_time, duration, status, approved, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          clip.id,
          clip.video_id,
          clip.user_id,
          clip.title,
          clip.description,
          clip.start_time,
          clip.end_time,
          clip.duration,
          clip.status,
          clip.approved ? 1 : 0,
          clip.created_at,
          clip.updated_at,
        ],
        function (err) {
          if (err) {
            logger.error('Error creating clip:', err);
            reject(err);
          } else {
            resolve(clip);
          }
        }
      );
    });
  }

  async getClipById(clipId: string): Promise<Clip | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clips WHERE id = ?';
      this.db.get(query, [clipId], (err, row: any) => {
        if (err) {
          logger.error('Error getting clip:', err);
          reject(err);
        } else {
          resolve(row ? { ...row, approved: Boolean(row.approved) } : null);
        }
      });
    });
  }

  async getVideoClips(videoId: string, page: number = 1, limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM clips WHERE video_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      this.db.all(query, [videoId, limit, offset], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting clips:', err);
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

  async getUserClips(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM clips WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      this.db.all(query, [userId, limit, offset], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting user clips:', err);
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

  async approveClip(clipId: string, approved: boolean, notes?: string): Promise<Clip | null> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE clips SET approved = ?, approval_notes = ?, updated_at = ? WHERE id = ?`;
      this.db.run(
        query,
        [approved ? 1 : 0, notes || null, new Date().toISOString(), clipId],
        async (err) => {
          if (err) {
            logger.error('Error approving clip:', err);
            reject(err);
          } else {
            const updated = await this.getClipById(clipId);
            resolve(updated);
          }
        }
      );
    });
  }

  async deleteClip(clipId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM clips WHERE id = ?';
      this.db.run(query, [clipId], (err) => {
        if (err) {
          logger.error('Error deleting clip:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async processClip(clipId: string): Promise<void> {
    try {
      const clip = await this.getClipById(clipId);
      if (!clip) throw new Error('Clip not found');

      // Update status
      await this.updateClip(clipId, { status: 'processing' });

      const clipsDir = process.env.OUTPUT_CLIPS_DIR || './output/clips';
      if (!fs.existsSync(clipsDir)) {
        fs.mkdirSync(clipsDir, { recursive: true });
      }

      const outputPath = path.join(clipsDir, `${clipId}.mp4`);

      // Simulate clip generation with FFmpeg command
      // In production, this would actually call FFmpeg
      await this.simulateClipGeneration(outputPath, clip.duration);

      // Update with output path
      await this.updateClip(clipId, { status: 'ready', output_path: outputPath });

      logger.info(`Clip ${clipId} processing completed`);
    } catch (error) {
      logger.error(`Error processing clip ${clipId}:`, error);
      await this.updateClip(clipId, { status: 'failed' });
    }
  }

  private async updateClip(clipId: string, updates: Partial<Clip>): Promise<void> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['status', 'output_path', 'approved', 'approval_notes'];
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
      values.push(clipId);

      const query = `UPDATE clips SET ${updateClause}, updated_at = ? WHERE id = ?`;
      this.db.run(query, values, (err) => {
        if (err) {
          logger.error('Error updating clip:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async simulateClipGeneration(outputPath: string, _duration: number): Promise<void> {
    // Simulate clip generation by creating an empty file
    // In production, use FFmpeg: ffmpeg -i input.mp4 -ss START -to END output.mp4
    return new Promise((resolve) => {
      fs.writeFileSync(outputPath, '');
      setTimeout(resolve, 1000);
    });
  }
}
