-- AI Gateway 数据库架构

-- 请求日志表
CREATE TABLE IF NOT EXISTS request_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0,
    timestamp TEXT NOT NULL,
    success INTEGER DEFAULT 1,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户配额表
CREATE TABLE IF NOT EXISTS user_quotas (
    user_id TEXT PRIMARY KEY,
    quota_limit INTEGER DEFAULT 1000000,
    quota_used INTEGER DEFAULT 0,
    reset_date TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 提供商健康状态表
CREATE TABLE IF NOT EXISTS provider_health (
    provider TEXT PRIMARY KEY,
    status TEXT DEFAULT 'healthy',
    latency_ms INTEGER DEFAULT 0,
    error_rate REAL DEFAULT 0,
    last_check DATETIME DEFAULT CURRENT_TIMESTAMP,
    consecutive_failures INTEGER DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_request_logs_user_timestamp ON request_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_request_logs_provider ON request_logs(provider);
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);

-- 插入默认的提供商健康状态
INSERT OR IGNORE INTO provider_health (provider, status) VALUES 
('openai', 'healthy'),
('deepseek', 'healthy'),
('gemini', 'healthy'),
('openrouter', 'healthy'),
('siliconflow', 'healthy'),
('cloudflare', 'healthy');
