// API客户端库，用于与AI Gateway后端通信

const API_BASE_URL = 'https://ai-gateway.aibook2099.workers.dev';

export class ApiClient {
  private adminApiKey: string;

  constructor(adminApiKey: string = 'aig_test_key_123') {
    this.adminApiKey = adminApiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.adminApiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 健康检查
  async getHealth() {
    return this.request('/health');
  }

  // 获取使用统计
  async getStats() {
    return this.request('/stats');
  }

  // 获取所有API密钥（管理员功能）
  async getApiKeys() {
    return this.request('/admin/api-keys');
  }

  // 创建新的API密钥
  async createApiKey(data: {
    name: string;
    userId: string;
    quotaLimit: number;
  }) {
    return this.request('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 删除API密钥
  async deleteApiKey(keyId: string) {
    return this.request(`/admin/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // 更新API密钥
  async updateApiKey(keyId: string, data: Partial<{
    name: string;
    quotaLimit: number;
    isActive: boolean;
  }>) {
    return this.request(`/admin/api-keys/${keyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 获取提供商状态
  async getProviderStatus() {
    return this.request('/admin/providers');
  }

  // 更新提供商配置
  async updateProviderConfig(providerId: string, config: {
    enabled?: boolean;
    priority?: number;
    apiKey?: string;
  }) {
    return this.request(`/admin/providers/${providerId}`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }

  // 测试提供商连接
  async testProvider(providerId: string) {
    return this.request(`/admin/providers/${providerId}/test`, {
      method: 'POST',
    });
  }

  // 获取详细使用统计
  async getDetailedStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
    return this.request(`/admin/stats?range=${timeRange}`);
  }
}

export const apiClient = new ApiClient();
