#!/usr/bin/env node

/**
 * StudioBot.ai CLI Tool
 * Command-line interface for StudioBot operations
 */

import { program } from 'commander';
import { StudioBotAPI } from './sdk/studiobot-sdk';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.studiobot');
const api = new StudioBotAPI(process.env.STUDIOBOT_API_URL || 'http://localhost:3000/api');

interface Config {
  userId?: string;
  token?: string;
  email?: string;
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
  return {};
}

function saveConfig(config: Config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const config = loadConfig();
if (config.token) {
  api.setToken(config.token);
}

program.version('1.0.0').description('StudioBot.ai CLI Tool');

// Auth Commands
program
  .command('auth:register')
  .description('Register a new user')
  .option('-u, --username <username>', 'Username')
  .option('-e, --email <email>', 'Email address')
  .option('-p, --password <password>', 'Password')
  .action(async (options) => {
    try {
      if (!options.username || !options.email || !options.password) {
        console.error('Usage: studiobot auth:register -u <username> -e <email> -p <password>');
        process.exit(1);
      }

      console.log('📝 Registering user...');
      const user = await api.register(options.username, options.email, options.password);
      console.log('✓ User registered:', user.id);
      console.log('  Run: studiobot auth:login -e ' + user.email + ' -p <password>');
    } catch (err) {
      console.error('✗ Registration failed:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('auth:login')
  .description('Login to StudioBot')
  .option('-e, --email <email>', 'Email address')
  .option('-p, --password <password>', 'Password')
  .action(async (options) => {
    try {
      if (!options.email || !options.password) {
        console.error('Usage: studiobot auth:login -e <email> -p <password>');
        process.exit(1);
      }

      console.log('🔐 Logging in...');
      const result = await api.login(options.email, options.password);
      config.userId = result.user.id;
      config.token = result.token;
      config.email = result.user.email;
      saveConfig(config);
      console.log('✓ Logged in as:', result.user.username);
      console.log('  Token saved to:', configPath);
    } catch (err) {
      console.error('✗ Login failed:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('auth:logout')
  .description('Logout from StudioBot')
  .action(() => {
    saveConfig({});
    console.log('✓ Logged out');
  });

// Video Commands
program
  .command('video:upload')
  .description('Upload a video from URL')
  .option('-u, --url <url>', 'Video URL')
  .option('-t, --title <title>', 'Video title')
  .option('-d, --description <description>', 'Video description')
  .action(async (options) => {
    try {
      if (!config.userId) {
        console.error('✗ Not logged in. Run: studiobot auth:login');
        process.exit(1);
      }

      if (!options.url || !options.title) {
        console.error('Usage: studiobot video:upload -u <url> -t <title> [-d <description>]');
        process.exit(1);
      }

      console.log('📤 Uploading video...');
      const video = await api.uploadVideo(config.userId, options.url, options.title, options.description);
      console.log('✓ Video uploaded:', video.id);
      console.log('  Status:', video.status);
      console.log('  Created:', new Date(video.created_at).toLocaleString());
    } catch (err) {
      console.error('✗ Upload failed:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('video:list')
  .description('List your videos')
  .option('-p, --page <page>', 'Page number', '1')
  .option('-l, --limit <limit>', 'Items per page', '10')
  .action(async (options) => {
    try {
      if (!config.userId) {
        console.error('✗ Not logged in. Run: studiobot auth:login');
        process.exit(1);
      }

      console.log('📹 Fetching videos...');
      const result = await api.getUserVideos(config.userId, parseInt(options.page), parseInt(options.limit));
      
      if (result.data.length === 0) {
        console.log('No videos found');
        return;
      }

      console.log('\n📺 Your Videos:');
      result.data.forEach((video) => {
        console.log(`  ${video.id} - ${video.title}`);
        console.log(`    Status: ${video.status} | Created: ${new Date(video.created_at).toLocaleDateString()}`);
      });
      console.log(`\nPage ${result.page} of ${Math.ceil(result.limit / 10)}`);
    } catch (err) {
      console.error('✗ Failed to list videos:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('video:get <videoId>')
  .description('Get video details')
  .action(async (videoId) => {
    try {
      console.log('🎬 Fetching video...');
      const video = await api.getVideo(videoId);
      console.log('\n📹 Video Details:');
      console.log('  ID:', video.id);
      console.log('  Title:', video.title);
      console.log('  Description:', video.description || 'N/A');
      console.log('  Status:', video.status);
      console.log('  Size:', video.file_size ? Math.round(video.file_size / 1024 / 1024) + ' MB' : 'N/A');
      console.log('  Created:', new Date(video.created_at).toLocaleString());
    } catch (err) {
      console.error('✗ Failed to get video:', (err as Error).message);
      process.exit(1);
    }
  });

// Clip Commands
program
  .command('clip:create')
  .description('Create a clip from a video')
  .option('-v, --video <videoId>', 'Video ID')
  .option('-t, --title <title>', 'Clip title')
  .option('-s, --start <start>', 'Start time (seconds)')
  .option('-e, --end <end>', 'End time (seconds)')
  .action(async (options) => {
    try {
      if (!config.userId) {
        console.error('✗ Not logged in. Run: studiobot auth:login');
        process.exit(1);
      }

      if (!options.video || !options.title || !options.start || !options.end) {
        console.error('Usage: studiobot clip:create -v <videoId> -t <title> -s <start> -e <end>');
        process.exit(1);
      }

      console.log('✂️  Creating clip...');
      const clip = await api.createClip(
        options.video,
        config.userId,
        options.title,
        parseFloat(options.start),
        parseFloat(options.end)
      );
      console.log('✓ Clip created:', clip.id);
      console.log('  Duration:', clip.duration + ' seconds');
      console.log('  Status:', clip.status);
    } catch (err) {
      console.error('✗ Failed to create clip:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check API and login status')
  .action(async () => {
    try {
      // Try to reach API
      const response = await fetch(`${process.env.STUDIOBOT_API_URL || 'http://localhost:3000/api'}/health`);
      const health = await response.json();

      console.log('🔍 StudioBot Status:\n');
      console.log('  API Server: ✓ Online');
      console.log('  Timestamp:', health.timestamp);

      if (config.userId) {
        console.log('\n👤 Authentication: ✓ Logged in');
        console.log('  User ID:', config.userId);
        console.log('  Email:', config.email);
      } else {
        console.log('\n👤 Authentication: ✗ Not logged in');
        console.log('  Run: studiobot auth:login');
      }
    } catch (err) {
      console.error('✗ API Server: Offline');
      console.error('  Make sure the StudioBot API is running on', process.env.STUDIOBOT_API_URL || 'http://localhost:3000');
    }
  });

program
  .command('help')
  .description('Show help')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
