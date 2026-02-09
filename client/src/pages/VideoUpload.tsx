import { useState } from 'react';
import { Upload, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';
import { videoAPI } from '../api/client';
import './VideoUpload.css';

interface VideoUploadProps {
  user: any;
}

export default function VideoUpload({ user }: VideoUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setError('');
      setResult(null);
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    const data = new FormData();
    data.append('video', file);
    data.append('user_id', user.id);
    data.append('title', formData.title);
    if (formData.description) {
      data.append('description', formData.description);
    }

    try {
      const response = await videoAPI.uploadFile(data);
      setResult(response.data);
      setProgress(100);

      // Reset form
      setFile(null);
      setFormData({ title: '', description: '', url: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleURLUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url || !formData.title) {
      setError('Please enter a URL and title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await videoAPI.uploadURL(
        user.id,
        formData.url,
        formData.title,
        formData.description
      );
      setResult(response.data);
      setFormData({ title: '', description: '', url: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Upload Video</h1>
        <p>Upload your video for AI-powered viral moment detection</p>
      </div>

      <div className="upload-container">
        {/* Upload Method Toggle */}
        <div className="method-toggle">
          <button
            className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <Upload size={20} />
            <span>Direct Upload (Recommended)</span>
            <span className="badge">Faster</span>
          </button>
          <button
            className={`method-btn ${uploadMethod === 'url' ? 'active' : ''}`}
            onClick={() => setUploadMethod('url')}
          >
            <LinkIcon size={20} />
            <span>Upload from URL</span>
          </button>
        </div>

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <form onSubmit={handleFileUpload} className="upload-form">
            <div
              className={`file-drop-zone ${file ? 'has-file' : ''}`}
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {file ? (
                <div className="file-info">
                  <CheckCircle size={48} className="success-icon" />
                  <h3>{file.name}</h3>
                  <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <Upload size={48} />
                  <h3>Click or drag video file here</h3>
                  <p>Supports: MP4, MOV, AVI, WebM, MKV (Max 500MB)</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {uploading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-text">Uploading... {progress}%</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <XCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <div>
                  <strong>Upload Successful!</strong>
                  <p>Video ID: {result.data?.id}</p>
                  <p>AI analysis is now running...</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : '🚀 Upload & Analyze'}
            </button>
          </form>
        )}

        {/* URL Upload */}
        {uploadMethod === 'url' && (
          <form onSubmit={handleURLUpload} className="upload-form">
            <div className="form-group">
              <label>Video URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>

            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <XCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <div>
                  <strong>Upload Initiated!</strong>
                  <p>Video ID: {result.data?.id}</p>
                  <p>Downloading and analyzing...</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={uploading}
            >
              {uploading ? 'Processing...' : '🔗 Upload from URL'}
            </button>
          </form>
        )}

        {/* Info Box */}
        <div className="info-box">
          <h3>💡 Pro Tip</h3>
          <p>
            <strong>Direct upload</strong> is 50% faster than URL upload because it skips the download step.
            Use URL upload when you have a video already hosted online.
          </p>
        </div>
      </div>
    </div>
  );
}
