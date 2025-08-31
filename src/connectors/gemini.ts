import { BaseConnector } from './base';
import { ChatCompletionRequest, ProviderResponse, Environment, ChatMessage } from '../types';

export class GeminiConnector extends BaseConnector {
  constructor(env: Environment) {
    super(env, env.GEMINI_API_KEY, 'https://generativelanguage.googleapis.com/v1beta');
  }

  async chat(request: ChatCompletionRequest): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      const model = request.model || 'gemini-pro';
      const contents = this.convertMessagesToGeminiFormat(request.messages);

      const payload = {
        contents,
        generationConfig: {
          maxOutputTokens: request.max_tokens || 1024,
          temperature: request.temperature || 0.7,
          topP: request.top_p || 0.8
        }
      };

      const response = await this.makeRequest(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

      // 转换Gemini响应为OpenAI格式
      const normalizedResponse = this.convertGeminiToOpenAIFormat(data, model);
      return this.normalizeResponse(normalizedResponse, startTime);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: Date.now() - startTime,
        tokens_used: 0
      };
    }
  }

  private convertMessagesToGeminiFormat(messages: ChatMessage[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system') // Gemini doesn't support system messages directly
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
  }

  private convertGeminiToOpenAIFormat(geminiResponse: any, model: string): any {
    const candidate = geminiResponse.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';

    return {
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content
        },
        finish_reason: candidate?.finishReason?.toLowerCase() || 'stop'
      }],
      usage: {
        prompt_tokens: geminiResponse.usageMetadata?.promptTokenCount || 0,
        completion_tokens: geminiResponse.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: geminiResponse.usageMetadata?.totalTokenCount || 0
      }
    };
  }
}

export async function handleGemini(request: ChatCompletionRequest, env: Environment): Promise<ProviderResponse> {
  const connector = new GeminiConnector(env);
  return await connector.chat(request);
}
