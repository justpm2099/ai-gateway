'use client';

import React, { useState } from 'react';
import ProviderSelector from '../../components/ProviderSelector';
import SimpleProviderConfig from '../../components/SimpleProviderConfig';
import { ProviderPreset } from '../../data/providerPresets';

export default function TestProvidersPage() {
  const [showSelector, setShowSelector] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset | null>(null);

  const handleProviderSelect = (preset: ProviderPreset | null) => {
    setShowSelector(false);
    if (preset) {
      setSelectedPreset(preset);
      setShowConfig(true);
    } else {
      alert('选择了自定义供应商');
    }
  };

  const handleConfigSave = async (config: any) => {
    console.log('保存配置:', config);
    alert('配置已保存（测试模式）');
    setShowConfig(false);
    setSelectedPreset(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            AI供应商配置测试页面
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowSelector(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              测试供应商选择器
            </button>

            <div className="text-sm text-gray-600">
              <p>这个页面用于测试新的AI供应商配置流程：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>点击按钮打开供应商选择器</li>
                <li>选择预置供应商进入简化配置</li>
                <li>选择自定义供应商进入完整配置</li>
                <li>测试各种供应商的预置配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 供应商选择器 */}
      {showSelector && (
        <ProviderSelector
          onSelectProvider={handleProviderSelect}
          onClose={() => setShowSelector(false)}
        />
      )}

      {/* 简化配置 */}
      {showConfig && selectedPreset && (
        <SimpleProviderConfig
          preset={selectedPreset}
          onSave={handleConfigSave}
          onBack={() => {
            setShowConfig(false);
            setShowSelector(true);
          }}
          onClose={() => {
            setShowConfig(false);
            setSelectedPreset(null);
          }}
        />
      )}
    </div>
  );
}
