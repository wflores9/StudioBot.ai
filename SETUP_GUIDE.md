# StudioBot.ai: Complete Setup & Getting Started Guide

## 🎯 Quick Start (5 minutes)

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- FFmpeg ([Installation Guide](#ffmpeg-installation))
- Git (optional, for version control)

### Installation

1. **Clone or extract the project**
   ```bash
   cd StudioBot.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the API**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

---

## 📋 Prerequisites & System Requirements

### System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 18.0 | 20.0+ |
| npm | 9.0 | 10.0+ |
| RAM | 2GB | 8GB+ |
| Disk | 1GB | 10GB+ |
| FFmpeg | Required | Latest |

### macOS Installation

```bash
# Using Homebrew
brew install ffmpeg
brew install node

# Verify installations
ffmpeg -version
node --version
npm --version
```

### Windows Installation

1. **Download & Install Node.js**
   - Visit https://nodejs.org/
   - Download LTS version
   - Run installer and follow prompts

2. **Download & Install FFmpeg**
   - Option A: Using Chocolatey
     ```powershell
     choco install ffmpeg
     ```
   - Option B: Manual download
     - Download from https://ffmpeg.org/download.html
     - Extract to `C:\Program Files\ffmpeg`
     - Add `C:\Program Files\ffmpeg\bin` to PATH

3. **Verify installation**
   ```powershell
   node --version
   npm --version
   ffmpeg -version
   ```

### Linux Installation

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm ffmpeg

# Fedora
sudo dnf install nodejs npm ffmpeg

# Arch
sudo pacman -S nodejs npm ffmpeg

# Verify
node --version
npm --version
ffmpeg -version
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Basic Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database (SQLite is default, PostgreSQL for production)
DB_TYPE=sqlite
DB_PATH=./data/studiobot.db

# For PostgreSQL:
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=studiobot
# DB_USER=studiobot
# DB_PASSWORD=strong_password

# YouTube
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_API_KEY=your_api_key
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/platforms/callback/youtube

# Twitch
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/api/platforms/callback/twitch

# Rumble
RUMBLE_API_KEY=your_api_key
RUMBLE_CHANNEL_ID=your_channel_id

# AI Services (Optional)
OPENAI_API_KEY=your_api_key
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
ANTHROPIC_API_KEY=your_api_key

# JWT
JWT_SECRET=your_secret_key_min_32_characters_long
JWT_EXPIRE=7d

# Storage
TEMP_VIDEO_DIR=./temp/videos
OUTPUT_DIR=./output
FFMPEG_PATH=/usr/bin/ffmpeg  # or C:\Program Files\ffmpeg\bin\ffmpeg.exe on Windows
```

---

## 🚀 Running StudioBot.ai

### Development Mode

```bash
# With hot-reload
npm run dev

# Watch TypeScript changes
npm run watch
```

### Production Mode

```bash
# Build
npm run build

# Start
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name "studiobot"
```

### Using Docker

```bash
# Build Docker image
docker build -t studiobot:latest .

# Run container
docker run -p 3000:3000 \
  -e YOUTUBE_CLIENT_ID=your_id \
  -e YOUTUBE_CLIENT_SECRET=your_secret \
  studiobot:latest

# Using Docker Compose (with PostgreSQL, Redis, Nginx)
docker-compose up -d
```

---

## 🧪 Testing the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-08T12:34:56.789Z"
}
```

### 2. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

Save the `token` from the response.

### 4. Upload Video

```bash
TOKEN="your_token_from_login"

curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=My First Video" \
  -F "sourceUrl=https://example.com/video.mp4" \
  -F "file=@video.mp4"
```

### 5. Get Your Videos

```bash
TOKEN="your_token_from_login"

curl http://localhost:3000/api/videos \
  -H "Authorization: Bearer $TOKEN"
```

### Run Complete Test Suite

```bash
# Run Node.js API tests
node test-api.js

# Run Jest unit tests (if configured)
npm test

# Run with coverage
npm test -- --coverage
```

---

## 📱 Using the CLI Tool

### Installation

```bash
# Build CLI
npm run build

# Install globally (optional)
npm link

# Or use directly with npx
npx ts-node cli/studiobot-cli.ts help
```

### Common Commands

```bash
# Register new user
studiobot-cli auth:register

# Login
studiobot-cli auth:login

# Upload video from URL
studiobot-cli video:upload

# List your videos
studiobot-cli video:list

# Create clip from video
studiobot-cli clip:create

# Check API status
studiobot-cli status

# Help
studiobot-cli help
```

---

## 🖥️ Building the React Dashboard

### Prerequisites

```bash
npm install -g create-react-app
```

### Setup Frontend

```bash
# Create React app
npx create-react-app dashboard

# Or use Vite for faster development
npm create vite@latest dashboard -- --template react-ts

# Install dependencies
cd dashboard
npm install

# Add SDK package
npm install ../sdk/studiobot-sdk.ts
```

### Dashboard Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── VideoUpload.tsx
│   │   ├── ClipEditor.tsx
│   │   ├── PlatformConnect.tsx
│   │   └── Analytics.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVideos.ts
│   │   └── useClips.ts
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
└── package.json
```

### Start Dashboard

```bash
cd dashboard
npm start

# Access at http://localhost:3000 (make sure API runs on :3001 or different port)
```

---

## 🔌 Integrating with Platforms

### Step 1: YouTube

1. Create Google Cloud project
2. Enable YouTube Data API
3. Create OAuth 2.0 credentials
4. Add to `.env`:
   ```bash
   YOUTUBE_CLIENT_ID=your_id
   YOUTUBE_CLIENT_SECRET=your_secret
   YOUTUBE_API_KEY=your_api_key
   ```

### Step 2: Twitch

1. Register at Twitch Developer
2. Create application
3. Get Client ID and Secret
4. Add to `.env`:
   ```bash
   TWITCH_CLIENT_ID=your_id
   TWITCH_CLIENT_SECRET=your_secret
   ```

### Step 3: Rumble

1. Create Rumble Creator account
2. Generate API key
3. Get Channel ID
4. Add to `.env`:
   ```bash
   RUMBLE_API_KEY=your_key
   RUMBLE_CHANNEL_ID=your_id
   ```

### Step 4: Test Publishing

```bash
TOKEN="your_token"

# Create a clip first
curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-123",
    "startTime": 10,
    "endTime": 25,
    "title": "Awesome Moment"
  }'

# Publish to YouTube
curl -X POST http://localhost:3000/api/distributions/publish \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "clip-123",
    "contentType": "clip",
    "platformName": "youtube"
  }'
```

---

## 📊 Database Setup

### SQLite (Development)

```bash
# Automatically created on first run at ./data/studiobot.db
# Check database:
sqlite3 data/studiobot.db ".tables"
```

### PostgreSQL (Production)

```bash
# Using Docker
docker run -d \
  --name studiobot-db \
  -e POSTGRES_DB=studiobot \
  -e POSTGRES_USER=studiobot \
  -e POSTGRES_PASSWORD=strongpassword \
  -p 5432:5432 \
  postgres:15

# Update .env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studiobot
DB_USER=studiobot
DB_PASSWORD=strongpassword

# Run migrations
npm run migrate:up
```

---

## 🐳 Docker Deployment

### Single Container

```bash
docker build -t studiobot:latest .
docker run -p 3000:3000 studiobot:latest
```

### Multi-Container with Docker Compose

```bash
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

Services included:
- **API**: Node.js Express server
- **PostgreSQL**: Main database
- **Redis**: Caching & job queue
- **Nginx**: Reverse proxy & load balancer

---

## 📈 Monitoring & Analytics

### Logs

Configure logging in `.env`:

```bash
LOG_LEVEL=debug  # trace, debug, info, warn, error
LOG_FORMAT=json  # json or text
```

Access logs:
```bash
tail -f logs/app.log
```

### Analytics Dashboard

```bash
# Get overall analytics
curl http://localhost:3000/api/distributions/analytics

# Get platform-specific stats
curl http://localhost:3000/api/distributions/analytics \
  -H "Authorization: Bearer $TOKEN"
```

### Performance Monitoring

```bash
# Using PM2
pm2 plus login
pm2 link <secret_key> <public_key>
pm2 start dist/index.js
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: `ENOENT: no such file or directory`
```bash
# Solution: Create required directories
mkdir -p data temp/videos output logs
```

**Issue**: `Error: EACCES: permission denied`
```bash
# Solution: Fix permissions
chmod -R 755 data temp output logs
```

**Issue**: `Error: listen EADDRINUSE :::3000`
```bash
# Solution: Change port or kill existing process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

**Issue**: FFmpeg not found
```bash
# Solution: Set correct path
# macOS/Linux
which ffmpeg

# Windows
where ffmpeg

# Update .env with full path
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### Useful Commands

```bash
# View database schema
sqlite3 data/studiobot.db ".schema"

# Clear database
rm data/studiobot.db

# Reset all logs
rm logs/*

# Check disk usage
du -sh data/ temp/ output/

# Monitor processes
top  # macOS/Linux
tasklist  # Windows
```

---

## ✅ Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure all platform API keys
- [ ] Set up SSL/TLS certificates
- [ ] Enable CORS for your domain
- [ ] Setup database backups
- [ ] Configure monitoring & alerts
- [ ] Setup error tracking (Sentry)
- [ ] Enable rate limiting
- [ ] Setup CI/CD pipeline
- [ ] Test disaster recovery
- [ ] Document runbooks

---

## 🆘 Getting Help

- **Documentation**: See [README.md](./README.md)
- **API Reference**: See [API.md](./API.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Platform Integration**: See [PLATFORM_INTEGRATION.md](./PLATFORM_INTEGRATION.md)
- **GitHub Issues**: Report bugs or request features
- **Discord Community**: Join our community for support

---

## 🎓 Next Steps

1. ✅ Complete setup & test API
2. ✅ Configure platform integrations
3. ✅ Build React dashboard
4. ✅ Create sample clips & publish
5. ✅ Monitor analytics
6. ✅ Deploy to production
7. ✅ Scale infrastructure

---

**Happy clipping! 🎬**
