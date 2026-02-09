import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger';

const dbPath = process.env.DATABASE_PATH || './data/studiobot.db';
let db: sqlite3.Database;

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
};

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.serialize(() => {
      // Users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Videos table
      database.run(`
        CREATE TABLE IF NOT EXISTS videos (
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
        )
      `);

      // Clips table
      database.run(`
        CREATE TABLE IF NOT EXISTS clips (
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
        )
      `);

      // Shorts table (vertical video format)
      database.run(`
        CREATE TABLE IF NOT EXISTS shorts (
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
        )
      `);

      // Thumbnails table
      database.run(`
        CREATE TABLE IF NOT EXISTS thumbnails (
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL,
          source_type TEXT NOT NULL,
          output_path TEXT,
          size TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Platform credentials table
      database.run(`
        CREATE TABLE IF NOT EXISTS platforms (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          platform_name TEXT NOT NULL,
          access_token TEXT,
          refresh_token TEXT,
          channel_id TEXT,
          credentials_encrypted TEXT,
          is_connected BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Content distribution history
      database.run(`
        CREATE TABLE IF NOT EXISTS distributions (
          id TEXT PRIMARY KEY,
          content_id TEXT NOT NULL,
          content_type TEXT NOT NULL,
          platform_name TEXT NOT NULL,
          platform_post_id TEXT,
          status TEXT DEFAULT 'pending',
          published_at DATETIME,
          url TEXT,
          view_count INTEGER DEFAULT 0,
          engagement_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          logger.error('Database initialization error:', err);
          reject(err);
        } else {
          logger.info('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
};
