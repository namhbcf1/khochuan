# KHO CHUAN - HỆ THỐNG QUẢN LÝ BÁN HÀNG THÔNG MINH

## TỔNG QUAN HỆ THỐNG

KhoChuan là một hệ thống quản lý bán hàng toàn diện được phát triển cho doanh nghiệp bán lẻ, kết hợp giữa hệ thống POS (Point of Sale), quản lý kho hàng, phân tích dữ liệu và công nghệ AI để cung cấp một giải pháp bán hàng thông minh.

### Kiến trúc hệ thống

Hệ thống được xây dựng theo kiến trúc client-server hiện đại:

1. **Frontend**: React.js + Vite, triển khai trên Cloudflare Pages
   - UI Framework: Ant Design (antd)
   - State Management: React Context API
   - Routing: React Router Dom

2. **Backend**: Node.js + Express.js, triển khai trên Cloudflare Workers
   - Database: SQL (thông qua Cloudflare D1)
   - Authentication: JWT (JSON Web Tokens)
   - API RESTful

## CẤU TRÚC DỰ ÁN

### Frontend

```
frontend/
  ├── src/
  │   ├── App.jsx               # Component gốc của ứng dụng
  │   ├── index.js              # Điểm vào của ứng dụng
  │   ├── routes.jsx            # Cấu hình định tuyến
  │   ├── assets/               # Tài nguyên tĩnh (ảnh, biểu tượng)
  │   ├── auth/                 # Xác thực người dùng
  │   │   └── AuthContext.jsx   # Context quản lý xác thực
  │   ├── components/           # Components tái sử dụng
  │   │   ├── Admin/            # Components cho trang Admin
  │   │   ├── Analytics/        # Components phân tích dữ liệu
  │   │   ├── common/           # Components dùng chung
  │   │   ├── Customers/        # Components quản lý khách hàng
  │   │   ├── features/         # Components tính năng đặc biệt
  │   │   ├── Layout/           # Components bố cục
  │   │   ├── Orders/           # Components đơn hàng
  │   │   ├── POS/              # Components cho terminal bán hàng
  │   │   ├── Products/         # Components quản lý sản phẩm
  │   │   ├── Staff/            # Components quản lý nhân viên
  │   │   └── ui/               # UI Components cơ bản
  │   ├── contexts/             # React Contexts
  │   ├── hooks/                # Custom React hooks
  │   ├── pages/                # Các trang của ứng dụng
  │   │   ├── admin/            # Trang dành cho admin
  │   │   ├── cashier/          # Trang dành cho thu ngân
  │   │   ├── customer/         # Trang dành cho khách hàng
  │   │   └── staff/            # Trang dành cho nhân viên
  │   ├── services/             # Dịch vụ API và phần cứng
  │   │   ├── ai/               # Dịch vụ AI
  │   │   ├── api/              # Kết nối với backend API
  │   │   ├── ecommerce/        # Tích hợp các sàn TMĐT
  │   │   ├── hardware/         # Kết nối thiết bị phần cứng
  │   │   └── notifications/    # Dịch vụ thông báo
  │   ├── styles/               # CSS và themes
  │   └── utils/                # Tiện ích
  │       ├── constants/        # Hằng số
  │       ├── context/          # Context helpers
  │       ├── helpers/          # Helper functions
  │       └── hooks/            # Custom hooks
  ├── public/                   # Tài nguyên công cộng
  └── vite.config.js           # Cấu hình Vite
```

### Backend

```
backend/
  ├── src/
  │   ├── index.js              # Điểm vào của server
  │   ├── ai/                   # Module AI và ML
  │   ├── controllers/          # Xử lý request/response
  │   ├── middleware/           # Middleware Express
  │   ├── routes/               # Định nghĩa API routes
  │   ├── services/             # Business logic
  │   ├── utils/                # Tiện ích
  │   └── websocket/            # Xử lý kết nối realtime
  ├── database/                 # SQL migrations và schema
  │   ├── migrations/           # Database migrations
  │   ├── schema.sql            # Schema definition
  │   └── seed.sql              # Dữ liệu mẫu
  └── docs/                    # Tài liệu API
```

