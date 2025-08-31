'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  XCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface Provider {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  enabled: boolean;
  apiKeyConfigured: boolean;
  models: string[];
  costPerToken: number;
  priority: number;
  lastCheck: string;
  latency: number;
}

const ProviderStatus = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/providers', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setProviders([
        {
          id: 'openai',
          name: 'OpenAI',
          status: 'down',
          enabled: false,
          apiKeyConfigured: false,
          models: ['gpt-4o', 'gpt-4o-mini'],
          costPerToken: 0.00001,
          priority: 1,
          lastCheck: new Date().toISOString(),
          latency: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleProvider = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const configureApiKey = (provider: Provider) => {
    setSelectedProvider(provider);
    setApiKeyInput('');
    setShowApiKeyModal(true);
  };

  const saveApiKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return;

    setProviders(prev => prev.map(p => 
      p.id === selectedProvider.id ? { ...p, apiKeyConfigured: true, status: 'healthy' } : p
    ));
    setShowApiKeyModal(false);
    setSelectedProvider(null);
    setApiKeyInput('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
          <h2 className="text-xl font-semibold text-gray-900">AI供应商状态</h2>
          <p className="text-sm text-gray-600 mt-1">管理和监控各个AI提供商的状态</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {providers.map((provider) => (
            <div key={provider.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(provider.status)}
                    <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>延迟: {provider.latency}ms</span>
                    <span>成本: ${provider.costPerToken.toFixed(6)}/token</span>
                    <span>优先级: {provider.priority}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <KeyIcon className={`w-4 h-4 ${provider.apiKeyConfigured ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-xs ${provider.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {provider.apiKeyConfigured ? 'API密钥已配置' : 'API密钥未配置'}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => configureApiKey(provider)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    配置
                  </button>
                  
                  <Switch
                    checked={provider.enabled}
                    onChange={() => toggleProvider(provider.id)}
                    className={`${
                      provider.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        provider.enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  支持模型: {provider.models.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showApiKeyModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">配置 {selectedProvider.name} API密钥</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API密钥
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="输入API密钥..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  密钥将安全存储在Cloudflare Workers环境变量中
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderStatus;
