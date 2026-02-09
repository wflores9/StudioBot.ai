import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/init';
import { videoRoutes } from './routes/video.routes';
import { clipRoutes } from './routes/clip.routes';
import { shortRoutes } from './routes/short.routes';
import { thumbnailRoutes } from './routes/thumbnail.routes';
import { platformRoutes } from './routes/platform.routes';
import { authRoutes } from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import distributionRoutes from './routes/distribution.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
initializeDatabase().catch((error) => {
  logger.error('Database initialization failed:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/shorts', shortRoutes);
app.use('/api/thumbnails', thumbnailRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/distributions', distributionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`StudioBot.ai server running on port ${PORT}`);
});

export default app;
