# KhoChuan POS - Deployment Documentation

## Triển khai hiện tại

### Frontend

**Status**: ✅ Đã triển khai thành công

**URLs**:
- **Production**: https://khochuan-pos.pages.dev
- **Testing Branch**: https://testing-framework.khochuan-pos.pages.dev
- **Latest Deployment**: https://b64046e8.khochuan-pos.pages.dev
- **Deployment ID**: b64046e8

**Cấu hình**:
- Framework: React 18 với Vite
- Hosting: Cloudflare Pages
- Build Command: `cd frontend && npm install --include=dev && npm run build`
- Build Directory: `/frontend/dist`
- Node version: 18

### Backend

**Status**: ✅ Đã triển khai thành công

**URLs**:
- **API URL**: https://khochuan-pos-api.bangachieu2.workers.dev

**Cấu hình**:
- Framework: Node.js với Express
- Hosting: Cloudflare Workers
- Wrangler Config: `/backend/wrangler.toml`

**Thay đổi**:
- Đã đơn giản hóa cấu trúc backend để không sử dụng Durable Objects
- Loại bỏ websockets và tính năng real-time để phù hợp với tài khoản miễn phí

**Endpoints**:
- Health check: `GET /health`
- Thông tin API: `GET /info`
- Authentication: `POST /auth/login`
- Các routes khác: `/admin/*`, `/cashier/*`, `/staff/*`, `/customer/*`

## Quy trình Deployment 