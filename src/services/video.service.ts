import { getDatabase } from '../database/init';
import { Video, VideoAnalysis } from '../types/models';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import assemblyAIService from './assemblyai.service';
import ffmpegService from './ffmpeg.service';
import { ClipService } from './clip.service';

export class VideoService {
  private db = getDatabase();

  async createVideo(video: Video): Promise<Video> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO videos (id, user_id, title, description, source_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          video.id,
          video.user_id,
          video.title,
          video.description,
          video.source_url,
          video.status,
          video.created_at,
          video.updated_at,
        ],
        function (err) {
          if (err) {
            logger.error('Error creating video:', err);
            reject(err);
          } else {
            resolve(video);
          }
        }
      );
    });
  }

  async getVideoById(videoId: string): Promise<Video | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM videos WHERE id = ?';
      this.db.get(query, [videoId], (err, row: any) => {
        if (err) {
          logger.error('Error getting video:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async getUserVideos(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM videos WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      this.db.all(query, [userId, limit, offset], (err, rows: any[]) => {
        if (err) {
          logger.error('Error getting user videos:', err);
          reject(err);
        } else {
          resolve({
            data: rows,
            page,
            limit,
          });
        }
      });
    });
  }

  async updateVideo(videoId: string, updates: Partial<Video>): Promise<Video | null> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['title', 'description', 'status', 'analysis_data'];
      const updateClause = allowedFields
        .filter((field) => field in updates)
        .map((field) => `${field} = ?`)
        .join(', ');

      if (!updateClause) {
        resolve(null);
        return;
      }

      const values = allowedFields
        .filter((field) => field in updates)
        .map((field) => (updates as any)[field]);

      values.push(new Date().toISOString());
      values.push(videoId);

      const query = `UPDATE videos SET ${updateClause}, updated_at = ? WHERE id = ?`;
      this.db.run(query, values, async (err) => {
        if (err) {
          logger.error('Error updating video:', err);
          reject(err);
        } else {
          const updated = await this.getVideoById(videoId);
          resolve(updated);
        }
      });
    });
  }

  async deleteVideo(videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM videos WHERE id = ?';
      this.db.run(query, [videoId], (err) => {
        if (err) {
          logger.error('Error deleting video:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Analyze uploaded video file (NEW - Direct upload method)
   * No download needed - file is already on disk!
   */
  async analyzeUploadedVideo(videoId: string): Promise<void> {
    try {
      const video = await this.getVideoById(videoId);
      if (!video) throw new Error('Video not found');
      if (!video.local_path) throw new Error('Video file path not found');

      logger.info(`Starting analysis for uploaded video: ${videoId}`);

      // Analyze video (simulate AI analysis)
      await this.updateVideo(videoId, { status: 'analyzing' });
      const analysis = await this.analyzeVideo(video.local_path);

      await this.updateVideo(videoId, {
        status: 'analyzed',
        analysis_data: JSON.stringify(analysis),
      });

      logger.info(`Video ${videoId} analysis completed`);
    } catch (error) {
      logger.error(`Error analyzing video ${videoId}:`, error);
      await this.updateVideo(videoId, { status: 'failed' });
    }
  }

  /**
   * Download and analyze video from URL (Fallback method)
   */
  async downloadAndAnalyzeVideo(videoId: string): Promise<void> {
    try {
      const video = await this.getVideoById(videoId);
      if (!video) throw new Error('Video not found');

      // Update status to downloading
      await this.updateVideo(videoId, { status: 'downloading' });

      // Download video from URL
      const videosDir = process.env.TEMP_VIDEO_DIR || './temp/videos';
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      const videoPath = path.join(videosDir, `${videoId}.mp4`);
      await this.downloadFile(video.source_url, videoPath);

      // Get file info
      const fileSize = fs.statSync(videoPath).size;
      await this.updateVideo(videoId, { local_path: videoPath, file_size: fileSize });

      // Analyze video (simulate AI analysis)
      await this.updateVideo(videoId, { status: 'analyzing' });
      const analysis = await this.analyzeVideo(videoPath);

      await this.updateVideo(videoId, {
        status: 'analyzed',
        analysis_data: JSON.stringify(analysis),
      });

      logger.info(`Video ${videoId} analysis completed`);
    } catch (error) {
      logger.error(`Error processing video ${videoId}:`, error);
      await this.updateVideo(videoId, { status: 'failed' });
    }
  }

  async getVideoAnalysis(videoId: string): Promise<VideoAnalysis | null> {
    const video = await this.getVideoById(videoId);
    if (!video || !video.analysis_data) {
      return null;
    }
    return JSON.parse(video.analysis_data);
  }

  private async downloadFile(url: string, filePath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async analyzeVideo(videoPath: string): Promise<VideoAnalysis> {
    try {
      logger.info('[VideoService] Starting real AI analysis for:', videoPath);

      // Step 1: Extract video metadata
      const metadata = await ffmpegService.getVideoMetadata(videoPath);
      logger.info('[VideoService] Video metadata extracted:', metadata);

      // Step 2: Extract audio from video
      const audioPath = await ffmpegService.extractAudio(videoPath);
      logger.info('[VideoService] Audio extracted to:', audioPath);

      // Step 3: Transcribe and analyze with AssemblyAI
      const transcript = await assemblyAIService.transcribeAudio(audioPath);
      logger.info('[VideoService] Transcription completed. Text length:', transcript.text.length);

      // Step 4: Detect clips from transcript
      const clipCandidates = assemblyAIService.detectClips(transcript);
      logger.info(`[VideoService] Detected ${clipCandidates.length} clip candidates`);

      // Step 5: Get video record to extract user_id and video_id
      const videoFileName = path.basename(videoPath, path.extname(videoPath));
      // Extract video ID (handle both direct uploads and downloaded videos)
      const videoIdMatch = videoFileName.match(/^([a-f0-9-]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : videoFileName;
      const videoRecord = await this.getVideoById(videoId);

      if (!videoRecord) {
        logger.warn('[VideoService] Video record not found, skipping clip creation');
        throw new Error('Video record not found');
      }

      // Step 6: Save clips to database
      const clipService = new ClipService();

      for (let i = 0; i < clipCandidates.length; i++) {
        const candidate = clipCandidates[i];
        const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        await clipService.createClip({
          id: clipId,
          video_id: videoRecord.id,
          user_id: videoRecord.user_id,
          title: `Clip ${i + 1}: ${candidate.reason}`,
          description: `${candidate.sentiment} sentiment - Score: ${(candidate.score * 100).toFixed(0)}%\n\n${candidate.transcript.substring(0, 200)}`,
          start_time: candidate.start_time,
          end_time: candidate.end_time,
          duration: candidate.end_time - candidate.start_time,
          status: 'ready',
          approved: candidate.score >= 0.7,
          approval_notes: `AI Score: ${(candidate.score * 100).toFixed(0)}% - ${candidate.reason}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      logger.info(`[VideoService] Saved ${clipCandidates.length} clips to database`);

      // Step 6: Clean up temporary audio file
      await ffmpegService.cleanup(audioPath);

      // Step 7: Build analysis result
      const viralMoments = clipCandidates.map((clip) => ({
        startTime: clip.start_time,
        endTime: clip.end_time,
        confidence: clip.score,
        description: clip.reason,
        tags: [clip.sentiment.toLowerCase(), 'ai-detected'],
      }));

      const keyframes = clipCandidates.slice(0, 5).map((clip) => ({
        timestamp: clip.start_time,
        description: clip.key_moments.substring(0, 100),
      }));

      const analysis: VideoAnalysis = {
        viralMoments,
        summary: `AI detected ${clipCandidates.length} potential viral clips. Video duration: ${metadata.duration.toFixed(1)}s`,
        estimatedLength: metadata.duration,
        keyframes,
      };

      logger.info('[VideoService] AI analysis completed successfully');
      return analysis;

    } catch (error) {
      logger.error('[VideoService] AI analysis failed:', error);

      // Return fallback mock data if AI analysis fails
      logger.warn('[VideoService] Falling back to mock analysis data');
      return {
        viralMoments: [
          {
            startTime: 15,
            endTime: 45,
            confidence: 0.50,
            description: 'Mock clip (AI analysis failed)',
            tags: ['fallback', 'mock'],
          },
        ],
        summary: 'AI analysis failed - using fallback data',
        estimatedLength: 300,
        keyframes: [
          { timestamp: 15, description: 'Fallback keyframe' },
        ],
      };
    }
  }
}
