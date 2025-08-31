'use client';

import React, { useState } from 'react';
import { PROVIDER_PRESETS, PROVIDER_CATEGORIES, ProviderPreset, getProvidersByCategory } from '../data/providerPresets';
import { 
  CpuChipIcon, 
  PlusIcon,
  CheckIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ProviderSelectorProps {
  onSelectProvider: (preset: ProviderPreset | null) => void;
  onClose: () => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ onSelectProvider, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('top-tier');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleProviderSelect = (preset: ProviderPreset) => {
    setSelectedProvider(preset.id);
    onSelectProvider(preset);
  };

  const handleCustomProvider = () => {
    setSelectedProvider('custom');
    onSelectProvider(null); // null表示自定义
  };

  const categories = Object.entries(PROVIDER_CATEGORIES);
  const currentProviders = getProvidersByCategory(selectedCategory);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">选择AI供应商</h3>
              <p className="text-sm text-gray-500 mt-1">选择预置供应商快速配置，或选择自定义供应商</p>
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

          {/* 分类选择 */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {categories.map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {PROVIDER_CATEGORIES[selectedCategory as keyof typeof PROVIDER_CATEGORIES]?.description}
            </p>
          </div>

          {/* 供应商网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider === provider.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {selectedProvider === provider.id && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CpuChipIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {provider.displayName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {provider.description}
                    </p>
                    
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {provider.models.length} 模型
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        ${provider.defaultConfig.costPerToken.toFixed(6)}/token
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <GlobeAltIcon className="w-3 h-3 mr-1" />
                      {provider.region === 'china' ? '国内' : provider.region === 'global' ? '全球' : provider.region}
                    </div>
                  </div>
                </div>
                
                {/* 特性标签 */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {provider.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {feature}
                    </span>
                  ))}
                  {provider.features.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      +{provider.features.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 自定义供应商选项 */}
          <div className="border-t pt-6">
            <div
              onClick={handleCustomProvider}
              className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-gray-400 ${
                selectedProvider === 'custom'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CogIcon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-900">自定义供应商</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    配置列表中没有的AI供应商
                  </p>
                </div>
                {selectedProvider === 'custom' && (
                  <CheckIcon className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (selectedProvider === 'custom') {
                  onSelectProvider(null);
                } else if (selectedProvider) {
                  const preset = PROVIDER_PRESETS.find(p => p.id === selectedProvider);
                  if (preset) {
                    onSelectProvider(preset);
                  }
                }
              }}
              disabled={!selectedProvider}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              继续配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSelector;
