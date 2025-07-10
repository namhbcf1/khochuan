@echo off
REM KhoChuan POS - Deployment Script for Cloudflare Pages

echo 🚀 Deploying KhoChuan POS System to Cloudflare Pages...

REM Check if Wrangler is installed
WHERE wrangler >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Wrangler CLI is not installed. Installing...
    call npm install -g wrangler
)

REM Check if user is logged in to Cloudflare
wrangler whoami >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Please login to Cloudflare first: wrangler auth login
    exit /b 1
)

REM Deploy backend first
echo 📡 Deploying backend (Cloudflare Workers)...
cd backend
call npm install
call npm run deploy

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend deployment failed!
    exit /b 1
) ELSE (
    echo ✅ Backend deployed successfully!
)

REM Deploy frontend
echo 🎨 Deploying frontend (Cloudflare Pages)...
cd ../frontend
call npm install
call npm run build

REM Deploy to Cloudflare Pages using direct API
echo 📤 Publishing to Cloudflare Pages...
call wrangler pages publish dist --project-name="khochuan-pos"

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend deployment failed!
    exit /b 1
) ELSE (
    echo ✅ Frontend deployed successfully!
)

cd ..

echo.
echo 🎉 Deployment Complete!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📱 Frontend: https://khochuan-pos.pages.dev
echo 📡 Backend API: https://api.khochuan-pos.pages.dev
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔧 Next steps:
echo 1. Log in to the admin panel with default credentials (admin@khochuan.com / admin123)
echo 2. Complete the initial setup wizard
echo 3. Start using KhoChuan POS system
echo. 