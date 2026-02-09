import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
}

export class FFmpegService {
  /**
   * Extract audio from video file
   */
  async extractAudio(videoPath: string, outputPath?: string): Promise<string> {
    const audioPath = outputPath || videoPath.replace(path.extname(videoPath), '_audio.mp3');

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Audio extraction started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`[FFmpeg] Processing: ${progress.percent?.toFixed(1)}% done`);
        })
        .on('end', () => {
          console.log('[FFmpeg] Audio extraction completed:', audioPath);
          resolve(audioPath);
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Audio extraction error:', err);
          reject(err);
        })
        .save(audioPath);
    });
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('[FFmpeg] Metadata extraction error:', err);
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const result: VideoMetadata = {
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFps(videoStream.r_frame_rate || '0/1'),
          codec: videoStream.codec_name || 'unknown',
          bitrate: metadata.format.bit_rate || 0,
        };

        console.log('[FFmpeg] Video metadata extracted:', result);
        resolve(result);
      });
    });
  }

  /**
   * Extract a clip from video
   */
  async extractClip(
    videoPath: string,
    startTime: number,
    endTime: number,
    outputPath: string
  ): Promise<string> {
    const duration = endTime - startTime;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Clip extraction started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`[FFmpeg] Extracting clip: ${progress.percent?.toFixed(1)}% done`);
        })
        .on('end', () => {
          console.log('[FFmpeg] Clip extraction completed:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Clip extraction error:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(
    videoPath: string,
    timeInSeconds: number,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timeInSeconds],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1280x720',
        })
        .on('end', () => {
          console.log('[FFmpeg] Thumbnail generated:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Thumbnail generation error:', err);
          reject(err);
        });
    });
  }

  /**
   * Parse FPS from FFmpeg format (e.g., "30000/1001" or "30/1")
   */
  private parseFps(fpsString: string): number {
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      const numerator = parseInt(parts[0]);
      const denominator = parseInt(parts[1]);
      return numerator / denominator;
    }
    return parseFloat(fpsString);
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log('[FFmpeg] Cleaned up file:', filePath);
    } catch (error) {
      console.error('[FFmpeg] Cleanup error:', error);
    }
  }
}

export default new FFmpegService();
