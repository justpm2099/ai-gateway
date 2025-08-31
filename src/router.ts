import { ChatCompletionRequest, ProviderResponse, Environment, AIProvider, User } from './types';
import { AuthManager } from './utils/auth';
import { Logger } from './utils/logger';
import { Config } from './utils/config';
import { handleOpenAI } from './connectors/openai';
import { handleDeepSeek } from './connectors/deepseek';
import { handleGemini } from './connectors/gemini';
import { handleOpenRouter } from './connectors/openrouter';
import { handleSiliconFlow } from './connectors/siliconflow';
import { handleCloudflareAI } from './connectors/cloudflare';
import { handleGrok } from './connectors/grok';

export class Router {
  private auth: AuthManager;
  private logger: Logger;
  private config: Config;
  private env: Environment;

  constructor(env: Environment) {
    this.env = env;
    this.auth = new AuthManager(env);
    this.logger = new Logger(env);
    this.config = new Config(env);
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS处理
    if (request.method === 'OPTIONS') {
      return this.handleCORS();
    }

    // 根路径 - Web界面
    if (pathname === '/') {
      return this.handleWebInterface();
    }

    // Favicon
    if (pathname === '/favicon.ico') {
      return this.handleFavicon();
    }

    // 健康检查
    if (pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: this.getCORSHeaders()
      });
    }

    // 用户统计
    if (pathname === '/stats' && request.method === 'GET') {
      return this.handleStats(request);
    }

    // 管理API端点
    if (pathname.startsWith('/admin/')) {
      return this.handleAdminAPI(request);
    }

    // 主要聊天接口
    if (pathname === '/v1/chat/completions' && request.method === 'POST') {
      return this.handleChatCompletion(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleChatCompletion(request: Request): Promise<Response> {
    const startTime = Date.now();

    try {
      // 认证
      const user = await this.auth.authenticate(request);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 速率限制检查
      const rateLimitOk = await this.auth.checkRateLimit(user);
      if (!rateLimitOk) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body: ChatCompletionRequest = await request.json();

      // 智能选择提供商
      const provider = await this.selectProvider(body, user);

      // 调用AI提供商
      const response = await this.callProvider(provider, body);

      // 计算延迟
      const latency = Date.now() - startTime;

      // 记录日志
      await this.logger.logRequest(user, provider, body.model || 'default', body, response);

      // 记录统计数据
      await this.recordStats(user.id, provider, latency, response);

      if (!response.success) {
        // 尝试故障转移
        const fallbackResponse = await this.handleFailover(body, user, provider);
        if (fallbackResponse.success) {
          // 记录故障转移的统计数据
          const fallbackLatency = Date.now() - startTime;
          await this.recordStats(user.id, 'fallback', fallbackLatency, fallbackResponse);

          return new Response(JSON.stringify(fallbackResponse.data), {
            headers: this.getCORSHeaders()
          });
        }

        return new Response(JSON.stringify({ error: response.error }), {
          status: 500,
          headers: this.getCORSHeaders()
        });
      }

      return new Response(JSON.stringify(response.data), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Router error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async selectProvider(request: ChatCompletionRequest, user: User): Promise<AIProvider> {
    // 如果请求中指定了提供商，直接使用
    if (request.provider && this.isValidProvider(request.provider)) {
      return request.provider as AIProvider;
    }

    // 智能选择策略
    const providers = this.config.getAllProviders();
    
    // 简单策略：优先使用成本最低的可用提供商
    for (const provider of providers) {
      const config = this.config.getProviderConfig(provider);
      if (await this.isProviderHealthy(provider)) {
        return provider;
      }
    }

    // 默认回退到Cloudflare AI
    return 'cloudflare';
  }

  private async callProvider(provider: AIProvider, request: ChatCompletionRequest): Promise<ProviderResponse> {
    switch (provider) {
      case 'openai':
        return await handleOpenAI(request, this.env);
      case 'deepseek':
        return await handleDeepSeek(request, this.env);
      case 'gemini':
        return await handleGemini(request, this.env);
      case 'openrouter':
        return await handleOpenRouter(request, this.env);
      case 'siliconflow':
        return await handleSiliconFlow(request, this.env);
      case 'cloudflare':
        return await handleCloudflareAI(request, this.env);
      case 'grok':
        return await handleGrok(request, this.env);
      default:
        return {
          success: false,
          error: 'Invalid provider',
          latency_ms: 0,
          tokens_used: 0
        };
    }
  }

  private async handleFailover(request: ChatCompletionRequest, user: User, failedProvider: AIProvider): Promise<ProviderResponse> {
    const fallbackProviders = this.config.getAllProviders().filter(p => p !== failedProvider);
    
    for (const provider of fallbackProviders) {
      if (await this.isProviderHealthy(provider)) {
        const response = await this.callProvider(provider, request);
        if (response.success) {
          await this.logger.logRequest(user, provider, request.model || 'default', request, response);
          return response;
        }
      }
    }

    return {
      success: false,
      error: 'All providers failed',
      latency_ms: 0,
      tokens_used: 0
    };
  }

  private async isProviderHealthy(provider: AIProvider): Promise<boolean> {
    // 简单的健康检查，实际应该缓存结果
    const config = this.config.getProviderConfig(provider);
    return !!config.api_key || provider === 'cloudflare';
  }

  private isValidProvider(provider: string): boolean {
    return this.config.getAllProviders().includes(provider as AIProvider);
  }

  private async handleStats(request: Request): Promise<Response> {
    const user = await this.auth.authenticate(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stats = await this.logger.getUsageStats(user.id);
    return new Response(JSON.stringify(stats), {
      headers: this.getCORSHeaders()
    });
  }

  private handleCORS(): Response {
    return new Response(null, {
      status: 204,
      headers: this.getCORSHeaders()
    });
  }

  private getCORSHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
    };
  }

  private handleWebInterface(): Response {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Gateway - AI资源聚合层</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); }
        h1 { text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .status { text-align: center; margin: 20px 0; }
        .status.healthy { color: #4ade80; }
        .endpoint { background: rgba(255,255,255,0.1); padding: 20px; margin: 15px 0; border-radius: 10px; }
        .endpoint h3 { margin-top: 0; color: #fbbf24; }
        code { background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; }
        .providers { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .provider { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center; }
        .footer { text-align: center; margin-top: 40px; opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Gateway</h1>
        <div class="status healthy">✅ 服务运行正常</div>

        <div class="endpoint">
            <h3>📡 API端点</h3>
            <p><strong>基础URL:</strong> <code>https://ai-gateway.aibook2099.workers.dev</code></p>
            <p><strong>聊天接口:</strong> <code>POST /v1/chat/completions</code></p>
            <p><strong>健康检查:</strong> <code>GET /health</code></p>
            <p><strong>使用统计:</strong> <code>GET /stats</code></p>
        </div>

        <div class="endpoint">
            <h3>🔑 认证</h3>
            <p>请在请求头中包含: <code>x-api-key: your-api-key</code></p>
            <p>测试密钥: <code>aig_test_key_123</code></p>
        </div>

        <div class="endpoint">
            <h3>🤖 支持的AI提供商</h3>
            <div class="providers">
                <div class="provider">🟢 OpenAI<br><small>gpt-4o, gpt-4o-mini</small></div>
                <div class="provider">🟢 DeepSeek<br><small>deepseek-chat</small></div>
                <div class="provider">🟢 Gemini<br><small>gemini-pro</small></div>
                <div class="provider">🟢 OpenRouter<br><small>多种模型</small></div>
                <div class="provider">🟢 SiliconFlow<br><small>开源模型</small></div>
                <div class="provider">🟢 Cloudflare AI<br><small>llama-2-7b</small></div>
            </div>
        </div>

        <div class="endpoint">
            <h3>📝 使用示例</h3>
            <pre><code>curl -X POST "https://ai-gateway.aibook2099.workers.dev/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: aig_test_key_123" \\
  -d '{
    "provider": "cloudflare",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'</code></pre>
        </div>

        <div class="footer">
            <p>🚀 Powered by Cloudflare Workers | 📊 Built with TypeScript</p>
            <p>⚡ 全球边缘计算 | 🔒 安全可靠 | 💰 成本优化</p>
        </div>
    </div>

    <script>
        // 实时健康检查
        fetch('/health')
            .then(r => r.json())
            .then(data => {
                console.log('Health check:', data);
                document.querySelector('.status').innerHTML = '✅ 服务运行正常 - ' + new Date(data.timestamp).toLocaleString();
            })
            .catch(e => {
                document.querySelector('.status').innerHTML = '❌ 服务异常';
                document.querySelector('.status').className = 'status error';
            });
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  private handleFavicon(): Response {
    // 简单的SVG favicon
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#667eea"/>
      <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial">🤖</text>
    </svg>`;

    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }

  private async handleAdminAPI(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // 管理员认证检查
    const user = await this.auth.authenticate(request);
    if (!user || user.id !== 'test-user-1') { // 简单的管理员检查
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: this.getCORSHeaders()
      });
    }

    // API密钥管理
    if (pathname === '/admin/api-keys' && request.method === 'GET') {
      return this.handleGetApiKeys();
    }

    if (pathname === '/admin/api-keys' && request.method === 'POST') {
      return this.handleCreateApiKey(request);
    }

    if (pathname.match(/^\/admin\/api-keys\/[^\/]+$/) && request.method === 'DELETE') {
      const keyId = pathname.split('/').pop()!;
      return this.handleDeleteApiKey(keyId);
    }

    // 提供商管理
    if (pathname === '/admin/providers' && request.method === 'GET') {
      return this.handleGetProviders();
    }

    if (pathname.match(/^\/admin\/providers\/[^\/]+$/) && request.method === 'PATCH') {
      const providerId = pathname.split('/').pop()!;
      return this.handleUpdateProvider(providerId, request);
    }

    // 供应商测试
    if (pathname.match(/^\/admin\/providers\/[^\/]+\/test$/) && request.method === 'POST') {
      const providerId = pathname.split('/')[3];
      return this.handleTestProvider(providerId);
    }

    // 详细统计
    if (pathname === '/admin/stats' && request.method === 'GET') {
      return this.handleDetailedStats(request);
    }

    // 用户管理
    if (pathname === '/admin/users' && request.method === 'GET') {
      return this.handleGetUsers();
    }

    if (pathname === '/admin/users' && request.method === 'POST') {
      return this.handleCreateUser(request);
    }

    if (pathname.match(/^\/admin\/users\/[^\/]+$/) && request.method === 'PATCH') {
      const userId = pathname.split('/').pop()!;
      return this.handleUpdateUser(userId, request);
    }

    if (pathname.match(/^\/admin\/users\/[^\/]+$/) && request.method === 'DELETE') {
      const userId = pathname.split('/').pop()!;
      return this.handleDeleteUser(userId);
    }

    // 系统设置
    if (pathname === '/admin/settings' && request.method === 'GET') {
      return this.handleGetSettings();
    }

    if (pathname === '/admin/settings' && request.method === 'PUT') {
      return this.handleUpdateSettings(request);
    }

    return new Response('Admin API endpoint not found', { status: 404 });
  }

  private async handleGetApiKeys(): Promise<Response> {
    try {
      // 从KV存储获取所有API密钥
      const keysList = await this.env.KV_USERS.list({ prefix: 'apikey:' });
      const keys = [];

      for (const key of keysList.keys) {
        try {
          const keyData = await this.env.KV_USERS.get(key.name);
          if (keyData) {
            const apiKey = JSON.parse(keyData);

            // 获取用户信息
            const userData = await this.env.KV_USERS.get(`user:${apiKey.userId}`);
            const user = userData ? JSON.parse(userData) : null;

            // 获取使用统计
            const stats = await this.getUserStats(apiKey.userId);

            keys.push({
              ...apiKey,
              userName: user?.name || 'Unknown User',
              userEmail: user?.email || 'unknown@example.com',
              quotaLimit: user?.quotaLimit || 0,
              quotaUsed: stats.totalRequests || 0
            });
          }
        } catch (parseError) {
          console.error('Error parsing API key data:', parseError);
        }
      }

      return new Response(JSON.stringify(keys), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to get API keys:', error);
      return new Response(JSON.stringify({ error: 'Failed to get API keys' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleCreateApiKey(request: Request): Promise<Response> {
    try {
      const body = await request.json();

      // 验证必填字段
      if (!body.userId || !body.name) {
        return new Response(JSON.stringify({ error: 'User ID and name are required' }), {
          status: 400,
          headers: this.getCORSHeaders()
        });
      }

      // 验证用户是否存在
      const userData = await this.env.KV_USERS.get(`user:${body.userId}`);
      if (!userData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: this.getCORSHeaders()
        });
      }

      const user = JSON.parse(userData);

      // 创建新的API密钥
      const apiKey = await this.createApiKeyForUser(body.userId, body.name);

      // 获取完整的密钥信息
      const keyData = await this.env.KV_USERS.get(`apikey:${apiKey}`);
      const fullKeyData = JSON.parse(keyData!);

      const responseKey = {
        ...fullKeyData,
        userName: user.name,
        userEmail: user.email,
        quotaLimit: user.quotaLimit || 0,
        quotaUsed: 0
      };

      return new Response(JSON.stringify(responseKey), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to create API key:', error);
      return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleDeleteApiKey(keyId: string): Promise<Response> {
    try {
      // 检查API密钥是否存在
      const keyData = await this.env.KV_USERS.get(`apikey:${keyId}`);
      if (!keyData) {
        return new Response(JSON.stringify({ error: 'API key not found' }), {
          status: 404,
          headers: this.getCORSHeaders()
        });
      }

      // 删除API密钥
      await this.env.KV_USERS.delete(`apikey:${keyId}`);

      return new Response(JSON.stringify({ success: true, keyId }), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete API key' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleGetProviders(): Promise<Response> {
    try {
      const providers = await Promise.all(
        this.config.getAllProviders().map(async (id) => {
          const config = this.config.getProviderConfig(id);
          const hasApiKey = !!config.api_key || id === 'cloudflare';

          // 测试供应商连接状态
          let status = 'down';
          let latency = 0;

          if (hasApiKey) {
            try {
              const testStart = Date.now();
              // 对于Cloudflare AI，直接标记为健康
              if (id === 'cloudflare') {
                status = 'healthy';
                latency = 150;
              } else {
                // 对其他供应商进行简单的健康检查
                const testResponse = await this.testProviderHealth(id);
                status = testResponse.success ? 'healthy' : 'degraded';
                latency = Date.now() - testStart;
              }
            } catch (error) {
              status = 'down';
              latency = 0;
            }
          }

          return {
            id,
            name: config.name,
            status,
            enabled: hasApiKey,
            apiKeyConfigured: hasApiKey,
            models: config.models,
            costPerToken: config.cost_per_token,
            priority: config.priority,
            lastCheck: new Date().toISOString(),
            latency
          };
        })
      );

      return new Response(JSON.stringify(providers), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to get providers' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async testProviderHealth(providerId: string): Promise<{success: boolean}> {
    try {
      // 创建一个简单的测试请求
      const testRequest: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
        temperature: 0
      };

      const response = await this.callProvider(providerId as AIProvider, testRequest);
      return { success: response.success };
    } catch (error) {
      return { success: false };
    }
  }

  private async handleUpdateProvider(providerId: string, request: Request): Promise<Response> {
    try {
      const body = await request.json();
      // TODO: 实现提供商配置更新逻辑

      return new Response(JSON.stringify({ success: true }), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to update provider' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleTestProvider(providerId: string): Promise<Response> {
    try {
      const startTime = Date.now();
      let success = false;

      // 根据供应商ID进行实际测试
      switch (providerId) {
        case 'openai':
          success = await this.testOpenAI();
          break;
        case 'anthropic':
          success = await this.testAnthropic();
          break;
        case 'google':
          success = await this.testGoogle();
          break;
        case 'deepseek':
          success = await this.testDeepSeek();
          break;
        default:
          success = false;
      }

      const latency = Date.now() - startTime;

      return new Response(JSON.stringify({
        success,
        latency,
        timestamp: new Date().toISOString()
      }), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        latency: 0,
        error: 'Test failed'
      }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async testOpenAI(): Promise<boolean> {
    try {
      const apiKey = this.env.OPENAI_API_KEY;
      if (!apiKey) return false;

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async testAnthropic(): Promise<boolean> {
    try {
      const apiKey = this.env.ANTHROPIC_API_KEY;
      if (!apiKey) return false;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async testGoogle(): Promise<boolean> {
    try {
      const apiKey = this.env.GOOGLE_API_KEY;
      if (!apiKey) return false;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testDeepSeek(): Promise<boolean> {
    try {
      const apiKey = this.env.DEEPSEEK_API_KEY;
      if (!apiKey) return false;

      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async handleDetailedStats(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const range = url.searchParams.get('range') || '24h';

      // 从KV存储获取真实统计数据
      const stats = await this.getStatsFromKV(range);

      return new Response(JSON.stringify(stats), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to get detailed stats:', error);
      return new Response(JSON.stringify({ error: 'Failed to get detailed stats' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async getStatsFromKV(range: string) {
    const now = new Date();
    const hours = range === '24h' ? 24 : range === '7d' ? 168 : 24;

    // 获取时间范围内的统计数据
    const requests = [];
    let totalRequests = 0;
    let totalCost = 0;
    let totalLatency = 0;
    let activeUsers = new Set();

    // 按小时获取数据
    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = `stats:${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}-${String(time.getHours()).padStart(2, '0')}`;

      try {
        const hourStatsStr = await this.env.AI_GATEWAY_KV.get(hourKey);
        const hourStats = hourStatsStr ? JSON.parse(hourStatsStr) : { count: 0, cost: 0, latency: 0, users: [] };

        requests.push({
          time: `${String(time.getHours()).padStart(2, '0')}:00`,
          count: hourStats.count || 0,
          cost: hourStats.cost || 0,
          latency: hourStats.latency || 0
        });

        totalRequests += hourStats.count || 0;
        totalCost += hourStats.cost || 0;
        totalLatency += hourStats.latency || 0;

        if (hourStats.users) {
          hourStats.users.forEach((user: string) => activeUsers.add(user));
        }
      } catch (error) {
        // 如果没有数据，使用0值
        requests.push({
          time: `${String(time.getHours()).padStart(2, '0')}:00`,
          count: 0,
          cost: 0,
          latency: 0
        });
      }
    }

    return {
      requests: requests.slice(-6), // 只返回最近6个时间点用于图表显示
      summary: {
        totalRequests,
        totalCost: Math.round(totalCost * 100) / 100,
        avgLatency: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
        activeUsers: activeUsers.size,
        requestsChange: await this.calculateChange('requests', totalRequests, range),
        usersChange: await this.calculateChange('users', activeUsers.size, range),
        costChange: await this.calculateChange('cost', totalCost, range),
        latencyChange: await this.calculateChange('latency', totalRequests > 0 ? totalLatency / totalRequests : 0, range)
      }
    };
  }

  private async recordStats(userId: string, provider: string, latency: number, response: ProviderResponse): Promise<void> {
    try {
      const now = new Date();
      const hourKey = `stats:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;

      // 计算成本（简化版本，实际应该根据模型和token数量计算）
      const cost = this.calculateRequestCost(provider, response);

      // 获取当前小时的统计数据
      const currentStatsStr = await this.env.AI_GATEWAY_KV.get(hourKey);
      const currentStats = currentStatsStr ? JSON.parse(currentStatsStr) : {
        count: 0,
        cost: 0,
        latency: 0,
        users: []
      };

      // 更新统计数据
      currentStats.count += 1;
      currentStats.cost += cost;
      currentStats.latency += latency;

      // 添加用户到活跃用户列表（去重）
      if (!currentStats.users.includes(userId)) {
        currentStats.users.push(userId);
      }

      // 保存更新后的统计数据
      await this.env.AI_GATEWAY_KV.put(hourKey, JSON.stringify(currentStats), {
        expirationTtl: 30 * 24 * 60 * 60 // 30天过期
      });

      // 同时更新日汇总数据
      const dayKey = `stats:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-summary`;
      const dayStatsStr = await this.env.AI_GATEWAY_KV.get(dayKey);
      const dayStats = dayStatsStr ? JSON.parse(dayStatsStr) : {
        requests: 0,
        cost: 0,
        latency: 0,
        users: 0
      };

      dayStats.requests += 1;
      dayStats.cost += cost;
      dayStats.latency += latency;

      await this.env.AI_GATEWAY_KV.put(dayKey, JSON.stringify(dayStats), {
        expirationTtl: 90 * 24 * 60 * 60 // 90天过期
      });

    } catch (error) {
      console.error('Failed to record stats:', error);
      // 不抛出错误，避免影响主要功能
    }
  }

  private calculateRequestCost(provider: string, response: ProviderResponse): number {
    // 简化的成本计算，实际应该根据具体模型和token数量
    const baseCosts: Record<string, number> = {
      'openai': 0.002,
      'anthropic': 0.003,
      'google': 0.001,
      'cloudflare': 0.0005,
      'deepseek': 0.0001,
      'siliconflow': 0.0002,
      'grok': 0.001,
      'openrouter': 0.002
    };

    return baseCosts[provider] || 0.001;
  }

  private async calculateChange(metric: string, currentValue: number, range: string): Promise<string> {
    try {
      const now = new Date();
      const compareTime = range === '24h' ?
        new Date(now.getTime() - 24 * 60 * 60 * 1000) :
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const compareKey = `stats:${compareTime.getFullYear()}-${String(compareTime.getMonth() + 1).padStart(2, '0')}-${String(compareTime.getDate()).padStart(2, '0')}-summary`;
      const compareStatsStr = await this.env.AI_GATEWAY_KV.get(compareKey);

      if (!compareStatsStr) return '+0%';

      const compareStats = JSON.parse(compareStatsStr);
      const compareValue = compareStats[metric] || 0;

      if (compareValue === 0) return currentValue > 0 ? '+100%' : '+0%';

      const change = ((currentValue - compareValue) / compareValue) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${Math.round(change)}%`;
    } catch (error) {
      return '+0%';
    }
  }

  private async handleGetUsers(): Promise<Response> {
    try {
      // 从KV存储获取所有用户
      const usersList = await this.env.KV_USERS.list({ prefix: 'user:' });
      const users = [];

      for (const key of usersList.keys) {
        try {
          const userData = await this.env.KV_USERS.get(key.name);
          if (userData) {
            const user = JSON.parse(userData);
            // 计算用户的API密钥数量和使用统计
            const apiKeysCount = await this.getUserApiKeysCount(user.id);
            const stats = await this.getUserStats(user.id);

            users.push({
              ...user,
              apiKeysCount,
              totalRequests: stats.totalRequests,
              totalCost: stats.totalCost,
              lastActive: stats.lastActive
            });
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      // 如果没有用户，创建默认管理员用户
      if (users.length === 0) {
        const defaultAdmin = await this.createDefaultAdmin();
        users.push(defaultAdmin);
      }

      return new Response(JSON.stringify(users), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to get users:', error);
      return new Response(JSON.stringify({ error: 'Failed to get users' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleCreateUser(request: Request): Promise<Response> {
    try {
      const body = await request.json();

      // 验证必填字段
      if (!body.email || !body.name) {
        return new Response(JSON.stringify({ error: 'Email and name are required' }), {
          status: 400,
          headers: this.getCORSHeaders()
        });
      }

      // 检查邮箱是否已存在
      const existingUser = await this.findUserByEmail(body.email);
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
          status: 409,
          headers: this.getCORSHeaders()
        });
      }

      const userId = crypto.randomUUID();
      const newUser = {
        id: userId,
        email: body.email,
        name: body.name,
        role: body.role || 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        quotaLimit: body.quotaLimit || 100000,
        quotaUsed: 0
      };

      // 存储到KV
      await this.env.KV_USERS.put(`user:${userId}`, JSON.stringify(newUser));

      // 为新用户创建默认API密钥
      const apiKey = await this.createApiKeyForUser(userId, `${body.name}的默认密钥`);

      const responseUser = {
        ...newUser,
        apiKeysCount: 1,
        totalRequests: 0,
        totalCost: 0,
        lastActive: null
      };

      return new Response(JSON.stringify(responseUser), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleUpdateUser(userId: string, request: Request): Promise<Response> {
    try {
      const body = await request.json();

      // 获取现有用户数据
      const existingUserData = await this.env.KV_USERS.get(`user:${userId}`);
      if (!existingUserData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: this.getCORSHeaders()
        });
      }

      const existingUser = JSON.parse(existingUserData);

      // 如果更新邮箱，检查是否与其他用户冲突
      if (body.email && body.email !== existingUser.email) {
        const emailConflict = await this.findUserByEmail(body.email);
        if (emailConflict && emailConflict.id !== userId) {
          return new Response(JSON.stringify({ error: 'Email already in use by another user' }), {
            status: 409,
            headers: this.getCORSHeaders()
          });
        }
      }

      // 更新用户数据
      const updatedUser = {
        ...existingUser,
        ...body,
        id: userId, // 确保ID不被覆盖
        updatedAt: new Date().toISOString()
      };

      // 保存到KV
      await this.env.KV_USERS.put(`user:${userId}`, JSON.stringify(updatedUser));

      // 获取统计信息
      const apiKeysCount = await this.getUserApiKeysCount(userId);
      const stats = await this.getUserStats(userId);

      const responseUser = {
        ...updatedUser,
        apiKeysCount,
        totalRequests: stats.totalRequests,
        totalCost: stats.totalCost,
        lastActive: stats.lastActive
      };

      return new Response(JSON.stringify(responseUser), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      return new Response(JSON.stringify({ error: 'Failed to update user' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleDeleteUser(userId: string): Promise<Response> {
    try {
      // 检查用户是否存在
      const existingUserData = await this.env.KV_USERS.get(`user:${userId}`);
      if (!existingUserData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: this.getCORSHeaders()
        });
      }

      const user = JSON.parse(existingUserData);

      // 防止删除管理员用户
      if (user.role === 'admin') {
        return new Response(JSON.stringify({ error: 'Cannot delete admin user' }), {
          status: 403,
          headers: this.getCORSHeaders()
        });
      }

      // 删除用户的所有API密钥
      await this.deleteUserApiKeys(userId);

      // 删除用户数据
      await this.env.KV_USERS.delete(`user:${userId}`);

      return new Response(JSON.stringify({ success: true, userId }), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleGetSettings(): Promise<Response> {
    try {
      // 从KV存储获取系统设置
      const settingsData = await this.env.KV_CONFIG.get('system:settings');

      let settings;
      if (settingsData) {
        settings = JSON.parse(settingsData);
      } else {
        // 默认设置
        settings = {
          general: {
            systemName: 'AI Gateway',
            description: 'AI资源聚合层 - 统一多个AI提供商的API网关',
            defaultProvider: 'deepseek',
            enableLogging: true,
            enableAnalytics: true
          },
          security: {
            rateLimitPerMinute: 60,
            maxTokensPerRequest: 4096,
            enableCors: true,
            allowedOrigins: ['*'],
            requireApiKey: true
          },
          notifications: {
            enableEmailAlerts: false,
            alertEmail: '',
            quotaWarningThreshold: 80,
            errorRateThreshold: 5
          },
          performance: {
            enableCaching: false,
            cacheTimeout: 300,
            maxConcurrentRequests: 100,
            requestTimeout: 30
          }
        };

        // 保存默认设置
        await this.env.KV_CONFIG.put('system:settings', JSON.stringify(settings));
      }

      return new Response(JSON.stringify(settings), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to get settings' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  private async handleUpdateSettings(request: Request): Promise<Response> {
    try {
      const body = await request.json();

      // 获取现有设置
      const existingSettingsData = await this.env.KV_CONFIG.get('system:settings');
      const existingSettings = existingSettingsData ? JSON.parse(existingSettingsData) : {};

      // 合并设置
      const updatedSettings = {
        ...existingSettings,
        ...body,
        updatedAt: new Date().toISOString()
      };

      // 保存到KV存储
      await this.env.KV_CONFIG.put('system:settings', JSON.stringify(updatedSettings));

      return new Response(JSON.stringify({ success: true, settings: updatedSettings }), {
        headers: this.getCORSHeaders()
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
        status: 500,
        headers: this.getCORSHeaders()
      });
    }
  }

  // 辅助方法
  private async findUserByEmail(email: string): Promise<any | null> {
    const usersList = await this.env.KV_USERS.list({ prefix: 'user:' });

    for (const key of usersList.keys) {
      try {
        const userData = await this.env.KV_USERS.get(key.name);
        if (userData) {
          const user = JSON.parse(userData);
          if (user.email === email) {
            return user;
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return null;
  }

  private async getUserApiKeysCount(userId: string): Promise<number> {
    try {
      const keysList = await this.env.KV_USERS.list({ prefix: 'apikey:' });
      let count = 0;

      for (const key of keysList.keys) {
        try {
          const keyData = await this.env.KV_USERS.get(key.name);
          if (keyData) {
            const apiKey = JSON.parse(keyData);
            if (apiKey.userId === userId) {
              count++;
            }
          }
        } catch (error) {
          console.error('Error parsing API key data:', error);
        }
      }

      return count;
    } catch (error) {
      console.error('Error getting user API keys count:', error);
      return 0;
    }
  }

  private async getUserStats(userId: string): Promise<{totalRequests: number, totalCost: number, lastActive: string | null}> {
    try {
      const statsData = await this.env.KV_USERS.get(`stats:user:${userId}`);
      if (statsData) {
        return JSON.parse(statsData);
      }
    } catch (error) {
      console.error('Error getting user stats:', error);
    }

    return {
      totalRequests: 0,
      totalCost: 0,
      lastActive: null
    };
  }

  private async createDefaultAdmin(): Promise<any> {
    const adminId = crypto.randomUUID();
    const defaultAdmin = {
      id: adminId,
      email: 'admin@ai-gateway.local',
      name: '系统管理员',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      quotaLimit: 10000000,
      quotaUsed: 0
    };

    await this.env.KV_USERS.put(`user:${adminId}`, JSON.stringify(defaultAdmin));

    // 创建默认API密钥
    await this.createApiKeyForUser(adminId, '管理员默认密钥');

    return {
      ...defaultAdmin,
      apiKeysCount: 1,
      totalRequests: 0,
      totalCost: 0,
      lastActive: null
    };
  }

  private async createApiKeyForUser(userId: string, name: string): Promise<string> {
    const apiKey = this.generateApiKey();
    const keyData = {
      id: crypto.randomUUID(),
      name,
      key: apiKey,
      userId,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: true
    };

    await this.env.KV_USERS.put(`apikey:${apiKey}`, JSON.stringify(keyData));
    return apiKey;
  }

  private generateApiKey(): string {
    const prefix = 'aig_';
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomPart;
  }

  private async deleteUserApiKeys(userId: string): Promise<void> {
    try {
      const keysList = await this.env.KV_USERS.list({ prefix: 'apikey:' });

      for (const key of keysList.keys) {
        try {
          const keyData = await this.env.KV_USERS.get(key.name);
          if (keyData) {
            const apiKey = JSON.parse(keyData);
            if (apiKey.userId === userId) {
              await this.env.KV_USERS.delete(key.name);
            }
          }
        } catch (error) {
          console.error('Error deleting API key:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting user API keys:', error);
    }
  }
}