## PHÂN HỆ NGƯỜI DÙNG

Hệ thống có 4 nhóm người dùng chính với các quyền hạn và chức năng khác nhau:

### 1. Quản trị viên (Admin)

**Quyền hạn**: Toàn quyền quản lý hệ thống.

**Chức năng**:
- Quản lý danh mục sản phẩm, giá cả
- Quản lý nhân viên và phân quyền
- Xem báo cáo phân tích chi tiết
- Cấu hình hệ thống
- Quản lý tích hợp (API, sàn TMĐT)
- Quản lý khách hàng
- Quản lý đơn hàng
- Quản lý kho hàng
- Quản lý chiến dịch marketing
- Thiết lập cấu hình gamification cho nhân viên

### 2. Thu ngân (Cashier)

**Quyền hạn**: Quản lý giao dịch bán hàng.

**Chức năng**:
- Sử dụng terminal POS bán hàng
- Quản lý ca làm việc
- Xử lý thanh toán
- Tra cứu thông tin khách hàng
- In hóa đơn, biên lai
- Xem lịch sử đơn hàng
- Xử lý đơn trả hàng
- Quản lý điểm tích lũy khách hàng

### 3. Nhân viên (Staff)

**Quyền hạn**: Quản lý sản phẩm và hỗ trợ bán hàng.

**Chức năng**:
- Xem thông tin sản phẩm
- Quản lý kho hàng
- Xem báo cáo cá nhân
- Tham gia gamification (điểm thưởng, thách thức)
- Xem thông tin đào tạo
- Quản lý thông tin cá nhân
- Xem đơn hàng

### 4. Khách hàng (Customer)

**Quyền hạn**: Xem thông tin cá nhân và đơn hàng.

**Chức năng**:
- Xem lịch sử mua hàng
- Quản lý điểm tích lũy
- Xem khuyến mãi cá nhân
- Quét mã QR để nhận ưu đãi
- Xem thông tin tài khoản

## TÍNH NĂNG CHI TIẾT

### Quản lý Bán hàng (POS)

1. **Terminal POS**
   - Giao diện bán hàng trực quan
   - Tìm kiếm sản phẩm nhanh
   - Quét mã vạch
   - Áp dụng giảm giá
   - Quản lý giỏ hàng
   - Xử lý nhiều hình thức thanh toán
   - In biên lai/hóa đơn

2. **Quản lý Ca**
   - Bắt đầu/kết thúc ca
   - Đếm tiền mặt
   - Báo cáo ca làm việc
   - Đối soát doanh thu

### Quản lý Sản phẩm & Kho hàng

1. **Sản phẩm**
   - Thêm/sửa/xóa sản phẩm
   - Phân loại sản phẩm
   - Quản lý biến thể (màu, kích cỡ)
   - Quản lý giá cả và chiết khấu
   - Quản lý hình ảnh sản phẩm
   - Import/export danh sách sản phẩm

2. **Kho hàng**
   - Theo dõi tồn kho
   - Nhập/xuất kho
   - Kiểm kho
   - Cảnh báo hàng tồn
   - Báo cáo dịch chuyển hàng hóa
   - Dự báo nhu cầu

### Quản lý Khách hàng & Marketing

1. **Khách hàng**
   - Thông tin khách hàng
   - Lịch sử mua hàng
   - Phân nhóm khách hàng
   - Điểm tích lũy & thành viên
   - Quản lý tương tác khách hàng

2. **Marketing**
   - Chương trình khuyến mãi
   - Coupon và mã giảm giá
   - Email marketing
   - Quản lý quà tặng
   - Phân tích hiệu quả chiến dịch

### Quản lý Nhân viên & Gamification

1. **Nhân viên**
   - Quản lý thông tin nhân viên
   - Phân quyền và vai trò
   - Lịch làm việc
   - Quản lý hoa hồng/thưởng
   - Theo dõi hiệu suất

