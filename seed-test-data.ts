/**
 * StudioBot.ai - Test Data Seeding Script
 * Seeds the database with test data for integration testing
 * Run before test-api.ts to ensure tests pass with real data
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
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
        try {
          resolve({ status: res.statusCode || 200, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 200, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  // Step 1: Create test user
  console.log('1️⃣ Creating test user...');
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  const registerRes = await makeRequest('POST', '/api/auth/register', testUser);
  if (registerRes.status !== 201) {
    console.error('❌ Failed to register user:', registerRes.data);
    return;
  }
  const userId = registerRes.data.data?.id || 'test-user-id';
  console.log(`✅ User created: ${userId}`);

  // Step 2: Upload test video
  console.log('\n2️⃣ Uploading test video...');
  const uploadRes = await makeRequest('POST', '/api/videos/upload', {
    user_id: userId,
    source_url: 'https://exemple.com/test-video.mp4',
    title: 'Test Video for Integration Tests',
    description: 'This is a test video used for API testing',
  });
  
  let videoId = 'test-video-id';
  if (uploadRes.status === 201 && uploadRes.data.data?.id) {
    videoId = uploadRes.data.data.id;
    console.log(`✅ Video uploaded: ${videoId}`);
  } else {
    console.log(`⚠️ Video upload returned status ${uploadRes.status}, using placeholder ID`);
  }

  // Step 3: Create test clip
  console.log('\n3️⃣ Creating test clip...');
  const clipRes = await makeRequest('POST', '/api/clips/create', {
    video_id: videoId,
    user_id: userId,
    title: 'Test Clip from Integration Tests',
    description: 'This clip was created for testing',
    start_time: 10,
    end_time: 30,
  });

  let clipId = 'test-clip-id';
  if (clipRes.status === 201 && clipRes.data.data?.id) {
    clipId = clipRes.data.data.id;
    console.log(`✅ Clip created: ${clipId}`);
  } else {
    console.log(`⚠️ Clip creation returned status ${clipRes.status}`);
  }

  // Step 4: Create test short
  console.log('\n4️⃣ Creating test short...');
  const shortRes = await makeRequest('POST', '/api/shorts/create', {
    clip_id: clipId,
    user_id: userId,
    title: 'Test Short Video',
    description: 'Short form content for testing',
  });

  let shortId = 'test-short-id';
  if (shortRes.status === 201 && shortRes.data.data?.id) {
    shortId = shortRes.data.data.id;
    console.log(`✅ Short created: ${shortId}`);
  } else {
    console.log(`⚠️ Short creation returned status ${shortRes.status}`);
  }

  // Step 5: Generate test thumbnail
  console.log('\n5️⃣ Generating test thumbnail...');
  const thumbnailRes = await makeRequest('POST', '/api/thumbnails/generate', {
    user_id: userId,
    video_id: videoId,
    timestamp: 15,
    text: 'Test Thumbnail',
  });

  let thumbnailId = 'test-thumb-id';
  if (thumbnailRes.status === 201 && thumbnailRes.data.data?.id) {
    thumbnailId = thumbnailRes.data.data.id;
    console.log(`✅ Thumbnail generated: ${thumbnailId}`);
  } else {
    console.log(`⚠️ Thumbnail generation returned status ${thumbnailRes.status}`);
  }

  // Step 6: Create test distribution
  console.log('\n6️⃣ Creating test distribution...');
  const distRes = await makeRequest('POST', '/api/distributions/publish', {
    user_id: userId,
    video_id: videoId,
    platforms: ['youtube'],
    title: 'Test Distribution',
    description: 'Test video for distribution',
  });

  let distId = 'test-dist-id';
  if (distRes.status === 201 && distRes.data.data?.id) {
    distId = distRes.data.data.id;
    console.log(`✅ Distribution created: ${distId}`);
  } else {
    console.log(`⚠️ Distribution creation returned status ${distRes.status}`);
  }

  // Output test data for reference
  console.log('\n' + '='.repeat(60));
  console.log('TEST DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nUser ID:          ${userId}`);
  console.log(`Video ID:         ${videoId}`);
  console.log(`Clip ID:          ${clipId}`);
  console.log(`Short ID:         ${shortId}`);
  console.log(`Thumbnail ID:     ${thumbnailId}`);
  console.log(`Distribution ID:  ${distId}`);
  console.log(`\nLogin Credentials:`);
  console.log(`  Email:    ${testUser.email}`);
  console.log(`  Password: ${testUser.password}`);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test data seeding complete!\n');
  console.log('You can now run: npx ts-node test-api.ts\n');
}

seedTestData().catch((error) => {
  console.error('❌ Error seeding test data:', error);
  process.exit(1);
});
