import { BaseConnector } from './base';
import { ChatCompletionRequest, ProviderResponse, Environment } from '../types';

export class OpenRouterConnector extends BaseConnector {
  constructor(env: Environment) {
    super(env, env.OPENROUTER_API_KEY, 'https://openrouter.ai/api/v1');
  }

  async chat(request: ChatCompletionRequest): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      const payload = {
        model: request.model || 'openai/gpt-3.5-turbo',
        messages: request.messages,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7,
        stream: request.stream || false,
        top_p: request.top_p,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty
      };

      const headers = {
        ...this.buildHeaders(),
        'HTTP-Referer': 'https://ai-gateway.workers.dev',
        'X-Title': 'AI Gateway'
      };

      const response = await this.makeRequest(
        `${this.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || `HTTP ${response.status}`,
          latency_ms: Date.now() - startTime,
          tokens_used: 0
        };
      }

      return this.normalizeResponse(data, startTime);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: Date.now() - startTime,
        tokens_used: 0
      };
    }
  }
}

export async function handleOpenRouter(request: ChatCompletionRequest, env: Environment): Promise<ProviderResponse> {
  const connector = new OpenRouterConnector(env);
  return await connector.chat(request);
}
