# 🏪 Smart POS System

Hệ thống Point of Sale (POS) thông minh được xây dựng với React và Cloudflare Workers, tích hợp AI và gamification.

## ✨ Tính năng chính

### 🎯 Core POS Features
- **Quản lý bán hàng**: Giao diện POS hiện đại với barcode scanner
- **Quản lý kho**: Theo dõi tồn kho, cảnh báo hết hàng
- **Quản lý khách hàng**: CRM tích hợp với loyalty program
- **Báo cáo & Analytics**: Dashboard thống kê chi tiết

### 🤖 AI-Powered Features
- **Dự đoán doanh số**: AI forecasting cho inventory planning
- **Gợi ý sản phẩm**: Recommendation engine
- **Phân tích xu hướng**: Trend analysis và insights
- **Chatbot hỗ trợ**: AI assistant cho nhân viên

### 🎮 Gamification
- **Hệ thống điểm**: Point system cho nhân viên và khách hàng
- **Badges & Achievements**: Huy hiệu và thành tựu
- **Leaderboard**: Bảng xếp hạng nhân viên
- **Challenges**: Thử thách hàng ngày/tuần

### 🔧 Technical Features
- **Real-time Updates**: WebSocket cho cập nhật thời gian thực
- **Offline Support**: PWA với offline capabilities
- **Multi-tenant**: Hỗ trợ nhiều cửa hàng
- **Role-based Access**: Phân quyền chi tiết

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
- ✅ Giao diện Admin
- ✅ Giao diện Thu ngân
- ✅ Giao diện Nhân viên với game hóa
- ✅ Ma trận phân quyền chi tiết
- ⏳ Tích hợp AI (đang phát triển)
- ⏳ Tích hợp sàn TMĐT (đang phát triển)
- ⏳ Kết nối phần cứng (đang phát triển)

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 14+
- NPM hoặc Yarn
- MongoDB 4+

### Cài đặt frontend
```bash
cd frontend
npm install
npm start
```

### Cài đặt backend
```bash
cd backend
npm install
npm start
```

## Đăng nhập thử nghiệm

Sử dụng các tài khoản sau để trải nghiệm hệ thống:

- Admin: admin@example.com / password
- Thu ngân: cashier@example.com / password
- Nhân viên: staff@example.com / password 