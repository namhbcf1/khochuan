#!/bin/bash
set -e

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                   ║${NC}"
echo -e "${BLUE}║            ${GREEN}KHOCHUAN POS DEPLOYMENT${BLUE}              ║${NC}"
echo -e "${BLUE}║                                                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: Wrangler CLI is not installed. Please run setup.sh first.${NC}"
    exit 1
fi

# Check Cloudflare login
echo -e "${BLUE}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}You need to log in to Cloudflare first.${NC}"
    wrangler login
fi

# Building frontend
echo -e "${BLUE}Building frontend...${NC}"
cd frontend
npm ci
npm run build
cd ..
echo -e "${GREEN}✓ Frontend build complete${NC}"

# Deploying frontend to Cloudflare Pages
echo -e "${BLUE}Deploying frontend to Cloudflare Pages...${NC}"
wrangler pages deploy frontend/dist --project-name=khochuan-pos
echo -e "${GREEN}✓ Frontend deployed to Cloudflare Pages${NC}"

# Deploying backend to Cloudflare Workers
echo -e "${BLUE}Deploying backend to Cloudflare Workers...${NC}"
cd backend
npm ci
wrangler deploy
echo -e "${GREEN}✓ Backend deployed to Cloudflare Workers${NC}"

# Running database migrations
echo -e "${BLUE}Running database migrations...${NC}"
wrangler d1 migrations apply pos-database
echo -e "${GREEN}✓ Database migrations applied${NC}"
cd ..

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Your application is now available at:${NC}"
echo -e "${YELLOW}Frontend: https://khochuan-pos.pages.dev${NC}"
echo -e "${YELLOW}Backend API: https://khochuan-api.<your-subdomain>.workers.dev${NC}"
echo "" 