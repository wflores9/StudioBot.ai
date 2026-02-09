export const PLATFORMS = {
  YOUTUBE: 'youtube',
  TWITCH: 'twitch',
  RUMBLE: 'rumble',
} as const;

export const VIDEO_STATUSES = {
  PENDING: 'pending',
  DOWNLOADING: 'downloading',
  ANALYZING: 'analyzing',
  ANALYZED: 'analyzed',
  FAILED: 'failed',
} as const;

export const CLIP_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export const SHORT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export const THUMBNAIL_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export const DISTRIBUTION_STATUSES = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

export const CONTENT_TYPES = {
  VIDEO: 'video',
  CLIP: 'clip',
  SHORT: 'short',
} as const;

export const PLATFORM_CONFIG = {
  youtube: {
    name: 'YouTube',
    maxVideoSize: 128 * 1024 * 1024 * 1024, // 128GB
    maxVideoDuration: 12 * 60 * 60, // 12 hours
    supportedFormats: ['mp4', 'mov', 'avi', 'mkv'],
    requiredCredentials: ['access_token', 'channel_id'],
    shortVideoRequirements: {
      minDuration: 15, // seconds
      maxDuration: 60, // seconds
      resolution: '1080x1920',
    },
  },
  twitch: {
    name: 'Twitch',
    maxVideoSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxVideoDuration: 48 * 60 * 60, // 48 hours
    supportedFormats: ['mp4', 'mov', 'flv'],
    requiredCredentials: ['access_token', 'channel_id'],
  },
  rumble: {
    name: 'Rumble',
    maxVideoSize: 8 * 1024 * 1024 * 1024, // 8GB
    maxVideoDuration: 24 * 60 * 60, // 24 hours
    supportedFormats: ['mp4', 'mov', 'avi'],
    requiredCredentials: ['api_key'],
  },
};

export const THUMBNAIL_SIZES = {
  YOUTUBE: {
    width: 1280,
    height: 720,
    format: 'jpg',
  },
  TWITCH: {
    width: 1280,
    height: 720,
    format: 'jpg',
  },
  RUMBLE: {
    width: 1024,
    height: 576,
    format: 'jpg',
  },
};

export const SHORT_RESOLUTIONS = {
  '1080x1920': { width: 1080, height: 1920, aspectRatio: '9:16' },
  '720x1280': { width: 720, height: 1280, aspectRatio: '9:16' },
  '540x960': { width: 540, height: 960, aspectRatio: '9:16' },
};

export const VIDEO_PROCESSING_CONFIG = {
  tempDir: process.env.TEMP_VIDEO_DIR || './temp/videos',
  outputClipsDir: process.env.OUTPUT_CLIPS_DIR || './output/clips',
  outputShortsDir: process.env.OUTPUT_SHORTS_DIR || './output/shorts',
  outputThumbnailsDir: process.env.OUTPUT_THUMBNAILS_DIR || './output/thumbnails',
  maxFileSize: 2048 * 1024 * 1024, // 2GB
  allowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv'],
};

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
};

export const TIMEOUT_CONFIG = {
  VIDEO_DOWNLOAD: 30 * 60 * 1000, // 30 minutes
  VIDEO_ANALYSIS: 60 * 60 * 1000, // 1 hour
  CLIP_GENERATION: 15 * 60 * 1000, // 15 minutes
  SHORT_CONVERSION: 20 * 60 * 1000, // 20 minutes
  THUMBNAIL_GENERATION: 5 * 60 * 1000, // 5 minutes
  PLATFORM_PUBLISH: 30 * 60 * 1000, // 30 minutes
};
