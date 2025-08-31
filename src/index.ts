import { Router } from './router';
import { Environment } from './types';

export default {
  async fetch(request: Request, env: Environment, ctx: ExecutionContext): Promise<Response> {
    const router = new Router(env);
    return await router.handleRequest(request);
  },
};

// 导出类型供外部使用
export * from './types';
