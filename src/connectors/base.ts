import { ChatCompletionRequest, ChatCompletionResponse, ProviderResponse, Environment } from '../types';

export abstract class BaseConnector {
  protected env: Environment;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(env: Environment, apiKey: string, baseUrl: string) {
    this.env = env;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract async chat(request: ChatCompletionRequest): Promise<ProviderResponse>;

  protected async makeRequest(
    url: string,
    options: RequestInit,
    timeoutMs: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected normalizeResponse(response: any, startTime: number): ProviderResponse {
    const latency = Date.now() - startTime;
    
    if (!response || response.error) {
      return {
        success: false,
        error: response?.error?.message || 'Unknown error',
        latency_ms: latency,
        tokens_used: 0
      };
    }

    return {
      success: true,
      data: response,
      latency_ms: latency,
      tokens_used: response.usage?.total_tokens || 0
    };
  }

  protected buildHeaders(contentType: string = 'application/json'): Record<string, string> {
    return {
      'Content-Type': contentType,
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'AI-Gateway/1.0'
    };
  }
}
