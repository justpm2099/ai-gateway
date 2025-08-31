'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  general: {
    systemName: string;
    description: string;
    defaultProvider: string;
    enableLogging: boolean;
    enableAnalytics: boolean;
  };
  security: {
    rateLimitPerMinute: number;
    maxTokensPerRequest: number;
    enableCors: boolean;
    allowedOrigins: string[];
    requireApiKey: boolean;
  };
  notifications: {
    enableEmailAlerts: boolean;
    alertEmail: string;
    quotaWarningThreshold: number;
    errorRateThreshold: number;
  };
  performance: {
    enableCaching: boolean;
    cacheTimeout: number;
    maxConcurrentRequests: number;
    requestTimeout: number;
  };
}

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'AI Gateway',
      description: 'AI资源聚合层 - 统一多个AI提供商的API网关',
      defaultProvider: 'deepseek',
      enableLogging: true,
      enableAnalytics: true
    },
    security: {
      rateLimitPerMinute: 60,
      maxTokensPerRequest: 4096,
      enableCors: true,
      allowedOrigins: ['*'],
      requireApiKey: true
    },
    notifications: {
      enableEmailAlerts: false,
      alertEmail: '',
      quotaWarningThreshold: 80,
      errorRateThreshold: 5
    },
    performance: {
      enableCaching: false,
      cacheTimeout: 300,
      maxConcurrentRequests: 100,
      requestTimeout: 30
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/settings', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'aig_test_key_123'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        // 显示成功消息
        alert('设置已保存成功！');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('保存设置失败，请重试。');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: '常规设置', icon: CogIcon },
    { id: 'security', name: '安全设置', icon: ShieldCheckIcon },
    { id: 'notifications', name: '通知设置', icon: BellIcon },
    { id: 'performance', name: '性能设置', icon: ChartBarIcon }
  ];

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'grok', name: 'Grok (xAI)' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'siliconflow', name: 'SiliconFlow' },
    { id: 'cloudflare', name: 'Cloudflare AI' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">系统设置</h2>
          <p className="text-sm text-gray-600 mt-1">配置AI Gateway的系统参数和行为</p>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 设置内容 */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统名称
                </label>
                <input
                  type="text"
                  value={settings.general.systemName}
                  onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统描述
                </label>
                <textarea
                  value={settings.general.description}
                  onChange={(e) => updateSetting('general', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认AI提供商
                </label>
                <select
                  value={settings.general.defaultProvider}
                  onChange={(e) => updateSetting('general', 'defaultProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableLogging"
                    checked={settings.general.enableLogging}
                    onChange={(e) => updateSetting('general', 'enableLogging', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableLogging" className="ml-2 block text-sm text-gray-900">
                    启用请求日志记录
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAnalytics"
                    checked={settings.general.enableAnalytics}
                    onChange={(e) => updateSetting('general', 'enableAnalytics', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableAnalytics" className="ml-2 block text-sm text-gray-900">
                    启用使用分析统计
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  速率限制 (每分钟请求数)
                </label>
                <input
                  type="number"
                  value={settings.security.rateLimitPerMinute}
                  onChange={(e) => updateSetting('security', 'rateLimitPerMinute', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  单次请求最大Token数
                </label>
                <input
                  type="number"
                  value={settings.security.maxTokensPerRequest}
                  onChange={(e) => updateSetting('security', 'maxTokensPerRequest', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  允许的来源域名 (每行一个)
                </label>
                <textarea
                  value={settings.security.allowedOrigins.join('\n')}
                  onChange={(e) => updateSetting('security', 'allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com&#10;https://app.example.com&#10;*"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableCors"
                    checked={settings.security.enableCors}
                    onChange={(e) => updateSetting('security', 'enableCors', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableCors" className="ml-2 block text-sm text-gray-900">
                    启用CORS跨域支持
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireApiKey"
                    checked={settings.security.requireApiKey}
                    onChange={(e) => updateSetting('security', 'requireApiKey', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireApiKey" className="ml-2 block text-sm text-gray-900">
                    强制要求API密钥认证
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableEmailAlerts"
                  checked={settings.notifications.enableEmailAlerts}
                  onChange={(e) => updateSetting('notifications', 'enableEmailAlerts', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enableEmailAlerts" className="ml-2 block text-sm text-gray-900">
                  启用邮件告警通知
                </label>
              </div>

              {settings.notifications.enableEmailAlerts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    告警邮箱地址
                  </label>
                  <input
                    type="email"
                    value={settings.notifications.alertEmail}
                    onChange={(e) => updateSetting('notifications', 'alertEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="admin@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配额警告阈值 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.notifications.quotaWarningThreshold}
                  onChange={(e) => updateSetting('notifications', 'quotaWarningThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  错误率告警阈值 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.notifications.errorRateThreshold}
                  onChange={(e) => updateSetting('notifications', 'errorRateThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCaching"
                  checked={settings.performance.enableCaching}
                  onChange={(e) => updateSetting('performance', 'enableCaching', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enableCaching" className="ml-2 block text-sm text-gray-900">
                  启用智能缓存
                </label>
              </div>

              {settings.performance.enableCaching && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    缓存超时时间 (秒)
                  </label>
                  <input
                    type="number"
                    value={settings.performance.cacheTimeout}
                    onChange={(e) => updateSetting('performance', 'cacheTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大并发请求数
                </label>
                <input
                  type="number"
                  value={settings.performance.maxConcurrentRequests}
                  onChange={(e) => updateSetting('performance', 'maxConcurrentRequests', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  请求超时时间 (秒)
                </label>
                <input
                  type="number"
                  value={settings.performance.requestTimeout}
                  onChange={(e) => updateSetting('performance', 'requestTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
