#!/bin/bash
set -e

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print KhoChuan Logo
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                   ║${NC}"
echo -e "${BLUE}║  ${GREEN}██╗  ██╗██╗  ██╗ ██████╗  ██████╗██╗  ██╗██╗   ██╗ █████╗ ███╗   ██╗${BLUE}  ║${NC}"
echo -e "${BLUE}║  ${GREEN}██║ ██╔╝██║  ██║██╔═══██╗██╔════╝██║  ██║██║   ██║██╔══██╗████╗  ██║${BLUE}  ║${NC}"
echo -e "${BLUE}║  ${GREEN}█████╔╝ ███████║██║   ██║██║     ███████║██║   ██║███████║██╔██╗ ██║${BLUE}  ║${NC}"
echo -e "${BLUE}║  ${GREEN}██╔═██╗ ██╔══██║██║   ██║██║     ██╔══██║██║   ██║██╔══██║██║╚██╗██║${BLUE}  ║${NC}"
echo -e "${BLUE}║  ${GREEN}██║  ██╗██║  ██║╚██████╔╝╚██████╗██║  ██║╚██████╔╝██║  ██║██║ ╚████║${BLUE}  ║${NC}"
echo -e "${BLUE}║  ${GREEN}╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝${BLUE}  ║${NC}"
echo -e "${BLUE}║                                                   ║${NC}"
echo -e "${BLUE}║               ${YELLOW}POS System Setup${BLUE}                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"

# Check if version is at least 18
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
    echo -e "${RED}Node.js version 18 or higher is required. Please upgrade Node.js.${NC}"
    exit 1
fi

# Check for Git
echo -e "${BLUE}Checking Git installation...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git.${NC}"
    exit 1
fi
echo -e "${GREEN}Git is installed.${NC}"

# Create environment files if they don't exist
echo -e "${BLUE}Creating environment files...${NC}"
if [ ! -f ".env" ]; then
    cp env.example .env
    echo -e "${GREEN}Created .env from template${NC}"
else
    echo -e "${YELLOW}Using existing .env file${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env
    echo -e "${GREEN}Created frontend/.env from template${NC}"
else
    echo -e "${YELLOW}Using existing frontend/.env file${NC}"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo -e "${GREEN}Created backend/.env from template${NC}"
else
    echo -e "${YELLOW}Using existing backend/.env file${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing project dependencies...${NC}"
npm install

echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Check for Wrangler
echo -e "${BLUE}Checking Wrangler installation...${NC}"
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler CLI is not installed. Installing globally...${NC}"
    npm install -g wrangler
    echo -e "${GREEN}Wrangler installed.${NC}"
else
    echo -e "${GREEN}Wrangler is already installed.${NC}"
fi

# Setup complete
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Configure your environment variables in the .env files"
echo -e "2. Start development:"
echo -e "   - Frontend: ${YELLOW}cd frontend && npm run dev${NC}"
echo -e "   - Backend: ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo -e "${BLUE}For deployment to Cloudflare:${NC}"
echo -e "1. Create a GitHub repository and push your code"
echo -e "2. Set up GitHub Secrets for Cloudflare deployment"
echo -e "3. Run GitHub Actions workflows to deploy"
echo ""
echo -e "${GREEN}Thank you for using KhoChuan POS!${NC}" 