# StudioBot.ai Deployment Guide

## Local Development Setup

### Quick Start
```bash
# 1. Clone repository
git clone <repo-url>
cd StudioBot.ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 4. Build TypeScript
npm run build

# 5. Start development server
npm run dev
```

Server runs on `http://localhost:3000`

---

## Production Deployment

### Prerequisites
- Node.js 16+
- npm or yarn
- FFmpeg installed
- Reverse proxy (Nginx/Apache)
- SSL certificate
- Database backup strategy

### Step 1: Server Setup

#### Ubuntu/Debian VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Create app user
sudo useradd -m studiobot
sudo -u studiobot mkdir -p /home/studiobot/app
```

#### macOS Server
```bash
# Install Node.js (via Homebrew)
brew install node

# Install FFmpeg
brew install ffmpeg

# Create app directory
mkdir -p ~/studiobot-app
```

### Step 2: Deploy Application

```bash
# Navigate to app directory
cd /home/studiobot/app

# Clone repository
git clone <repo-url> .

# Install production dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Create required directories
mkdir -p data temp/videos output/{clips,shorts,thumbnails} logs
```

### Step 3: Configure Environment

```bash
# Create production .env
cat > .env << EOF
PORT=3000
NODE_ENV=production
DATABASE_PATH=/home/studiobot/app/data/studiobot.db
TEMP_VIDEO_DIR=/home/studiobot/app/temp/videos
OUTPUT_CLIPS_DIR=/home/studiobot/app/output/clips
OUTPUT_SHORTS_DIR=/home/studiobot/app/output/shorts
OUTPUT_THUMBNAILS_DIR=/home/studiobot/app/output/thumbnails
LOG_LEVEL=info
LOG_FILE=/home/studiobot/app/logs/app.log

# Add your API keys here
YOUTUBE_API_KEY=your_key
YOUTUBE_CLIENT_ID=your_id
YOUTUBE_CLIENT_SECRET=your_secret
TWITCH_CLIENT_ID=your_id
TWITCH_ACCESS_TOKEN=your_token
RUMBLE_API_KEY=your_key

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
EOF

# Set proper permissions
chmod 600 .env
```

### Step 4: Setup Process Manager

#### Using PM2 (Recommended)
```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'studiobot-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration and enable startup
pm2 save
pm2 startup
```

#### Using Systemd (Alternative)
```bash
# Create systemd service
sudo tee /etc/systemd/system/studiobot.service << EOF
[Unit]
Description=StudioBot.ai API Server
After=network.target

[Service]
Type=simple
User=studiobot
WorkingDirectory=/home/studiobot/app
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable studiobot
sudo systemctl start studiobot

# Check status
sudo systemctl status studiobot
```

### Step 5: Configure Reverse Proxy

#### Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/studiobot << 'EOF'
upstream studiobot_api {
  server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name api.yourdomain.com;
  return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
  
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!eNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Proxy settings
  client_max_body_size 2G;

  location / {
    proxy_pass http://studiobot_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
  limit_req zone=api_limit burst=200 nodelay;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/studiobot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate

#### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 7: Database Backup

#### Create backup script
```bash
cat > /home/studiobot/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/studiobot/backups"
DB_PATH="/home/studiobot/app/data/studiobot.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/studiobot_$TIMESTAMP.db

# Keep only last 30 days
find $BACKUP_DIR -name "studiobot_*.db" -mtime +30 -delete
EOF

chmod +x /home/studiobot/backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/studiobot/backup.sh") | crontab -
```

---

## Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/index.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  studiobot:
    build: .
    container_name: studiobot-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_PATH: /app/data/studiobot.db
      TEMP_VIDEO_DIR: /app/temp/videos
      OUTPUT_CLIPS_DIR: /app/output/clips
      OUTPUT_SHORTS_DIR: /app/output/shorts
      OUTPUT_THUMBNAILS_DIR: /app/output/thumbnails
      LOG_LEVEL: info
    volumes:
      - ./data:/app/data
      - ./temp:/app/temp
      - ./output:/app/output
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy with Docker:
```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## AWS Deployment

### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 studiobot

# Create environment
eb create studiobot-prod

# Configure environment
# Add .env variables via AWS Secrets Manager

# Deploy
eb deploy
```

### Using EC2

```bash
# Launch t3.medium instance (2GB RAM minimum)
# Select Ubuntu 22.04 LTS

# Security groups: Allow 80, 443, 22

# SSH into instance and follow production setup above
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check API health
curl https://api.yourdomain.com/health

# Monitor logs
sudo journalctl -u studiobot -f

# Check disk space
df -h

# Check database size
ls -lh /home/studiobot/app/data/studiobot.db
```

### Auto-scaling Setup (AWS)
```
Load Balancer
    ↓
Auto Scaling Group
    ├── Instance 1 (t3.medium)
    ├── Instance 2 (t3.medium)
    └── Instance 3 (t3.medium)
    
    Scales based on:
    - CPU > 70%
    - Memory > 80%
```

### Upgrade Steps
```bash
# 1. Stop application
pm2 stop all

# 2. Backup database
cp data/studiobot.db data/studiobot.db.bak

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm ci

# 5. Build
npm run build

# 6. Test
npm run test

# 7. Start
pm2 start ecosystem.config.js
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs studiobot-api

# Check port availability
netstat -tlnp | grep 3000

# Check Node.js version
node --version
```

### High Memory Usage
```bash
# Check memory
pm2 monit

# Increase limit in PM2
# Edit ecosystem.config.js:
# max_memory_restart: '2G'
```

### Database Locks
```bash
# Check SQLite usage
lsof /home/studiobot/app/data/studiobot.db

# Migrate to PostgreSQL for production
```

### SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -noout -dates -in /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem

# Renew certificate
sudo certbot renew
```

---

## Performance Tuning

### Node.js
```bash
# Increase file descriptors
ulimit -n 65536

# Set heap memory
node --max-old-space-size=4096 dist/index.js
```

### Nginx
```
worker_processes auto;
worker_rlimit_nofile 65535;

http {
  keepalive_timeout 65;
  client_body_timeout 60;
  send_timeout 60;
}
```

### Database
```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
```

---

## Rollback Procedure

```bash
# If deployment fails:

# 1. Stop current version
pm2 stop studiobot-api

# 2. Restore database backup
cp data/studiobot.db.bak data/studiobot.db

# 3. Checkout previous version
git revert HEAD
npm ci
npm run build

# 4. Start previous version
pm2 start ecosystem.config.js

# 5. Investigate issue
pm2 logs studiobot-api
```

---

## Support & Resources

- Documentation: https://docs.studiobot.ai
- GitHub Issues: https://github.com/studiobot/studiobot.ai/issues
- Email: support@studiobot.ai
