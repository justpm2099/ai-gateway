'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  KeyIcon, 
  ChartPieIcon, 
  UserGroupIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [gatewayHealth, setGatewayHealth] = useState<{status: string; timestamp: string} | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // 检查AI Gateway健康状态
    fetch('https://ai-gateway.aibook2099.workers.dev/health')
      .then(r => r.json())
      .then(data => setGatewayHealth(data))
      .catch(e => console.error('Health check failed:', e));
  }, []);

  const navigation = [
    { name: '仪表板', href: '/dashboard', icon: ChartBarIcon },
    { name: 'AI供应商', href: '/providers', icon: CpuChipIcon },
    { name: 'API密钥', href: '/api-keys', icon: KeyIcon },
    { name: '使用统计', href: '/usage', icon: ChartPieIcon },
    { name: '用户管理', href: '/users', icon: UserGroupIcon },
    { name: '系统设置', href: '/settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🤖</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Gateway 管理中心</h1>
                <p className="text-sm text-gray-500">AI资源聚合层管理平台</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                gatewayHealth?.status === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {gatewayHealth?.status === 'healthy' ? '🟢' : '🔴'}
                <span className="ml-1">
                  {gatewayHealth?.status === 'healthy' ? '服务正常' : '服务异常'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
