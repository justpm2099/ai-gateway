'use client';

import React, { useState } from 'react';
import { ProviderPreset } from '../data/providerPresets';
import {
  KeyIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface SimpleProviderConfigProps {
  preset: ProviderPreset;
  onSave: (config: any) => void;
  onBack: () => void;
  onClose: () => void;
}

const SimpleProviderConfig: React.FC<SimpleProviderConfigProps> = ({ 
  preset, 
  onSave, 
  onBack, 
  onClose 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [displayName, setDisplayName] = useState(preset.displayName);
  const [priority, setPriority] = useState(preset.defaultConfig.priority);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    
    const config = {
      name: preset.name,
      displayName: displayName,
      apiBaseUrl: preset.apiBaseUrl,
      apiKey: apiKey.trim(),
      models: preset.models,
      timeout: preset.defaultConfig.timeout,
      retries: preset.defaultConfig.retries,
      maxTokens: preset.defaultConfig.maxTokens,
      priority: priority,
      costPerToken: preset.defaultConfig.costPerToken,
      authType: preset.authType,
      authHeader: preset.authHeader,
      enabled: true,
      description: preset.description,
      features: preset.features
    };

    try {
      await onSave(config);
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存配置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* 标题和供应商信息 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">配置 {preset.displayName}</h3>
                <p className="text-sm text-gray-500">{preset.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 供应商详细信息 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {preset.region === 'china' ? '国内服务' : preset.region === 'global' ? '全球服务' : preset.region}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{preset.models.length} 个模型</span>
              </div>
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  ${preset.defaultConfig.costPerToken.toFixed(6)}/token
                </span>
              </div>
            </div>
            
            {/* 支持的模型 */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">支持的模型:</h4>
              <div className="flex flex-wrap gap-1">
                {preset.models.slice(0, 6).map((model, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {model}
                  </span>
                ))}
                {preset.models.length > 6 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{preset.models.length - 6} 更多
                  </span>
                )}
              </div>
            </div>

            {/* 特性标签 */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">主要特性:</h4>
              <div className="flex flex-wrap gap-1">
                {preset.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 配置表单 */}
          <div className="space-y-4">
            {/* API密钥 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <KeyIcon className="w-4 h-4 inline mr-1" />
                API密钥 *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`请输入您的 ${preset.displayName} API密钥`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                <span>API密钥将被安全加密存储</span>
                {preset.documentation && (
                  <>
                    <span className="mx-2">•</span>
                    <a
                      href={preset.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      获取API密钥
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* 显示名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                显示名称
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="自定义显示名称（可选）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? '(最高优先级)' : num === 10 ? '(最低优先级)' : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                数字越小优先级越高，系统会优先使用高优先级的供应商
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              返回选择
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProviderConfig;
