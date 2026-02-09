# StudioBot.ai Configuration Guide

## Environment Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Update Configuration Values

#### Server Configuration
```env
PORT=3000
NODE_ENV=development
```

#### Database Setup
```env
DATABASE_PATH=./data/studiobot.db
```

The database file will be automatically created on first run.

#### Video Processing Paths
```env
# Temporary storage for downloaded videos
TEMP_VIDEO_DIR=./temp/videos

# Output directories
OUTPUT_CLIPS_DIR=./output/clips
OUTPUT_SHORTS_DIR=./output/shorts
OUTPUT_THUMBNAILS_DIR=./output/thumbnails
```

Directories are created automatically if they don't exist.

#### Logging Configuration
```env
LOG_LEVEL=debug  # debug, info, warn, error
LOG_FILE=./logs/app.log
```

#### Platform API Keys

##### YouTube Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (StudioBot.ai)
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Authorized redirect URI: http://localhost:3000/auth/youtube/callback)
5. Add API key and credentials to .env:

```env
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

##### Twitch Setup
1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click "Create Application"
3. Select "Application Type: Public"
4. Accept terms and create
5. Generate OAuth Token
6. Add to .env:

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_ACCESS_TOKEN=your_access_token_here
```

##### Rumble Setup
1. Visit [Rumble Creator Studio](https://rumble.com/account/creator/)
2. API Settings → Generate API Key
3. Add to .env:

```env
RUMBLE_API_KEY=your_api_key_here
RUMBLE_CHANNEL_ID=your_channel_id_here
```

#### Authentication
```env
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
```

Generate random secrets:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## FFmpeg Installation

StudioBot.ai uses FFmpeg for video processing. Install it before running:

### macOS
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt-get install ffmpeg
```

### Windows
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract and add to PATH
3. Verify: `ffmpeg -version`

### Docker
If using Docker, FFmpeg is included in the base image.

---

## Database Configuration

### SQLite3 (Default)

The database is automatically initialized on server startup. The schema includes:
- Users table
- Videos table
- Clips table
- Shorts table
- Thumbnails table
- Platforms table
- Distributions table

**Database file location:** `./data/studiobot.db`

### Backup Database
```bash
cp ./data/studiobot.db ./data/studiobot.db.backup
```

### Reset Database
```bash
rm ./data/studiobot.db
# Restart server to reinitialize
```

---

## Advanced Configuration

### FFmpeg Custom Options

For video processing optimization, edit the clip and short processing in respective service files:

**For Clip Creation** (`src/services/clip.service.ts`):
```typescript
// Customize FFmpeg parameters
const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -to ${endTime} -c:v libx264 -preset fast "${outputPath}"`;
```

**For Short Conversion** (`src/services/short.service.ts`):
```typescript
// Custom scaling and padding for vertical format
const command = `ffmpeg -i "${inputPath}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:-1:-1:color=black" "${outputPath}"`;
```

### Custom Logging

Modify log levels per module by editing `src/utils/logger.ts`:

```typescript
class Logger {
  private currentLogLevel: LogLevel;

  constructor() {
    const envLevel = (process.env.LOG_LEVEL || 'info').toUpperCase();
    this.currentLogLevel = LogLevel[envLevel as keyof typeof LogLevel] as LogLevel;
  }
}
```

---

## Deployment Configuration

### Production Setup

1. **Environment**: Set `NODE_ENV=production`
2. **Security**: 
   - Generate strong JWT_SECRET and SESSION_SECRET
   - Use environment variables for all secrets
   - Enable HTTPS
3. **Logging**: Set `LOG_LEVEL=info` (reduce verbosity)
4. **Database**: Consider PostgreSQL for production
5. **Storage**: Use cloud storage (AWS S3, Google Cloud Storage) for media files

### Docker Configuration

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  studiobot:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_PATH: /app/data/studiobot.db
    volumes:
      - ./data:/app/data
      - ./output:/app/output
      - ./logs:/app/logs
```

Run with Docker:
```bash
docker-compose up
```

---

## Performance Tuning

### Database Optimization
```sql
-- Create indexes for faster queries
CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_clips_video ON clips(video_id);
CREATE INDEX idx_clips_user ON clips(user_id);
CREATE INDEX idx_shorts_user ON shorts(user_id);
CREATE INDEX idx_distributions_content ON distributions(content_id);
CREATE INDEX idx_distributions_platform ON distributions(platform_name);
```

### Memory Management
For large video processing, set Node.js memory limit:
```bash
node --max-old-space-size=4096 dist/index.js
```

### Video Processing Settings
Adjust FFmpeg presets in services for speed vs quality:
- `ultrafast` - Speed priority
- `fast` - Balanced (default)
- `slow` - Quality priority

---

## Troubleshooting

### Database Issues
**Problem:** "SQLITE_CANTOPEN error"
**Solution:** Run `mkdir -p ./data` before starting server

### FFmpeg Not Found
**Problem:** "ffmpeg command not found"
**Solution:** Install FFmpeg and verify it's in PATH: `which ffmpeg`

### Port Already in Use
**Problem:** "EADDRINUSE :::3000"
**Solution:** Change PORT in .env or kill process: `lsof -ti:3000 | xargs kill -9`

### API Connection Issues
**Problem:** "Cannot reach http://localhost:3000"
**Solution:** Verify server is running: `curl http://localhost:3000/health`

---

## Security Best Practices

1. **Never commit .env** - Add to .gitignore
2. **Rotate secrets** - Periodically regenerate API keys
3. **Check logs** - Review `./logs/app.log` for errors
4. **Validate inputs** - API validates all inputs
5. **Use HTTPS** - Required for production
6. **Secure database** - Use strong file permissions
   ```bash
   chmod 600 ./data/studiobot.db
   ```

---

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-08T10:30:00.000Z"
}
```

### Log Monitoring
```bash
tail -f ./logs/app.log
```

### Database Size
```bash
ls -lh ./data/studiobot.db
```

---

## Backup & Recovery

### Regular Backups
```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp ./data/studiobot.db $BACKUP_DIR/studiobot_$TIMESTAMP.db
```

### Restore from Backup
```bash
cp ./backups/studiobot_YYYYMMDD_HHMMSS.db ./data/studiobot.db
```

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Install FFmpeg
3. ✅ Start the server
4. ✅ Create a test user account
5. ✅ Upload a test video
6. ✅ Test the API workflow

For more details, see [README.md](./README.md) and [API.md](./API.md)
