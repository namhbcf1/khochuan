# KhoChuan POS System Deployment

## Deployment URLs

### Production
- Frontend: https://khochuan-pos.pages.dev
- Backend API: https://khochuan-pos.bangachieu2.workers.dev

### Testing Branch
- Frontend: https://testing-framework.khochuan-pos.pages.dev

## Environment Setup

The application is deployed on Cloudflare's infrastructure:
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- Storage: Cloudflare KV (for sessions and cache)

## Testing

The following tests are available and can be run to verify functionality:

```bash
# Authentication tests
npm run test:auth

# POS functionality tests
npm run test:pos

# Visual regression tests
npm run test:visual

# Run all tests
npm test
```

## Deployment Process

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm install
   npm run build
   ```

3. Deploy to Cloudflare:
   ```bash
   # Deploy frontend
   wrangler pages deploy frontend/dist

   # Deploy backend
   wrangler deploy
   ```

## Configuration

Configuration is managed through:
- `wrangler.toml` for backend and general settings
- `cloudflare-pages.json` for frontend deployment settings
- Environment variables in the Cloudflare dashboard

## Known Issues

- Some visual regression tests may need to be updated after UI changes
- Testing on mobile devices requires specific device profiles

## Last Successful Deployment

- Date: July 9, 2025
- Version: 1.0.0 (testing-framework branch)
- Build ID: 0ed1c92d-409c-4bc0-9516-d82d5869f777 