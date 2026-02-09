# StudioBot.ai Frontend

Modern React frontend for the StudioBot.ai AI-powered video platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── client.ts          # API client & endpoints
│   ├── components/
│   │   ├── Layout.tsx         # Main layout with sidebar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.tsx          # Login/Register page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── VideoUpload.tsx    # Video upload (file & URL)
│   │   ├── VideoList.tsx      # Video management
│   │   ├── VideoDetail.tsx    # Video details & analysis
│   │   ├── ClipManager.tsx    # Clip creation
│   │   ├── ShortManager.tsx   # Shorts generation
│   │   ├── PlatformManager.tsx# Platform publishing
│   │   └── Analytics.tsx      # Analytics dashboard
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 Features

### ✅ Implemented
- **Authentication** - Login/Register with demo mode
- **Dashboard** - Stats overview and quick actions
- **Video Upload** - Direct file upload (recommended) & URL upload
- **Sidebar Navigation** - Collapsible sidebar with routing
- **Responsive Design** - Works on desktop, tablet, and mobile

### 🚧 Coming Soon
- **Video List** - Browse and manage videos
- **Video Detail** - View AI analysis and viral moments
- **Clip Manager** - Create and approve clips
- **Short Manager** - Generate shorts from clips
- **Platform Manager** - Connect and publish to platforms
- **Analytics** - Performance metrics and insights

## 🎯 Key Components

### API Client
Located in `src/api/client.ts`, provides TypeScript interfaces for all backend endpoints:

```typescript
import { videoAPI } from '../api/client';

// Upload video file
const formData = new FormData();
formData.append('video', file);
formData.append('user_id', userId);
formData.append('title', 'My Video');
const response = await videoAPI.uploadFile(formData);

// Get video analysis
const analysis = await videoAPI.getAnalysis(videoId);
```

### Video Upload Component
Direct file upload with drag-and-drop support:
- Validates file type and size
- Real-time upload progress
- Switches between file upload and URL upload
- Automatic AI analysis trigger

### Dashboard
Shows:
- Stats (videos, clips, shorts, analyzing)
- Quick actions
- Recent videos with status badges

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` file in client directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Styling

Uses CSS variables for theming. Customize in `src/index.css`:

```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --success: #4caf50;
  --error: #f44336;
  /* ... */
}
```

## 📱 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main overview |
| `/upload` | VideoUpload | Upload videos |
| `/videos` | VideoList | Browse videos |
| `/videos/:id` | VideoDetail | Video details |
| `/clips` | ClipManager | Manage clips |
| `/shorts` | ShortManager | Manage shorts |
| `/platforms` | PlatformManager | Platform connections |
| `/analytics` | Analytics | Performance metrics |

## 🎨 UI Components

### Sidebar Navigation
- Collapsible sidebar
- Active route highlighting
- User profile section
- Logout button

### Page Layout
- Consistent header structure
- Responsive grid layouts
- Card-based design
- Smooth transitions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔗 API Integration

The frontend connects to the backend API at `http://localhost:3000/api` by default.

Make sure the backend server is running:

```bash
# In root directory
npm start
```

## 💡 Tips

### Demo Mode
Click "Try Demo" on login page to use the app without authentication.

### File Upload
Direct file upload is 50% faster than URL upload. Use it when you have the video file locally.

### Development
The Vite dev server has hot module replacement (HMR) for instant updates during development.

## 📝 Next Steps

1. Complete remaining page implementations
2. Add real-time status updates (WebSockets)
3. Implement video player component
4. Add thumbnail previews
5. Build analytics charts
6. Add batch operations

## 🐛 Troubleshooting

### "Cannot connect to API"
Make sure backend server is running on port 3000.

### "Module not found"
Run `npm install` to install dependencies.

### "Port 5173 already in use"
Change port in `vite.config.ts`:
```ts
server: {
  port: 5174
}
```

## 📄 License

MIT License - See LICENSE file for details
