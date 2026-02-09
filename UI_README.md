# StudioBot.ai - UI & Desktop Applications

Complete user interface suite for StudioBot.ai with both web dashboard and desktop application.

## 📁 Project Structure

```
ui/
├── web/           # Next.js web dashboard
├── desktop/       # Electron desktop application
└── shared/        # Shared components and utilities (future)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- StudioBot API running on http://localhost:3000

### Web Dashboard

```bash
cd ui/web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

**Available at**: http://localhost:3001

### Desktop Application

```bash
cd ui/desktop

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build and package for distribution
npm run electron-dist
```

## ✨ Features

### Web Dashboard (`ui/web`)

**Technology Stack**:
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS (styling)
- Zustand (state management)
- Axios (API client)
- React Hook Form (form management)
- Recharts (analytics charts)

**Pages**:
- 🔐 **Authentication** - Login/Register
- 📊 **Dashboard** - Overview and stats
- 🎬 **Videos** - Upload and manage videos
- ✂️ **Clips** - Create and manage clips
- 📱 **Shorts** - Generate shorts from clips
- 📈 **Analytics** - View performance metrics
- 🌍 **Distribution** - Publish to multiple platforms

**Key Features**:
- Real-time upload progress
- Video status tracking
- Clip generation interface
- Multi-platform distribution
- Analytics dashboard
- User authentication

### Desktop Application (`ui/desktop`)

**Technology Stack**:
- Electron (desktop framework)
- React 18
- TypeScript
- IPC for system integration
- Native file dialogs

**Desktop-Only Features**:
- 📂 Native file system access
- 🎥 Local video preview
- ⚡ Offline-capable architecture
- 🖥️ Native system integration
- 🔄 Batch upload capability
- 💾 Local cache and settings

## 🔌 API Integration

Both applications connect to the StudioBot API:

**Development**: `http://localhost:3000/api`
**Production**: Configure via environment variables

### Environment Variables

**Web Dashboard** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Desktop** (`src/utils/config.ts`):
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Optimized for 1920x1080+
- **Tablet**: Optimized for 768px+
- **Mobile**: Optimized for 320px+

## 🎨 UI Components

Shared components available:
- `Layout` - Main layout wrapper
- `Button` - CTA buttons
- `Card` - Content containers
- `Modal` - Dialog modals
- `ProgressBar` - Upload progress
- `StatusBadge` - Status indicators

## 🔐 Authentication

Both apps use token-based authentication:
1. Register/Login via API
2. Store JWT token in localStorage (web) or secure storage (desktop)
3. Include token in all API requests
4. Auto-logout on 401 response

## 📊 State Management

**Web**: Zustand stores in `/store`
- `authStore` - User authentication
- `videoStore` - Video management
- `uiStore` - UI state

**Desktop**: Context API + custom hooks (recommended for Electron)

## 🚀 Building for Production

### Web Dashboard

```bash
cd ui/web

# Build
npm run build

# Deploy to Vercel, Netlify, or any hosting
vercel deploy
```

### Desktop Application

```bash
cd ui/desktop

# Build executables for all platforms
npm run electron-dist

# Files will be in dist/ directory
```

## 📚 API Integration Examples

### Upload Video
```typescript
const { uploadVideo } = useVideo();

await uploadVideo(file, 'My Video', 'Description');
```

### Create Clip
```typescript
const { createClip } = useClips();

await createClip(videoId, userId, 'Clip Title', 15, 45);
```

### Publish to Platforms
```typescript
const { publishContent } = useDistributions();

await publishContent(contentId, 'video', ['youtube', 'twitch']);
```

## 🔧 Development Tips

### Web Dashboard
- Hot reload enabled in dev mode
- TypeScript strict mode
- ESLint configured
- Tailwind CSS IntelliSense

### Desktop Application
- DevTools available in dev mode
- IPC logging available
- File system access through secure bridges
- Auto-updates ready (configure in Electron)

## 📦 Building Standalone

**Web**: Create Docker container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**Desktop**: Uses electron-builder (Windows/Mac/Linux)
- `.exe` for Windows
- `.dmg` for macOS
- `.AppImage`/`.deb` for Linux

## 🛠️ Troubleshooting

### API Connection Issues
1. Ensure backend is running on port 3000
2. Check CORS settings in backend
3. Verify API_URL environment variable

### File Upload Fails
1. Check file size limits (500MB max)
2. Verify file format (video/* required)
3. Check disk space

### Electron Build Issues
1. Clear node_modules and reinstall
2. Check Node version compatibility
3. Install build tools for your platform

## 📞 Support

For issues with:
- **Web Dashboard**: Check Next.js documentation
- **Desktop**: Check Electron documentation
- **API**: Check StudioBot API documentation

## 📄 License

Same license as StudioBot.ai main project
