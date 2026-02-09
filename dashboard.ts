/**
 * StudioBot.ai Deployment Status Dashboard
 * Real-time service health monitoring and quick endpoint testing
 * Access at: http://localhost:3001/dashboard
 */

const http = require('http');
const url = require('url');

const PORT = 3001;
const API_BASE = 'http://localhost:3000';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  lastChecked: string;
}

const services: { [key: string]: ServiceStatus } = {
  health: {
    name: 'API Health',
    endpoint: '/health',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  auth: {
    name: 'Authentication',
    endpoint: '/api/auth/me',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  videos: {
    name: 'Video Service',
    endpoint: '/api/videos/user/test',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  clips: {
    name: 'Clip Service',
    endpoint: '/api/clips/user/test',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  shorts: {
    name: 'Shorts Service',
    endpoint: '/api/shorts/user/test',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  thumbnails: {
    name: 'Thumbnail Service',
    endpoint: '/api/thumbnails/user/test',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  distribution: {
    name: 'Distribution Service',
    endpoint: '/api/distributions',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
  platforms: {
    name: 'Platform Integration',
    endpoint: '/api/platforms',
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  },
};

// Check service health
async function checkServiceHealth(key: string) {
  const service = services[key];
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}${service.endpoint}`);
    const responseTime = Date.now() - startTime;

    if (response.ok || response.status === 401 || response.status === 404) {
      services[key].status = 'online';
    } else {
      services[key].status = 'error';
    }
    services[key].responseTime = responseTime;
  } catch (error) {
    services[key].status = 'offline';
    services[key].responseTime = Date.now() - startTime;
  }

  services[key].lastChecked = new Date().toISOString();
}

// Check all services
async function checkAllServices() {
  const promises = Object.keys(services).map((key) => checkServiceHealth(key));
  await Promise.all(promises);
}

// Generate HTML dashboard
function generateDashboard(): string {
  const servicesHtml = Object.entries(services)
    .map(
      ([, service]) => `
    <tr>
      <td>${service.name}</td>
      <td><code>${service.endpoint}</code></td>
      <td>
        <span class="status status-${service.status}">
          ${service.status === 'online' ? '🟢 Online' : service.status === 'offline' ? '🔴 Offline' : '🟡 Error'}
        </span>
      </td>
      <td>${service.responseTime}ms</td>
      <td>${new Date(service.lastChecked).toLocaleTimeString()}</td>
    </tr>
  `
    )
    .join('');

  const overallStatus = Object.values(services).filter((s) => s.status === 'online').length;
  const totalServices = Object.keys(services).length;
  const statusPercentage = ((overallStatus / totalServices) * 100).toFixed(0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudioBot.ai - Deployment Status</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: white;
      border-radius: 10px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 32px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .status-badge.healthy {
      background: #d4edda;
      color: #155724;
    }
    
    .status-badge.degraded {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-badge.down {
      background: #f8d7da;
      color: #721c24;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .stat-card h3 {
      color: #667eea;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    
    .stat-card .value {
      color: #333;
      font-size: 32px;
      font-weight: bold;
    }
    
    .services-table {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    .services-table h2 {
      padding: 20px;
      background: #f8f9fa;
      color: #333;
      margin: 0;
      border-bottom: 1px solid #dee2e6;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }
    
    th {
      padding: 15px;
      text-align: left;
      color: #666;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    
    td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
      color: #333;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    code {
      background: #f4f4f4;
      padding: 3px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    
    .status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }
    
    .status-online {
      background: #d4edda;
      color: #155724;
    }
    
    .status-offline {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-error {
      background: #fff3cd;
      color: #856404;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #764ba2;
    }
    
    .footer {
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    .endpoint-list {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    .endpoint-list h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .endpoint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .endpoint-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .endpoint-card h4 {
      color: #667eea;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .endpoint-card code {
      display: block;
      margin: 8px 0;
      background: white;
      padding: 8px;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .endpoint-card button {
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 StudioBot.ai - Deployment Dashboard</h1>
      <p>Real-time monitoring of all platform services and endpoints</p>
      <div class="status-badge ${overallStatus === totalServices ? 'healthy' : overallStatus > totalServices / 2 ? 'degraded' : 'down'}">
        ${overallStatus}/${totalServices} Services Online (${statusPercentage}%)
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <h3>Online Services</h3>
          <div class="value">${overallStatus}/${totalServices}</div>
        </div>
        <div class="stat-card">
          <h3>Health Status</h3>
          <div class="value">${statusPercentage}%</div>
        </div>
        <div class="stat-card">
          <h3>Last Updated</h3>
          <div class="value" style="font-size: 14px; margin-top: 5px;">${new Date().toLocaleTimeString()}</div>
        </div>
      </div>
      
      <div class="controls">
        <button onclick="location.reload()">🔄 Refresh Status</button>
        <button onclick="testAllEndpoints()">🧪 Run Tests</button>
      </div>
    </div>
    
    <div class="services-table">
      <h2>📊 Service Status</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Endpoint</th>
            <th>Status</th>
            <th>Response Time</th>
            <th>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          ${servicesHtml}
        </tbody>
      </table>
    </div>
    
    <div class="endpoint-list">
      <h2>📚 Quick Test Endpoints</h2>
      <div class="endpoint-grid">
        <div class="endpoint-card">
          <h4>Health Check</h4>
          <code>GET /health</code>
          <button onclick="testEndpoint('/health')">Test</button>
        </div>
        <div class="endpoint-card">
          <h4>List Videos</h4>
          <code>GET /api/videos/user/test</code>
          <button onclick="testEndpoint('/api/videos/user/test')">Test</button>
        </div>
        <div class="endpoint-card">
          <h4>List Clips</h4>
          <code>GET /api/clips/user/test</code>
          <button onclick="testEndpoint('/api/clips/user/test')">Test</button>
        </div>
        <div class="endpoint-card">
          <h4>List Shorts</h4>
          <code>GET /api/shorts/user/test</code>
          <button onclick="testEndpoint('/api/shorts/user/test')">Test</button>
        </div>
        <div class="endpoint-card">
          <h4>OAuth - YouTube</h4>
          <code>GET /api/oauth/authorize/youtube</code>
          <button onclick="testEndpoint('/api/oauth/authorize/youtube')">Test</button>
        </div>
        <div class="endpoint-card">
          <h4>Distributions</h4>
          <code>GET /api/distributions</code>
          <button onclick="testEndpoint('/api/distributions')">Test</button>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>StudioBot.ai v1.0 | Status Dashboard | Last checked: ${new Date().toLocaleString()}</p>
      <p style="margin-top: 10px;">
        <a href="http://localhost:3000" style="color: #667eea; text-decoration: none;">API Base URL</a> | 
        <a href="http://localhost:3000/api" style="color: #667eea; text-decoration: none;">API Docs</a> |
        <a href="http://localhost:3001" style="color: #667eea; text-decoration: none;">Dashboard Home</a>
      </p>
    </div>
  </div>
  
  <script>
    async function testEndpoint(endpoint) {
      try {
        const response = await fetch('http://localhost:3000' + endpoint);
        const data = await response.json();
        alert(\`✅ Success (Status: \${response.status})\\n\\nResponse:\\n\${JSON.stringify(data, null, 2).substring(0, 200)}\`);
      } catch (error) {
        alert(\`❌ Error: \${error.message}\`);
      }
    }
    
    async function testAllEndpoints() {
      const message = 'Testing all endpoints...\\n\\nThis will open a new window with detailed test results.';
      alert(message);
      window.open('/test-results', '_blank');
    }
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
      fetch('http://localhost:3001/api/status')
        .then(r => r.json())
        .then(data => {
          // Update status in real-time
        })
        .catch(err => console.log('Refresh failed:', err));
    }, 30000);
  </script>
</body>
</html>
  `;
}

// Create server
const server = http.createServer(async (req: any, res: any) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/' || pathname === '/dashboard') {
    // Dashboard HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateDashboard());
  } else if (pathname === '/api/status') {
    // JSON status endpoint
    await checkAllServices();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ services, timestamp: new Date().toISOString() }));
  } else if (pathname === '/health') {
    // Simple health check
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start checking services
checkAllServices().then(() => {
  // Check again every 10 seconds
  setInterval(checkAllServices, 10000);
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   🎯 StudioBot.ai Deployment Dashboard Ready   ║
║                                                  ║
║   📊 Dashboard: http://localhost:${PORT}         ║
║   🏥 API Health: http://localhost:${PORT}/health  ║
║   ⚡ Status API: http://localhost:${PORT}/api/status ║
║                                                  ║
║   Monitoring: http://localhost:3000             ║
╚══════════════════════════════════════════════════╝
  `);
});
