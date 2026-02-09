# StudioBot.ai Architecture Documentation

## System Overview

StudioBot.ai is a microservice-ready Node.js/TypeScript application that automates video content creation and multi-platform distribution. The architecture follows clean layering principles with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│           (Web, Mobile, Desktop, Third-party)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                    Express.js Server                         │
│                     (Port 3000)                              │
├─────────────────────────────────────────────────────────────┤
│ Middleware Layer                                            │
│ - CORS, Body Parser, Error Handler                          │
├─────────────────────────────────────────────────────────────┤
│ Route Layer                                                 │
│ - /auth (Authentication)                                    │
│ - /videos (Video Upload & Analysis)                         │
│ - /clips (Clip Management)                                  │
│ - /shorts (Short Form Content)                              │
│ - /thumbnails (Thumbnail Generation)                        │
│ - /platforms (Multi-Platform Distribution)                  │
├─────────────────────────────────────────────────────────────┤
│ Service Layer (Business Logic)                              │
│ - AuthService → User Management                             │
│ - VideoService → Video Processing & AI Analysis             │
│ - ClipService → Clip Extraction                             │
│ - ShortService → Vertical Format Conversion                 │
│ - ThumbnailService → Image Generation                       │
│ - PlatformService → API Integration                         │
├─────────────────────────────────────────────────────────────┤
│ Data Layer                                                  │
│ - SQLite3 Database                                          │
│ - Type Definitions                                          │
│ - Utilities (Logger, Error Handler)                         │
├─────────────────────────────────────────────────────────────┤
│ External Integrations                                       │
│ - FFmpeg (Video Processing)                                 │
│ - YouTube API                                               │
│ - Twitch API                                                │
│ - Rumble API                                                │
│ - File System (Local Storage)                               │
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Presentation Layer (Routes)
Located in `src/routes/`

Responsibilities:
- Handle HTTP requests and responses
- Validate input parameters
- Route requests to appropriate services
- Return formatted API responses

Files:
- `auth.routes.ts` - Authentication endpoints
- `video.routes.ts` - Video management
- `clip.routes.ts` - Clip operations
- `short.routes.ts` - Short form content
- `thumbnail.routes.ts` - Thumbnail operations
- `platform.routes.ts` - Platform integration

### 2. Business Logic Layer (Services)
Located in `src/services/`

Responsibilities:
- Implement core business logic
- Coordinate between routes and data layer
- Handle async operations
- Manage external API calls
- Process videos and generate content

Services:
- **AuthService**: User registration, login, profile management
- **VideoService**: Download, analyze videos, detect viral moments
- **ClipService**: Extract video segments, manage clips
- **ShortService**: Convert clips to vertical format
- **ThumbnailService**: Generate preview images
- **PlatformService**: Publish to YouTube, Twitch, Rumble

### 3. Data Layer
Located in `src/database/`

Responsibilities:
- Database schema initialization
- Execute database queries
- Data persistence and retrieval

Files:
- `init.ts` - SQLite initialization and schema

### 4. Utilities & Middleware
Located in `src/utils/` and `src/middleware/`

Utilities:
- **logger.ts** - Structured logging for debugging
- **errorHandler.ts** - Centralized error handling

Middleware:
- Request validation
- Error catching
- Response formatting

### 5. Type Definitions
Located in `src/types/`

Files:
- `models.ts` - TypeScript interfaces for all entities

---

## Data Flow Diagrams

### Video Upload & Analysis Flow

```
┌─────────────┐
│ Client      │
│ POST /videos│
│ /upload     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ VideoRoute          │
│ - Validate input    │
│ - Create video ID   │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐      ┌──────────────┐
│ VideoService         │─────▶│ Database     │
│ - Save to DB         │      │ (Insert)     │
│ - Start async job    │      └──────────────┘
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Background Process   │
│ 1. Download from URL │
│ 2. Run AI Analysis   │
│ 3. Extract keyframes │
│ 4. Update DB status  │
└──────────────────────┘
```

### Clip Creation & Distribution Flow