2. **Gamification**
   - Bảng xếp hạng nhân viên
   - Thách thức và mục tiêu
   - Huy hiệu và thành tích
   - Phần thưởng và khích lệ
   - Các chỉ số KPI trực quan

### Phân tích & Báo cáo

1. **Dashboard**
   - Tổng quan kinh doanh
   - Biểu đồ doanh thu
   - Thống kê bán hàng
   - Hiệu suất nhân viên
   - Chỉ số KPI chính

2. **Báo cáo chi tiết**
   - Báo cáo bán hàng
   - Báo cáo tồn kho
   - Báo cáo lợi nhuận
   - Báo cáo khách hàng
   - Báo cáo nhân viên
   - Báo cáo chi tiêu

### AI & Công nghệ thông minh

1. **AI Insights**
   - Phân khúc khách hàng
   - Dự báo nhu cầu
   - Tối ưu hóa giá
   - Gợi ý sản phẩm
   - Phát hiện gian lận

2. **Tích hợp**
   - Kết nối với sàn TMĐT (Shopee, Lazada, Tiki)
   - API cho các hệ thống khác
   - Kết nối cổng thanh toán
   - Tích hợp phần cứng (máy in, két tiền, máy quét)

## CÔNG NGHỆ PHẦN CỨNG

### Thiết bị đầu cuối

1. **Máy quét mã vạch**
   - Quét sản phẩm nhanh chóng
   - Hỗ trợ nhiều loại mã vạch
   - Kết nối không dây hoặc có dây

2. **Máy in**
   - In hóa đơn/biên lai
   - In báo cáo
   - Hỗ trợ nhiều kích thước giấy

3. **Két tiền**
   - Mở tự động khi thanh toán
   - Quản lý tiền mặt an toàn
   - Tương thích với hệ thống POS

4. **Terminal thanh toán**
   - Hỗ trợ thẻ tín dụng/ghi nợ
   - Thanh toán không tiếp xúc
   - Thanh toán qua QR code

## LUỒNG NGƯỜI DÙNG CHÍNH

### 1. Luồng bán hàng tại quầy

1. Thu ngân đăng nhập vào hệ thống
2. Bắt đầu ca làm việc và kiểm đếm tiền mặt
3. Quét sản phẩm hoặc tìm kiếm sản phẩm để thêm vào giỏ hàng
4. Áp dụng khuyến mãi hoặc giảm giá (nếu có)
5. Xác định thông tin khách hàng (khách vãng lai hoặc khách thành viên)
6. Chọn phương thức thanh toán và xử lý thanh toán
7. In hóa đơn/biên lai
8. Hoàn thành giao dịch và tiếp tục giao dịch mới
9. Kết thúc ca, đếm tiền và đối soát

### 2. Luồng quản lý hàng hóa

1. Admin/Nhân viên kho đăng nhập vào hệ thống
2. Kiểm tra báo cáo tồn kho và cảnh báo
3. Tạo phiếu nhập kho cho hàng hóa mới
4. Cập nhật số lượng và thông tin sản phẩm
5. Kiểm tra và đối soát hàng thực tế
6. Tạo báo cáo tồn kho

### 3. Luồng quản lý khách hàng

1. Admin/Nhân viên đăng nhập vào hệ thống
2. Tìm kiếm thông tin khách hàng
3. Xem lịch sử mua hàng và điểm tích lũy
4. Thêm mới hoặc cập nhật thông tin khách hàng
5. Phân nhóm khách hàng theo hành vi mua
6. Tạo chiến dịch marketing cho nhóm khách hàng mục tiêu

## THIẾT KẾ GIAO DIỆN

### Giao diện Admin

- **Dashboard**: Hiển thị tổng quan kinh doanh với các biểu đồ và chỉ số KPI
- **Quản lý sản phẩm**: Giao diện CRUD sản phẩm, phân loại, giá cả
- **Quản lý đơn hàng**: Xem, tìm kiếm, cập nhật trạng thái đơn hàng
- **Quản lý khách hàng**: Thông tin khách hàng, phân nhóm, lịch sử
- **Báo cáo & Phân tích**: Nhiều loại báo cáo với bộ lọc và biểu đồ
- **Cài đặt hệ thống**: Cấu hình cửa hàng, thuế, in ấn, phân quyền

