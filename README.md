# Smart POS System - KHO CHUAN

## Giới thiệu

Hệ thống POS thông minh KhoChuan với tính năng game hóa, AI, và đa kênh bán hàng. Được phát triển với React, Node.js, và hệ thống cơ sở dữ liệu hiện đại.

## Cấu trúc hệ thống

Hệ thống được chia thành hai phần chính:

### Frontend
- Giao diện người dùng phân quyền theo vai trò (Admin, Thu ngân, Nhân viên)
- Được phát triển với React, Ant Design và các công nghệ hiện đại
- Hỗ trợ game hóa để tăng năng suất nhân viên
- Trực quan hóa dữ liệu và báo cáo
- Tích hợp AI cho việc gợi ý và dự báo

### Backend
- API RESTful phát triển với Node.js
- Xác thực và phân quyền chi tiết
- Tích hợp AI và ML cho phân tích
- Xử lý thanh toán đa kênh
- Đồng bộ dữ liệu real-time

## Các vai trò người dùng

### Admin
- Quản lý toàn diện hệ thống
- Truy cập vào tất cả tính năng và báo cáo
- Cấu hình và tùy chỉnh hệ thống

### Thu ngân
- Xử lý giao dịch bán hàng
- Quản lý đơn hàng và đổi trả
- Truy cập thông tin khách hàng

### Nhân viên
- Theo dõi hiệu suất cá nhân
- Tham gia hệ thống game hóa
- Truy cập thông tin bán hàng và đào tạo

## Tính năng nổi bật

### Game hóa
- Hệ thống thứ hạng và cấp độ
- Thành tích và phần thưởng
- Bảng xếp hạng và cuộc thi
- Thử thách và mục tiêu

### AI và phân tích
- Dự báo nhu cầu
- Phân khúc khách hàng
- Tối ưu giá
- Gợi ý sản phẩm

### Quản lý kho thông minh
- Theo dõi tồn kho thời gian thực
- Cảnh báo khi hàng sắp hết
- Đề xuất nhập hàng
- Phân tích biến động kho

### Tích hợp đa kênh
- Đồng bộ với các sàn TMĐT: Shopee, Lazada, Tiki
- Quản lý đơn hàng từ nhiều nguồn
- Báo cáo hiệu suất bán hàng đa kênh

## Kiến trúc frontend

Dự án tuân theo cấu trúc thư mục rõ ràng để dễ bảo trì và mở rộng:

```
client/src/
├── auth/                        # Hệ thống xác thực & phân quyền
├── components/                  # Components dùng chung
│   ├── common/                  # Components cơ bản
│   ├── ui/                      # UI Components tái sử dụng
│   └── features/                # Feature-specific components
├── pages/                       # Các trang chính theo role
│   ├── admin/                   # Giao diện Quản trị viên
│   ├── cashier/                 # Giao diện Thu ngân
│   └── staff/                   # Giao diện Nhân viên (Game hóa)
├── services/                    # Services & APIs
│   ├── api/                     # API clients
│   ├── ai/                      # AI Services
│   ├── hardware/                # Hardware integrations
│   ├── ecommerce/               # E-commerce integrations
│   └── notifications/           # Notification services
├── utils/                       # Utilities & Helpers
├── styles/                      # Styles & Themes
├── assets/                      # Static assets
└── __tests__/                   # Tests
```

## Trạng thái triển khai

- ✅ Cấu trúc thư mục và kiến trúc ứng dụng
- ✅ Hệ thống xác thực và phân quyền
- ✅ Giao diện cơ bản của POS Terminal
- ⏳ Dashboard và báo cáo Admin (đang phát triển)
- ⏳ Quản lý khách hàng (đang phát triển)
- ✅ Kiểm thử và QA
- ✅ Triển khai lên Cloudflare
- ⏳ Tích hợp AI (đang phát triển)
- ⏳ Tích hợp sàn TMĐT (đang phát triển)
- ⏳ Kết nối phần cứng (đang phát triển)

## Kết quả kiểm tra

### Các phần đã vượt qua test
- **Xác thực**: 6/6 tests pass
- **POS Terminal**: 5/5 tests pass
- **Visual Regression**: 6/6 tests pass

### Các phần đang phát triển
- Dashboard: Đang cải thiện UI/UX và các thành phần
- Quản lý khách hàng: Đang xây dựng các tính năng

## Framework kiểm thử triển khai

Hệ thống KhoChuan bao gồm framework kiểm thử triển khai tự động để đảm bảo chất lượng sau khi triển khai:

### Cấu trúc
- `tests/deployment.spec.js`: Test case kiểm tra ứng dụng đã triển khai
- `tests/run-deployment-tests.js`: Script chạy các test kiểm tra triển khai
- `scripts/verify-deployment.sh`: Script bash kiểm tra triển khai (Linux/Mac)
- `scripts/verify-deployment.ps1`: Script PowerShell kiểm tra triển khai (Windows)
- `verify-deployment.cmd`: Script batch để chạy trên Windows
- `.github/workflows/verify-deployment.yml`: Workflow CI/CD tự động kiểm tra

### Cách sử dụng

Trên Windows:
```cmd
verify-deployment.cmd [url] [api-url]
```

Trên Linux/Mac:
```bash
./scripts/verify-deployment.sh [url] [api-url]
```

Tự động qua GitHub Actions:
- Tự động chạy khi có deployment thành công
- Có thể kích hoạt thủ công qua workflow_dispatch

### Kết quả
- Kết quả được lưu vào file CHUAN.MD
- Báo cáo chi tiết với screenshots ở thư mục playwright-report
- Xem báo cáo bằng lệnh: `npx playwright show-report`

## Deployment URLs

- **Frontend**: https://khochuan-pos.pages.dev
- **Latest Preview**: https://b64046e8.khochuan-pos.pages.dev
- **Testing Framework Branch**: https://testing-framework.khochuan-pos.pages.dev
- **Backend API**: https://khochuan-pos-api.bangachieu2.workers.dev

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 14+
- NPM hoặc Yarn
- MongoDB 4+ (hoặc sử dụng Cloudflare KV)

### Cài đặt frontend
```bash
cd frontend
npm install
npm run dev     # Chạy môi trường phát triển
npm run build   # Build cho production
```

### Cài đặt backend
```bash
cd backend
npm install
npm run dev     # Chạy môi trường phát triển
```

### Chạy tests
```bash
# Các test xác thực
npm run test:auth

# Các test POS
npm run test:pos

# Kiểm tra hình ảnh
npm run test:visual

# Chạy tất cả test
npm test
```

## Đăng nhập thử nghiệm

Sử dụng các tài khoản sau để trải nghiệm hệ thống:

- Admin: admin@example.com / password
- Thu ngân: cashier@example.com / password
- Nhân viên: staff@example.com / password

## Tài liệu tham khảo

- [Tài liệu API](docs/API_DOCUMENTATION.md)
- [Hướng dẫn triển khai](DEPLOYMENT.md) 
- [Báo cáo kiểm tra](TEST-REPORT-SUMMARY.md)
- [Kế hoạch triển khai](IMPLEMENTATION-PLAN.md)
- [Thông tin dự án chi tiết](CHUAN.MD) 