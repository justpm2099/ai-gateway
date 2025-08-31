import { BaseConnector } from './base';
import { ChatCompletionRequest, ProviderResponse, Environment, ChatMessage } from '../types';

export class CloudflareAIConnector extends BaseConnector {
  constructor(env: Environment) {
    super(env, '', ''); // Cloudflare AI doesn't need external API key
  }

  async chat(request: ChatCompletionRequest): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      const model = request.model || '@cf/meta/llama-2-7b-chat-fp16';
      
      // 构建prompt格式
      const prompt = this.buildPrompt(request.messages);

      const response = await this.env.AI.run(model, {
        prompt,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7
      });

      // 转换为OpenAI格式
      const normalizedResponse = this.convertToOpenAIFormat(response, model);
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

  private buildPrompt(messages: ChatMessage[]): string {
    let prompt = '';
    
    for (const message of messages) {
      switch (message.role) {
        case 'system':
          prompt += `System: ${message.content}\n\n`;
          break;
        case 'user':
          prompt += `Human: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    }
    
    prompt += 'Assistant: ';
    return prompt;
  }

  private convertToOpenAIFormat(cfResponse: any, model: string): any {
    const content = cfResponse.response || cfResponse.text || '';
    
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
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: this.estimateTokens(this.buildPrompt([])),
        completion_tokens: this.estimateTokens(content),
        total_tokens: this.estimateTokens(this.buildPrompt([]) + content)
      }
    };
  }

  private estimateTokens(text: string): number {
    // 简单的token估算，实际应该使用更精确的方法
    return Math.ceil(text.length / 4);
  }
}

export async function handleCloudflareAI(request: ChatCompletionRequest, env: Environment): Promise<ProviderResponse> {
  const connector = new CloudflareAIConnector(env);
  return await connector.chat(request);
}
