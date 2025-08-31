# 🚀 AI Gateway 快速启动指南

## 📱 立即体验

### 🎛️ 管理界面
访问: **https://7014c78b.ai-gateway-admin.pages.dev**
- 查看AI供应商状态
- 管理API密钥
- 监控使用统计
- 配置系统设置

### 🤖 API调用
**基础URL**: https://ai-gateway.aibook2099.workers.dev

## 🔑 测试密钥

**API Key**: `aig_test_key_123`
- 配额: 1,000,000 tokens
- 权限: 管理员级别
- 状态: 活跃

## 💻 API使用示例

### 基础聊天请求
```bash
curl -X POST "https://ai-gateway.aibook2099.workers.dev/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: aig_test_key_123" \
  -d '{
    "provider": "cloudflare",
    "messages": [
      {"role": "user", "content": "Hello, AI Gateway!"}
    ],
    "max_tokens": 1024,
    "temperature": 0.7
  }'
```

### PowerShell示例
```powershell
$headers = @{"x-api-key" = "aig_test_key_123"}
$body = @{
    provider = "cloudflare"
    messages = @(@{role = "user"; content = "Hello AI Gateway!"})
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://ai-gateway.aibook2099.workers.dev/v1/chat/completions" -Method POST -ContentType "application/json" -Headers $headers -Body $body
```

### JavaScript/Node.js示例
```javascript
const response = await fetch('https://ai-gateway.aibook2099.workers.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'aig_test_key_123'
  },
  body: JSON.stringify({
    provider: 'cloudflare',
    messages: [
      { role: 'user', content: 'Hello AI Gateway!' }
    ],
    max_tokens: 1024,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Python示例
```python
import requests

url = "https://ai-gateway.aibook2099.workers.dev/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "aig_test_key_123"
}
data = {
    "provider": "cloudflare",
    "messages": [
        {"role": "user", "content": "Hello AI Gateway!"}
    ],
    "max_tokens": 1024,
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

## 🔧 管理功能

### 查看使用统计
```bash
curl -X GET "https://ai-gateway.aibook2099.workers.dev/stats" \
  -H "x-api-key: aig_test_key_123"
```

### 健康检查
```bash
curl -X GET "https://ai-gateway.aibook2099.workers.dev/health"
```

### 获取供应商状态
```bash
curl -X GET "https://ai-gateway.aibook2099.workers.dev/admin/providers" \
  -H "x-api-key: aig_test_key_123"
```

## 🎯 支持的AI供应商

| 供应商 | 状态 | 模型示例 | 特点 |
|--------|------|----------|------|
| **Cloudflare AI** | 🟢 可用 | llama-2-7b-chat | 免费，边缘计算 |
| **OpenAI** | 🔴 需配置 | gpt-4o, gpt-4o-mini | 高质量，广泛支持 |
| **DeepSeek** | 🔴 需配置 | deepseek-chat | 高性价比，中文友好 |
| **Gemini** | 🔴 需配置 | gemini-pro | 多模态支持 |
| **OpenRouter** | 🔴 需配置 | 多种模型 | 模型聚合平台 |
| **SiliconFlow** | 🔴 需配置 | 开源模型 | 成本优化 |

## ⚙️ 配置AI供应商

1. 访问管理界面: https://7014c78b.ai-gateway-admin.pages.dev
2. 点击"AI供应商"标签
3. 为每个供应商点击"配置"按钮
4. 输入相应的API密钥
5. 保存配置

## 📊 监控和分析

### 实时监控
- 请求数量和频率
- 响应时间和延迟
- 成本和token使用
- 错误率和可用性

### 历史分析
- 按时间段的使用趋势
- 按供应商的性能对比
- 按用户的使用统计
- 成本优化建议

## 🆘 故障排除

### 常见问题
1. **API调用失败** - 检查API密钥是否正确
2. **供应商不可用** - 查看管理界面中的供应商状态
3. **配额超限** - 检查用户配额使用情况
4. **响应缓慢** - 查看各供应商的延迟状态

### 联系支持
- 查看项目文档: `README.md`
- 检查部署状态: `DEPLOYMENT.md`
- 查看进度报告: `PROJECT-PROGRESS.md`

## 🎉 开始使用

1. **立即测试**: 使用上面的API示例进行测试
2. **配置供应商**: 在管理界面中添加您的API密钥
3. **创建用户**: 为您的项目生成专用API密钥
4. **监控使用**: 通过管理界面查看使用情况

您的AI Gateway现在已经完全可以投入使用了！🚀
