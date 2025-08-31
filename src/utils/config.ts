import { ProviderConfig, AIProvider, Environment } from '../types';

export class Config {
  private env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  getProviderConfig(provider: AIProvider): ProviderConfig {
    const configs: Record<AIProvider, ProviderConfig> = {
      openai: {
        name: 'OpenAI',
        api_key: this.env.OPENAI_API_KEY,
        base_url: 'https://api.openai.com/v1',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        cost_per_token: 0.00001,
        max_tokens: 4096,
        supports_streaming: true,
        priority: 1
      },
      deepseek: {
        name: 'DeepSeek',
        api_key: this.env.DEEPSEEK_API_KEY,
        base_url: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder'],
        cost_per_token: 0.000001,
        max_tokens: 4096,
        supports_streaming: true,
        priority: 2
      },
      gemini: {
        name: 'Google Gemini',
        api_key: this.env.GEMINI_API_KEY,
        base_url: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-pro', 'gemini-pro-vision'],
        cost_per_token: 0.000005,
        max_tokens: 2048,
        supports_streaming: true,
        priority: 3
      },
      openrouter: {
        name: 'OpenRouter',
        api_key: this.env.OPENROUTER_API_KEY,
        base_url: 'https://openrouter.ai/api/v1',
        models: ['openai/gpt-4o', 'anthropic/claude-3-sonnet'],
        cost_per_token: 0.00002,
        max_tokens: 4096,
        supports_streaming: true,
        priority: 4
      },
      siliconflow: {
        name: 'SiliconFlow',
        api_key: this.env.SILICONFLOW_API_KEY,
        base_url: 'https://api.siliconflow.cn/v1',
        models: ['deepseek-ai/deepseek-chat', 'Qwen/Qwen2-7B-Instruct'],
        cost_per_token: 0.000001,
        max_tokens: 4096,
        supports_streaming: true,
        priority: 5
      },
      cloudflare: {
        name: 'Cloudflare AI',
        api_key: '',
        base_url: '',
        models: ['@cf/meta/llama-2-7b-chat-fp16', '@cf/mistral/mistral-7b-instruct-v0.1'],
        cost_per_token: 0,
        max_tokens: 2048,
        supports_streaming: false,
        priority: 6
      },
      grok: {
        name: 'Grok (xAI)',
        api_key: this.env.GROK_API_KEY,
        base_url: 'https://api.x.ai/v1',
        models: ['grok-beta', 'grok-vision-beta'],
        cost_per_token: 0.000005,
        max_tokens: 4096,
        supports_streaming: true,
        priority: 7
      }
    };

    return configs[provider];
  }

  getDefaultProvider(): AIProvider {
    return (this.env.DEFAULT_PROVIDER as AIProvider) || 'deepseek';
  }

  isLoggingEnabled(): boolean {
    return this.env.ENABLE_LOGGING === 'true';
  }

  getRateLimit(): number {
    return parseInt(this.env.RATE_LIMIT_PER_MINUTE) || 60;
  }

  getAllProviders(): AIProvider[] {
    return ['openai', 'deepseek', 'gemini', 'openrouter', 'siliconflow', 'cloudflare', 'grok'];
  }
}
