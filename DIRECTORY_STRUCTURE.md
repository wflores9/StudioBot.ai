# StudioBot.ai: Directory Structure & Navigation Guide

## 📁 Complete Project Structure

```
StudioBot.ai/
│
├── 📂 src/                                 # TypeScript Source Code
│   ├── index.ts                           # Express server entry point
│   │
│   ├── 📂 routes/                         # API Route Handlers (6 files)
│   │   ├── auth.routes.ts                 # Auth endpoints (register, login, profile)
│   │   ├── video.routes.ts                # Video management (upload, list, delete)
│   │   ├── clip.routes.ts                 # Clip creation & approval
│   │   ├── short.routes.ts                # Shorts generation
│   │   ├── thumbnail.routes.ts            # Thumbnail generation
│   │   └── platform.routes.ts             # Platform integrations
│   │
│   ├── 📂 services/                       # Business Logic Layer (10 files)
│   │   ├── auth.service.ts                # User authentication
│   │   ├── video.service.ts               # Video analysis & processing
│   │   ├── clip.service.ts                # Clip extraction with FFmpeg
│   │   ├── short.service.ts               # Vertical format conversion
│   │   ├── thumbnail.service.ts           # Thumbnail generation
│   │   ├── platform.service.ts            # Multi-platform publishing
│   │   ├── platform.integrations.ts       # YouTube, Twitch, Rumble APIs
│   │   ├── oauth.service.ts               # OAuth flow management
│   │   ├── analytics.service.ts           # Analytics aggregation
│   │   └── ai.integration.ts              # AI service integrations
│   │
│   ├── 📂 middleware/                     # Express Middleware (2 files)
│   │   ├── errorHandler.ts                # Centralized error handling
│   │   └── auth.ts                        # JWT authentication
│   │
│   ├── 📂 database/                       # Data Access Layer (1 file)
│   │   └── init.ts                        # SQLite/PostgreSQL schema
│   │
│   ├── 📂 types/                          # TypeScript Types (1 file)
│   │   └── models.ts                      # Data models & interfaces
│   │
│   ├── 📂 utils/                          # Utility Functions (1 file)
│   │   └── logger.ts                      # Structured logging
│   │
│   └── 📂 dashboard/                      # React Components (1 file)
│       └── Dashboard.tsx                  # Main dashboard UI
│
├── 📂 sdk/                                 # Client Libraries
│   └── studiobot-sdk.ts                   # TypeScript SDK (400+ lines)
│
├── 📂 cli/                                 # Command-Line Tools
│   └── studiobot-cli.ts                   # CLI with Commander.js
│
├── 📂 data/                                # Runtime Data
│   └── studiobot.db                       # SQLite database (auto-created)
│
├── 📂 temp/                                # Temporary Files
│   └── 📂 videos/                         # Temporary video storage
│
├── 📂 output/                              # Generated Content
│   ├── 📂 clips/                          # Generated clips
│   ├── 📂 shorts/                         # Generated shorts (1080x1920)
│   └── 📂 thumbnails/                     # Generated thumbnails
│
├── 📂 logs/                                # Application Logs
│   └── app.log                            # Main application log file
│
├── 📂 node_modules/                        # NPM Dependencies (auto-created)
│   └── [100+ packages]
│
├── 📂 dist/                                # Compiled JavaScript (auto-created)
│   └── [compiled .js files]
│
├── 📝 Configuration Files
│   ├── package.json                       # Dependencies & scripts
│   ├── package-lock.json                  # Locked versions
│   ├── tsconfig.json                      # TypeScript config
│   ├── .env.example                       # Environment variables template
│   ├── .env                                # Your local env vars (git ignored)
│   ├── .gitignore                         # Git ignore rules
│   └── .eslintrc.json                     # Linting rules
│
├── 🐳 Container Files
│   ├── Dockerfile                         # Single container build
│   └── docker-compose.yml                 # Multi-service orchestration
│
├── 📚 Documentation Files
│   ├── README.md                          # Project description
│   ├── API.md                             # API reference (30+ endpoints)
│   ├── ARCHITECTURE.md                    # System design & patterns
│   ├── CONFIGURATION.md                   # Advanced configuration
│   ├── DEPLOYMENT.md                      # Deployment guide
│   ├── SETUP_GUIDE.md                     # Getting started (NEW)
│   ├── PLATFORM_INTEGRATION.md            # Platform setup (NEW)
│   ├── WORKFLOWS_AND_RECIPES.md           # Usage examples (NEW)
│   ├── PROJECT_OVERVIEW.md                # Complete overview (NEW)
│   ├── LATEST_UPDATES.md                  # What's new (NEW)
│   └── DIRECTORY_STRUCTURE.md             # This file (NEW)
│
├── 🧪 Testing
│   └── test-api.js                        # API integration tests (300+ lines)
│
└── 📋 Project Files
    ├── LICENSE                            # MIT License
    └── .gitattributes                     # Git attributes
```

