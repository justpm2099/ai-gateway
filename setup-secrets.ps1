# AI Gateway 密钥设置脚本
# 运行此脚本来设置所有必要的API密钥

Write-Host "🔐 设置 AI Gateway 密钥..." -ForegroundColor Green

# 提示用户输入API密钥
Write-Host "`n请输入各个AI提供商的API密钥（如果没有可以跳过）:" -ForegroundColor Yellow

# OpenAI
$openaiKey = Read-Host "OpenAI API Key (sk-...)"
if ($openaiKey) {
    npx wrangler secret put OPENAI_API_KEY --text="$openaiKey"
}

# DeepSeek
$deepseekKey = Read-Host "DeepSeek API Key (sk-...)"
if ($deepseekKey) {
    npx wrangler secret put DEEPSEEK_API_KEY --text="$deepseekKey"
}

# Gemini
$geminiKey = Read-Host "Gemini API Key"
if ($geminiKey) {
    npx wrangler secret put GEMINI_API_KEY --text="$geminiKey"
}

# OpenRouter
$openrouterKey = Read-Host "OpenRouter API Key (sk-or-...)"
if ($openrouterKey) {
    npx wrangler secret put OPENROUTER_API_KEY --text="$openrouterKey"
}

# SiliconFlow
$siliconflowKey = Read-Host "SiliconFlow API Key"
if ($siliconflowKey) {
    npx wrangler secret put SILICONFLOW_API_KEY --text="$siliconflowKey"
}

Write-Host "`n✅ 密钥设置完成！" -ForegroundColor Green
Write-Host "🚀 您的AI Gateway已部署到: https://ai-gateway.aibook2099.workers.dev" -ForegroundColor Cyan
Write-Host "🔑 测试API Key: aig_test_key_123" -ForegroundColor Yellow
