# StudioBot.ai AI Integration Guide

## Overview

StudioBot.ai implements a **multi-AI orchestration architecture** that leverages each AI service's unique strengths:

- **OpenAI Vision**: Emotional analysis, scene understanding, visual storytelling
- **AWS Rekognition**: Object/scene detection, face recognition, content moderation  
- **Anthropic Claude**: Strategic recommendations, viral moment identification, creative content

## AI Services Architecture

### OpenAI Vision API - Emotional & Visual Understanding
**Strengths**: Understanding what's emotionally compelling about scenes, visual storytelling, caption generation

**Methods**:
- `analyzeVideoFrames(frames, timestamps)` - Analyze frames for emotional peaks and engagement
- `generateThumbnailDescription(frameBuffer)` - Create compelling thumbnail descriptions
- `analyzeEmotionalArc(frameDescriptions)` - Identify emotional trajectory and pacing

**Use Case**: Identifying which moments will resonate emotionally with viewers

### AWS Rekognition API - Content Analysis & Moderation  
**Strengths**: Detecting WHAT's in the video (objects, people, activities, inappropriate content)

**Methods**:
- `analyzeVideoSegments(videoPath)` - Detect objects, activities, scene composition
- `detectFaces(frameBuffer)` - Identify people, emotions, quality for thumbnails
- `detectInapropriateContent(frameBuffer)` - Flag unsafe content for different platforms
- `detectText(frameBuffer)` - Extract on-screen text and captions
- `analyzeSceneComposition(frameBuffer)` - Evaluate visual appeal and brightness

**Use Case**: Understanding technical aspects of video content and platform appropriateness

### Anthropic Claude - Strategic Insights
**Strengths**: Making strategic decisions about virality, creating hooks, generating hashtags

**Methods**:
- `identifyViralMoments(analysisData)` - Predict viral potential and best platforms
- `generatePlatformStrategy(title, description, tags)` - Platform-specific recommendations
- `generateHashtags(title, description, category, platform)` - Trending hashtag generation
- `generateEngagingHooks(videoContent, audience)` - Create attention-grabbing text
- `analyzeCompleteContent(analysisInput)` - Comprehensive strategic recommendations

**Use Case**: Creating data-driven publishing and growth strategies

### AI Orchestrator - Complete Pipeline
**Coordinates all three AI services** in optimal sequence:

```
1. AWS Rekognition (detects WHAT)
   ↓
2. OpenAI Vision (analyzes HOW it FEELS)
   ↓
3. Claude (decides HOW TO PUBLISH)
```

## API Endpoints

### 1. AI-Powered Viral Moment Detection
**Endpoint**: `POST /api/videos/{videoId}/analyze-ai`

Runs complete AI analysis pipeline on a video to identify viral moments.

**Request**:
```json
{
  "openaiKey": "sk-...",
  "awsAccessKey": "AKIA...",
  "awsSecretKey": "...",
  "claudeKey": "sk-ant-..."
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "videoId": "video-123",
    "totalDuration": 3600,
    "clipCount": 5,
    "totalViralityScore": 8.2,
    "viralMoments": [
      {
        "startTime": 45,
        "endTime": 90,
        "duration": 45,
        "viralityScore": 8.7,
        "reason": "High-engagement moment featuring Running + Jumping",
        "emotionalPeaks": ["excitement", "surprise"],
        "detectedObjects": ["Person", "Outdoor", "Action"],
        "engagementFactors": ["high-confidence-detection", "multiple-activities"],
        "bestForPlatforms": ["YouTube Shorts", "TikTok", "Instagram Reels"],
        "thumbnailTimestamp": 45,
        "clipRecommendation": "45-second clip starting at 45s"
      }
    ],
    "platformRecommendations": {
      "YouTube Shorts": {
        "bestMoments": [...],
        "strategy": "Post 3-4x per week, focus on entertainment",
        "recommendedFrequency": "3-4 per week"
      },
      "TikTok": {
        "bestMoments": [...],
        "strategy": "Post 1-2x daily, use trending sounds",
        "recommendedFrequency": "1-2 per day"
      }
    },
    "hashtags": {
      "YouTube": ["#viral", "#shorts", "#content"],
      "TikTok": ["#trending", "#foryou", "#viral"],
      "Instagram": ["#reels", "#instagram", "#content"],
      "LinkedIn": ["#professional", "#growth", "#insights"]
    },
    "hooks": [
      "Wait for the 45s mark... 🤯",
      "This moment will change everything",
      "You won't believe what happens next"
    ]
  }
}
```

### 2. Quick Virality Score Check
**Endpoint**: `GET /api/videos/{videoId}/virality-score`

Quick prediction without full AI analysis (useful for rapid assessment).

**Response**:
```json
{
  "status": "success",
  "data": {
    "videoId": "video-123",
    "viralityScore": 8.5,
    "engagementFactors": [
      "eye-catching-content",
      "trending-topic",
      "emotional-appeal",
      "short-duration"
    ],
    "recommendation": "High viral potential",
    "suggestedAction": "Create clip immediately"
  }
}
```

### 3. Get AI Recommendations
**Endpoint**: `GET /api/videos/{videoId}/recommendations`

Get existing AI analysis recommendations for a video.

