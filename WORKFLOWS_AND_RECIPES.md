# StudioBot.ai: Workflow & Recipe Examples

## 📖 Table of Contents

1. [Complete Workflow](#complete-workflow)
2. [Recipes](#recipes)
3. [Advanced Scenarios](#advanced-scenarios)
4. [Automation Scripts](#automation-scripts)

---

## 🔄 Complete Workflow

### Workflow: From Video to Multi-Platform Distribution

```
1. User Uploads Video
   ↓
2. AI Analyzes for Viral Moments
   ↓
3. System Suggests Clip Segments
   ↓
4. User Approves/Edits Clips
   ↓
5. System Generates Shorts (Vertical Format)
   ↓
6. System Creates Thumbnails
   ↓
7. User Connects Platforms (YouTube, Twitch, Rumble)
   ↓
8. System Publishes to All Platforms
   ↓
9. Analytics Tracked & Displayed
   ↓
10. User Optimizes Based on Performance
```

### Step-by-Step Implementation

```typescript
import { StudioBotAPI } from './sdk/studiobot-sdk';

// 1. Initialize API
const api = new StudioBotAPI('http://localhost:3000');

// 2. Register/Login
const auth = await api.register('user@example.com', 'password123', 'username');
const token = auth.token;
api.setToken(token);

// 3. Upload Video
const video = await api.uploadVideo('user123', 'https://example.com/video.mp4', 'My Stream Highlights');

// 4. Analyze Video
const analysis = await api.analyzeVideo(video.id);
// Returns: { viralMoments: [...], sentimentTrends: [...], suggestions: [...] }

// 5. Create Clips from Suggested Moments
const clips: any[] = [];
for (const moment of analysis.viralMoments.slice(0, 5)) {
  const clip = await api.createClip(video.id, moment.startTime, moment.endTime);
  clips.push(clip);
}

// 6. Generate Thumbnails
for (const clip of clips) {
  await api.generateThumbnail(clip.id);
}

// 7. Create Shorts from Clips
const shorts: any[] = [];
for (const clip of clips) {
  const short = await api.createShort(clip.id, '1080x1920');
  shorts.push(short);
}

// 8. Connect Platforms
const youtubeAuth = await api.connectPlatform('youtube', youtubeAuthCode);
const twitchAuth = await api.connectPlatform('twitch', twitchAuthCode);
const rumbleAuth = await api.connectPlatform('rumble', rumbleApiKey);

// 9. Publish to All Platforms
for (const clip of clips) {
  await api.publishContent(clip.id, 'clip', ['youtube', 'twitch', 'rumble'], {
    title: `Clip: ${clip.title}`,
    description: `From: ${video.title}\n\nCheck out the full video!`,
    tags: ['gaming', 'highlights', 'viral'],
  });
}

// 10. Monitor Analytics
const analytics = await api.getDistributionAnalytics();
console.log(analytics);
```

---

## 🧑‍🍳 Recipes

### Recipe 1: Auto-Clip and Publish

**Goal**: Automatically detect viral moments and publish to YouTube

```typescript
import { StudioBotAPI } from './sdk/studiobot-sdk';

async function autoClipAndPublish(videoId: string, platforms: string[]) {
  const api = new StudioBotAPI('http://localhost:3000');
  api.setToken(process.env.API_TOKEN!);

  try {
    // 1. Analyze video for viral moments
    console.log('📊 Analyzing video...');
    const analysis = await api.analyzeVideo(videoId);

    if (!analysis.viralMoments.length) {
      console.log('No viral moments detected');
      return;
    }

    // 2. Create clips automatically
    console.log(`✂️ Creating ${analysis.viralMoments.length} clips...`);
    const clips = await Promise.all(
      analysis.viralMoments.map((moment) =>
        api.createClip(videoId, moment.startTime, moment.endTime)
      )
    );

    // 3. Auto-approve clips
    console.log('✅ Approving clips...');
    await Promise.all(clips.map((clip) => api.approveClip(clip.id)));

    // 4. Publish to platforms
    console.log(`📤 Publishing to ${platforms.join(', ')}...`);
    await Promise.all(
      clips.map((clip) =>
        api.publishContent(clip.id, 'clip', platforms, {
          title: `Viral Moment: ${clip.title}`,
          description: `Auto-clipped viral moment. #shorts #viral`,
          tags: ['viral', 'highlights', 'auto-clipped'],
        })
      )
    );

    console.log('✨ Done!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

// Usage
autoClipAndPublish('video-123', ['youtube', 'twitch', 'rumble']);
```

### Recipe 2: Batch Process Multiple Videos

**Goal**: Upload and process multiple videos in sequence

```typescript
import fs from 'fs';
import path from 'path';

async function batchProcessVideos(videoDirectory: string) {
  const api = new StudioBotAPI('http://localhost:3000');
  api.setToken(process.env.API_TOKEN!);

  const videoFiles = fs
    .readdirSync(videoDirectory)
    .filter((file) => ['.mp4', '.webm', '.avi'].includes(path.extname(file)));

  console.log(`Found ${videoFiles.length} videos to process`);

  for (const file of videoFiles) {
    const filePath = path.join(videoDirectory, file);
    const filename = path.parse(file).name;

    try {
      console.log(`\n📹 Processing: ${filename}`);

      // Upload
      const video = await api.uploadVideo(
        'user-123',
        filePath,
        filename
      );

      // Wait for analysis
      let status = 'processing';
      let attempts = 0;
      while (status === 'processing' && attempts < 60) {
        await new Promise((r) => setTimeout(r, 5000)); // Wait 5s
        const result = await api.getVideo(video.id);
        status = result.status;
        attempts++;
      }

      // Create clips
      if (status === 'completed') {
        const analysis = await api.analyzeVideo(video.id);
        const clips = await Promise.all(
          analysis.viralMoments.slice(0, 3).map((moment) =>
            api.createClip(video.id, moment.startTime, moment.endTime)
          )
        );

        await Promise.all(clips.map((clip) => api.approveClip(clip.id)));

        console.log(`✅ Created ${clips.length} clips from ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, (error as Error).message);
    }
  }
}

// Usage
batchProcessVideos('./videos');
```

### Recipe 3: Smart Thumbnail Generation

**Goal**: Generate thumbnails and pick the best one

```typescript
async function generateSmartThumbnails(clipId: string) {
  const api = new StudioBotAPI('http://localhost:3000');
  api.setToken(process.env.API_TOKEN!);

  try {
    console.log('🖼️ Generating thumbnails...');

    // Generate at multiple frames
    const timestamps = [0, 0.25, 0.5, 0.75];
    const thumbnails = await Promise.all(
      timestamps.map((ts) => api.generateThumbnail(clipId, ts))
    );

    console.log(`Generated ${thumbnails.length} thumbnails`);

    // Analyze with AI for engagement
    // (assuming you have AI integration)
    // const scores = await Promise.all(
    //   thumbnails.map(t => analyzeEngagement(t.path))
    // );

    // Return highest scoring thumbnail
    return thumbnails[0]; // Simplified
  } catch (error) {
    console.error('Error generating thumbnails:', (error as Error).message);
  }
}
```

### Recipe 4: Platform-Specific Publishing

**Goal**: Customize content for each platform

```typescript
async function publishToAllPlatforms(clipId: string, metadata: any) {
  const api = new StudioBotAPI('http://localhost:3000');
  api.setToken(process.env.API_TOKEN!);

  const platformConfigs = {
    youtube: {
      title: `[🔥 VIRAL] ${metadata.title}`,
      description: `${metadata.description}\n\nSUBSCRIBE for more!`,
      categoryId: '20',
      tags: [...metadata.tags, 'viral', 'highlights'],
    },
    twitch: {
      title: `Highlight: ${metadata.title}`,
      description: metadata.description,
      language: 'en',
    },
    rumble: {
      title: `${metadata.title} - Full Clip`,
      description: `${metadata.description}\n\nShare and like!`,
      tags: metadata.tags,
    },
  };

  for (const [platform, config] of Object.entries(platformConfigs)) {
    try {
      console.log(`📤 Publishing to ${platform}...`);
      await api.publishContent(clipId, 'clip', [platform], config);
      console.log(`✅ ${platform} published`);
    } catch (error) {
      console.error(`❌ ${platform} failed:`, (error as Error).message);
    }
  }
}
```

---

## 🚀 Advanced Scenarios

### Scenario 1: Live Stream Clipping

Monitor live stream and auto-clip when engagement spikes:

```typescript
async function liveStreamAutoClipper(streamUrl: string) {
  const api = new StudioBotAPI('http://localhost:3000');

  // 1. Start monitoring stream
  // 2. Detect engagement spikes
  // 3. Record segment with 30s buffer
  // 4. Create clip
  // 5. Publish immediately

  const interval = setInterval(async () => {
    const metrics = await api.getStreamMetrics(streamUrl);

    if (metrics.engagementRate > 80) {
      // High engagement detected
      const clip = await api.createClipFromStream(streamUrl, {
        duration: 30,
        quality: '1080p',
      });

      await api.publishContent(clip.id, 'clip', ['youtube', 'twitch']);
      console.log('🎬 Live clip published!');
    }
  }, 10000); // Check every 10 seconds
}
```

### Scenario 2: Analytics-Driven Optimization

Adjust publishing strategy based on performance:

```typescript
async function optimizeBasedOnAnalytics() {
  const api = new StudioBotAPI('http://localhost:3000');

  // Get last 30 days analytics
  const analytics = await api.getDistributionAnalytics({
    days: 30,
  });

  // Analyze by platform
  let bestPlatform = 'youtube';
  let bestEngagement = 0;

  for (const platform of ['youtube', 'twitch', 'rumble']) {
    const platformStats = analytics.filter((a) => a.platform === platform);
    const avgEngagement = platformStats.reduce((sum, a) => sum + a.engagement, 0) / platformStats.length;

    if (avgEngagement > bestEngagement) {
      bestEngagement = avgEngagement;
      bestPlatform = platform;
    }
  }

  console.log(`✨ Best performing platform: ${bestPlatform}`);
  console.log(`📊 Average engagement: ${bestEngagement}%`);

  // Adjust publishing: prioritize best platform
  // Reduce frequency on low-performing platforms
}
```

### Scenario 3: Content Recommendation Engine

Suggest content based on trending topics:

```typescript
async function contentRecommendations() {
  const api = new StudioBotAPI('http://localhost:3000');

  // 1. Get past successful clips
  const topClips = await api.getClips({ sortBy: 'engagement', limit: 20 });

  // 2. Analyze common patterns
  const commonTags = topClips.flatMap((c) => c.tags) as string[];
  const trendingTopics = getMostFrequent(commonTags, 10);

  // 3. Recommend future content
  console.log('🎯 Trending topics to focus on:');
  trendingTopics.forEach((topic) => {
    console.log(`  - ${topic}`);
  });

  // 4. Suggest video themes
  const recommendations = generateContentRecommendations(trendingTopics);
  return recommendations;
}

function getMostFrequent(arr: string[], n: number) {
  const counts = new Map<string, number>();
  arr.forEach((tag) => {
    counts.set(tag, (counts.get(tag) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((e) => e[0]);
}

function generateContentRecommendations(trends: string[]) {
  return trends.map((trend) => ({
    topic: trend,
    suggestedLength: '30-60 seconds',
    platforms: ['youtube', 'twitch', 'rumble'],
    expectedEngagement: 'High',
  }));
}
```

---

## 🤖 Automation Scripts

### Script 1: Daily Video Compilation

Auto-compile yesterday's highlights into a shorts compilation:

```typescript
// daily-highlight-compiler.ts
import { StudioBotAPI } from './sdk/studiobot-sdk';

async function compileHighlights() {
  const api = new StudioBotAPI('http://localhost:3000');
  api.setToken(process.env.API_TOKEN!);

  const yesterday = new Date(Date.now() - 86400000);

  // Get clips from yesterday
  const clips = await api.getClips({
    createdAfter: yesterday.toISOString(),
    sortBy: 'engagement',
  });

  if (!clips.length) {
    console.log('No clips from yesterday');
    return;
  }

  // Create compilation video
  const compilation = {
    title: `Daily Highlights - ${yesterday.toLocaleDateString()}`,
    clips: clips.slice(0, 5),
    music: 'royalty-free-upbeat.mp3',
    transitions: 'fade',
  };

  // Publish
  for (const platform of ['youtube', 'twitch', 'rumble']) {
    await api.publishContent(compilation.title, 'short', [platform], {
      title: compilation.title,
      description: `Today's top 5 moments!\n\n${clips.map((c) => c.title).join('\n')}`,
      tags: ['daily', 'compilation', 'highlights'],
    });
  }

  console.log('✅ Daily compilation published');
}

// Run daily
if (require.main === module) {
  compileHighlights().catch(console.error);
}

// Or with node-cron for scheduling:
// const cron = require('node-cron');
// cron.schedule('0 6 * * *', compileHighlights); // 6 AM daily
```

### Script 2: Weekly Analytics Report

Generate and email weekly performance report:

```typescript
async function generateWeeklyReport() {
  const api = new StudioBotAPI('http://localhost:3000');

  const lastWeek = new Date(Date.now() - 7 * 86400000);
  const analytics = await api.getDistributionAnalytics({
    startDate: lastWeek.toISOString(),
  });

  const report = {
    period: `${lastWeek.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
    totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
    totalEngagement: analytics.reduce((sum, a) => sum + a.engagement, 0),
    topClip: analytics.sort((a, b) => b.views - a.views)[0],
    byPlatform: groupBy(analytics, 'platform'),
  };

  // Send email
  // await emailReport(report, 'analytics@example.com');

  console.log(JSON.stringify(report, null, 2));
}

function groupBy(arr: any[], key: string) {
  const grouped: any = {};
  arr.forEach((item) => {
    const group = item[key];
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  });
  return grouped;
}
```

### Script 3: Content Sync to Multiple Sources

Backup and sync content across platforms:

```typescript
async function syncContentAcrossPlatforms() {
  const api = new StudioBotAPI('http://localhost:3000');

  // Get all clips
  const clips = await api.getClips({ limit: 100 });

  for (const clip of clips) {
    // Ensure clip exists on all platforms
    const published = await api.getDistributions(clip.id);
    const publishedPlatforms = new Set(published.map((p) => p.platform));

    // Publish to missing platforms
    for (const platform of ['youtube', 'twitch', 'rumble']) {
      if (!publishedPlatforms.has(platform)) {
        console.log(`Publishing ${clip.id} to ${platform}...`);
        await api.publishContent(clip.id, 'clip', [platform]);
      }
    }
  }

  console.log('✅ All content synced');
}
```

---

## 📚 More Examples

Visit the `examples/` directory in the repository for:
- Complete working applications
- Integration examples
- Database migrations
- Docker deployments
- CI/CD configurations

---

**Ready to start? Pick a recipe and customize it for your needs! 🚀**
