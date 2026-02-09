/**
 * Example: Direct Video File Upload
 * Demonstrates how to upload a video file directly to StudioBot.ai
 * Much faster than URL-based upload - no download step needed!
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Upload a video file directly
 */
async function uploadVideoFile(userId, videoFilePath, title, description = '') {
  try {
    console.log('📤 Uploading video file...');

    // Create form data
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFilePath));
    formData.append('user_id', userId);
    formData.append('title', title);
    formData.append('description', description);

    // Upload file
    const response = await axios.post(
      `${API_BASE_URL}/videos/upload-file`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ Video uploaded successfully!');
    console.log('Video ID:', response.data.data.id);
    console.log('Status:', response.data.data.status);
    console.log('File Info:', response.data.fileInfo);

    return response.data.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check video analysis status
 */
async function checkVideoStatus(videoId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
    console.log(`\n📊 Video Status: ${response.data.data.status}`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get AI analysis results
 */
async function getVideoAnalysis(videoId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}/analysis`);
    console.log('\n🤖 AI Analysis Results:');
    console.log('Viral Moments:', response.data.data.viralMoments.length);
    console.log('Summary:', response.data.data.summary);
    return response.data.data;
  } catch (error) {
    console.error('❌ Analysis not ready yet:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Complete workflow example
 */
async function completeUploadWorkflow() {
  try {
    // Step 1: Register a user (if needed)
    const userId = 'test-user-123'; // Replace with actual user ID

    // Step 2: Upload video file
    const videoFilePath = path.join(__dirname, 'sample-video.mp4');
    // Check if file exists
    if (!fs.existsSync(videoFilePath)) {
      console.log('⚠️  Sample video not found. Please provide a video file path.');
      console.log('Usage: node upload-video-file.js <path-to-video>');
      return;
    }

    const video = await uploadVideoFile(
      userId,
      videoFilePath,
      'My Awesome Video',
      'Testing direct file upload feature'
    );

    // Step 3: Poll for analysis completion
    console.log('\n⏳ Waiting for AI analysis...');
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      const status = await checkVideoStatus(video.id);

      if (status.status === 'analyzed') {
        console.log('✅ Analysis complete!');
        break;
      } else if (status.status === 'failed') {
        console.log('❌ Analysis failed');
        return;
      }

      attempts++;
    }

    // Step 4: Get analysis results
    const analysis = await getVideoAnalysis(video.id);
    if (analysis) {
      console.log('\n🎯 Viral Moments Found:');
      analysis.viralMoments.forEach((moment, idx) => {
        console.log(`  ${idx + 1}. ${moment.startTime}s - ${moment.endTime}s`);
        console.log(`     Confidence: ${moment.confidence}`);
        console.log(`     ${moment.description}`);
      });
    }

    console.log('\n🎉 Upload workflow completed successfully!');
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

// Run example if executed directly
if (require.main === module) {
  const videoPath = process.argv[2] || path.join(__dirname, 'sample-video.mp4');
  console.log('🚀 StudioBot.ai - Direct Video Upload Example\n');

  // Override video path if provided
  if (process.argv[2]) {
    const userId = 'test-user-123';
    uploadVideoFile(userId, videoPath, 'Test Video', 'Direct upload test')
      .then((video) => {
        console.log('\n✅ Success! Video ID:', video.id);
        console.log('Check status at:', `${API_BASE_URL}/videos/${video.id}`);
      })
      .catch((error) => {
        console.error('Failed:', error.message);
        process.exit(1);
      });
  } else {
    completeUploadWorkflow();
  }
}

module.exports = {
  uploadVideoFile,
  checkVideoStatus,
  getVideoAnalysis,
};