```
┌──────────────┐
│ User creates │
│ clip         │
└────┬─────────┘
     │
     ▼
┌──────────────────┐        ┌──────────────┐
│ ClipRoute        │───────▶│ Database     │
│ POST /clips/     │        │ (Insert)     │
│ create           │        └──────────────┘
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ ClipService      │
│ - Extract segment│
│ - Generate output│
│ - Update status  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐        ┌──────────────────┐
│ User approves    │───────▶│ ShortService     │
│ clip             │        │ - Convert format │
└────┬─────────────┘        └────┬─────────────┘
     │                           │
     ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ Thumbnail        │        │ PlatformService  │
│ Generation       │        │ - Publish to API │
└──────────────────┘        └──────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│ Users        │
├──────────────┤
│ id (PK)      │
│ username     │
│ email        │
│ password_hash│
└──────┬───────┘
       │
       │ 1:N
       │
       ├──────────────────────────┬──────────────┬──────────────┐
       │                          │              │              │
       ▼                          ▼              ▼              ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Videos       │      │ Platforms    │  │ Clips        │  │ Shorts       │
├──────────────┤      ├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │      │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ user_id (FK) │      │ user_id (FK) │  │ video_id (FK)│  │ clip_id (FK) │
│ title        │      │ platform_name│  │ user_id (FK) │  │ user_id (FK) │
│ source_url   │      │ access_token │  │ title        │  │ title        │
│ local_path   │      │ channel_id   │  │ start_time   │  │ resolution   │
│ status       │      │ is_connected │  │ end_time     │  │ status       │
│ analysis_data│      └──────┬───────┘  │ status       │  │ approved     │
└──────┬───────┘             │          │ approved     │  └──────┬───────┘
       │                     │          └──────┬───────┘        │
       │                     │                 │                │
       └─────────────────────┼─────────────────┼────────────────┘
                             │                 │
                             └────────┬────────┘
                                      │
                                      │ N:N (through Distributions)
                                      │
                                      ▼
                            ┌──────────────────┐
                            │ Distributions    │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ content_id (FK)  │
                            │ content_type     │
                            │ platform_name    │
                            │ platform_post_id │
                            │ status           │
                            │ published_at     │
                            │ url              │
                            │ view_count       │
                            └──────────────────┘

Thumbnails table (standalone, referenced by videos/clips/shorts)
┌──────────────────┐
│ Thumbnails       │
├──────────────────┤
│ id (PK)          │
│ source_id (FK)   │
│ source_type      │
│ output_path      │
│ status           │
└──────────────────┘
```

---

## Service Architecture

### AuthService
```
AuthService
├── registerUser(username, email, password)
├── loginUser(email, password)
├── getUser(userId)
├── updateUser(userId, updates)
├── changePassword(userId, oldPwd, newPwd)
├── hashPassword(password)
├── verifyPassword(password, hash)
└── generateToken(userId, email)
```

### VideoService
```
VideoService
├── createVideo(video)
├── getVideoById(videoId)
├── getUserVideos(userId, page, limit)
├── updateVideo(videoId, updates)
├── deleteVideo(videoId)
├── downloadAndAnalyzeVideo(videoId)
├── getVideoAnalysis(videoId)
├── downloadFile(url, filePath)
└── analyzeVideo(videoPath)
```

### ClipService
```
ClipService
├── createClip(clip)
├── getClipById(clipId)
├── getVideoClips(videoId, page, limit)
├── approveClip(clipId, approved, notes)
├── deleteClip(clipId)
├── processClip(clipId)
└── simulateClipGeneration(outputPath)
```

### ShortService
```
ShortService
├── createShort(short)
├── getShortById(shortId)
├── getUserShorts(userId, page, limit)
├── approveShort(shortId, approved)
├── deleteShort(shortId)
├── convertClipToShort(clipId, userId, title, description)
└── processShortConversion(shortId, inputPath, outputPath)
```

### ThumbnailService
```
ThumbnailService
├── createThumbnail(thumbnail)
├── getThumbnailById(thumbnailId)
├── getThumbnailsForSource(sourceId)
├── getThumbnailFilePath(thumbnailId)
├── deleteThumbnail(thumbnailId)
├── generateThumbnail(thumbnailId, timestamp)
└── simulateThumbnailGeneration(outputPath)
```

### PlatformService
```
PlatformService
├── connectPlatform(userId, platformName, credentials)
├── getUserPlatforms(userId)
├── publishContent(userId, platformName, contentId, contentType, metadata)
├── getDistributionHistory(contentId)
├── getAnalytics(userId, platformName)
├── disconnectPlatform(platformId)
└── publishToProvider(platformName, contentId, contentType, distributionId, metadata)
```