---

## 🗺️ Navigation Guide

### Quick Links by Task

#### 🚀 Getting Started
1. **First Time Setup**: Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Quick Test**: Run `node test-api.js`
3. **Check Health**: `curl http://localhost:3000/health`

#### 📡 API Development
1. **View All Endpoints**: [API.md](./API.md)
2. **Route Handlers**: `src/routes/` (6 files)
3. **Services**: `src/services/` (10 files)
4. **Types**: `src/types/models.ts`

#### 🔌 Platform Integration
1. **Setup Instructions**: [PLATFORM_INTEGRATION.md](./PLATFORM_INTEGRATION.md)
2. **Implementation**: `src/services/platform.integrations.ts`
3. **OAuth Flows**: `src/services/oauth.service.ts`
4. **Analytics**: `src/services/analytics.service.ts`

#### 💻 Client Development
1. **TypeScript SDK**: `sdk/studiobot-sdk.ts`
2. **CLI Tool**: `cli/studiobot-cli.ts`
3. **React Dashboard**: `src/dashboard/Dashboard.tsx`

#### 📊 Monitoring & Analytics
1. **Logs**: `logs/app.log`
2. **Analytics Service**: `src/services/analytics.service.ts`
3. **Database**: `data/studiobot.db`

#### 🐳 Deployment
1. **Docker Setup**: [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Dockerfile**: `./Dockerfile`
3. **Docker Compose**: `./docker-compose.yml`
4. **Configuration**: [CONFIGURATION.md](./CONFIGURATION.md)

#### 📚 Learning Resources
1. **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Workflows**: [WORKFLOWS_AND_RECIPES.md](./WORKFLOWS_AND_RECIPES.md)
3. **Project Overview**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
4. **Latest Updates**: [LATEST_UPDATES.md](./LATEST_UPDATES.md)

---

## 📂 Directory Purpose

### `src/` - Main Application Code
**Contains all TypeScript source code organized into layers:**
- `routes/` - HTTP endpoint handlers
- `services/` - Business logic & external APIs
- `middleware/` - Express middleware
- `database/` - Data access & schema
- `types/` - TypeScript interfaces
- `utils/` - Helper functions
- `dashboard/` - React components

**Files**: 22 TypeScript files
**Lines**: 5,000+ lines of code
**Key File**: `src/index.ts` (application entry point)

### `sdk/` - Client Libraries
**Client-side code for consuming the API:**
- `studiobot-sdk.ts` - TypeScript SDK with 20+ methods

**Usage**: 
```typescript
import { StudioBotAPI } from './sdk/studiobot-sdk';
const api = new StudioBotAPI('http://localhost:3000');
```

### `cli/` - Command-Line Interface
**Interactive console tool:**
- `studiobot-cli.ts` - 400+ lines with 10+ commands

**Usage**:
```bash
studiobot-cli auth:register
studiobot-cli video:upload
studiobot-cli clip:create
```

### `data/` - Database Files
**Runtime data storage:**
- `studiobot.db` - SQLite database (auto-created)

**Access**:
```bash
sqlite3 data/studiobot.db ".tables"
```

### `temp/` - Temporary Storage
**Intermediate processing files:**
- `videos/` - Downloaded/uploaded videos awaiting processing

**Auto-cleanup**: Typically cleared after processing

### `output/` - Generated Content
**Final processed outputs:**
- `clips/` - Extracted clip videos
- `shorts/` - Vertical format shorts
- `thumbnails/` - Generated preview images

**Storage**: Persisted for download/delivery

### `logs/` - Application Logs
**Runtime diagnostic information:**
- `app.log` - Main application log file

**View logs**:
```bash
tail -f logs/app.log
```

### `dist/` - Compiled Output
**Auto-generated compiled JavaScript:**
- Contains compiled `.js` files from `src/` TypeScript
- Generated by `npm run build`

**Generated from**: `src/` directory
**Used by**: `npm start` command

---

## 📖 Documentation Map

### Getting Started (Beginner)
```
1. README.md              ← Start here
2. SETUP_GUIDE.md         ← Installation & config
3. test-api.js            ← Try it out
```

### Understanding the System (Intermediate)
```
1. ARCHITECTURE.md        ← How it works
2. API.md                 ← API endpoints
3. PROJECT_OVERVIEW.md    ← Complete structure
```

### Building & Customizing (Advanced)
```
1. PLATFORM_INTEGRATION.md ← Add YouTube/Twitch/Rumble
2. CONFIGURATION.md        ← Advanced settings
3. WORKFLOWS_AND_RECIPES.md ← Automation examples
```

### Deployment & Operations (DevOps)
```
1. DEPLOYMENT.md          ← Production setup
2. Docker files           ← Containerization
3. CONFIGURATION.md       ← Env variables
```

---

## 🔍 Finding Things

### By Feature

**Video Upload**
- Route: `src/routes/video.routes.ts`
- Service: `src/services/video.service.ts`
- Endpoint: `POST /api/videos/upload`
- SDK: `api.uploadVideo()`

**Multi-Platform Publishing**
- Route: `src/routes/platform.routes.ts`
- Service: `src/services/platform.service.ts`
- Integration: `src/services/platform.integrations.ts`
- Endpoint: `POST /api/distributions/publish`

**User Authentication**
- Route: `src/routes/auth.routes.ts`
- Service: `src/services/auth.service.ts`
- Middleware: `src/middleware/auth.ts`
- Endpoint: `POST /api/auth/login`

**Analytics**
- Service: `src/services/analytics.service.ts`
- Endpoint: `GET /api/distributions/analytics`
- SDK: `api.getDistributionAnalytics()`

**OAuth Integration**
- Service: `src/services/oauth.service.ts`
- Doc: `PLATFORM_INTEGRATION.md`
- Endpoint: `POST /api/platforms/auth/:platform`

### By Language

**TypeScript Services**
- Location: `src/services/*.ts`
- Count: 10 files
- Purpose: Business logic

**API Routes**
- Location: `src/routes/*.ts`
- Count: 6 files
- Purpose: HTTP endpoints

**React Components**
- Location: `src/dashboard/`
- Count: 1 main component
- Purpose: Web UI

**JavaScript**
- Location: `test-api.js`, `cli/*, `sdk/*`
- Purpose: Testing, CLI, SDK

**SQL/Database**
- Location: `src/database/init.ts`
- Purpose: Schema definition

---

## 🛠️ Common Commands

### Development
```bash
npm install              # Install dependencies
npm run build            # Build TypeScript
npm run dev              # Development with hot-reload
npm start                # Run server
npm test                 # Run tests
```

### Testing
```bash
node test-api.js         # Run integration tests
curl http://localhost:3000/health  # Health check
npm test -- --watch      # Watch mode
```

### Database
```bash
sqlite3 data/studiobot.db ".tables"     # List tables
sqlite3 data/studiobot.db ".schema"     # View schema
npm run migrate:up                      # Database migrations
```

### Docker
```bash
docker build -t studiobot:latest .      # Build image
docker run -p 3000:3000 studiobot      # Run container
docker-compose up -d                    # Start all services
```

### CLI
```bash
npx ts-node cli/studiobot-cli.ts help          # List commands
npm link                                        # Install globally
studiobot-cli auth:register                    # Run command
```

---

## 📊 Project Statistics

### Code Files
| Type | Count | Lines |
|------|-------|-------|
| Services | 10 | 2,500+ |
| Routes | 6 | 800+ |
| Middleware | 2 | 150 |
| Components | 1 | 350+ |
| SDK | 1 | 400+ |
| CLI | 1 | 400+ |
| Tests | 1 | 300+ |
| **Total** | **22** | **5,000+** |

### Documentation
| File | Lines | Purpose |
|------|-------|---------|
| README.md | 150 | Overview |
| API.md | 400 | API reference |
| ARCHITECTURE.md | 300 | Design patterns |
| CONFIGURATION.md | 250 | Config guide |
| DEPLOYMENT.md | 300 | Deployment |
| SETUP_GUIDE.md | 400 | Setup instructions |
| PLATFORM_INTEGRATION.md | 300 | Platform setup |
| WORKFLOWS_AND_RECIPES.md | 500 | Examples |
| PROJECT_OVERVIEW.md | 400 | Complete overview |
| LATEST_UPDATES.md | 400 | What's new |
| **Total** | **3,000+** | **Complete docs** |

---

## 🚀 Project Readiness

### ✅ Core Features
- [x] 30+ API endpoints
- [x] 7-table database schema
- [x] Video processing pipeline
- [x] Multi-platform integration
- [x] OAuth 2.0 flows
- [x] Analytics aggregation
- [x] React dashboard
- [x] CLI tool
- [x] TypeScript SDK

### ✅ Development Tools
- [x] TypeScript support
- [x] ESLint config
- [x] Jest setup
- [x] Integration tests
- [x] Error handling
- [x] Logging system
- [x] Docker support

### ✅ Documentation
- [x] API reference
- [x] Setup guide
- [x] Architecture guide
- [x] Platform integration guide
- [x] Workflow examples
- [x] Deployment guide
- [x] Configuration guide

### ⏳ Future Enhancements
- [ ] Live streaming support
- [ ] Mobile app (React Native)
- [ ] Advanced ML features
- [ ] Webhook support
- [ ] Message queuing
- [ ] GraphQL API
- [ ] Admin dashboard

---

## 💡 Tips for Navigation

1. **Always start with README.md** - Get oriented
2. **Use SETUP_GUIDE.md before running anything** - Proper environment
3. **Check API.md for endpoint details** - Find what you need
4. **Read ARCHITECTURE.md to understand design** - Learn the structure
5. **Look at WORKFLOWS_AND_RECIPES.md for examples** - See real code
6. **Search for feature names** - Find implementation quickly
7. **Use IDE's "Go to Definition"** - Jump between files
8. **Check test-api.js for usage** - See working examples

---

## 🆘 If You Can't Find Something

### Problem: "Where is X feature?"

1. Search in [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for feature index
2. Check [API.md](./API.md) for endpoint
3. Look in `src/routes/` for route handler
4. Find in `src/services/` for business logic
5. Check [DIRECTORY_STRUCTURE.md](./DIRECTORY_STRUCTURE.md) (this file)

### Problem: "How do I use X?"

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for initial setup
2. See [API.md](./API.md) for endpoint docs
3. Look at `test-api.js` for usage examples
4. Check SDK method in `sdk/studiobot-sdk.ts`
5. View recipes in [WORKFLOWS_AND_RECIPES.md](./WORKFLOWS_AND_RECIPES.md)

### Problem: "How do I deploy?"

1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Use [docker-compose.yml](./docker-compose.yml) for full stack
3. Configure [CONFIGURATION.md](./CONFIGURATION.md)
4. Follow production checklist in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📞 Documentation Cross-References

| Doc | Covers | Links To |
|-----|--------|----------|
| README.md | Overview | All other docs |
| SETUP_GUIDE.md | Getting started | PLATFORM_INTEGRATION.md |
| PLATFORM_INTEGRATION.md | Platform setup | CONFIGURATION.md |
| API.md | Endpoints | src/routes/ |
| WORKFLOWS_AND_RECIPES.md | Examples | SDK, CLI, API |
| ARCHITECTURE.md | Design | Database, Services |
| DEPLOYMENT.md | Production | Docker, docker-compose.yml |
| PROJECT_OVERVIEW.md | Reference | All docs |

---

**You're all set! Navigate using this guide and the cross-references above. Happy coding! 🚀**
