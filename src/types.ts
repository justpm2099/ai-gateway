// 核心类型定义
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  provider?: string;
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface User {
  id: string;
  email: string;
  api_key: string;
  quota_limit?: number;
  quota_used?: number;
  created_at: string;
}

export interface RequestLog {
  id: string;
  user_id: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  cost_usd?: number;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

export interface ProviderConfig {
  name: string;
  api_key: string;
  base_url: string;
  models: string[];
  cost_per_token: number;
  max_tokens: number;
  supports_streaming: boolean;
  priority: number;
}

export interface RouterStrategy {
  type: 'cost' | 'speed' | 'quality' | 'availability';
  fallback_providers: string[];
  model_mapping: Record<string, string>;
}

export interface Environment {
  KV_USERS: KVNamespace;
  KV_CONFIG: KVNamespace;
  DB: D1Database;
  AI: any; // Cloudflare AI binding
  
  // API Keys
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  GEMINI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  SILICONFLOW_API_KEY: string;
  
  // Configuration
  DEFAULT_PROVIDER: string;
  ENABLE_LOGGING: string;
  RATE_LIMIT_PER_MINUTE: string;
}

export interface ProviderResponse {
  success: boolean;
  data?: ChatCompletionResponse;
  error?: string;
  latency_ms: number;
  tokens_used: number;
}

export type AIProvider = 'openai' | 'deepseek' | 'gemini' | 'openrouter' | 'siliconflow' | 'cloudflare' | 'grok';

export interface HealthCheck {
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  last_check: string;
  error_rate: number;
}
