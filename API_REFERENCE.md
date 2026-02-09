# StudioBot.ai - Complete API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication

All requests should include authentication headers where required:
```
Authorization: Bearer {token}
```

## Response Format

All responses follow this format:
```json
{
  "status": "success|error",
  "data": {},
  "message": "Optional message"
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, must include uppercase, lowercase, number)"
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-02-08T10:30:00Z",
    "updated_at": "2024-02-08T10:30:00Z"
  }
}
```

**Error Codes:**
- `400`: Missing or invalid fields
- `409`: Username or email already exists

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Codes:**
- `401`: Invalid credentials
- `404`: User not found

---

### GET /auth/profile/:userId
Get user profile information.

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-02-08T10:30:00Z",
    "updated_at": "2024-02-08T10:30:00Z"
  }
}
```

**Error Codes:**
- `404`: User not found

---

### PATCH /auth/profile/:userId
Update user profile.

**Request:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)"
}
```

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "jane_doe",
    "email": "jane@example.com",
    "updated_at": "2024-02-08T10:35:00Z"
  }
}
```

---

### POST /auth/:userId/change-password
Change user password.

**Request:**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**Response:** 200 OK
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Codes:**
- `401`: Old password incorrect

---

## 🎬 Video Endpoints

### POST /videos/upload
Upload video from URL for analysis.

**Request:**
```json
{
  "user_id": "uuid",
  "source_url": "https://example.com/video.mp4",
  "title": "string",
  "description": "string (optional)"
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "video_uuid",
    "user_id": "user_uuid",
    "title": "Amazing Video",
    "description": "A great video",
    "source_url": "https://example.com/video.mp4",
    "local_path": null,
    "duration": null,
    "file_size": null,
    "status": "pending",
    "analysis_data": null,
    "created_at": "2024-02-08T10:30:00Z",
    "updated_at": "2024-02-08T10:30:00Z"
  },
  "message": "Video upload initiated. Processing started."
}
```

**Statuses:** pending → downloading → analyzing → analyzed (or failed)

---

### GET /videos/:videoId
Get video details.

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "id": "video_uuid",
    "user_id": "user_uuid",
    "title": "Amazing Video",
    "status": "analyzed",
    "duration": 300,
    "file_size": 524288000,
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

---

### GET /videos/user/:userId
Get user's videos (paginated).

**Query Parameters:**
- `page`: int (default: 1)
- `limit`: int (default: 20)

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "data": [...],
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /videos/:videoId/analysis
Get AI analysis results for a video.

**Response:** 200 OK
```json
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
    "keyframes": [
      {
        "timestamp": 15,
        "description": "Action starts"
      }
    ]
  }
}
```

**Error Codes:**
- `404`: Analysis not found or not ready

---

### PATCH /videos/:videoId
Update video metadata.

**Request:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

---

### DELETE /videos/:videoId
Delete video and associated files.

**Response:** 200 OK
```json
{
  "status": "success",
  "message": "Video deleted successfully"
}
```

---

## ✂️ Clip Endpoints

### POST /clips/create
Create a clip from a video segment.

**Request:**
```json
{
  "video_id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "description": "string (optional)",
  "start_time": 15.5,
  "end_time": 45.5
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "clip_uuid",
    "video_id": "video_uuid",
    "user_id": "user_uuid",
    "title": "Epic Moment",
    "start_time": 15.5,
    "end_time": 45.5,
    "duration": 30,
    "status": "pending",
    "approved": false,
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Clip creation started"
}
```

**Statuses:** pending → processing → ready (or failed)

---

### GET /clips/:clipId
Get clip details.

**Response:** 200 OK

---

### GET /clips/video/:videoId
Get all clips for a video (paginated).

**Query Parameters:**
- `page`: int (default: 1)
- `limit`: int (default: 20)

---

### PATCH /clips/:clipId/approve
Approve or reject a clip.

**Request:**
```json
{
  "approved": boolean,
  "approval_notes": "string (optional)"
}
```

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "id": "clip_uuid",
    "approved": true,
    "approval_notes": "Great content!",
    "status": "ready"
  },
  "message": "Clip approved"
}
```

---

### DELETE /clips/:clipId
Delete a clip.

---

## 🎥 Shorts Endpoints

### POST /shorts/create-from-clip
Convert a clip to vertical format short.

**Request:**
```json
{
  "clip_id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "description": "string (optional)"
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "short_uuid",
    "clip_id": "clip_uuid",
    "user_id": "user_uuid",
    "title": "Epic Short",
    "resolution": "1080x1920",
    "status": "pending",
    "approved": false,
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Short conversion started"
}
```

**Statuses:** pending → processing → ready (or failed)

---

### GET /shorts/:shortId
Get short details.

---

### GET /shorts/user/:userId
Get user's shorts (paginated).

---

### PATCH /shorts/:shortId/approve
Approve or reject a short.

**Request:**
```json
{
  "approved": boolean
}
```

