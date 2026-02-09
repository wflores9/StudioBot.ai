import React from 'react';
import Layout from '../components/Layout';
import ChartCard from '../components/ChartCard';
import useDistributions from '../hooks/useDistributions';

const AnalyticsPage: React.FC = () => {
  const { getAnalytics } = useDistributions();
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    getAnalytics().then((res) => {
      if (mounted) setData(res || []);
    }).catch(() => {});
    return () => { mounted = false };
  }, [getAnalytics]);

  // Map data to something Recharts expects
  const visits = (data || []).map((d: any, i: number) => ({ name: d.date || `T${i}`, value: d.views || d.count || 0, views: d.views || 0 }));

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Views Over Time" data={visits} dataKey="views" />
          <ChartCard title="Engagement" data={visits} dataKey="value" />
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
