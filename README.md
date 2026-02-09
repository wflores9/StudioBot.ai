# StudioBot.ai - AI-Powered Video Analysis & Multi-Platform Distribution

StudioBot.ai is a sophisticated AI software platform that analyzes videos submitted via URL, automatically identifies viral moments, creates optimized clips and shorts, generates compelling thumbnails, and distributes content across multiple platforms (YouTube, Twitch, Rumble) with user approval workflows.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Workflow](#workflow)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### Core Capabilities

1. **Video Ingestion**
   - Accept videos via URL
   - Automatic download and storage
   - Support for multiple formats
   - File size and duration validation

2. **AI Video Analysis**
   - Automated viral moment detection
   - Confidence scoring for each moment
   - Keyframe identification
   - Content tagging and categorization
   - Time-coded segment analysis

3. **Content Creation**
   - Automatic clip generation from viral moments
   - Vertical video format conversion (Shorts/Reels)
   - Smart thumbnail generation
   - Multiple resolution support
   - Batch processing capabilities

4. **User Approval Workflow**
   - Review clips before publishing
   - Approval/rejection with notes
   - Batch approval operations
   - Content curation dashboard

5. **Multi-Platform Distribution**
   - YouTube integration (upload, schedule, publish)
   - Twitch integration (stream, upload VOD)
   - Rumble integration (content upload)
   - Platform-specific formatting
   - Simultaneous multi-platform publishing

6. **Analytics & Management**
   - Real-time view counts
   - Engagement metrics
   - Distribution history
   - Platform-specific analytics
   - Content performance tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   StudioBot.ai Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Express.js API Server (Node.js)              │  │
│  │  Port: 3000 (configurable via .env)                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│        ┌─────────────────┼─────────────────┐                 │
│        │                 │                 │                 │
│  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐        │
│  │ Auth Routes  │  │ Video Routes │ │ Clip Routes  │        │
│  │ /api/auth    │  │ /api/videos  │ │ /api/clips   │        │
│  └──────────────┘  └──────────────┘ └──────────────┘        │
│        │                 │                 │                 │
│  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐        │
│  │Short Routes  │  │Thumbnail Rtes│ │Platform Rtes │        │
│  │/api/shorts   │  │/api/thumbnls │ │/api/platforms│        │
│  └──────────────┘  └──────────────┘ └──────────────┘        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Service Layer (Business Logic)             │  │
│  │  • VideoService    • ClipService                        │  │
│  │  • ShortService    • ThumbnailService                   │  │
│  │  • PlatformService • AuthService                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Data Layer (SQLite Database)                 │  │
│  │  • Users • Videos • Clips • Shorts                      │  │
│  │  • Thumbnails • Platforms • Distributions              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           File Storage & Processing                     │  │
│  │  • FFmpeg (video processing)                            │  │
│  │ • Temp storage: ./temp/videos                          │  │
│  │  • Output: ./output/{clips,shorts,thumbnails}          │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    ┌───▼────┐        ┌───▼────┐       ┌───▼────┐
    │ YouTube │        │ Twitch │       │ Rumble │
    │   API   │        │  API   │       │  API   │
    └────────┘        └────────┘       └────────┘
```

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite 3
- **API Clients**: Axios
- **Video Processing**: FFmpeg (integrated via Node.js)

### Development
- **Transpiler**: TypeScript Compiler (tsc)
- **Dev Server**: ts-node
- **Linting**: ESLint
- **Testing**: Jest

### External Integration
- YouTube Data API v3
- Twitch API
- Rumble API

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- FFmpeg installed on system
- Git

### Step 1: Clone Repository
```bash
cd c:\Users\wflor\OneDrive\StudioBot.ai
git init
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Step 4: Build Project
```bash
npm run build
```

### Step 5: Initialize Database
The database is automatically initialized on server startup.

### Step 6: Start Development Server
```bash
npm run dev
```

### Step 7: Start Production Server
```bash
npm run build
npm start
```

## 🖥️ UI Development — Web + Desktop

Quick commands to run the Next web UI and Electron desktop app locally.

Start the web dev server (Next.js, port 3001):
```bash
cd ui/web
npm run dev
```

Start Electron after the web server is ready (Windows PowerShell):
```powershell
cd ui/desktop
npm run dev:wait
# or run the small PowerShell helper directly:
# .\scripts\run-electron.ps1
```

Start both (cross-platform) from repo root:
```bash
npm run dev:all
```

Notes:
- `dev:all` uses `concurrently` (added to root `devDependencies`).
- `ui/desktop/scripts/run-electron.js` and `run-electron.ps1` wait for the web URL before launching Electron.


## 📁 Project Structure

```
StudioBot.ai/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── database/
│   │   └── init.ts             # Database initialization & schema
│   ├── routes/
│   │   ├── auth.routes.ts       # Authentication endpoints
│   │   ├── video.routes.ts      # Video management endpoints
│   │   ├── clip.routes.ts       # Clip management endpoints
│   │   ├── short.routes.ts      # Shorts/Vertical video endpoints
│   │   ├── thumbnail.routes.ts  # Thumbnail generation endpoints
│   │   └── platform.routes.ts   # Platform integration endpoints
│   ├── services/
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── video.service.ts     # Video processing logic
│   │   ├── clip.service.ts      # Clip generation logic
│   │   ├── short.service.ts     # Shorts conversion logic
│   │   ├── thumbnail.service.ts # Thumbnail generation logic
│   │   └── platform.service.ts  # Platform publishing logic
│   ├── middleware/
│   │   └── errorHandler.ts      # Global error handling
│   ├── types/
│   │   └── models.ts            # TypeScript type definitions
│   └── utils/
│       └── logger.ts            # Logging utility
├── dist/                        # Compiled JavaScript (generated)
├── temp/                        # Temporary video storage
├── output/                      # Output files (clips, shorts, thumbnails)
├── logs/                        # Application logs
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGc..."
  }
}
```

### Video Endpoints

#### Upload Video from URL
```
POST /api/videos/upload
Content-Type: application/json

{
  "user_id": "user_uuid",
  "source_url": "https://example.com/video.mp4",
  "title": "Amazing Action Video",
  "description": "Optional video description"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "video_uuid",
    "user_id": "user_uuid",
    "title": "Amazing Action Video",
    "source_url": "https://example.com/video.mp4",
    "status": "pending",
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Video upload initiated. Processing started."
}
```

#### Get Video Analysis
```
GET /api/videos/:videoId/analysis

Response: 200 OK
{
  "status": "success",
  "data": {
    "viralMoments": [
      {
        "startTime": 15,
        "endTime": 45,
        "confidence": 0.95,
        "description": "High-energy action sequence",
        "tags": ["action", "engaging", "viral"]
      }
    ],
    "summary": "Video contains 2 major viral moments",
    "estimatedLength": 300,
    "keyframes": [...]
  }
}
```

### Clip Endpoints

#### Create Clip
```
POST /api/clips/create
Content-Type: application/json

{
  "video_id": "video_uuid",
  "user_id": "user_uuid",
  "title": "Epic Moment",
  "description": "Extracted viral moment",
  "start_time": 15,
  "end_time": 45
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "clip_uuid",
    "video_id": "video_uuid",
    "user_id": "user_uuid",
    "title": "Epic Moment",
    "start_time": 15,
    "end_time": 45,
    "duration": 30,
    "status": "pending",
    "approved": false,
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

#### Approve Clip
```
PATCH /api/clips/:clipId/approve
Content-Type: application/json

{
  "approved": true,
  "approval_notes": "Great content, ready to publish"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": "clip_uuid",
    "approved": true,
    "approval_notes": "Great content, ready to publish",
    "updated_at": "2024-02-08T10:35:00Z"
  }
}
```

### Shorts Endpoints

#### Convert Clip to Short
```
POST /api/shorts/create-from-clip
Content-Type: application/json

