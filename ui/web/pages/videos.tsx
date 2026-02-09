import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/auth';
import { useVideo } from '@/hooks/useApi';
import { FiUpload, FiAlertCircle, FiCheck } from 'react-icons/fi';

export default function VideosPage() {
  const { user } = useAuthStore();
  const { uploadVideo, isLoading, error: apiError } = useVideo();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) {
        setUploadMessage({ type: 'error', text: 'File must be less than 500MB' });
        return;
      }
      if (!selectedFile.type.startsWith('video/')) {
        setUploadMessage({ type: 'error', text: 'Please select a valid video file' });
        return;
      }
      setFile(selectedFile);
      setUploadMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user?.id) {
      setUploadMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      await uploadVideo(file, title, description);
      setUploadMessage({ type: 'success', text: 'Video uploaded successfully!' });
      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Upload failed' });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
          <p className="text-gray-500 mt-2">Upload and analyze your videos to create viral clips</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit}>
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Video File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                {file ? (
                  <div>
                    <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">MP4, MOV, WebM up to 500MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="My Awesome Video"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Tell us about your video..."
                rows={4}
              />
            </div>

            {/* Messages */}
            {(uploadMessage || apiError) && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                  (uploadMessage?.type || (apiError ? 'error' : 'success')) === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                {(uploadMessage?.type || (apiError ? 'error' : 'success')) === 'error' ? (
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    (uploadMessage?.type || (apiError ? 'error' : 'success')) === 'error'
                      ? 'text-red-700'
                      : 'text-green-700'
                  }`}
                >
                  {uploadMessage?.text || apiError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || !file || !title}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setTitle('');
                  setDescription('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
