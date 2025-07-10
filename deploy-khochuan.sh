#!/bin/bash

# KhoChuan POS - Deployment Script for Cloudflare Pages and Workers

echo "🚀 Deploying KhoChuan POS System to Cloudflare..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Installing..."
    npm install -g wrangler
else
    WRANGLER_VERSION=$(wrangler --version)
    echo "✅ Wrangler CLI detected: $WRANGLER_VERSION"
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Please login to Cloudflare first: wrangler auth login"
    exit 1
else
    echo "✅ Logged in to Cloudflare"
fi

# Build frontend first
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Deploy frontend to Cloudflare Pages
echo "🚀 Deploying frontend to Cloudflare Pages..."
wrangler pages deploy dist --project-name=khochuan-pos

if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment failed!"
    exit 1
fi

echo "✅ Frontend deployed successfully!"

# Build and deploy backend
echo "🔨 Building and deploying backend..."
cd ../backend

# Create D1 database if it doesn't exist
echo "🗄️ Setting up D1 database..."
DB_EXISTS=false

if wrangler d1 list | grep -q "khochuan-pos-db"; then
    DB_EXISTS=true
    echo "✅ Database already exists"
else
    echo "Creating new database..."
fi

if [ "$DB_EXISTS" = false ]; then
    echo "Creating D1 database..."
    wrangler d1 create khochuan-pos-db
    
    if [ $? -ne 0 ]; then
        echo "❌ Database creation failed!"
        exit 1
    fi
    
    echo "✅ Database created successfully!"
    echo "⚠️ Please update the database_id in wrangler.toml with the ID from above"
    echo "Then run this script again"
    exit 0
fi

# Apply database migrations
echo "🗄️ Applying database migrations..."
wrangler d1 execute khochuan-pos-db --file=./database/schema.sql

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    exit 1
fi

echo "✅ Database schema applied successfully!"

# Seed database with initial data
echo "🌱 Seeding database with initial data..."
wrangler d1 execute khochuan-pos-db --file=./database/seed.sql

if [ $? -ne 0 ]; then
    echo "❌ Database seeding failed!"
    exit 1
fi

echo "✅ Database seeded successfully!"

# Create KV namespace if it doesn't exist
echo "🔑 Setting up KV namespace for caching..."
KV_EXISTS=false

if wrangler kv:namespace list | grep -q "khochuan-pos-cache"; then
    KV_EXISTS=true
    echo "✅ KV namespace already exists"
else
    echo "Creating new KV namespace..."
fi

if [ "$KV_EXISTS" = false ]; then
    echo "Creating KV namespace..."
    wrangler kv:namespace create "khochuan-pos-cache"
    wrangler kv:namespace create "khochuan-pos-cache" --preview
    
    if [ $? -ne 0 ]; then
        echo "❌ KV namespace creation failed!"
        exit 1
    fi
    
    echo "✅ KV namespace created successfully!"
    echo "⚠️ Please update the id and preview_id in wrangler.toml with the IDs from above"
    echo "Then run this script again"
    exit 0
fi

# Create R2 bucket if it doesn't exist
echo "📦 Setting up R2 bucket for storage..."
R2_EXISTS=false

if wrangler r2 bucket list | grep -q "khochuan-pos-storage"; then
    R2_EXISTS=true
    echo "✅ R2 bucket already exists"
else
    echo "Creating new R2 bucket..."
fi

if [ "$R2_EXISTS" = false ]; then
    echo "Creating R2 bucket..."
    wrangler r2 bucket create khochuan-pos-storage
    
    if [ $? -ne 0 ]; then
        echo "❌ R2 bucket creation failed!"
        exit 1
    fi
    
    echo "✅ R2 bucket created successfully!"
fi

# Deploy backend to Cloudflare Workers
echo "🚀 Deploying backend to Cloudflare Workers..."
wrangler deploy

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed!"
    exit 1
fi

echo "✅ Backend deployed successfully!"

# Return to root directory
cd ..

# Display deployment information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 KhoChuan POS System deployed successfully!"
echo "📱 Frontend: https://khochuan-pos.pages.dev"
echo "⚙️ Backend API: https://khochuan-pos-api.bangachieu2.workers.dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test accounts:"
echo "👑 Admin: admin@khochuan.com / admin123"
echo "💰 Cashier: cashier@khochuan.com / cashier123"
echo "👨‍💼 Staff: staff@khochuan.com / staff123"
echo "👤 Customer: customer@khochuan.com / customer123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 