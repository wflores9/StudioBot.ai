# StudioBot.ai Deployment Script for Windows
# This script builds and deploys the Docker containers

Write-Host "🚀 StudioBot.ai Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file - Please edit it with your credentials" -ForegroundColor Green
    Write-Host ""
    Read-Host "Press Enter after updating .env to continue"
}

# Generate random secrets if they're still default
Write-Host "🔐 Checking security secrets..." -ForegroundColor Cyan
$envContent = Get-Content ".env" -Raw

if ($envContent -match "CHANGE_THIS_TO_RANDOM_STRING") {
    Write-Host "⚠️  Generating secure JWT and Session secrets..." -ForegroundColor Yellow
    
    # Generate random secrets
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    
    # Replace in .env
    $envContent = $envContent -replace "JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS", "JWT_SECRET=$jwtSecret"
    $envContent = $envContent -replace "SESSION_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS", "SESSION_SECRET=$sessionSecret"
    
    Set-Content ".env" $envContent
    Write-Host "✓ Generated secure secrets" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Building Docker images..." -ForegroundColor Cyan
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 Stopping existing containers..." -ForegroundColor Cyan
docker-compose down

Write-Host ""
Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Containers started successfully" -ForegroundColor Green
Write-Host ""

# Wait for health check
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check container status
Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🧪 Testing API health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API is healthy: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API health check failed - container may still be starting" -ForegroundColor Yellow
    Write-Host "   Check logs with: docker logs studiobot-api" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  • API running at: http://localhost:3000" -ForegroundColor White
Write-Host "  • View logs: docker logs -f studiobot-api" -ForegroundColor White
Write-Host "  • Run tests: node test-api.js" -ForegroundColor White
Write-Host "  • Stop services: docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "🌐 For production deployment:" -ForegroundColor Cyan
Write-Host "  • Set up domain and SSL certificate" -ForegroundColor White
Write-Host "  • Configure Nginx reverse proxy (port 80/443)" -ForegroundColor White
Write-Host "  • Update ALLOWED_ORIGINS in .env" -ForegroundColor White
Write-Host "  • Enable nginx profile: docker-compose --profile nginx up -d" -ForegroundColor White
Write-Host ""
