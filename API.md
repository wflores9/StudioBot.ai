# StudioBot.ai API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require a valid user ID. For endpoints requiring authentication, include the user_id in the request body or URL parameters.

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "User registered successfully"
}
```

**Error (400):**
```json
{
  "status": "error",
  "message": "Missing required fields or validation failed",
  "statusCode": 400
}
```

---

### Login
Authenticate user and get access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string"
    },
    "token": "jwt_token"
  },
  "message": "Login successful"
}
```

**Error (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

## Video Endpoints

### Upload Video File (Recommended)
Upload a video file directly for faster processing.

**Endpoint:** `POST /videos/upload-file`

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```
video: File (required, video file)
user_id: uuid (required)
title: string (required)
description: string (optional)
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "source_url": "original_filename.mp4",
    "local_path": "/temp/videos/uuid.mp4",
    "file_size": 12345678,
    "status": "pending",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Video uploaded successfully. AI analysis started.",
  "fileInfo": {
    "originalName": "video.mp4",
    "size": 12345678,
    "mimeType": "video/mp4"
  }
}
```

**Supported Formats:**
- MP4 (`.mp4`)
- MPEG (`.mpeg`, `.mpg`)
- QuickTime (`.mov`)
- AVI (`.avi`)
- FLV (`.flv`)
- WebM (`.webm`)
- Matroska (`.mkv`)

**File Size Limit:** 500MB

**Note:** Video is analyzed immediately - no download step needed!

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('user_id', userId);
formData.append('title', 'My Video');
formData.append('description', 'Optional');

fetch('http://localhost:3000/api/videos/upload-file', {
  method: 'POST',
  body: formData
});
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/videos/upload-file \
  -F "video=@/path/to/video.mp4" \
  -F "user_id=user-123" \
  -F "title=My Video"
```

---

### Upload Video from URL (Fallback)
Submit a video URL for analysis.

**Endpoint:** `POST /videos/upload`

**Request Body:**
```json
{
  "user_id": "uuid (required)",
  "source_url": "string (required, valid URL)",
  "title": "string (required)",
  "description": "string (optional)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "source_url": "string",
    "status": "pending",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Video upload initiated. Processing started."
}
```

**Note:** Video will be downloaded and analyzed asynchronously.

---

### Get Video
Retrieve video details and current processing status.

**Endpoint:** `GET /videos/:videoId`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "source_url": "string",
    "local_path": "string",
    "duration": "number (seconds)",
    "file_size": "number (bytes)",
    "status": "pending|downloading|analyzing|analyzed|failed",
    "analysis_data": "JSON string",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
}
```

---

### Get Video Analysis
Retrieve AI analysis results (viral moments, keyframes).

**Endpoint:** `GET /videos/:videoId/analysis`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "viralMoments": [
      {
        "startTime": "number (seconds)",
        "endTime": "number (seconds)",
        "confidence": "number (0-1)",
        "description": "string",
        "tags": ["string"]
      }
    ],
    "summary": "string",
    "estimatedLength": "number (seconds)",
    "keyframes": [
      {
        "timestamp": "number (seconds)",
        "description": "string",
        "thumbnail_url": "string (optional)"
      }
    ]
  }
}
```

---

## Clip Endpoints

### Create Clip
Extract a segment from a video.

**Endpoint:** `POST /clips/create`

**Request Body:**
```json
{
  "video_id": "uuid (required)",
  "user_id": "uuid (required)",
  "title": "string (required)",
  "description": "string (optional)",
  "start_time": "number (required, seconds)",
  "end_time": "number (required, seconds)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "video_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "start_time": "number",
    "end_time": "number",
    "duration": "number",
    "status": "pending|processing|ready|failed",
    "approved": false,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Clip creation started"
}
```

---

### Approve Clip
Review and approve/reject a clip for further processing.

**Endpoint:** `PATCH /clips/:clipId/approve`

**Request Body:**
```json
{
  "approved": "boolean (required)",
  "approval_notes": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "video_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "approved": true,
    "approval_notes": "string",
    "status": "ready",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Clip approved"
}
```

---

## Shorts Endpoints

### Create Short from Clip
Convert an approved clip to vertical short format.

**Endpoint:** `POST /shorts/create-from-clip`

**Request Body:**
```json
{
  "clip_id": "uuid (required)",
  "user_id": "uuid (required)",
  "title": "string (required)",
  "description": "string (optional)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "clip_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "resolution": "1080x1920",
    "status": "pending|processing|ready|failed",
    "approved": false,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Short conversion started"
}
```

---

### Approve Short
Review and approve a short for distribution.

**Endpoint:** `PATCH /shorts/:shortId/approve`

**Request Body:**
```json
{
  "approved": "boolean (required)"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "clip_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "approved": true,
    "status": "ready",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Short approved"
}
```

---

## Thumbnail Endpoints

### Generate Thumbnail
Create a thumbnail image from video content.

**Endpoint:** `POST /thumbnails/generate`

**Request Body:**
```json
{
  "source_id": "uuid (required, video/clip/short ID)",
  "source_type": "video|clip|short (required)",
  "timestamp": "number (optional, seconds for custom frame)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "source_id": "uuid",
    "source_type": "string",
    "size": "1280x720",
    "status": "pending|processing|ready|failed",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Thumbnail generation started"
}
```

---

### Download Thumbnail
Download the generated thumbnail image.

**Endpoint:** `GET /thumbnails/:thumbnailId/download`

**Response:** File stream (JPEG image)

---

## Platform Integration Endpoints

### Connect Platform
Link a social media platform account.

**Endpoint:** `POST /platforms/:platformName/connect`

**URL Parameters:**
- `platformName`: `youtube` | `twitch` | `rumble`

**Request Body:**
```json
{
  "user_id": "uuid (required)",
  "credentials": {
    "access_token": "string (required)",
    "refresh_token": "string (optional)",
    "channel_id": "string (optional)"
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "platform_name": "string",
    "channel_id": "string",
    "is_connected": true,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Connected to youtube successfully"
}
```

---

### Publish Content
Distribute approved content to a platform.

**Endpoint:** `POST /platforms/:platformName/publish`

**URL Parameters:**
- `platformName`: `youtube` | `twitch` | `rumble`

**Request Body:**
```json
{
  "user_id": "uuid (required)",
  "content_id": "uuid (required, clip/short ID)",
  "content_type": "clip|short|video (required)",
  "metadata": {
    "title": "string",
    "description": "string",
    "tags": ["string"]
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "content_id": "uuid",
    "content_type": "string",
    "platform_name": "string",
    "status": "publishing|published|failed",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  },
  "message": "Publishing clip to youtube..."
}
```

---

### Get Distribution History
View publishing history for content across platforms.

**Endpoint:** `GET /platforms/distributions/:contentId`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "content_id": "uuid",
      "content_type": "string",
      "platform_name": "string",
      "platform_post_id": "string",
      "status": "published",
      "published_at": "ISO 8601 timestamp",
      "url": "string",
      "view_count": "number",
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp"
    }
  ]
}
```

---

### Get Platform Analytics
Retrieve engagement metrics for a platform.

**Endpoint:** `GET /platforms/:platformName/analytics/:userId`

**URL Parameters:**
- `platformName`: `youtube` | `twitch` | `rumble`
- `userId`: User UUID

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_posts": "number",
    "total_views": "number",
    "avg_views": "number"
  }
}
```

---

## Error Responses

All errors follow a standard format:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": "number"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid authentication |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Current implementation has no rate limiting. In production, add:
- 100 requests per minute per user
- 5 concurrent uploads per user
- 10 concurrent platform publishes

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example:**
```
GET /videos/user/user-uuid?page=2&limit=50
```

---

## Data Types

### Status Values

**Video:** `pending` | `downloading` | `analyzing` | `analyzed` | `failed`

**Clip:** `pending` | `processing` | `ready` | `failed`

**Short:** `pending` | `processing` | `ready` | `failed`

**Thumbnail:** `pending` | `processing` | `ready` | `failed`

**Distribution:** `pending` | `publishing` | `published` | `failed`

---

## Webhooks (Future)

Coming soon: Webhook support for real-time status updates on video processing, publishing, and analytics.

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Upload video
const uploadVideo = async (userId: string, videoUrl: string) => {
  return await api.post('/videos/upload', {
    user_id: userId,
    source_url: videoUrl,
    title: 'My Video'
  });
};

// Create clip
const createClip = async (videoId: string, userId: string) => {
  return await api.post('/clips/create', {
    video_id: videoId,
    user_id: userId,
    title: 'Viral Moment',
    start_time: 15,
    end_time: 45
  });
};
```

### Python
```python
import requests

API_BASE = 'http://localhost:3000/api'

def upload_video(user_id, video_url, title):
    response = requests.post(f'{API_BASE}/videos/upload', json={
        'user_id': user_id,
        'source_url': video_url,
        'title': title
    })
    return response.json()

def create_clip(video_id, user_id, title, start, end):
    response = requests.post(f'{API_BASE}/clips/create', json={
        'video_id': video_id,
        'user_id': user_id,
        'title': title,
        'start_time': start,
        'end_time': end
    })
    return response.json()
```

---

## Support

For API issues and questions:
- GitHub Issues: [Create an issue]
- Email: api-support@studiobot.ai
- Documentation: https://docs.studiobot.ai/api
