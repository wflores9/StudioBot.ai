import React from 'react';
import Layout from '../components/Layout';
import useDistributions from '../hooks/useDistributions';
import useVideos from '../hooks/useVideos';

const DistributionPage: React.FC = () => {
  const { listPlatforms, publish } = useDistributions();
  const { listVideos } = useVideos();
  const [platforms, setPlatforms] = React.useState<any[]>([]);
  const [videos, setVideos] = React.useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    listPlatforms().then((res) => { if (mounted) setPlatforms(res || []) }).catch(() => {});
    listVideos().then((res) => { if (mounted) setVideos(res || []) }).catch(() => {});
    return () => { mounted = false };
  }, [listPlatforms, listVideos]);

  const handlePublish = async () => {
    if (!selectedVideo || !selectedPlatform) return;
    setLoading(true);
    try {
      await publish({ source_id: selectedVideo, platform: selectedPlatform });
      alert('Published');
    } catch (e) {
      alert('Publish failed');
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Distribution</h1>
        <div className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Video</label>
              <select className="mt-1 block w-full" value={selectedVideo || ''} onChange={e => setSelectedVideo(e.target.value)}>
                <option value="">Select a video</option>
                {videos.map(v => <option key={v.id} value={v.id}>{v.title || v.name || v.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <select className="mt-1 block w-full" value={selectedPlatform || ''} onChange={e => setSelectedPlatform(e.target.value)}>
                <option value="">Select platform</option>
                {platforms.map(p => <option key={p} value={p.id || p.name}>{p.name || p.id}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={handlePublish} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Publishing...' : 'Publish'}</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DistributionPage;
