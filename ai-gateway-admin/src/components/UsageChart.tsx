'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartData {
  time: string;
  count: number;
  cost: number;
  latency: number;
  requests: number; // 添加requests字段以兼容图表显示
}

const UsageChart = () => {
  const [chartType, setChartType] = useState<'requests' | 'cost' | 'latency'>('requests');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/stats', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });

      if (response.ok) {
        const statsData = await response.json();
        console.log('Chart data received:', statsData);

        // 转换API数据格式以匹配图表需求
        const chartData = statsData.requests?.map((item: any) => ({
          time: item.time,
          count: item.count || 0,
          requests: item.count || 0, // 同时保留requests字段用于显示
          cost: item.cost || 0,
          latency: item.latency || 0
        })) || [];

        setData(chartData);
      } else {
        console.error('Failed to fetch chart data:', response.status);
        // 使用空数据而不是模拟数据
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // 使用空数据而不是模拟数据
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    // 每30秒刷新一次数据
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">使用统计</h2>
          <div className="flex space-x-2">
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">使用统计</h2>
        <div className="flex space-x-2">
          {Object.entries(chartConfigs).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setChartType(key as any)}
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
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>暂无数据</div>
              <div className="text-sm mt-1">请先发送一些API请求来生成统计数据</div>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* 实时统计摘要 - 使用真实数据 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + (item.requests || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">总请求数</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            ${data.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">总成本</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + (item.latency || 0), 0) / data.length) : 0}ms
          </p>
          <p className="text-sm text-gray-600">平均延迟</p>
        </div>
      </div>
    </div>
  );
};

export default UsageChart;
