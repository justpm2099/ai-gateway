import { RequestLog, User, Environment, ProviderResponse } from '../types';

export class Logger {
  private env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  async logRequest(
    user: User,
    provider: string,
    model: string,
    request: any,
    response: ProviderResponse
  ): Promise<void> {
    if (this.env.ENABLE_LOGGING !== 'true') {
      return;
    }

    const log: RequestLog = {
      id: crypto.randomUUID(),
      user_id: user.id,
      provider,
      model,
      prompt_tokens: response.data?.usage?.prompt_tokens || 0,
      completion_tokens: response.data?.usage?.completion_tokens || 0,
      total_tokens: response.tokens_used,
      latency_ms: response.latency_ms,
      cost_usd: this.calculateCost(provider, response.tokens_used),
      timestamp: new Date().toISOString(),
      success: response.success,
      error_message: response.error
    };

    try {
      await this.env.DB.prepare(`
        INSERT INTO request_logs 
        (id, user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, cost_usd, timestamp, success, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        log.id,
        log.user_id,
        log.provider,
        log.model,
        log.prompt_tokens,
        log.completion_tokens,
        log.total_tokens,
        log.latency_ms,
        log.cost_usd,
        log.timestamp,
        log.success ? 1 : 0,
        log.error_message
      ).run();
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  }

  private calculateCost(provider: string, tokens: number): number {
    const costPerToken: Record<string, number> = {
      openai: 0.00001,
      deepseek: 0.000001,
      gemini: 0.000005,
      openrouter: 0.00002,
      siliconflow: 0.000001,
      cloudflare: 0
    };

    return (costPerToken[provider] || 0) * tokens;
  }

  async getUsageStats(userId: string, days: number = 30): Promise<any> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      const result = await this.env.DB.prepare(`
        SELECT 
          provider,
          COUNT(*) as request_count,
          SUM(total_tokens) as total_tokens,
          SUM(cost_usd) as total_cost,
          AVG(latency_ms) as avg_latency
        FROM request_logs 
        WHERE user_id = ? AND timestamp >= ?
        GROUP BY provider
      `).bind(userId, since).all();

      return result.results;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return [];
    }
  }
}