**Response**:
```json
{
  "status": "success",
  "data": {
    "videoId": "video-123",
    "platformStrategy": {
      "YouTube Shorts": {...},
      "TikTok": {...}
    },
    "hashtags": {
      "YouTube": ["#shorts", "#viral"],
      "TikTok": ["#trending", "#foryou"]
    },
    "engagementHooks": [
      "This is incredible - keep watching",
      "The twist will blow your mind"
    ],
    "topClips": [
      {
        "startTime": 45,
        "endTime": 90,
        "viralityScore": 8.7
      }
    ],
    "nextSteps": [
      "Create clips from top viral moments",
      "Generate thumbnails from recommended timestamps",
      "Publish to recommended platforms"
    ],
    "generatedAt": "2026-02-08T08:15:20.737Z"
  }
}
```

## Workflow Examples

### Example 1: Complete Video Analysis
```bash
# 1. Upload video
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "source_url": "https://example.com/video.mp4",
    "title": "Amazing Viral Moment",
    "description": "Check this out!"
  }'

# 2. Run AI analysis
curl -X POST http://localhost:3000/api/videos/video-123/analyze-ai \
  -H "Content-Type: application/json" \
  -d '{
    "openaiKey": "sk-...",
    "claudeKey": "sk-ant-..."
  }'

# 3. Get recommendations
curl http://localhost:3000/api/videos/video-123/recommendations
```

### Example 2: Multi-Platform Publishing Strategy
```bash
# Run analysis
curl -X POST http://localhost:3000/api/videos/video-123/analyze-ai -d '{...}'

# Get platform-specific data from response
# Then use /api/distributions/publish to auto-create clips for each platform
curl -X POST http://localhost:3000/api/distributions/publish \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-123",
    "platforms": ["youtube", "tiktok", "instagram"],
    "useAIRecommendations": true
  }'
```

## AI Features Breakdown

### OpenAI Vision Capabilities
1. **Frame Analysis**
   - Emotional peak detection
   - Visual storytelling identification
   - Engagement point location
   - Attention-grabbing element identification

2. **Thumbnail Generation**
   - Visual appeal analysis
   - Compelling description creation
   - Click-through optimization

3. **Emotional Arc Analysis**
   - Pacing pattern detection
   - Viewer engagement prediction
   - Best clip range identification

### AWS Rekognition Capabilities
1. **Object & Activity Detection**
   - Scene identification
   - Activity recognition
   - Composition analysis
   - Vibrancy scoring

2. **Face Recognition**
   - Face quality assessment
   - Emotional expression detection
   - Age range estimation
   - Thumbnail suitability scoring

3. **Content Moderation**
   - Violence detection
   - Adult content flagging
   - Hate symbol identification
   - Platform-specific approval (YouTube, TikTok, Instagram)

4. **Text Detection**
   - On-screen text extraction
   - Engagement text identification
   - Caption detection

### Claude AI Capabilities
1. **Viral Moment Prediction**
   - Virality scoring (1-10)
   - Platform suitability analysis
   - Clip duration recommendations
   - Hook strategy generation

2. **Platform Strategy**
   - YouTube Shorts recommendations
   - TikTok-specific strategy
   - Instagram Reels optimization
   - LinkedIn professional positioning

3. **Hashtag Generation**
   - Trending hashtag identification
   - Platform-specific optimization
   - Niche and popular mix
   - Current trend consideration

4. **Engagement Hooks**
   - Problem-solution framing
   - Surprise/shock angles
   - FOMO/urgency elements
   - Benefit-driven messaging
   - Emotional resonance

## Configuration

### Environment Variables
```env
# No permanent API keys needed - clients provide their own when calling endpoints
OPENAI_MODEL=gpt-4-vision-preview  # Can be configured
CLAUDE_MODEL=claude-3-opus-20240229
AWS_REGION=us-east-1
```

### Client-Provided Credentials
All AI keys are provided per-request through the API:
- `openaiKey`: OpenAI API key (required for vision analysis)
- `claudeKey`: Anthropic Claude API key (required for strategy)
- `awsAccessKey`: AWS access key (optional for Rekognition)
- `awsSecretKey`: AWS secret key (optional for Rekognition)

This allows each client to use their own AI credentials without server-side storage.

## Performance & Costs

### Processing Time
- Quick virality check: ~100ms
- Full AI analysis: 2-5 seconds (depends on frame count)
- Platform recommendations: 3-8 seconds

### Cost Optimization
1. **Batch Processing**: Analyze multiple videos sequentially
2. **Selective Analysis**: Use quick virality check first, full analysis for promising videos
3. **Caching**: Store analysis results to avoid re-running

### API Rate Limits
- OpenAI Vision: 3 requests/min (free tier)
- Claude: 20 requests/min
- AWS Rekognition: 100 requests/sec

## Error Handling

```json
{
  "status": "error",
  "message": "AI analysis failed: Invalid API key",
  "code": 401
}
```

Common errors:
- `400`: Missing required credentials
- `401`: Invalid API keys
- `404`: Video not found
- `500`: Analysis service failure

## Best Practices

1. **Always use client credentials** - Don't store API keys on server
2. **Cache analysis results** - Avoid re-analyzing same video
3. **Batch upload + analyze** - Process videos efficiently
4. **Follow platform guidelines** - Use moderation data to ensure compliance
5. **A/B test recommendations** - Validate AI suggestions with real data

## Future Enhancements

- [ ] Real-time frame extraction from video files
- [ ] Batch analysis API for multiple videos
- [ ] Custom training with client's historical performance data
- [ ] Webhook notifications when analysis completes
- [ ] Analysis result versioning and comparison
- [ ] Competitor analysis integration
- [ ] Trending topic integration with real-time data
- [ ] Advanced metrics prediction (expected viral lift %)
