# Khochuan - Hệ thống Quản lý Bán hàng Thông minh

![Khochuan POS](frontend/public/logo.svg)

## Giới thiệu

Khochuan là một hệ thống quản lý bán hàng toàn diện được phát triển cho doanh nghiệp bán lẻ, kết hợp giữa hệ thống POS (Point of Sale), quản lý kho hàng, phân tích dữ liệu và công nghệ AI để cung cấp một giải pháp bán hàng thông minh.

> **Lưu ý về script trên Windows**: Nếu bạn đang sử dụng Windows, hãy đảm bảo các script `.sh` có thể thực thi bằng cách sử dụng Git Bash hoặc WSL. Trong một số trường hợp, bạn có thể cần chạy `chmod +x *.sh` trong môi trường bash để đảm bảo script có quyền thực thi.

## Cấu trúc hệ thống

Hệ thống được xây dựng theo kiến trúc client-server hiện đại:

### Frontend
- **Framework**: React.js + Vite, triển khai trên Cloudflare Pages
- **UI Framework**: Ant Design (antd)
- **State Management**: React Context API
- **Routing**: React Router Dom

### Backend
- **Runtime**: Node.js + Express.js, triển khai trên Cloudflare Workers
- **Database**: SQL (thông qua Cloudflare D1)
- **Authentication**: JWT (JSON Web Tokens)
- **API RESTful**

## Các vai trò người dùng

### Admin (Quản trị viên)
- ✅ **Toàn quyền** trên tất cả modules
- 🎯 Dashboard BI toàn diện
- 🤖 Cấu hình AI/ML
- ⚙️ Quản lý hệ thống

### Cashier (Thu ngân)
- ✅ **POS Terminal**
- 🛒 Xử lý đơn hàng
- 👤 Tra cứu khách hàng
- 🧾 In hóa đơn

### Staff (Nhân viên)
- ✅ **Dashboard cá nhân**
- 🎮 Hệ thống game hóa
- 📈 Hiệu suất cá nhân
- 🏆 Thành tích và thử thách

### Customer (Khách hàng)
- ✅ **Thông tin cá nhân**
- 🛍️ Lịch sử đơn hàng
- 🎁 Điểm tích lũy
- 🔔 Thông báo ưu đãi

## Tính năng nổi bật

### Game hóa cho nhân viên
- 🏆 Bảng xếp hạng và thách thức
- 🥇 Hệ thống huy hiệu và thành tích
- 🎯 Mục tiêu cá nhân và nhóm
- 🎁 Phần thưởng và ghi nhận

### Phân tích AI thông minh
- 👥 Phân khúc khách hàng tự động
- 📊 Dự báo nhu cầu dựa trên dữ liệu lịch sử
- 💰 Tối ưu hóa giá dựa trên xu hướng thị trường
- 🛒 Gợi ý sản phẩm cho khách hàng

### Tích hợp đa kênh
- 🌐 Đồng bộ với sàn TMĐT (Shopee, Lazada, Tiki)
- 📱 Kết nối mạng xã hội và marketing
- 📦 Quản lý đơn hàng từ nhiều nguồn
- 👤 Trải nghiệm khách hàng nhất quán

## Hướng dẫn Bắt đầu

Để bắt đầu với dự án Khochuan POS, hãy làm theo các bước sau:

### 1. Cài đặt các công cụ cần thiết

- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
- [Git](https://git-scm.com/)
- Trình soạn thảo code (VS Code được khuyến nghị)

### 2. Clone dự án

```bash
# Clone repository
git clone https://github.com/your-username/khochuan-pos.git
cd khochuan-pos
```

### 3. Chạy script cài đặt

Script cài đặt sẽ giúp bạn thiết lập môi trường phát triển.

```bash
# Trên Linux/Mac
chmod +x setup.sh
./setup.sh

# Trên Windows
./setup.sh
# hoặc
bash setup.sh
```

### 4. Phát triển cục bộ

Để chạy dự án trên máy tính cục bộ:

```bash
# Chạy backend
cd backend
npm run dev

# Trong terminal khác, chạy frontend
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`, backend API sẽ chạy tại `http://localhost:8787`.

### 5. Các lệnh hữu ích

```bash
# Build frontend
cd frontend
npm run build

# Kiểm tra code frontend
cd frontend
npm run lint

# Chạy tests
cd frontend
npm test

# Deploy toàn bộ hệ thống
./deploy-all.sh
```

## Hướng dẫn triển khai

### Yêu cầu hệ thống
- Node.js 18+
- Git
- Tài khoản GitHub
- Tài khoản Cloudflare (để triển khai)

### 1. Chuẩn bị triển khai

#### Sao chép dự án
```bash
# Clone repository
git clone https://github.com/your-username/khochuan-pos.git
cd khochuan-pos

# Cài đặt dependencies
npm install

# Cài đặt dependencies frontend
cd frontend
npm install
cd ..

# Cài đặt dependencies backend
cd backend
npm install
cd ..
```

#### Cấu hình môi trường

1. Sao chép file môi trường mẫu:
```bash
cp env.example .env
cp frontend/env.example frontend/.env
cp backend/env.example backend/.env
```

2. Chỉnh sửa file `.env` với thông tin phù hợp
3. Cấu hình Cloudflare:
   - Tạo tài khoản Cloudflare (nếu chưa có)
   - Tạo Cloudflare API Token với quyền Workers và Pages

### 2. Triển khai lên GitHub

```bash
# Khởi tạo repository trên GitHub và liên kết
git remote add origin https://github.com/your-username/khochuan-pos.git
git branch -M main
git push -u origin main
```

### 3. Cấu hình GitHub Secrets

Thêm các secrets sau vào repository GitHub:

- `CLOUDFLARE_API_TOKEN`: Token API của Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: ID tài khoản Cloudflare
- `VITE_API_URL`: URL của backend API
- `VITE_API_KEY`: API key (nếu có)
- `DATABASE_URL`: URL kết nối database
- `JWT_SECRET`: Khóa bí mật cho JWT

### 4. Triển khai lên Cloudflare

#### Triển khai Frontend (Cloudflare Pages)

1. Từ dashboard Cloudflare, chọn "Pages"
2. Chọn "Create a project"
3. Kết nối với GitHub và chọn repository
4. Cấu hình như sau:
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install --include=dev && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Environment variables**: Thêm các biến môi trường cần thiết từ `frontend/.env`

#### Triển khai Backend (Cloudflare Workers)

1. Cài đặt Wrangler CLI:
```bash
npm install -g wrangler
```

2. Đăng nhập vào Cloudflare:
```bash
wrangler login
```

3. Cấu hình D1 Database:
```bash
# Tạo database
wrangler d1 create khochuan-pos

# Thêm ID database vào wrangler.toml
# [d1_databases]
# binding = "DB"
# database_name = "khochuan-pos"
# database_id = "<DATABASE_ID>"
```

4. Chạy migrations:
```bash
cd backend
wrangler d1 migrations apply khochuan-pos --local
```

5. Deploy backend:
```bash
cd backend
wrangler deploy
```

### 5. Tự động hóa với GitHub Actions

Dự án đã được cấu hình với GitHub Actions để tự động triển khai:
- `.github/workflows/deploy-frontend.yml`: Tự động triển khai frontend lên Cloudflare Pages khi có push vào branch main
- `.github/workflows/deploy-backend.yml`: Tự động triển khai backend lên Cloudflare Workers khi có push vào branch main

Sau khi thiết lập GitHub Secrets và đẩy code lên, workflows sẽ tự động chạy.

## Cấu trúc dự án

```
khochuan/
├── 🔧 backend/                     # Backend API & Server
│   ├── database/                  # Database migrations & schema
│   ├── src/                       # Source code
│   │   ├── ai/                    # AI services
│   │   ├── controllers/           # Request controllers
│   │   ├── middleware/            # Middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Utilities
│   │   ├── websocket/             # WebSocket
│   │   └── index.js               # Main entry point
│   └── wrangler.toml              # Cloudflare configuration
│
└── 🎨 frontend/                    # Frontend client application
    ├── src/                       # Source code
    │   ├── auth/                  # Authentication
    │   ├── components/            # React components
    │   ├── contexts/              # React contexts
    │   ├── hooks/                 # Custom hooks
    │   ├── pages/                 # App pages
    │   ├── services/              # API services
    │   ├── styles/                # CSS & styling
    │   └── utils/                 # Utilities
    └── vite.config.js             # Vite configuration
```

## Thử nghiệm hệ thống

Sau khi triển khai, hệ thống có thể truy cập tại:
- **Frontend**: https://khochuan-pos.pages.dev
- **Backend API**: https://khochuan-api.your-subdomain.workers.dev

### Đăng nhập thử nghiệm

Sử dụng các tài khoản sau để trải nghiệm hệ thống:

- **Admin**: admin@khochuan.com / Khochuan@2023
- **Thu ngân**: cashier@khochuan.com / Khochuan@2023
- **Nhân viên**: staff@khochuan.com / Khochuan@2023

## Liên hệ và hỗ trợ

Nếu cần hỗ trợ hoặc có câu hỏi, vui lòng liên hệ:
- Email: support@khochuan.com
- GitHub Issues: https://github.com/your-username/khochuan-pos/issues

---

© 2023 Khochuan POS - Hệ thống quản lý bán hàng thông minh 