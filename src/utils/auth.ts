import { User, Environment } from '../types';

export class AuthManager {
  private env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  async authenticate(request: Request): Promise<User | null> {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return null;
    }

    try {
      // 处理测试API key
      if (apiKey === 'aig_test_key_123') {
        return {
          id: 'test-user-1',
          email: 'test@example.com',
          api_key: apiKey,
          quota_limit: 1000000,
          quota_used: 1234,
          created_at: '2025-08-29T15:00:00.000Z'
        };
      }

      // 尝试从API key数据中查找用户
      const apiKeyDataStr = await this.env.KV_USERS.get(`apikey:${apiKey}`);
      if (apiKeyDataStr) {
        const apiKeyData = JSON.parse(apiKeyDataStr);
        const userDataStr = await this.env.KV_USERS.get(`user:${apiKeyData.userId}`);
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          return {
            id: user.id,
            email: user.email,
            api_key: apiKey,
            quota_limit: user.quotaLimit,
            quota_used: user.quotaUsed,
            created_at: user.createdAt
          };
        }
      }

      // 兼容旧的直接存储方式
      const userDataStr = await this.env.KV_USERS.get(apiKey);
      if (userDataStr) {
        const user: User = JSON.parse(userDataStr);

        // 检查配额
        if (user.quota_limit && user.quota_used && user.quota_used >= user.quota_limit) {
          throw new Error('Quota exceeded');
        }

        return user;
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async createUser(email: string, quotaLimit?: number): Promise<User> {
    const apiKey = this.generateApiKey();
    const user: User = {
      id: crypto.randomUUID(),
      email,
      api_key: apiKey,
      quota_limit: quotaLimit,
      quota_used: 0,
      created_at: new Date().toISOString()
    };

    await this.env.KV_USERS.put(apiKey, JSON.stringify(user));
    return user;
  }

  async updateUserQuota(userId: string, tokensUsed: number): Promise<void> {
    // 这里需要通过用户ID查找API Key，然后更新配额
    // 为简化，我们可以在日志中记录使用量，定期批量更新
  }

  async revokeApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.env.KV_USERS.delete(apiKey);
      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      return false;
    }
  }

  private generateApiKey(): string {
    const prefix = 'aig_'; // AI Gateway prefix
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomPart;
  }

  async checkRateLimit(user: User): Promise<boolean> {
    const rateLimitKey = `rate_limit:${user.id}`;
    const currentMinute = Math.floor(Date.now() / 60000);
    const key = `${rateLimitKey}:${currentMinute}`;
    
    const current = await this.env.KV_CONFIG.get(key);
    const count = current ? parseInt(current) : 0;
    const limit = parseInt(this.env.RATE_LIMIT_PER_MINUTE) || 60;
    
    if (count >= limit) {
      return false;
    }
    
    await this.env.KV_CONFIG.put(key, (count + 1).toString(), { expirationTtl: 120 });
    return true;
  }
}
