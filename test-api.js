#!/usr/bin/env node

/**
 * StudioBot.ai API Test Suite
 * Tests all endpoints with sample data
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api';
let testResults = { passed: 0, failed: 0, tests: [] };

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test helper
async function test(name, fn) {
  try {
    await fn();
    testResults.tests.push({ name, status: 'PASS' });
    testResults.passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    testResults.tests.push({ name, status: 'FAIL', error: err.message });
    testResults.failed++;
    console.log(`✗ ${name}: ${err.message}`);
  }
}

// Storage for test data
let testUserId = null;
let testUserEmail = null;
const testUserPassword = 'TestPass123!';
let testVideoId = null;
let testClipId = null;

async function runTests() {
  console.log('🧪 Starting StudioBot.ai API Tests\n');

  // Auth Tests
  console.log('📝 Authentication Tests:');
  await test('Register user', async () => {
    testUserEmail = `test_${Date.now()}@example.com`;
    const res = await makeRequest('POST', '/auth/register', {
      username: `testuser_${Date.now()}`,
      email: testUserEmail,
      password: testUserPassword,
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.id) throw new Error('No user ID returned');
    testUserId = res.body.data.id;
  });

  await test('Login user', async () => {
    const res = await makeRequest('POST', '/auth/login', {
      email: testUserEmail,
      password: testUserPassword,
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.data.token) throw new Error('No token returned');
  });

  await test('Get user profile', async () => {
    const res = await makeRequest('GET', `/auth/profile/${testUserId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.data.username) throw new Error('No username in response');
  });

  // Video Tests
  console.log('\n🎬 Video Tests:');
  await test('Upload video via URL', async () => {
    const res = await makeRequest('POST', '/videos/upload', {
      user_id: testUserId,
      source_url: 'https://example.com/sample-video.mp4',
      title: 'Test Video ' + Date.now(),
      description: 'Test video for API testing',
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.id) throw new Error('No video ID returned');
    testVideoId = res.body.data.id;
  });

  await test('Get video details', async () => {
    const res = await makeRequest('GET', `/videos/${testVideoId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (res.body.data.id !== testVideoId) throw new Error('Wrong video returned');
  });

  await test('Get user videos list', async () => {
    const res = await makeRequest('GET', `/videos/user/${testUserId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!Array.isArray(res.body.data)) throw new Error('data is not an array');
  });

  // Clip Tests
  console.log('\n✂️  Clip Tests:');
  await test('Create clip', async () => {
    const res = await makeRequest('POST', '/clips/create', {
      video_id: testVideoId,
      user_id: testUserId,
      title: 'Test Clip',
      description: 'A test clip',
      start_time: 10,
      end_time: 30,
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.id) throw new Error('No clip ID returned');
    testClipId = res.body.data.id;
  });

  await test('Get clip details', async () => {
    const res = await makeRequest('GET', `/clips/${testClipId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (res.body.data.id !== testClipId) throw new Error('Wrong clip returned');
  });

  await test('Get video clips', async () => {
    const res = await makeRequest('GET', `/clips/video/${testVideoId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!Array.isArray(res.body.data)) throw new Error('data is not an array');
  });

  await test('Approve clip', async () => {
    const res = await makeRequest('PATCH', `/clips/${testClipId}/approve`, {
      approved: true,
      approval_notes: 'Looks great!',
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.data.approved) throw new Error('Clip not approved');
  });

  // Short Tests
  console.log('\n📱 Shorts Tests:');
  await test('Create short from clip', async () => {
    const res = await makeRequest('POST', '/shorts/create', {
      clip_id: testClipId,
      user_id: testUserId,
      title: 'Test Short',
      description: 'A vertical short',
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.id) throw new Error('No short ID returned');
  });

  // Thumbnail Tests
  console.log('\n🖼️  Thumbnail Tests:');
  await test('Generate thumbnail', async () => {
    const res = await makeRequest('POST', '/thumbnails/generate', {
      source_id: testVideoId,
      source_type: 'video',
      timestamp: 15,
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.id) throw new Error('No thumbnail ID returned');
  });

  // Platform Tests
  console.log('\n🌐 Platform Tests:');
  await test('Connect platform', async () => {
    const res = await makeRequest('POST', '/platforms/youtube/connect', {
      user_id: testUserId,
      credentials: {
        access_token: 'test_token_12345',
        refresh_token: 'test_refresh_token',
        channel_id: 'UCtest123',
      },
    });
    if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}`);
    if (!res.body.data.is_connected) throw new Error('Platform not connected');
  });

  await test('Get user platforms', async () => {
    const res = await makeRequest('GET', `/platforms/user/${testUserId}`);
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!Array.isArray(res.body.data)) throw new Error('Platforms is not an array');
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Total: ${testResults.passed + testResults.failed}\n`);

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