---

### DELETE /shorts/:shortId
Delete a short.

---

## 🖼️ Thumbnail Endpoints

### POST /thumbnails/generate
Generate a thumbnail for video/clip/short.

**Request:**
```json
{
  "source_id": "uuid",
  "source_type": "video|clip|short",
  "timestamp": 15.5
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "thumbnail_uuid",
    "source_id": "video_uuid",
    "source_type": "video",
    "size": "1280x720",
    "status": "pending",
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Thumbnail generation started"
}
```

**Statuses:** pending → processing → ready (or failed)

---

### GET /thumbnails/:thumbnailId
Get thumbnail details.

---

### GET /thumbnails/source/:sourceId
Get all thumbnails for a content source.

---

### GET /thumbnails/:thumbnailId/download
Download thumbnail file (returns image file).

---

### DELETE /thumbnails/:thumbnailId
Delete a thumbnail.

---

## 🌐 Platform Endpoints

### POST /platforms/:platformName/connect
Connect social media platform.

**Supported Platforms:** `youtube`, `twitch`, `rumble`

**Request:**
```json
{
  "user_id": "uuid",
  "credentials": {
    "access_token": "string",
    "refresh_token": "string (optional)",
    "channel_id": "string"
  }
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "platform_uuid",
    "user_id": "user_uuid",
    "platform_name": "youtube",
    "channel_id": "UCxxxxx",
    "is_connected": true,
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Connected to youtube successfully"
}
```

---

### GET /platforms/user/:userId
Get user's connected platforms.

**Response:** 200 OK
```json
{
  "status": "success",
  "data": [
    {
      "id": "platform_uuid",
      "platform_name": "youtube",
      "channel_id": "UCxxxxx",
      "is_connected": true
    },
    {
      "id": "platform_uuid2",
      "platform_name": "twitch",
      "channel_id": "twitchchannel",
      "is_connected": true
    }
  ]
}
```

---

### POST /platforms/:platformName/publish
Publish content to a platform.

**Supported Platforms:** `youtube`, `twitch`, `rumble`

**Request:**
```json
{
  "user_id": "uuid",
  "content_id": "uuid",
  "content_type": "clip|short|video",
  "metadata": {
    "title": "string",
    "description": "string",
    "tags": ["array", "of", "tags"],
    "visibility": "public|private|unlisted"
  }
}
```

**Response:** 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "distribution_uuid",
    "content_id": "short_uuid",
    "content_type": "short",
    "platform_name": "youtube",
    "status": "publishing",
    "created_at": "2024-02-08T10:30:00Z"
  },
  "message": "Publishing short to youtube..."
}
```

**Statuses:** pending → publishing → published (or failed)

---

### GET /platforms/distributions/:contentId
Get distribution history for content.

**Response:** 200 OK
```json
{
  "status": "success",
  "data": [
    {
      "id": "distribution_uuid",
      "content_id": "short_uuid",
      "platform_name": "youtube",
      "status": "published",
      "platform_post_id": "video_id_xyz",
      "url": "https://youtube.com/watch?v=video_id_xyz",
      "view_count": 1250,
      "published_at": "2024-02-08T10:35:00Z"
    }
  ]
}
```

---

### GET /platforms/:platformName/analytics/:userId
Get analytics for platform.

**Response:** 200 OK
```json
{
  "status": "success",
  "data": {
    "total_posts": 15,
    "total_views": 18750,
    "avg_views": 1250,
    "platform_name": "youtube"
  }
}
```

---

### DELETE /platforms/:platformId
Disconnect a platform.

**Response:** 200 OK
```json
{
  "status": "success",
  "message": "Platform disconnected successfully"
}
```

---

## 🏥 Health Check

### GET /health
Check API health status.

**Response:** 200 OK
```json
{
  "status": "ok",
  "timestamp": "2024-02-08T10:30:00Z"
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Pagination

Endpoints with pagination support these query parameters:
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:
```json
{
  "data": [...],
  "page": 1,
  "limit": 20,
  "total": 150,
  "pages": 8
}
```

---

## Rate Limiting (Future)

Currently not implemented. Planned for production deployment:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- 10 concurrent uploads per user

---

## Error Handling

All errors return consistent format:
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common errors:
- **Missing Fields**: 400 - "Missing required fields: field1, field2"
- **Invalid Format**: 400 - "Invalid source_type. Must be one of: video, clip, short"
- **Not Found**: 404 - "Video not found"
- **Conflict**: 409 - "Username already exists"
- **Internal Error**: 500 - "Internal Server Error"

---

## Webhook Events (Future)

Planned webhook events:
- `video.analyzed` - Video analysis complete
- `clip.ready` - Clip generation complete
- `short.ready` - Short conversion complete
- `content.published` - Content published to platform
- `platform.error` - Platform publishing error

---

**API Version**: 1.0.0  
**Last Updated**: February 8, 2026
