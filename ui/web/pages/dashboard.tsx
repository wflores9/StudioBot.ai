import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/auth';
import { useVideo } from '@/hooks/useApi';
import { FiPlay, FiTrendingUp, FiShare2, FiDownload } from 'react-icons/fi';

interface DashboardStats {
  totalVideos: number;
  totalClips: number;
  totalViews: number;
  avgEngagement: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, getMe } = useAuthStore();
  const { videos, fetchUserVideos } = useVideo();
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalClips: 0,
    totalViews: 0,
    avgEngagement: 0,
  });

  useEffect(() => {
    if (!user) {
      getMe();
    }
  }, [user, getMe]);

  useEffect(() => {
    if (user && !user.id) {
      router.push('/login');
      return;
    }
    if (user?.id) {
      fetchUserVideos(user.id);
      // Calculate stats
      setStats({
        totalVideos: videos.length,
        totalClips: 0,
        totalViews: 0,
        avgEngagement: 0,
      });
    }
  }, [user, fetchUserVideos, videos.length]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
          <p className="text-gray-500 mt-2">Here&apos;s what&apos;s happening with your content</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Videos', value: stats.totalVideos, icon: FiPlay, color: 'purple' },
            { label: 'Clips Created', value: stats.totalClips, icon: FiDownload, color: 'blue' },
            { label: 'Total Views', value: stats.totalViews, icon: FiTrendingUp, color: 'green' },
            { label: 'Avg Engagement', value: `${stats.avgEngagement}%`, icon: FiShare2, color: 'pink' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colors = {
              purple: 'from-purple-500 to-purple-600',
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              pink: 'from-pink-500 to-pink-600',
            };
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} text-white rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className="w-12 h-12 opacity-20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {videos.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FiPlay className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No videos yet. Upload your first video to get started!</p>
              </div>
            ) : (
              videos.slice(0, 5).map((video) => (
                <div key={video.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{video.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {Math.round(video.duration)}s • {video.width}x{video.height}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        video.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : video.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
