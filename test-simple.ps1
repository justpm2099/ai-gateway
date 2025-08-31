$baseUrl = "https://ai-gateway.aibook2099.workers.dev"
$apiKey = "aig_test_key_123"

Write-Host "Testing AI Gateway API..." -ForegroundColor Green

# Test health check
Write-Host "`nTesting health check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/health"
Write-Host "Health status: $($health.status)" -ForegroundColor Green

# Test authenticated API call
Write-Host "`nTesting authenticated API call..." -ForegroundColor Yellow
$headers = @{"x-api-key" = $apiKey}
$body = @{
    provider = "cloudflare"
    messages = @(
        @{
            role = "user"
            content = "Hello from AI Gateway!"
        }
    )
} | ConvertTo-Json -Depth 3

$response = Invoke-RestMethod -Uri "$baseUrl/v1/chat/completions" -Method POST -ContentType "application/json" -Headers $headers -Body $body
Write-Host "Response received successfully!" -ForegroundColor Green
Write-Host "Model: $($response.model)" -ForegroundColor Cyan
Write-Host "Tokens used: $($response.usage.total_tokens)" -ForegroundColor Cyan

Write-Host "`nAI Gateway is working correctly!" -ForegroundColor Green
