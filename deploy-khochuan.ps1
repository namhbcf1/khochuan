# KhoChuan POS - Deployment Script for Cloudflare Pages and Workers (PowerShell version)

Write-Host "🚀 Deploying KhoChuan POS System to Cloudflare..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check if Wrangler is installed
try {
    $wranglerVersion = wrangler --version
    Write-Host "✅ Wrangler CLI detected: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI is not installed. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

# Check if user is logged in to Cloudflare
try {
    $wranglerAuth = wrangler whoami
    if (-not $wranglerAuth) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in to Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Cloudflare first: wrangler auth login" -ForegroundColor Red
    exit 1
}

# Build frontend first
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Deploy frontend to Cloudflare Pages
Write-Host "🚀 Deploying frontend to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy dist --project-name=khochuan-pos

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green

# Build and deploy backend
Write-Host "🔨 Building and deploying backend..." -ForegroundColor Yellow
Set-Location ../backend

# Create D1 database if it doesn't exist
Write-Host "🗄️ Setting up D1 database..." -ForegroundColor Yellow
$dbExists = $false

try {
    $dbList = wrangler d1 list
    if ($dbList -match "khochuan-pos-db") {
        $dbExists = $true
        Write-Host "✅ Database already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating new database..." -ForegroundColor Yellow
}

if (-not $dbExists) {
    Write-Host "Creating D1 database..." -ForegroundColor Yellow
    wrangler d1 create khochuan-pos-db
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database creation failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
    Write-Host "⚠️ Please update the database_id in wrangler.toml with the ID from above" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 0
}

# Apply database migrations
Write-Host "🗄️ Applying database migrations..." -ForegroundColor Yellow
wrangler d1 execute khochuan-pos-db --file=./database/schema.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema applied successfully!" -ForegroundColor Green

# Seed database with initial data
Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Yellow
wrangler d1 execute khochuan-pos-db --file=./database/seed.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database seeding failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database seeded successfully!" -ForegroundColor Green

# Create KV namespace if it doesn't exist
Write-Host "🔑 Setting up KV namespace for caching..." -ForegroundColor Yellow
$kvExists = $false

try {
    $kvList = wrangler kv:namespace list
    if ($kvList -match "khochuan-pos-cache") {
        $kvExists = $true
        Write-Host "✅ KV namespace already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating new KV namespace..." -ForegroundColor Yellow
}

if (-not $kvExists) {
    Write-Host "Creating KV namespace..." -ForegroundColor Yellow
    wrangler kv:namespace create "khochuan-pos-cache"
    wrangler kv:namespace create "khochuan-pos-cache" --preview
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ KV namespace creation failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ KV namespace created successfully!" -ForegroundColor Green
    Write-Host "⚠️ Please update the id and preview_id in wrangler.toml with the IDs from above" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 0
}

# Create R2 bucket if it doesn't exist
Write-Host "📦 Setting up R2 bucket for storage..." -ForegroundColor Yellow
$r2Exists = $false

try {
    $r2List = wrangler r2 bucket list
    if ($r2List -match "khochuan-pos-storage") {
        $r2Exists = $true
        Write-Host "✅ R2 bucket already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating new R2 bucket..." -ForegroundColor Yellow
}

if (-not $r2Exists) {
    Write-Host "Creating R2 bucket..." -ForegroundColor Yellow
    wrangler r2 bucket create khochuan-pos-storage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ R2 bucket creation failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ R2 bucket created successfully!" -ForegroundColor Green
}

# Deploy backend to Cloudflare Workers
Write-Host "🚀 Deploying backend to Cloudflare Workers..." -ForegroundColor Yellow
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green

# Return to root directory
Set-Location ..

# Display deployment information
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 KhoChuan POS System deployed successfully!" -ForegroundColor Green
Write-Host "📱 Frontend: https://khochuan-pos.pages.dev" -ForegroundColor Cyan
Write-Host "⚙️ Backend API: https://khochuan-pos-api.bangachieu2.workers.dev" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Test accounts:" -ForegroundColor Yellow
Write-Host "Admin: admin@khochuan.com / admin123" -ForegroundColor White
Write-Host "Cashier: cashier@khochuan.com / cashier123" -ForegroundColor White
Write-Host "Staff: staff@khochuan.com / staff123" -ForegroundColor White
Write-Host "Customer: customer@khochuan.com / customer123" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan 