# Cloud Deployment Guide for StudioBot.ai

This guide covers deploying StudioBot.ai to various cloud platforms.

## Table of Contents
- [DigitalOcean Droplet](#digitalocean-droplet)
- [AWS EC2](#aws-ec2)
- [Railway](#railway)
- [Render](#render)
- [Fly.io](#flyio)

---

## Prerequisites
- GitHub repository with your code
- Cloud platform account
- Domain name (optional but recommended)
- API keys for YouTube, Twitch, etc.

---

## DigitalOcean Droplet

### Step 1: Create Droplet
1. Log into DigitalOcean
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Docker on Ubuntu 22.04
   - **Size**: Basic ($12/month - 2 GB RAM, 2 vCPUs)
   - **Datacenter**: Choose closest to your users
   - **Add SSH key** for secure access

### Step 2: Initial Setup
```bash
# SSH into your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Docker Compose
apt install docker-compose -y

# Clone your repository
git clone https://github.com/wflores9/StudioBot.ai.git
cd StudioBot.ai
```

### Step 3: Configure Environment
```bash
# Create .env file
nano .env
# Copy contents from .env.example and fill in your credentials
# Make sure to set:
# - NODE_ENV=production
# - JWT_SECRET (generate random string)
# - SESSION_SECRET (generate random string)
# - Platform API keys
```

### Step 4: Deploy
```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker logs -f studiobot-api
```

### Step 5: Configure Firewall
```bash
# Allow HTTP, HTTPS, and SSH
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Step 6: Set up Domain (Optional)
1. Point your domain's A record to droplet IP
2. Enable nginx profile:
```bash
docker-compose --profile nginx up -d
```
3. Get SSL certificate:
```bash
docker exec -it studiobot_nginx sh
# Inside container, use certbot for Let's Encrypt
```

### Step 7: Test Deployment
```bash
# From your local machine
curl http://your_droplet_ip:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Cost**: ~$12/month

---

## AWS EC2

### Step 1: Launch Instance
1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Choose:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t3.small (2 vCPU, 2 GB RAM)
   - **Security Group**: 
     - SSH (22) - Your IP
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
     - Custom TCP (3000) - 0.0.0.0/0

### Step 2: Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Clone repository
git clone https://github.com/wflores9/StudioBot.ai.git
cd StudioBot.ai
```

### Step 3: Configure and Deploy
```bash
# Create .env (same as DigitalOcean)
nano .env

# Deploy
docker-compose up -d

# Check logs
docker logs -f studiobot-api
```

### Step 4: Set up Elastic IP (Optional)
1. Allocate Elastic IP in AWS Console
2. Associate with your EC2 instance
3. Update DNS records to point to Elastic IP

**Cost**: ~$15-20/month (t3.small + storage)

---

## Railway

Railway offers simple deployment with GitHub integration.

### Step 1: Create Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `StudioBot.ai` repository

### Step 2: Configure Service
1. Railway will detect Dockerfile automatically
2. Click on the service → "Variables"
3. Add environment variables:
```
PORT=3000
NODE_ENV=production
JWT_SECRET=<generate-random-string>
SESSION_SECRET=<generate-random-string>
YOUTUBE_API_KEY=<your-key>
... (add all from .env)
```

### Step 3: Add PostgreSQL (Optional)
1. Click "New" → "Database" → "PostgreSQL"
2. Railway auto-creates DATABASE_URL variable
3. Update your app to use PostgreSQL

### Step 4: Deploy
1. Railway auto-deploys on push
2. Get your app URL from dashboard (e.g., `appname.up.railway.app`)
3. Test: `curl https://your-app.up.railway.app/health`

### Step 5: Custom Domain (Optional)
1. Settings → Domains → Add domain
2. Point your domain to Railway's CNAME

**Cost**: Free tier ($5 credit/month), then ~$10-20/month

---

## Render

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Sign in and click "New" → "Web Service"
3. Connect GitHub account and select repository

### Step 2: Configure Service
```
Name: studiobot-api
Environment: Docker
Region: Choose closest
Branch: main
```

### Step 3: Environment Variables
Add in Render dashboard:
```
PORT=3000
NODE_ENV=production
JWT_SECRET=<random-string>
SESSION_SECRET=<random-string>
... (all other env vars from .env)
```

### Step 4: Add Disk Storage
1. Advanced → Add Disk
2. Mount path: `/app/data`
3. Size: 1 GB (for database and files)

### Step 5: Deploy
1. Click "Create Web Service"
2. Render builds and deploys automatically
3. Your app will be at: `https://studiobot-api.onrender.com`

### Step 6: Test
```bash
curl https://studiobot-api.onrender.com/health
```

**Cost**: Free tier available, paid starts at $7/month

---

## Fly.io

### Step 1: Install flyctl
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login and Initialize
```bash
# Login
fly auth login

# Navigate to project
cd StudioBot.ai

# Initialize app
fly launch
# Choose:
# - App name: studiobot-ai
# - Region: Choose closest
# - PostgreSQL: No (using SQLite)
# - Redis: No (optional)
```

### Step 3: Configure fly.toml
Fly creates `fly.toml`. Update if needed:
```toml
app = "studiobot-ai"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[mounts]
  source = "data_volume"
  destination = "/app/data"
```

### Step 4: Create Volume
```bash
fly volumes create data_volume --size 1 --region iad
```

### Step 5: Set Secrets
```bash
fly secrets set JWT_SECRET=<random-string>
fly secrets set SESSION_SECRET=<random-string>
fly secrets set YOUTUBE_API_KEY=<your-key>
# ... set all sensitive env vars
```

### Step 6: Deploy
```bash
fly deploy
```

### Step 7: Test
```bash
fly open /health
# Or
curl https://studiobot-ai.fly.dev/health
```

**Cost**: Free tier (3 VMs), paid ~$5-10/month

---

## Post-Deployment Checklist

All platforms:

- [ ] ✅ API health check responds
- [ ] ✅ Test authentication endpoints
- [ ] ✅ Test video upload
- [ ] ✅ Configure domain and SSL
- [ ] ✅ Set up monitoring/logging
- [ ] ✅ Configure backups for database
- [ ] ✅ Update CORS allowed origins
- [ ] ✅ Set rate limiting
- [ ] ✅ Enable CDN (optional)
- [ ] ✅ Document deployment process

## Testing Production Deployment

```bash
# Run comprehensive tests against production
BASE_URL=https://your-domain.com node test-api.js
```

## Monitoring

### Option 1: Built-in Platform Monitoring
- Railway: Auto-monitors CPU, memory, requests
- Render: Metrics dashboard available
- Fly.io: Built-in metrics

### Option 2: External Services
- **Uptime Robot**: Free uptime monitoring
- **Better Uptime**: Advanced monitoring
- **New Relic**: APM and logging
- **Sentry**: Error tracking

### Add Health Check Monitoring
```bash
# Uptime Robot example
1. Add monitor: https://your-domain.com/health
2. Set interval: 5 minutes
3. Alert on failures
```

---

## Scaling

As your app grows:

1. **Horizontal Scaling**: Add more instances
   - Railway: Increase replicas
   - Fly.io: `fly scale count 3`
   - AWS: Auto Scaling Groups

2. **Vertical Scaling**: Upgrade resources
   - Increase RAM/CPU on platform dashboard

3. **Database**: Switch to PostgreSQL
   - Better for multiple instances
   - Built-in on most platforms

4. **Storage**: Use S3/object storage
   - Videos and media → AWS S3
   - Reduces server storage needs

---

## Cost Comparison

| Platform | Entry | Production | Pros |
|----------|-------|------------|------|
| DigitalOcean | $12/mo | $24-48/mo | Simple, predictable |
| AWS EC2 | $15/mo | $30-100/mo | Scalable, many services |
| Railway | $5/mo | $20-40/mo | Easy, GitHub integration |
| Render | $7 /mo | $20-50/mo | Auto-scaling, simple |
| Fly.io | Free | $10-30/mo | Edge deployment, fast |

**Recommendation for starting**: Railway or Render (easiest) or DigitalOcean (best value).

---

## Support

If you encounter issues:
1. Check platform-specific logs
2. Verify all environment variables
3. Test health endpoint
4. Review security groups/firewall
5. Check Docker logs: `docker logs studiobot-api`
