# StudioBot.ai Platform Integration Guide

## Overview

This guide covers setting up integrations with YouTube, Twitch, and Rumble for StudioBot.ai's multi-platform publishing capabilities.

## Table of Contents

1. [YouTube Integration](#youtube-integration)
2. [Twitch Integration](#twitch-integration)
3. [Rumble Integration](#rumble-integration)
4. [Environment Configuration](#environment-configuration)
5. [OAuth Flow Setup](#oauth-flow-setup)
6. [Testing Integrations](#testing-integrations)

---

## YouTube Integration

### Prerequisites

- Google Cloud Project with YouTube Data API enabled
- OAuth 2.0 credentials (Client ID and Client Secret)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "StudioBot.ai"
3. Enable APIs:
   - YouTube Data API v3
   - YouTube Analytics API (optional, for analytics)

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: "Web application"
3. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/platforms/callback/youtube
   https://yourdomain.com/api/platforms/callback/youtube (production)
   ```
4. Copy the **Client ID** and **Client Secret**

### Step 3: Add to .env

```bash
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/platforms/callback/youtube
```

### Usage Example

```typescript
import { YouTubePublisher } from './services/platform.integrations';

const publisher = new YouTubePublisher(accessToken, apiKey);

// Upload video
const result = await publisher.uploadVideo(filePath, {
  title: 'My Viral Clip',
  description: 'This is an awesome clip from my stream',
  tags: ['gaming', 'highlights', 'viral'],
  categoryId: '20', // Gaming
  privacyStatus: 'public',
});

// Get analytics
const analytics = await publisher.getAnalytics(videoId);
```

---

## Twitch Integration

### Prerequisites

- Twitch Developer Account
- OAuth 2.0 credentials (Client ID and Client Secret)

### Step 1: Register Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application
3. Application Category: "Video Integration Service"
4. OAuth Redirect URLs:
   ```
   http://localhost:3000/api/platforms/callback/twitch
   https://yourdomain.com/api/platforms/callback/twitch (production)
   ```
5. Copy the **Client ID** and create a **Client Secret**

### Step 2: Add to .env

```bash
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_REDIRECT_URI=http://localhost:3000/api/platforms/callback/twitch
```

### Usage Example

```typescript
import { TwitchPublisher } from './services/platform.integrations';

const publisher = new TwitchPublisher(clientId, accessToken, userId);

// Upload VOD
const result = await publisher.uploadVideo(filePath, {
  title: 'Highlights from Today',
  description: 'Best moments from the stream',
  language: 'en',
});

// Get channel info
const channel = await publisher.getChannelInfo();

// Update channel
await publisher.updateChannelInfo(
  'New Title',
  'Updated description'
);
```

---

## Rumble Integration

### Prerequisites

- Rumble Creator Account
- API Key

### Step 1: Get API Key

1. Go to [Rumble Creator Dashboard](https://rumble.com/creator)
2. Navigate to Settings → API Keys
3. Generate a new API key
4. Save your **Channel ID** (visible in account settings)

### Step 2: Add to .env

```bash
RUMBLE_API_KEY=your_api_key_here
RUMBLE_CHANNEL_ID=your_channel_id_here
```

### Usage Example

```typescript
import { RumblePublisher } from './services/platform.integrations';

const publisher = new RumblePublisher(apiKey, channelId);

// Upload video
const result = await publisher.uploadVideo(filePath, {
  title: 'Amazing Content',
  description: 'Check this out!',
  tags: ['entertainment', 'highlights'],
});

// Get analytics
const stats = await publisher.getAnalytics(videoId);
```

---

## Environment Configuration

### Complete .env Template

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database
DB_TYPE=sqlite # or postgres
DB_PATH=./data/studiobot.db
DB_HOST=localhost
DB_PORT=5432
DB_USER=studiobot
DB_PASSWORD=your_db_password
DB_NAME=studiobot

# YouTube Integration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/platforms/callback/youtube
YOUTUBE_API_KEY=your_youtube_api_key

# Twitch Integration
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/api/platforms/callback/twitch

# Rumble Integration
RUMBLE_API_KEY=your_rumble_api_key
RUMBLE_CHANNEL_ID=your_rumble_channel_id

# AI Services
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
ANTHROPIC_API_KEY=your_anthropic_api_key

# Video Processing
FFMPEG_PATH=/usr/bin/ffmpeg
MAX_VIDEO_SIZE=5120M # 5GB
TEMP_VIDEO_DIR=./temp/videos

# JWT Tokens
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

---

## OAuth Flow Setup

### 1. Request Handler

Add this route to your API to initiate OAuth:

```typescript
// GET /api/platforms/auth/:platform
router.get('/auth/:platform', async (req, res) => {
  const { platform } = req.params;
  const returnUrl = req.query.return_to || '/dashboard';
  
  const authManager = new PlatformAuthManager(
    {
      clientId: process.env.YOUTUBE_CLIENT_ID!,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirectUri: process.env.YOUTUBE_REDIRECT_URI!,
    },
    // ... other platforms
  );

  const authUrl = authManager.getAuthorizationUrl(
    platform as 'youtube' | 'twitch' | 'rumble',
    returnUrl
  );

  res.redirect(authUrl);
});
```

### 2. Callback Handler

```typescript
// GET /api/platforms/callback/:platform
router.get('/callback/:platform', async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query;

  const authManager = new PlatformAuthManager(/* config */);

  const result = await authManager.handleCallback(
    platform as 'youtube' | 'twitch' | 'rumble',
    code as string,
    state as string
  );

  if (!result.valid) {
    return res.status(400).json({ error: 'Invalid authorization' });
  }

  // Save token to database
  await db.platforms.save({
    userId: req.user.id,
    platformName: platform,
    accessToken: result.token.access_token,
    refreshToken: result.token.refresh_token,
    expiresAt: new Date(Date.now() + result.token.expires_in * 1000),
    isConnected: true,
  });

  // Redirect back
  res.redirect(result.returnUrl || '/dashboard');
});
```

---

## Testing Integrations

### 1. Test File Upload

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Video" \
  -F "file=@test-video.mp4"
```

### 2. Test Clip Creation

```bash
curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-123",
    "startTime": 10.5,
    "endTime": 25.3
  }'
```

### 3. Test Publishing

```bash
curl -X POST http://localhost:3000/api/distributions/publish \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "clip-123",
    "contentType": "clip",
    "platformName": "youtube"
  }'
```

### 4. Test Analytics

```bash
curl http://localhost:3000/api/distributions/analytics \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### YouTube Issues

**Problem**: "Invalid Client ID"
- Solution: Verify credentials in .env match Google Cloud Console
- Check redirect URIs are properly configured

**Problem**: "Access Denied"
- Solution: User must grant YouTube upload permissions
- Check OAuth scope includes `youtube.upload`

### Twitch Issues

**Problem**: "Authentication Failed"
- Solution: Verify Client ID and Secret are correct
- Check redirect URI matches exactly (case-sensitive)

**Problem**: "Insufficient Permissions"
- Solution: User must have broadcaster permissions
- Refresh token and request new scopes

### Rumble Issues

**Problem**: "Invalid API Key"
- Solution: Verify API key in Rumble Creator Dashboard
- Check key hasn't expired

**Problem**: "Channel Not Found"
- Solution: Verify Channel ID is correct
- User must be creator on Rumble

### General Issues

**Problem**: "CORS Error"
- Solution: Update CORS_ORIGIN in .env with correct domain
- Restart server after changes

**Problem**: "Database Connection Error"
- Solution: Check DATABASE_URL or DB_* environment variables
- Ensure database service is running

---

## Advanced Configuration

### Custom OAuth Provider

To add a custom platform OAuth:

```typescript
class CustomPlatformOAuth {
  getAuthorizationUrl(state: string): string {
    // Your implementation
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    // Your implementation
  }
}
```

### Webhook Events

Enable real-time notifications:

```bash
WEBHOOK_SECRET=your_webhook_secret
REDIS_URL=redis://localhost:6379
```

### Rate Limiting

```bash
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Next Steps

1. ✅ Set up YouTube integration
2. ✅ Configure Twitch integration
3. ✅ Add Rumble API access
4. ✅ Test OAuth flows
5. ✅ Deploy to production
6. ✅ Monitor analytics aggregation

For more details, refer to official platform documentation:
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Twitch API](https://dev.twitch.tv/docs)
- [Rumble API](https://rumble.com/api)