---

## Request/Response Cycle

### Successful Request
```
1. Client sends HTTP request
   ↓
2. Express receives request
   ↓
3. Middleware processes (CORS, Body Parser)
   ↓
4. Route handler validates input
   ↓
5. Service processes business logic
   ↓
6. Database query executed
   ↓
7. Result formatted as JSON
   ↓
8. Response sent to client (200/201)
```

### Error Handling
```
1. Error occurs in service
   ↓
2. Thrown as AppError with statusCode
   ↓
3. Caught by catchAsync middleware wrapper
   ↓
4. Passed to errorHandler middleware
   ↓
5. Formatted as standardized error response
   ↓
6. Sent to client with appropriate HTTP code
```

---

## Asynchronous Operations

Jobs that run in the background:

1. **Video Download & Analysis**
   - Triggered after: Video upload
   - Duration: Minutes to hours
   - Status updates: `pending` → `downloading` → `analyzing` → `analyzed`

2. **Clip Processing**
   - Triggered after: Clip creation
   - Duration: Seconds to minutes
   - Status updates: `pending` → `processing` → `ready`

3. **Short Conversion**
   - Triggered after: Clip approval
   - Duration: Seconds to minutes
   - Status updates: `pending` → `processing` → `ready`

4. **Thumbnail Generation**
   - Triggered after: Thumbnail request
   - Duration: Seconds
   - Status updates: `pending` → `processing` → `ready`

5. **Platform Publishing**
   - Triggered after: Publish request
   - Duration: Seconds to minutes
   - Status updates: `pending` → `publishing` → `published`

---

## Security Architecture

### Input Validation
- Endpoint validation in routes
- Type checking with TypeScript
- Email format validation
- Password strength requirements (min 8 chars)

### Data Protection
- Password hashing with SHA-256 (production should use bcrypt)
- Database encryption (optional for platform credentials)
- Secure file permissions for database

### Error Handling
- No sensitive data in error messages
- Logging without credentials
- Standard error response format

---

## Performance Considerations

### Optimization Strategies

1. **Async Processing**: Video processing doesn't block requests
2. **Database Indexing**: Indexes on foreign keys and frequently queried fields
3. **Streaming**: Large file downloads use streams
4. **Caching**: Consider caching popular analysis results
5. **Pagination**: List endpoints support pagination

### Scalability Path

1. **Horizontal Scaling**: Add more servers behind load balancer
2. **Queue System**: Use Bull or RabbitMQ for background jobs
3. **Database**: Migrate to PostgreSQL for production
4. **Storage**: Move media to cloud storage (S3, Google Cloud)
5. **Caching**: Add Redis for session/analysis caching
6. **Microservices**: Split into separate services as needed

### Bottlenecks & Solutions

| Bottleneck | Issue | Solution |
|-----------|-------|----------|
| Video Processing | FFmpeg CPU intensive | Queue system, worker processes |
| Database Locks | SQLite concurrent writes | PostgreSQL or sharding |
| Storage | Local disk space | Cloud storage integration |
| API Rate Limits | Platform throttling | Retry logic, caching |
| Memory | Large video files | Streaming, chunked processing |

---

## Deployment Architecture

### Development
```
Local Machine
├── Express Server
├── SQLite Database
├── Local File Storage
└── FFmpeg (local)
```

### Production
```
Load Balancer
├── Server 1 (Express + Node)
├── Server 2 (Express + Node)
├── Server 3 (Express + Node)
│
├── Database Cluster (PostgreSQL)
├── Redis Cache
├── Cloud Storage (S3/GCS)
├── Message Queue (RabbitMQ/SQS)
│
└── Worker Servers
    ├── Video Processor
    ├── Thumbnail Generator
    ├── Platform Publisher
    └── Analytics Updater
```

---

## Future Architecture Improvements

1. **GraphQL API**: Support for more flexible queries
2. **WebSocket Support**: Real-time status updates
3. **Event Streaming**: Kafka for event sourcing
4. **Serverless**: AWS Lambda for scalability
5. **Containerization**: Full Kubernetes support
6. **API Gateway**: Rate limiting, authentication
7. **Monitoring**: Prometheus + Grafana dashboards
8. **Distributed Tracing**: Jaeger integration

---

For implementation details, see individual service files in `src/services/`.