{
  "clip_id": "clip_uuid",
  "user_id": "user_uuid",
  "title": "Epic Short",
  "description": "Vertical format short"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "short_uuid",
    "clip_id": "clip_uuid",
    "title": "Epic Short",
    "duration": 30,
    "resolution": "1080x1920",
    "status": "pending",
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

### Thumbnail Endpoints

#### Generate Thumbnail
```
POST /api/thumbnails/generate
Content-Type: application/json

{
  "source_id": "video_uuid",
  "source_type": "video",
  "timestamp": 15
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "thumbnail_uuid",
    "source_id": "video_uuid",
    "source_type": "video",
    "size": "1280x720",
    "status": "pending",
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

### Platform Endpoints

#### Connect Platform
```
POST /api/platforms/youtube/connect
Content-Type: application/json

{
  "user_id": "user_uuid",
  "credentials": {
    "access_token": "youtube_access_token",
    "refresh_token": "youtube_refresh_token",
    "channel_id": "UCxxxxx"
  }
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "platform_uuid",
    "user_id": "user_uuid",
    "platform_name": "youtube",
    "channel_id": "UCxxxxx",
    "is_connected": true,
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

#### Publish Content
```
POST /api/platforms/youtube/publish
Content-Type: application/json

{
  "user_id": "user_uuid",
  "content_id": "short_uuid",
  "content_type": "short",
  "metadata": {
    "title": "Epic Moment",
    "description": "Auto-generated viral short",
    "tags": ["viral", "action"],
    "visibility": "public"
  }
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "distribution_uuid",
    "content_id": "short_uuid",
    "content_type": "short",
    "platform_name": "youtube",
    "status": "publishing",
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT NOT NULL,
  local_path TEXT,
  duration INTEGER,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',
  analysis_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Clips Table
```sql
CREATE TABLE clips (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  duration REAL NOT NULL,
  output_path TEXT,
  status TEXT DEFAULT 'pending',
  approved BOOLEAN DEFAULT 0,
  approval_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Shorts Table
```sql
CREATE TABLE shorts (
  id TEXT PRIMARY KEY,
  clip_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  output_path TEXT,
  duration REAL,
  resolution TEXT DEFAULT '1080x1920',
  status TEXT DEFAULT 'pending',
  approved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clip_id) REFERENCES clips(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Platforms & Distributions
Stores user platform credentials, API keys, and tracks all content distributions across platforms with view counts and engagement data.

## 🔄 Workflow

### Complete Content Processing Workflow

```
1. USER UPLOADS VIDEO
   ↓
   POST /api/videos/upload
   ├─ Validate URL and metadata
   ├─ Create video record (status: pending)
   └─ Trigger async download

2. VIDEO PROCESSING (Async)
   ├─ Download from source URL
   ├─ Update status: downloading
   ├─ AI Analysis on video content
   ├─ Identify viral moments
   ├─ Extract keyframes
   │  
   ├─ Update status: analyzed
   ├─ Store analysis data in database
   └─ Notify user of completion

3. USER REVIEWS ANALYSIS
   ├─ GET /api/videos/:videoId/analysis
   ├─ View identified viral moments
   ├─ View confidence scores
   └─ View suggested time ranges

4. USER CREATES CLIPS
   ├─ POST /api/clips/create
   ├─ Specify start_time and end_time
   ├─ Add title and description
   ├─ Create clip record (status: pending)
   └─ Trigger async clip generation

5. CLIP GENERATION (Async)
   ├─ Extract segment from video using FFmpeg
   ├─ Apply optimizations
   ├─ Update status: ready
   └─ Store output path

6. USER CREATES SHORTS
   ├─ POST /api/shorts/create-from-clip
   ├─ Convert to vertical format (1080x1920)
   ├─ Create short record (status: pending)
   └─ Trigger async conversion

7. SHORT CONVERSION (Async)
   ├─ Resize and reformat to 9:16 aspect ratio
   ├─ Add padding/letterboxing if needed
   ├─ Apply any effects
   ├─ Update status: ready
   └─ Store output path

8. THUMBNAIL GENERATION
   ├─ POST /api/thumbnails/generate
   ├─ Extract keyframe from clip/short
   ├─ Create thumbnail (1280x720)
   ├─ Update status: ready
   └─ Store output path

9. USER APPROVAL
   ├─ PATCH /api/clips/:clipId/approve (approved: true)
   ├─ PATCH /api/shorts/:shortId/approve (approved: true)
   ├─ Thumbnail auto-approved with clip
   └─ Add approval notes (optional)

10. PLATFORM CONNECTION
    ├─ POST /api/platforms/youtube/connect
    ├─ POST /api/platforms/twitch/connect
    ├─ POST /api/platforms/rumble/connect
    ├─ Validate credentials
    ├─ Store encrypted tokens
    └─ Mark as connected

11. CONTENT DISTRIBUTION
    ├─ POST /api/platforms/youtube/publish
    ├─ POST /api/platforms/twitch/publish
    ├─ POST /api/platforms/rumble/publish
    ├─ Create distribution records
    └─ Trigger async multi-platform publishing

12. MULTI-PLATFORM PUBLISHING (Async)
    ├─ YouTube
    │  ├─ Upload short video
    │  ├─ Set title, description, tags
    │  ├─ Set thumbnail
    │  ├─ Configure visibility
    │  └─ Publish to channel
    ├─ Twitch
    │  ├─ Upload as VOD
    │  ├─ Set title and tags
    │  ├─ Configure category
    │  └─ Publish to channel
    └─ Rumble
       ├─ Upload video
       ├─ Set metadata
       ├─ Configure settings
       └─ Publish to channel

13. ANALYTICS TRACKING
    ├─ GET /api/platforms/:platformName/analytics/:userId
    ├─ Track view counts
    ├─ Monitor engagement metrics
    ├─ Compare performance across platforms
    └─ Store engagement data in distributions table

14. CONTENT MANAGEMENT
    ├─ GET /api/videos/user/:userId
    ├─ GET /api/clips/user/:userId
    ├─ GET /api/shorts/user/:userId
    ├─ DELETE /api/clips/:clipId
    ├─ DELETE /api/shorts/:shortId
    └─ Manage entire content library
```

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Paths
DATABASE_PATH=./data/studiobot.db
TEMP_VIDEO_DIR=./temp/videos
OUTPUT_CLIPS_DIR=./output/clips
OUTPUT_SHORTS_DIR=./output/shorts
OUTPUT_THUMBNAILS_DIR=./output/thumbnails

# AI Service
AI_SERVICE_URL=https://api.example.com/analyze
AI_SERVICE_KEY=your_key

# YouTube
YOUTUBE_API_KEY=your_key
YOUTUBE_CLIENT_ID=your_id
YOUTUBE_CLIENT_SECRET=your_secret

# Twitch
TWITCH_CLIENT_ID=your_id
TWITCH_ACCESS_TOKEN=your_token

# Rumble
RUMBLE_API_KEY=your_key

# Security
JWT_SECRET=your_secret
SESSION_SECRET=your_secret

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Run tests
npm test

# Watch mode for development
npm run watch
```

### Code Structure Best Practices

- **Services**: Contain all business logic
- **Routes**: Define API endpoints and handle HTTP
- **Middleware**: Handle cross-cutting concerns
- **Types**: Centralized TypeScript definitions
- **Database**: Handle all data persistence

### Error Handling

All errors are caught and properly formatted:
```typescript
{
  "status": "error",
  "message": "Human readable error message",
  "statusCode": 400
}
```

## 🚢 Deployment

### Environment Setup for Production

1. Set `NODE_ENV=production`
2. Generate strong secrets for JWT_SECRET and SESSION_SECRET
3. Configure database path for persistent storage
4. Set up FFmpeg on production server
5. Configure platform API credentials
6. Set up CDN for video storage (optional)

### Scaling Considerations

- Use Redis for caching (future enhancement)
- Implement job queue for video processing (BullMQ)
- Use reverse proxy (Nginx) for load balancing
- Setup database replication for reliability
- Consider microservices for video processing

### Monitoring

- Application logs: `./logs/app.log`
- Error tracking: (Future: Sentry integration)
- Performance monitoring: (Future: New Relic)
- Uptime monitoring: (Future: Pingdom)

## 📝 Future Enhancements

1. **Real-time WebSocket Updates**: Live progress on video processing
2. **Advanced AI Analysis**: ML models for better viral moment detection
3. **Scheduled Publishing**: Schedule content distribution for optimal times
4. **Batch Operations**: Process multiple videos simultaneously
5. **Custom Branding**: Watermarks and intro/outro sequences
6. **Team Collaboration**: Multiple users per organization
7. **Advanced Analytics**: Detailed performance dashboards
8. **Content Library**: Store and manage templates and presets
9. **API Rate Limiting**: Prevent abuse
10. **OAuth2 Integration**: Streamlined platform authentication

## 📞 Support & Contact

For issues, feature requests, or questions, please refer to the documentation or contact the development team.

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: February 8, 2026  
**Status**: Production Ready
