# KhoChuan POS - Deployment PowerShell Script

Write-Host "🚀 Deploying KhoChuan POS to Cloudflare..." -ForegroundColor Cyan

# Step 1: Install dependencies and build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location -Path frontend
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Step 2: Deploy to Cloudflare Pages
Write-Host "☁️ Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages publish dist --project-name="khochuan-pos"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloudflare Pages deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend deployed to Cloudflare Pages!" -ForegroundColor Green

# Step 3: Deploy the backend to Cloudflare Workers
Write-Host "📡 Deploying backend to Cloudflare Workers..." -ForegroundColor Yellow
Set-Location -Path ../backend
npm install
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend deployed to Cloudflare Workers!" -ForegroundColor Green

# Step 4: Show deployment information
Set-Location -Path ..
Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 Frontend: https://khochuan-pos.pages.dev" -ForegroundColor Cyan
Write-Host "📡 Backend API: https://api.khochuan-pos.pages.dev" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n🔧 Next steps:" -ForegroundColor Yellow
Write-Host "1. Login with admin@khochuan.com / admin123" -ForegroundColor Yellow
Write-Host "2. Complete initial setup" -ForegroundColor Yellow
Write-Host "3. Start using KhoChuan POS!" -ForegroundColor Yellow 