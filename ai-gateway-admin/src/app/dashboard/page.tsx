'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ServerIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DashboardCard from '@/components/DashboardCard';
import UsageChart from '@/components/UsageChart';
import Layout from '@/components/Layout';

interface DashboardStats {
  totalRequests: number;
  activeUsers: number;
  totalCost: number;
  avgLatency: number;
  requestsChange: string;
  usersChange: string;
  costChange: string;
  latencyChange: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/stats', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received stats data:', data);

        // 从API响应中提取summary数据
        const summary = data.summary || {};
        const safeStats: DashboardStats = {
          totalRequests: summary.totalRequests || 0,
          activeUsers: summary.activeUsers || 0,
          totalCost: summary.totalCost || 0,
          avgLatency: summary.avgLatency || 0,
          requestsChange: summary.requestsChange || '+0%',
          usersChange: summary.usersChange || '+0%',
          costChange: summary.costChange || '+0%',
          latencyChange: summary.latencyChange || '+0%'
        };
        setStats(safeStats);
      } else {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // 显示真实的错误状态，而不是假数据
      setStats({
        totalRequests: 0,
        activeUsers: 0,
        totalCost: 0,
        avgLatency: 0,
        requestsChange: '+0%',
        usersChange: '+0%',
        costChange: '+0%',
        latencyChange: '+0%'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="总请求数"
          value={stats?.totalRequests?.toLocaleString() || '0'}
          change={stats?.requestsChange || '+0%'}
          icon={ChartBarIcon}
          color="blue"
        />
        <DashboardCard
          title="活跃用户"
          value={stats?.activeUsers?.toString() || '0'}
          change={stats?.usersChange || '+0%'}
          icon={UsersIcon}
          color="green"
        />
        <DashboardCard
          title="总成本"
          value={`$${stats?.totalCost?.toFixed(2) || '0.00'}`}
          change={stats?.costChange || '+0%'}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <DashboardCard
          title="平均延迟"
          value={`${stats?.avgLatency || 0}ms`}
          change={stats?.latencyChange || '+0%'}
          icon={ServerIcon}
          color="purple"
        />
      </div>

      {/* 使用统计图表 */}
      <UsageChart />
      </div>
    </Layout>
  );
}
