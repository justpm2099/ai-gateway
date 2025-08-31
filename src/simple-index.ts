// 简化版本用于测试部署
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
      });
    }

    // 健康检查
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 简单的聊天接口测试
    if (url.pathname === '/v1/chat/completions' && request.method === 'POST') {
      try {
        const body = await request.json();
        
        // 模拟响应
        const response = {
          id: `chatcmpl-${crypto.randomUUID()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: body.model || 'ai-gateway-test',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: `Hello! This is AI Gateway responding. You said: "${body.messages?.[body.messages.length - 1]?.content || 'nothing'}"`
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        };

        return new Response(JSON.stringify(response), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Invalid request body' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    return new Response('AI Gateway - Not Found', { status: 404 });
  },
};
