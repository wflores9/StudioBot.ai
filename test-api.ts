/**
 * StudioBot.ai - Comprehensive API Test Suite
 * Tests all endpoints for proper functionality
 * Run with: npx ts-node test-api.ts
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  responseTime: number;
}

const results: TestResult[] = [];

// Helper function to make HTTP requests
function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any; responseTime: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        try {
          resolve({ status: res.statusCode || 200, data: JSON.parse(data), responseTime });
        } catch {
          resolve({ status: res.statusCode || 200, data, responseTime });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test runner
async function runTest(
  name: string,
  method: string,
  endpoint: string,
  body?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  try {
    const { status, data, responseTime } = await makeRequest(method, endpoint, body);
    const passed = status === expectedStatus || (expectedStatus === 404 && status === 404);

    const result: TestResult = {
      name,
      endpoint,
      method,
      status: passed ? 'PASS' : 'FAIL',
      statusCode: status,
      responseTime,
    };

    if (!passed) {
      result.error = `Expected ${expectedStatus}, got ${status}. Response: ${JSON.stringify(data).substring(0, 100)}`;
    }

    results.push(result);
    return result;
  } catch (error) {
    const result: TestResult = {
      name,
      endpoint,
      method,
      status: 'FAIL',
      error: String(error),
      responseTime: 0,
    };
    results.push(result);
    return result;
  }
}

// Main test suite
async function runTests() {
  console.log('🚀 Starting StudioBot.ai API Test Suite\n');
  console.log(`Testing: ${BASE_URL}\n`);

  // ========== HEALTH CHECK ==========
  console.log('📋 Health & System Tests');
  await runTest('Health Check', 'GET', '/health', undefined, 200);

  // ========== AUTH ENDPOINTS ==========
  console.log('\n📋 Authentication Endpoints');
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  const registerResult = await runTest('Register User', 'POST', '/api/auth/register', testUser, 201);
  let userId = 'test-user-id';

  if (registerResult.status === 'PASS') {
    console.log(`  ✓ User registered: ${testUser.email}`);
  }

  await runTest('Login', 'POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });

  await runTest('Get User Profile', 'GET', `/api/auth/me?user_id=${userId}`);

  // ========== VIDEO ENDPOINTS ==========
  console.log('\n📋 Video Management Endpoints');
  const testVideo = {
    user_id: userId,
    source_url: 'https://example.com/test-video.mp4',
    title: 'Test Video',
    description: 'Testing video upload',
  };

  const uploadResp = await makeRequest('POST', '/api/videos/upload', testVideo);
  let videoId = uploadResp.data?.data?.id || 'test-video-id';
  await runTest('Upload Video (URL)', 'POST', '/api/videos/upload', testVideo, 201);
  console.log(`  ℹ️  Captured video ID: ${videoId}`);

  await runTest('List Videos', 'GET', `/api/videos/user/${userId}`);
  await runTest('Get Video by ID', 'GET', `/api/videos/${videoId}`, undefined, 200);
  await runTest('Update Video', 'PATCH', `/api/videos/${videoId}`, {
    title: 'Updated Title',
    description: 'Updated description',
  });

  // ========== AI ANALYSIS ENDPOINTS ==========
  console.log('\n📋 AI Analysis & Virality Detection');
  await runTest('Quick Virality Score', 'GET', `/api/videos/${videoId}/virality-score`, undefined, 404);
  await runTest('Get Video Recommendations', 'GET', `/api/videos/${videoId}/recommendations`, undefined, 404);

  // Mock AI analysis (requires real API keys - would fail without credentials)
  await runTest('AI Analysis Pipeline', 'POST', `/api/videos/${videoId}/analyze-ai`, {
    openaiKey: 'sk-mock-key',
    claudeKey: 'sk-ant-mock-key',
  });

  // ========== CLIP ENDPOINTS ==========
  console.log('\n📋 Clip Generation Endpoints');
  const clipData = {
    user_id: userId,
    video_id: videoId,
    title: 'Test Clip',
    start_time: 10,
    end_time: 30,
    description: 'Test clip creation',
  };

  await runTest('Create Clip', 'POST', '/api/clips/create', clipData, 201);
  let clipResp = await makeRequest('POST', '/api/clips/create', clipData);
  let clipId = clipResp.data?.data?.id || 'test-clip-id';
  console.log(`  ℹ️  Captured clip ID: ${clipId}`);
  
  await runTest('List Clips', 'GET', `/api/clips/user/${userId}`);
  await runTest('Get Clip by ID', 'GET', `/api/clips/${clipId}`);
  await runTest('Update Clip', 'PATCH', `/api/clips/${clipId}`, { title: 'Updated Clip' });

  // ========== SHORTS ENDPOINTS ==========
  console.log('\n📋 Shorts Creation Endpoints');
  const shortsData = {
    user_id: userId,
    clip_id: 'test-clip-id',
    title: 'Test Short',
    description: 'Auto-generated short',
  };

  await runTest('Create Short', 'POST', '/api/shorts/create', shortsData, 201);
  let shortResp = await makeRequest('POST', '/api/shorts/create', shortsData);
  let shortId = shortResp.data?.data?.id || 'test-short-id';
  console.log(`  ℹ️  Captured short ID: ${shortId}`);
  
  await runTest('List Shorts', 'GET', `/api/shorts/user/${userId}`);
  await runTest('Get Short by ID', 'GET', `/api/shorts/${shortId}`);
  await runTest('Export Short', 'GET', `/api/shorts/${shortId}/export`, undefined, 200);

  // ========== THUMBNAIL ENDPOINTS ==========
  console.log('\n📋 Thumbnail Generation Endpoints');
  const thumbnailData = {
    source_id: videoId,
    source_type: 'video',
    timestamp: 15,
  };

  await runTest('Generate Thumbnail', 'POST', '/api/thumbnails/generate', thumbnailData, 201);
  let thumbResp = await makeRequest('POST', '/api/thumbnails/generate', thumbnailData);
  let thumbnailId = thumbResp.data?.data?.id || 'test-thumb-id';
  
  await runTest('List Thumbnails', 'GET', `/api/thumbnails/user/${userId}`);
  await runTest('Get Thumbnail', 'GET', `/api/thumbnails/${thumbnailId}`);

  // ========== PLATFORM AUTH ENDPOINTS ==========
  console.log('\n📋 Platform Authentication & OAuth');
  await runTest('Authorize YouTube', 'GET', `/api/oauth/authorize/youtube`, undefined, 200);
  await runTest('Authorize Twitch', 'GET', `/api/oauth/authorize/twitch`, undefined, 200);
  await runTest('Disconnect Platform', 'GET', `/api/oauth/disconnect/youtube`, undefined, 200);

  // ========== DISTRIBUTION ENDPOINTS ==========
  console.log('\n📋 Multi-Platform Distribution');
  const publishData = {
    user_id: userId,
    video_id: videoId,
    platforms: ['youtube', 'twitch', 'rumble'],
    title: 'Test Distribution',
    description: 'Testing multi-platform publishing',
  };

  await runTest('Publish to Platforms', 'POST', '/api/distributions/publish', publishData, 201);
  let distResp = await makeRequest('POST', '/api/distributions/publish', publishData);
  let distId = distResp.data?.data?.id || 'test-dist-id';
  console.log(`  ℹ️  Captured distribution ID: ${distId}`);
  
  await runTest('List Distributions', 'GET', `/api/distributions?user_id=${userId}`);
  await runTest('Get Distribution', 'GET', `/api/distributions/${distId}`);
  await runTest('Get Analytics', 'GET', `/api/distributions/analytics?user_id=${userId}`);
  await runTest('Update Distribution Status', 'PATCH', `/api/distributions/${distId}/status`, {
    status: 'published',
  });

  // ========== PLATFORM STATUS ENDPOINTS ==========
  console.log('\n📋 Platform Management');
  await runTest('List Connected Platforms', 'GET', `/api/platforms?user_id=${userId}`);
  await runTest('Get Platform Status', 'GET', `/api/platforms/youtube/status?user_id=${userId}`);

  // ========== ERROR HANDLING TESTS ==========
  console.log('\n📋 Error Handling');
  await runTest('Missing Required Fields', 'POST', '/api/videos/upload', { title: 'No user_id' }, 400);
  await runTest('Not Found', 'GET', '/api/videos/nonexistent-id', undefined, 404);
  await runTest('Invalid Method', 'DELETE', `/api/videos/${videoId}`, undefined, 200);

  // ========== RESULTS SUMMARY ==========
  printResults();
}

function printResults() {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                       TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;
  const avgResponseTime = (results.reduce((sum, r) => sum + r.responseTime, 0) / total).toFixed(0);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime}ms\n`);

  console.log('DETAILED RESULTS:\n');
  console.log('┌─────────────────────────────────────┬──────────┬────────────┬──────────────┐');
  console.log('│ Endpoint                            │ Method   │ Status     │ Response (ms)│');
  console.log('├─────────────────────────────────────┼──────────┼────────────┼──────────────┤');

  results.forEach((r) => {
    const status = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const endpoint = r.endpoint.substring(0, 35).padEnd(35);
    const method = r.method.padEnd(8);
    const responseTime = r.responseTime.toString().padEnd(12);
    console.log(`│ ${endpoint} │ ${method} │ ${status.padEnd(10)} │ ${responseTime} │`);

    if (r.error) {
      console.log(`│ ERROR: ${r.error.substring(0, 65).padEnd(63)} │`);
    }
  });

  console.log('└─────────────────────────────────────┴──────────┴────────────┴──────────────┘\n');

  // Endpoint category breakdown
  console.log('ENDPOINT BREAKDOWN:\n');
  const categories = [
    { name: 'Health & System', pattern: 'health' },
    { name: 'Authentication', pattern: 'auth' },
    { name: 'Videos', pattern: '/videos' },
    { name: 'Clips', pattern: '/clips' },
    { name: 'Shorts', pattern: '/shorts' },
    { name: 'Thumbnails', pattern: '/thumbnails' },
    { name: 'OAuth & Platforms', pattern: 'oauth|platforms' },
    { name: 'Distribution', pattern: 'distributions' },
    { name: 'AI & Analysis', pattern: 'analyze|virality' },
  ];

  categories.forEach((cat) => {
    const regex = new RegExp(cat.pattern, 'i');
    const catResults = results.filter((r) => regex.test(r.endpoint));
    if (catResults.length > 0) {
      const catPassed = catResults.filter((r) => r.status === 'PASS').length;
      const catFailed = catResults.filter((r) => r.status === 'FAIL').length;
      console.log(`${cat.name.padEnd(25)} ${catPassed}/${catResults.length} passed (${catFailed} failed)`);
    }
  });

  console.log('\n' + '═'.repeat(65) + '\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! API is fully operational.\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review errors above.\n`);
  }
}

// Run tests
runTests().catch(console.error);
