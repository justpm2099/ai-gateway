'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  quotaLimit: number;
  quotaUsed: number;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    quotaLimit: 1000000,
    userId: ''
  });

  // useEffect(() => {
  //   fetchApiKeys();
  // }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/api-keys', {
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: 添加成功提示
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('https://ai-gateway.aibook2099.workers.dev/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'aig_test_key_123'
        },
        body: JSON.stringify(newKeyForm)
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys(prev => [...prev, newKey]);
        setShowCreateModal(false);
        setNewKeyForm({ name: '', quotaLimit: 1000000, userId: '' });
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('确定要删除这个API密钥吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`https://ai-gateway.aibook2099.workers.dev/admin/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': 'aig_test_key_123'
        }
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(k => k.id !== keyId));
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const formatQuota = (used: number, limit: number) => {
    const safeUsed = used || 0;
    const safeLimit = limit || 0;
    const percentage = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
    return { percentage, text: `${safeUsed.toLocaleString()} / ${safeLimit.toLocaleString()}` };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">API密钥管理</h2>
            <p className="text-sm text-gray-600 mt-1">创建和管理用户API密钥</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            创建密钥
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => {
            const quota = formatQuota(apiKey.quotaUsed, apiKey.quotaLimit);
            const isVisible = visibleKeys.has(apiKey.id);
            
            return (
              <div key={apiKey.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.isActive ? '活跃' : '已禁用'}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>用户ID: {apiKey.userId}</span>
                      <span>创建时间: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                      {apiKey.lastUsed && (
                        <span>最后使用: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-md px-3 py-2 flex-1 max-w-md">
                        <code className="text-sm font-mono">
                          {isVisible ? apiKey.key : '•'.repeat(20)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>配额使用情况</span>
                        <span>{quota.text}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            quota.percentage > 90 ? 'bg-red-500' : 
                            quota.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">创建新的API密钥</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密钥名称
                </label>
                <input
                  type="text"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：生产环境密钥"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户ID
                </label>
                <input
                  type="text"
                  value={newKeyForm.userId}
                  onChange={(e) => setNewKeyForm(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="用户唯一标识"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配额限制 (tokens)
                </label>
                <input
                  type="number"
                  value={newKeyForm.quotaLimit}
                  onChange={(e) => setNewKeyForm(prev => ({ ...prev, quotaLimit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={createApiKey}
                  disabled={!newKeyForm.name || !newKeyForm.userId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