### Giao diện Thu ngân (POS)

- **Màn hình bán hàng**: Giao diện đơn giản, trực quan, dễ sử dụng
- **Quản lý giỏ hàng**: Thêm/xóa/sửa sản phẩm, áp dụng giảm giá
- **Thanh toán**: Nhiều phương thức thanh toán, xử lý tiền thừa
- **Quản lý ca**: Bắt đầu/kết thúc ca, báo cáo doanh thu

### Giao diện Nhân viên

- **Dashboard cá nhân**: Hiệu suất, mục tiêu, thành tích
- **Thách thức & Huy hiệu**: Gamification để tăng năng suất
- **Đào tạo**: Tài liệu, video hướng dẫn sản phẩm và kỹ năng bán hàng
- **Thống kê cá nhân**: Doanh số, hoa hồng, xếp hạng

### Giao diện Khách hàng

- **Thông tin tài khoản**: Thông tin cá nhân, điểm tích lũy
- **Lịch sử mua hàng**: Đơn hàng đã mua, trạng thái
- **Ưu đãi & Khuyến mãi**: Mã giảm giá và ưu đãi đặc biệt
- **QR Code**: Quét mã để nhận ưu đãi hoặc thanh toán

## TÍNH NĂNG NỔI BẬT

1. **Phân tích AI thông minh**
   - Phân khúc khách hàng tự động
   - Dự báo nhu cầu dựa trên dữ liệu lịch sử
   - Tối ưu hóa giá dựa trên xu hướng thị trường
   - Gợi ý sản phẩm cho khách hàng dựa trên hành vi mua

2. **Gamification cho nhân viên**
   - Bảng xếp hạng và thách thức
   - Hệ thống huy hiệu và thành tích
   - Mục tiêu cá nhân và nhóm
   - Phần thưởng và ghi nhận

3. **Tích hợp đa kênh**
   - Đồng bộ với sàn TMĐT (Shopee, Lazada, Tiki)
   - Kết nối mạng xã hội và marketing
   - Quản lý đơn hàng từ nhiều nguồn
   - Trải nghiệm khách hàng nhất quán

4. **Báo cáo trực quan và chi tiết**
   - Dashboard tùy chỉnh theo vai trò
   - Báo cáo thời gian thực
   - Xuất báo cáo nhiều định dạng
   - Cảnh báo thông minh

5. **Trải nghiệm bán hàng liền mạch**
   - Giao diện POS trực quan
   - Hỗ trợ nhiều thiết bị
   - Hoạt động offline khi mất kết nối
   - Xử lý thanh toán nhanh chóng

## KẾ HOẠCH PHÁT TRIỂN TƯƠNG LAI

1. **Mở rộng tính năng AI**
   - Nhận diện hình ảnh sản phẩm
   - Chatbot hỗ trợ khách hàng
   - Dự đoán xu hướng mua sắm

2. **Tính năng Mobile**
   - Ứng dụng mobile cho nhân viên bán hàng
   - Ứng dụng cho khách hàng với thẻ thành viên điện tử
   - POS di động cho bán hàng lưu động

3. **Mở rộng tích hợp**
   - Thêm các cổng thanh toán mới
   - Kết nối với các nền tảng thương mại điện tử khác
   - API mở rộng cho đối tác

4. **Nâng cao trải nghiệm người dùng**
   - Giao diện tùy chỉnh theo thương hiệu
   - Tối ưu hóa UX trên các thiết bị
   - Đa ngôn ngữ và đa tiền tệ

---

*Tài liệu này cung cấp tổng quan về hệ thống KhoChuan. Chi tiết cụ thể về cài đặt, triển khai và sử dụng có thể được tìm thấy trong tài liệu kỹ thuật và hướng dẫn người dùng.* 