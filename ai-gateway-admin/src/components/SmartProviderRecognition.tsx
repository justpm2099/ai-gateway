'use client';

import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface RecognizedProvider {
  name: string;
  displayName: string;
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
  confidence: number;
  source: 'pattern' | 'url' | 'key_format';
}

interface SmartProviderRecognitionProps {
  onProviderRecognized: (provider: RecognizedProvider) => void;
  onClose: () => void;
}

const SmartProviderRecognition: React.FC<SmartProviderRecognitionProps> = ({ 
  onProviderRecognized, 
  onClose 
}) => {
  const [inputText, setInputText] = useState('');
  const [recognizedProviders, setRecognizedProviders] = useState<RecognizedProvider[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 智能识别规则
  const recognitionPatterns = {
    openai: {
      name: 'openai',
      displayName: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      patterns: {
        apiKey: /sk-[a-zA-Z0-9]{48,}/g,
        url: /api\.openai\.com/i,
        keywords: /openai|gpt-?4|gpt-?3\.?5/i
      }
    },
    anthropic: {
      name: 'anthropic',
      displayName: 'Anthropic (Claude)',
      baseUrl: 'https://api.anthropic.com',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      patterns: {
        apiKey: /sk-ant-[a-zA-Z0-9\-_]{95,}/g,
        url: /api\.anthropic\.com/i,
        keywords: /anthropic|claude/i
      }
    },
    deepseek: {
      name: 'deepseek',
      displayName: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder'],
      patterns: {
        apiKey: /sk-[a-zA-Z0-9]{48,}/g,
        url: /api\.deepseek\.com/i,
        keywords: /deepseek/i
      }
    },
    gemini: {
      name: 'gemini',
      displayName: 'Google Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-pro', 'gemini-pro-vision'],
      patterns: {
        apiKey: /AIza[0-9A-Za-z\-_]{35}/g,
        url: /generativelanguage\.googleapis\.com/i,
        keywords: /gemini|google.*ai/i
      }
    },
    openrouter: {
      name: 'openrouter',
      displayName: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      models: ['openai/gpt-4o', 'anthropic/claude-3-sonnet'],
      patterns: {
        apiKey: /sk-or-[a-zA-Z0-9\-_]{48,}/g,
        url: /openrouter\.ai/i,
        keywords: /openrouter/i
      }
    },
    siliconflow: {
      name: 'siliconflow',
      displayName: 'SiliconFlow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      models: ['deepseek-ai/deepseek-chat', 'Qwen/Qwen2-7B-Instruct'],
      patterns: {
        apiKey: /sk-[a-zA-Z0-9]{48,}/g,
        url: /api\.siliconflow\.cn/i,
        keywords: /siliconflow|silicon.*flow/i
      }
    }
  };

  const analyzeText = () => {
    setIsAnalyzing(true);
    const results: RecognizedProvider[] = [];

    // 分析每个供应商
    Object.entries(recognitionPatterns).forEach(([key, config]) => {
      let confidence = 0;
      let apiKey = '';
      let detectedUrl = '';

      // 检查API密钥格式
      const keyMatches = inputText.match(config.patterns.apiKey);
      if (keyMatches) {
        confidence += 40;
        apiKey = keyMatches[0];
      }

      // 检查URL
      if (config.patterns.url.test(inputText)) {
        confidence += 30;
        const urlMatch = inputText.match(/https?:\/\/[^\s]+/g);
        if (urlMatch) {
          detectedUrl = urlMatch.find(url => config.patterns.url.test(url)) || config.baseUrl;
        }
      }

      // 检查关键词
      if (config.patterns.keywords.test(inputText)) {
        confidence += 20;
      }

      // 检查模型名称
      const modelKeywords = config.models.join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const modelRegex = new RegExp(modelKeywords, 'i');
      if (modelRegex.test(inputText)) {
        confidence += 10;
      }

      if (confidence >= 30) {
        results.push({
          name: config.name,
          displayName: config.displayName,
          apiKey: apiKey || undefined,
          baseUrl: detectedUrl || config.baseUrl,
          models: config.models,
          confidence,
          source: apiKey ? 'key_format' : detectedUrl ? 'url' : 'pattern'
        });
      }
    });

    // 按置信度排序
    results.sort((a, b) => b.confidence - a.confidence);
    setRecognizedProviders(results);
    setIsAnalyzing(false);
  };

  const handleProviderSelect = (provider: RecognizedProvider) => {
    onProviderRecognized(provider);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600 bg-green-100';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 70) return '高置信度';
    if (confidence >= 50) return '中等置信度';
    return '低置信度';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">智能识别AI供应商配置</h3>
                <p className="text-sm text-gray-500">粘贴配置信息，自动识别供应商和参数</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              title="关闭"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* 输入区域 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              粘贴配置信息
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请粘贴包含API密钥、URL或供应商信息的文本内容..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                支持识别：API密钥、服务URL、供应商名称、模型名称等
              </p>
              <button
                type="button"
                onClick={analyzeText}
                disabled={!inputText.trim() || isAnalyzing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    智能识别
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 识别结果 */}
          {recognizedProviders.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">识别结果</h4>
              <div className="space-y-3">
                {recognizedProviders.map((provider, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="text-lg font-medium text-gray-900">
                            {provider.displayName}
                          </h5>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(provider.confidence)}`}>
                            {getConfidenceText(provider.confidence)} ({provider.confidence}%)
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {provider.apiKey && (
                            <div>
                              <span className="font-medium text-gray-700">API密钥:</span>
                              <span className="ml-2 text-gray-600 font-mono">
                                {provider.apiKey.substring(0, 10)}...
                              </span>
                            </div>
                          )}
                          {provider.baseUrl && (
                            <div>
                              <span className="font-medium text-gray-700">服务URL:</span>
                              <span className="ml-2 text-gray-600">{provider.baseUrl}</span>
                            </div>
                          )}
                          {provider.models && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">支持模型:</span>
                              <span className="ml-2 text-gray-600">
                                {provider.models.slice(0, 3).join(', ')}
                                {provider.models.length > 3 && ` 等${provider.models.length}个`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleProviderSelect(provider)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        使用此配置
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 无识别结果 */}
          {!isAnalyzing && inputText.trim() && recognizedProviders.length === 0 && (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">未识别到供应商配置</h3>
              <p className="mt-1 text-sm text-gray-500">
                请检查输入内容是否包含有效的API密钥、URL或供应商信息
              </p>
            </div>
          )}

          {/* 示例提示 */}
          {recognizedProviders.length === 0 && !inputText.trim() && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">支持的格式示例：</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• OpenAI: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>• Anthropic: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>• Google: AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>• 配置文件片段、环境变量、curl命令等</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartProviderRecognition;
