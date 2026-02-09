# Video Upload Methods Comparison

## 🚀 Method 1: Direct File Upload (RECOMMENDED)

### Endpoint
```
POST /api/videos/upload-file
Content-Type: multipart/form-data
```

### Request
```javascript
const formData = new FormData();
formData.append('video', videoFile); // File object
formData.append('user_id', 'user-123');
formData.append('title', 'My Video');
formData.append('description', 'Optional description');

fetch('http://localhost:3000/api/videos/upload-file', {
  method: 'POST',
  body: formData
});
```

### Workflow
```
User selects file → Upload to server → Analyze ✅
                    (1 step)
```

### Pros
✅ **Faster** - No download step
✅ **More reliable** - No URL issues
✅ **Better UX** - Standard file picker
✅ **No external dependencies** - Works offline
✅ **Immediate processing** - File already on server

### Cons
❌ Requires file upload bandwidth
❌ File size limits (500MB default)

---

## 🔗 Method 2: URL-Based Upload (FALLBACK)

### Endpoint
```
POST /api/videos/upload
Content-Type: application/json
```

### Request
```javascript
fetch('http://localhost:3000/api/videos/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user-123',
    source_url: 'https://example.com/video.mp4',
    title: 'My Video',
    description: 'Optional description'
  })
});
```

### Workflow
```
User provides URL → Server downloads → Analyze
                   (2 steps - slower)
```

### Pros
✅ No upload bandwidth needed
✅ Good for external/public videos
✅ Can handle very large files

### Cons
❌ **Slower** - Extra download step
❌ **Less reliable** - URLs can break
❌ **Network dependent** - Requires internet
❌ **Security risks** - URL might expire

---

## 📊 Performance Comparison

| Metric | Direct Upload | URL Upload |
|--------|---------------|------------|
| **Processing Steps** | 1 | 2 |
| **Time to Analysis** | ~5 sec | ~30 sec |
| **Failure Rate** | Low | Medium |
| **User Control** | High | Low |
| **Best For** | Most use cases | External videos |

---

## 💡 Recommendations

### Use Direct Upload When:
- User has video file locally
- Need fast processing
- Want reliable uploads
- Building user-facing app

### Use URL Upload When:
- Video is already hosted
- File is very large (>500MB)
- Importing from external source
- Batch processing URLs

---

## 🔧 cURL Examples

### Direct Upload
```bash
curl -X POST http://localhost:3000/api/videos/upload-file \
  -F "video=@/path/to/video.mp4" \
  -F "user_id=user-123" \
  -F "title=My Video" \
  -F "description=Test upload"
```

### URL Upload
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "source_url": "https://example.com/video.mp4",
    "title": "My Video"
  }'
```

---

## 🎯 Supported Video Formats

Both methods support:
- MP4 (`.mp4`)
- MPEG (`.mpeg`, `.mpg`)
- QuickTime (`.mov`)
- AVI (`.avi`)
- FLV (`.flv`)
- WebM (`.webm`)
- Matroska (`.mkv`)

**Max File Size**: 500MB (configurable in `upload.ts`)

---

## 🔒 Security Notes

### Direct Upload
- File type validation
- Size limits enforced
- Files stored securely
- Automatic cleanup

### URL Upload
- URL validation required
- HTTPS recommended
- Timeout protection
- Download limits

---

## 📈 Migration Guide

If switching from URL to Direct Upload:

1. Update frontend to use file input
2. Change API call to use FormData
3. Update to `/upload-file` endpoint
4. Test with various file formats
5. Monitor upload speeds

**No backend changes needed** - both methods supported!
