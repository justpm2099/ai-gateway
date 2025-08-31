# AI Gateway API 测试脚本

$baseUrl = "https://ai-gateway.aibook2099.workers.dev"
$apiKey = "aig_test_key_123"

Write-Host "🧪 测试 AI Gateway API..." -ForegroundColor Green

# 测试健康检查
Write-Host "`n1. 健康检查..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "✅ 健康检查通过: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ 健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试无认证请求（应该失败）
Write-Host "`n2. 测试无认证请求..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/chat/completions" -Method POST -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"Hello"}]}'
    Write-Host "❌ 无认证请求应该失败但成功了" -ForegroundColor Red
} catch {
    Write-Host "✅ 无认证请求正确被拒绝" -ForegroundColor Green
}

# 测试带认证的Cloudflare AI请求
Write-Host "`n3. 测试 Cloudflare AI..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/chat/completions" -Method POST -ContentType "application/json" -Headers @{"x-api-key"="$apiKey"} -Body '{"provider":"cloudflare","messages":[{"role":"user","content":"Hello from AI Gateway!"}]}'
    Write-Host "✅ Cloudflare AI 响应成功" -ForegroundColor Green
    Write-Host "   模型: $($response.model)" -ForegroundColor Cyan
    Write-Host "   Token使用: $($response.usage.total_tokens)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Cloudflare AI 请求失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试使用统计
Write-Host "`n4. 测试使用统计..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/stats" -Headers @{"x-api-key"="$apiKey"}
    Write-Host "✅ 使用统计获取成功" -ForegroundColor Green
    if ($stats -and $stats.Count -gt 0) {
        Write-Host "   统计数据: $($stats.Count) 条记录" -ForegroundColor Cyan
    } else {
        Write-Host "   暂无使用记录" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ 使用统计获取失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 测试完成！" -ForegroundColor Green
