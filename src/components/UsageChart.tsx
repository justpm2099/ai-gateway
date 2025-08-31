'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const UsageChart = () => {
  const [chartType, setChartType] = useState<'requests' | 'cost' | 'latency'>('requests');
  const [data, setData] = useState<Array<{time: string; requests: number; cost: number; latency: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/stats?range=24h', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setData(statsData.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // 使用模拟数据
      setData([
        { time: '00:00', requests: 120, cost: 0.12, latency: 245 },
        { time: '04:00', requests: 80, cost: 0.08, latency: 230 },
        { time: '08:00', requests: 200, cost: 0.25, latency: 280 },
        { time: '12:00', requests: 350, cost: 0.45, latency: 320 },
        { time: '16:00', requests: 280, cost: 0.35, latency: 290 },
        { time: '20:00', requests: 180, cost: 0.22, latency: 250 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartConfigs = {
    requests: {
      title: '请求数量趋势',
      dataKey: 'requests',
      color: '#3b82f6',
      unit: '次'
    },
    cost: {
      title: '成本趋势',
      dataKey: 'cost',
      color: '#f59e0b',
      unit: '$'
    },
    latency: {
      title: '延迟趋势',
      dataKey: 'latency',
      color: '#8b5cf6',
      unit: 'ms'
    }
  };

  const config = chartConfigs[chartType];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">使用统计</h2>
        <div className="flex space-x-2">
          {(Object.entries(chartConfigs) as Array<[string, typeof chartConfigs.requests]>).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setChartType(key as 'requests' | 'cost' | 'latency')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {cfg.title}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'requests' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${config.unit}`, config.title]}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey={config.dataKey} fill={config.color} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${config.unit}`, config.title]}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color} 
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-600">今日请求</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">$12.34</p>
          <p className="text-sm text-gray-600">今日成本</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">245ms</p>
          <p className="text-sm text-gray-600">平均延迟</p>
        </div>
      </div>
    </div>
  );
};

export default UsageChart;
