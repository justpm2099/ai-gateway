// AI供应商预置配置数据
export interface ProviderPreset {
  id: string;
  name: string;
  displayName: string;
  category: 'top-tier' | 'domestic' | 'open-source' | 'specialized' | 'emerging';
  region: 'global' | 'china' | 'us' | 'europe';
  description: string;
  logo?: string;
  apiBaseUrl: string;
  models: string[];
  defaultConfig: {
    timeout: number;
    retries: number;
    maxTokens: number;
    priority: number;
    costPerToken: number;
  };
  authType: 'bearer' | 'api-key' | 'custom';
  authHeader?: string;
  documentation?: string;
  features: string[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  // 顶级供应商
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    category: 'top-tier',
    region: 'global',
    description: 'GPT系列模型的原厂，提供最先进的大语言模型服务',
    apiBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4', 'dall-e-3', 'whisper-1'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 1,
      costPerToken: 0.00001
    },
    authType: 'bearer',
    documentation: 'https://platform.openai.com/docs',
    features: ['文本生成', '图像生成', '语音识别', '代码生成']
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    category: 'top-tier',
    region: 'global',
    description: 'Claude系列模型，以安全性和有用性著称的AI助手',
    apiBaseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 2,
      costPerToken: 0.000015
    },
    authType: 'api-key',
    authHeader: 'x-api-key',
    documentation: 'https://docs.anthropic.com',
    features: ['文本生成', '代码分析', '长文本处理', '安全对话']
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google Gemini',
    category: 'top-tier',
    region: 'global',
    description: 'Google的多模态AI模型，支持文本、图像和代码理解',
    apiBaseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 3,
      costPerToken: 0.000005
    },
    authType: 'api-key',
    documentation: 'https://ai.google.dev/docs',
    features: ['多模态理解', '代码生成', '图像分析', '长上下文']
  },
  {
    id: 'azure-openai',
    name: 'azure-openai',
    displayName: 'Azure OpenAI',
    category: 'top-tier',
    region: 'global',
    description: 'Microsoft Azure提供的企业级OpenAI服务',
    apiBaseUrl: 'https://{resource}.openai.azure.com/openai/deployments/{deployment}',
    models: ['gpt-4o', 'gpt-4', 'gpt-35-turbo', 'dall-e-3'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 4,
      costPerToken: 0.00001
    },
    authType: 'api-key',
    documentation: 'https://docs.microsoft.com/azure/cognitive-services/openai/',
    features: ['企业级安全', '数据隐私', '合规性', 'SLA保障']
  },
  {
    id: 'aws-bedrock',
    name: 'aws-bedrock',
    displayName: 'Amazon Bedrock',
    category: 'top-tier',
    region: 'global',
    description: 'AWS的托管AI模型服务，支持多种基础模型',
    apiBaseUrl: 'https://bedrock-runtime.{region}.amazonaws.com',
    models: ['anthropic.claude-3-sonnet', 'anthropic.claude-3-haiku', 'amazon.titan-text-express', 'meta.llama2-70b'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 5,
      costPerToken: 0.000008
    },
    authType: 'custom',
    documentation: 'https://docs.aws.amazon.com/bedrock/',
    features: ['多模型选择', 'AWS集成', '企业级', '数据安全']
  },

  // 国内主流供应商
  {
    id: 'baidu-wenxin',
    name: 'baidu-wenxin',
    displayName: '百度文心一言',
    category: 'domestic',
    region: 'china',
    description: '百度自研的大语言模型，深度理解中文语境',
    apiBaseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    models: ['ernie-4.0-8k', 'ernie-3.5-8k', 'ernie-bot-turbo', 'ernie-bot'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 6,
      costPerToken: 0.000003
    },
    authType: 'custom',
    documentation: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/',
    features: ['中文优化', '多模态', '知识增强', '本土化服务']
  },
  {
    id: 'alibaba-qwen',
    name: 'alibaba-qwen',
    displayName: '阿里通义千问',
    category: 'domestic',
    region: 'china',
    description: '阿里巴巴的大语言模型，具备强大的中文理解和生成能力',
    apiBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 7,
      costPerToken: 0.000002
    },
    authType: 'bearer',
    documentation: 'https://help.aliyun.com/zh/dashscope/',
    features: ['长文本处理', '多语言支持', '代码生成', '知识问答']
  },
  {
    id: 'tencent-hunyuan',
    name: 'tencent-hunyuan',
    displayName: '腾讯混元',
    category: 'domestic',
    region: 'china',
    description: '腾讯自研的大语言模型，具备多模态理解能力',
    apiBaseUrl: 'https://hunyuan.tencentcloudapi.com',
    models: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 8,
      costPerToken: 0.000003
    },
    authType: 'custom',
    documentation: 'https://cloud.tencent.com/document/product/1729',
    features: ['多模态理解', '中文优化', '实时对话', '内容创作']
  },
  {
    id: 'bytedance-doubao',
    name: 'bytedance-doubao',
    displayName: '字节豆包',
    category: 'domestic',
    region: 'china',
    description: '字节跳动的AI大模型，专注于创意内容生成',
    apiBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-lite-4k', 'doubao-pro-4k', 'doubao-pro-32k'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 9,
      costPerToken: 0.000002
    },
    authType: 'bearer',
    documentation: 'https://www.volcengine.com/docs/82379',
    features: ['创意写作', '多轮对话', '代码生成', '知识问答']
  },
  {
    id: 'zhipu-ai',
    name: 'zhipu-ai',
    displayName: '智谱AI',
    category: 'domestic',
    region: 'china',
    description: 'ChatGLM系列模型，清华技术背景的AI公司',
    apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-4v', 'glm-3-turbo', 'chatglm3-6b'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 10,
      costPerToken: 0.000005
    },
    authType: 'bearer',
    documentation: 'https://open.bigmodel.cn/dev/api',
    features: ['多模态', '代码理解', '数学推理', '知识问答']
  },
  {
    id: 'moonshot-ai',
    name: 'moonshot-ai',
    displayName: '月之暗面 Kimi',
    category: 'domestic',
    region: 'china',
    description: '专注于长文本理解的AI模型，支持超长上下文',
    apiBaseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 11,
      costPerToken: 0.000003
    },
    authType: 'bearer',
    documentation: 'https://platform.moonshot.cn/docs',
    features: ['超长上下文', '文档分析', '知识提取', '内容总结']
  },
  {
    id: 'deepseek',
    name: 'deepseek',
    displayName: 'DeepSeek',
    category: 'domestic',
    region: 'china',
    description: '深度求索的开源大模型，代码能力突出',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 12,
      costPerToken: 0.000001
    },
    authType: 'bearer',
    documentation: 'https://platform.deepseek.com/api-docs',
    features: ['代码生成', '数学推理', '开源模型', '高性价比']
  },
  {
    id: 'lingyiwanwu',
    name: 'lingyiwanwu',
    displayName: '零一万物',
    category: 'domestic',
    region: 'china',
    description: 'Yi系列模型，李开复创立的AI公司',
    apiBaseUrl: 'https://api.lingyiwanwu.com/v1',
    models: ['yi-34b-chat', 'yi-6b-chat', 'yi-large'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 13,
      costPerToken: 0.000004
    },
    authType: 'bearer',
    documentation: 'https://platform.lingyiwanwu.com/docs',
    features: ['多语言支持', '长文本', '代码理解', '推理能力']
  },

  // 开源/API聚合平台
  {
    id: 'openrouter',
    name: 'openrouter',
    displayName: 'OpenRouter',
    category: 'open-source',
    region: 'global',
    description: '多模型API聚合平台，一个接口访问多种AI模型',
    apiBaseUrl: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4o', 'anthropic/claude-3-sonnet', 'google/gemini-pro', 'meta-llama/llama-2-70b'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 14,
      costPerToken: 0.00002
    },
    authType: 'bearer',
    documentation: 'https://openrouter.ai/docs',
    features: ['多模型聚合', '统一接口', '成本优化', '模型比较']
  },
  {
    id: 'together-ai',
    name: 'together-ai',
    displayName: 'Together AI',
    category: 'open-source',
    region: 'global',
    description: '开源模型托管平台，提供高性能推理服务',
    apiBaseUrl: 'https://api.together.xyz/v1',
    models: ['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 15,
      costPerToken: 0.0000008
    },
    authType: 'bearer',
    documentation: 'https://docs.together.ai',
    features: ['开源模型', '高性能推理', '自定义微调', '成本效益']
  },
  {
    id: 'replicate',
    name: 'replicate',
    displayName: 'Replicate',
    category: 'open-source',
    region: 'global',
    description: '机器学习模型API平台，支持各种开源模型',
    apiBaseUrl: 'https://api.replicate.com/v1',
    models: ['meta/llama-2-70b-chat', 'mistralai/mixtral-8x7b-instruct-v0.1', 'stability-ai/stable-diffusion-xl'],
    defaultConfig: {
      timeout: 60000,
      retries: 3,
      maxTokens: 4096,
      priority: 16,
      costPerToken: 0.000001
    },
    authType: 'bearer',
    documentation: 'https://replicate.com/docs',
    features: ['开源模型', '图像生成', '视频处理', '音频生成']
  },
  {
    id: 'huggingface',
    name: 'huggingface',
    displayName: 'Hugging Face',
    category: 'open-source',
    region: 'global',
    description: '最大的开源AI模型社区和推理平台',
    apiBaseUrl: 'https://api-inference.huggingface.co/models',
    models: ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill', 'google/flan-t5-large'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 17,
      costPerToken: 0.0000005
    },
    authType: 'bearer',
    documentation: 'https://huggingface.co/docs/api-inference',
    features: ['开源社区', '模型微调', '免费使用', '研究友好']
  },
  {
    id: 'groq',
    name: 'groq',
    displayName: 'Groq',
    category: 'open-source',
    region: 'global',
    description: '超高速AI推理平台，专注于推理性能优化',
    apiBaseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    defaultConfig: {
      timeout: 15000,
      retries: 3,
      maxTokens: 4096,
      priority: 18,
      costPerToken: 0.0000007
    },
    authType: 'bearer',
    documentation: 'https://console.groq.com/docs',
    features: ['超高速推理', '低延迟', '开源模型', '高吞吐量']
  },
  {
    id: 'perplexity',
    name: 'perplexity',
    displayName: 'Perplexity',
    category: 'open-source',
    region: 'global',
    description: '搜索增强的AI模型，提供实时信息检索能力',
    apiBaseUrl: 'https://api.perplexity.ai',
    models: ['llama-3-sonar-small-32k-online', 'llama-3-sonar-large-32k-online', 'llama-3-8b-instruct', 'llama-3-70b-instruct'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 19,
      costPerToken: 0.000001
    },
    authType: 'bearer',
    documentation: 'https://docs.perplexity.ai',
    features: ['实时搜索', '信息检索', '事实核查', '引用来源']
  },
  {
    id: 'cohere',
    name: 'cohere',
    displayName: 'Cohere',
    category: 'open-source',
    region: 'global',
    description: '企业级NLP API，专注于文本理解和生成',
    apiBaseUrl: 'https://api.cohere.ai/v1',
    models: ['command-r-plus', 'command-r', 'command', 'command-light'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 20,
      costPerToken: 0.000015
    },
    authType: 'bearer',
    documentation: 'https://docs.cohere.com',
    features: ['企业级NLP', '文本分类', '语义搜索', '内容生成']
  },

  // 专业/垂直领域
  {
    id: 'stability-ai',
    name: 'stability-ai',
    displayName: 'Stability AI',
    category: 'specialized',
    region: 'global',
    description: '专业的图像生成AI，Stable Diffusion的开发者',
    apiBaseUrl: 'https://api.stability.ai/v1',
    models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6', 'stable-diffusion-512-v2-1'],
    defaultConfig: {
      timeout: 60000,
      retries: 3,
      maxTokens: 4096,
      priority: 21,
      costPerToken: 0.00002
    },
    authType: 'bearer',
    documentation: 'https://platform.stability.ai/docs',
    features: ['图像生成', '艺术创作', '风格转换', '高分辨率']
  },
  {
    id: 'midjourney',
    name: 'midjourney',
    displayName: 'Midjourney',
    category: 'specialized',
    region: 'global',
    description: '顶级的AI图像生成服务，以艺术质量著称',
    apiBaseUrl: 'https://api.midjourney.com/v1',
    models: ['midjourney-v6', 'midjourney-v5.2', 'niji-6'],
    defaultConfig: {
      timeout: 120000,
      retries: 2,
      maxTokens: 4096,
      priority: 22,
      costPerToken: 0.00003
    },
    authType: 'bearer',
    documentation: 'https://docs.midjourney.com',
    features: ['艺术级图像', '风格多样', '高质量输出', '创意设计']
  },
  {
    id: 'runwayml',
    name: 'runwayml',
    displayName: 'RunwayML',
    category: 'specialized',
    region: 'global',
    description: '专业的AI视频生成和编辑平台',
    apiBaseUrl: 'https://api.runwayml.com/v1',
    models: ['gen-2', 'gen-1', 'inpainting', 'background-removal'],
    defaultConfig: {
      timeout: 180000,
      retries: 2,
      maxTokens: 4096,
      priority: 23,
      costPerToken: 0.00005
    },
    authType: 'bearer',
    documentation: 'https://docs.runwayml.com',
    features: ['视频生成', '视频编辑', '特效制作', '创意工具']
  },
  {
    id: 'elevenlabs',
    name: 'elevenlabs',
    displayName: 'ElevenLabs',
    category: 'specialized',
    region: 'global',
    description: '顶级的AI语音合成和克隆服务',
    apiBaseUrl: 'https://api.elevenlabs.io/v1',
    models: ['eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_monolingual_v1'],
    defaultConfig: {
      timeout: 60000,
      retries: 3,
      maxTokens: 4096,
      priority: 24,
      costPerToken: 0.00003
    },
    authType: 'api-key',
    authHeader: 'xi-api-key',
    documentation: 'https://docs.elevenlabs.io',
    features: ['语音合成', '声音克隆', '多语言支持', '情感表达']
  },
  {
    id: 'assemblyai',
    name: 'assemblyai',
    displayName: 'AssemblyAI',
    category: 'specialized',
    region: 'global',
    description: '专业的语音识别和音频智能分析服务',
    apiBaseUrl: 'https://api.assemblyai.com/v2',
    models: ['best', 'nano'],
    defaultConfig: {
      timeout: 60000,
      retries: 3,
      maxTokens: 4096,
      priority: 25,
      costPerToken: 0.000012
    },
    authType: 'bearer',
    documentation: 'https://www.assemblyai.com/docs',
    features: ['语音识别', '音频分析', '实时转录', '情感分析']
  },

  // 新兴供应商
  {
    id: 'xai-grok',
    name: 'xai-grok',
    displayName: 'xAI (Grok)',
    category: 'emerging',
    region: 'global',
    description: '马斯克创立的AI公司，Grok模型具有独特的幽默风格',
    apiBaseUrl: 'https://api.x.ai/v1',
    models: ['grok-beta', 'grok-vision-beta'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 26,
      costPerToken: 0.000005
    },
    authType: 'bearer',
    documentation: 'https://docs.x.ai',
    features: ['幽默对话', '实时信息', '多模态', '创新思维']
  },
  {
    id: 'mistral-ai',
    name: 'mistral-ai',
    displayName: 'Mistral AI',
    category: 'emerging',
    region: 'europe',
    description: '欧洲的开源AI公司，专注于高效的语言模型',
    apiBaseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mixtral-8x7b'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 27,
      costPerToken: 0.000008
    },
    authType: 'bearer',
    documentation: 'https://docs.mistral.ai',
    features: ['欧洲AI', '开源模型', '高效推理', '多语言']
  },
  {
    id: 'siliconflow',
    name: 'siliconflow',
    displayName: 'SiliconFlow',
    category: 'emerging',
    region: 'china',
    description: '国内AI推理平台，提供多种开源模型的高速推理',
    apiBaseUrl: 'https://api.siliconflow.cn/v1',
    models: ['deepseek-ai/deepseek-chat', 'Qwen/Qwen2-7B-Instruct', 'meta-llama/Meta-Llama-3-8B-Instruct'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 28,
      costPerToken: 0.000001
    },
    authType: 'bearer',
    documentation: 'https://docs.siliconflow.cn',
    features: ['高速推理', '开源模型', '国内服务', '成本优化']
  },
  {
    id: 'cloudflare-ai',
    name: 'cloudflare-ai',
    displayName: 'Cloudflare Workers AI',
    category: 'emerging',
    region: 'global',
    description: 'Cloudflare的边缘计算AI服务，全球分布式推理',
    apiBaseUrl: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run',
    models: ['@cf/meta/llama-2-7b-chat-fp16', '@cf/mistral/mistral-7b-instruct-v0.1', '@cf/microsoft/DialoGPT-medium'],
    defaultConfig: {
      timeout: 30000,
      retries: 3,
      maxTokens: 4096,
      priority: 29,
      costPerToken: 0.000000
    },
    authType: 'bearer',
    documentation: 'https://developers.cloudflare.com/workers-ai/',
    features: ['边缘计算', '全球分布', '低延迟', '免费额度']
  }
];

// 按分类分组
export const PROVIDER_CATEGORIES = {
  'top-tier': {
    name: '顶级供应商',
    description: '全球领先的AI模型提供商',
    icon: '🏆'
  },
  'domestic': {
    name: '国内供应商',
    description: '中国本土的AI模型服务商',
    icon: '🇨🇳'
  },
  'open-source': {
    name: '开源平台',
    description: '开源模型和API聚合平台',
    icon: '🔓'
  },
  'specialized': {
    name: '专业领域',
    description: '专注特定领域的AI服务',
    icon: '🎯'
  },
  'emerging': {
    name: '新兴供应商',
    description: '新兴的AI模型提供商',
    icon: '🚀'
  }
};

// 根据分类获取供应商
export const getProvidersByCategory = (category: string) => {
  return PROVIDER_PRESETS.filter(provider => provider.category === category);
};

// 根据ID获取供应商预置配置
export const getProviderPreset = (id: string) => {
  return PROVIDER_PRESETS.find(provider => provider.id === id);
};
