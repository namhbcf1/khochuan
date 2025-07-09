# Khochuan POS - Chi tiết Kỹ thuật

## 🔧 Công nghệ sử dụng

### Frontend
- **Framework**: React 18+ với React Router 6
- **State Management**: Context API + Custom Hooks
- **UI Framework**: Custom UI với hỗ trợ từ Tailwind CSS
- **API Communication**: Axios, React Query
- **Real-time**: WebSockets, Socket.IO
- **Visualization**: Chart.js, D3.js
- **Build Tools**: Vite
- **Testing**: Jest, React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, OAuth 2.0
- **WebSockets**: Socket.IO
- **API Documentation**: OpenAPI/Swagger
- **Testing**: Jest, Supertest
- **Task Queue**: Bull, Redis
- **Logging**: Winston, Pino

### DevOps & Deployment
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend)
- **Database Hosting**: Managed PostgreSQL (Supabase/Neon)
- **Monitoring**: Datadog, Sentry
- **Containers**: Docker

## 🔐 Bảo mật

### Authentication
- JWT (JSON Web Tokens) với refresh token
- Multi-factor Authentication (MFA)
- Role-based Access Control (RBAC)
- OAuth 2.0 integration
- Session timeout & management

### Data Protection
- End-to-end encryption cho dữ liệu nhạy cảm
- Mã hóa thông tin thanh toán (PCI DSS compliant)
- Mã hóa dữ liệu lưu trữ
- Data masking cho thông tin nhạy cảm

### API Security
- Rate limiting
- CORS configuration
- API keys & scopes
- Input validation & sanitization
- Brute force protection

## 🤖 Tính năng AI

### Phân khúc khách hàng (Customer Segmentation)
- **Thuật toán**: K-means clustering, RFM analysis
- **Dữ liệu**: Lịch sử mua hàng, giá trị đơn hàng, tần suất mua
- **Kết quả**: Phân loại khách hàng VIP, thường xuyên, tiềm năng, không hoạt động

### Dự báo nhu cầu (Demand Forecasting)
- **Thuật toán**: LSTM (Long Short-Term Memory), ARIMA
- **Dữ liệu**: Lịch sử bán hàng, mùa vụ, xu hướng thị trường
- **Kết quả**: Dự báo nhu cầu sản phẩm, tối ưu tồn kho

### Tối ưu giá (Price Optimization)
- **Thuật toán**: Reinforcement Learning, Random Forest
- **Dữ liệu**: Giá cả lịch sử, elasticity, cạnh tranh, mùa vụ
- **Kết quả**: Đề xuất giá tối ưu cho lợi nhuận và doanh số

### Gợi ý sản phẩm (Product Recommendations)
- **Thuật toán**: Collaborative Filtering, Matrix Factorization
- **Dữ liệu**: Lịch sử mua hàng, sản phẩm liên quan
- **Kết quả**: Gợi ý cross-sell, up-sell, bán kèm

## 🎮 Game hóa (Gamification)

### Hệ thống điểm & cấp độ
- Điểm kinh nghiệm (XP) cho mỗi đơn hàng
- Cấp độ nhân viên (từ Tân binh đến Chuyên gia)
- Điểm thưởng đặc biệt cho thành tích nổi bật

### Thành tích & huy hiệu
- Huy hiệu theo mục tiêu doanh số
- Huy hiệu theo kỹ năng bán hàng
- Huy hiệu sản phẩm (expertise badges)
- Thành tích đặc biệt (First Sale, Milestone Sales)

### Thử thách & nhiệm vụ
- Nhiệm vụ hàng ngày
- Thử thách hàng tuần
- Chiến dịch bán hàng theo mùa
- Thử thách đội nhóm

### Bảng xếp hạng & phần thưởng
- Bảng xếp hạng theo doanh số
- Bảng xếp hạng theo số lượng đơn hàng
- Phần thưởng thực (tiền thưởng, ngày nghỉ)
- Phần thưởng ảo (huy hiệu, danh hiệu)

## 💾 Cấu trúc Database

### Bảng chính
1. **users**: Người dùng hệ thống
   - id, email, password_hash, name, role, created_at, updated_at

2. **products**: Sản phẩm
   - id, name, sku, barcode, description, price, cost, tax_rate, category_id, supplier_id, created_at, updated_at

3. **inventory**: Tồn kho
   - id, product_id, quantity, location_id, last_counted_at, created_at, updated_at

4. **categories**: Danh mục sản phẩm
   - id, name, parent_id, image_url, created_at, updated_at

5. **customers**: Khách hàng
   - id, name, email, phone, address, loyalty_points, segment, created_at, updated_at

6. **orders**: Đơn hàng
   - id, customer_id, cashier_id, total, tax, discount, payment_method, status, created_at, updated_at

7. **order_items**: Chi tiết đơn hàng
   - id, order_id, product_id, quantity, price, discount, created_at, updated_at

8. **payments**: Thanh toán
   - id, order_id, amount, method, status, reference, created_at, updated_at

9. **staff**: Nhân viên
   - id, user_id, position, hire_date, manager_id, commission_rate, created_at, updated_at

10. **staff_performance**: Hiệu suất nhân viên
    - id, staff_id, sales, orders_count, average_order_value, period, created_at, updated_at

11. **gamification_achievements**: Thành tích game hóa
    - id, staff_id, achievement_id, unlocked_at, created_at, updated_at

12. **suppliers**: Nhà cung cấp
    - id, name, contact, email, phone, address, created_at, updated_at

### Bảng phụ
1. **sessions**: Phiên làm việc
   - id, cashier_id, start_time, end_time, starting_cash, ending_cash, status

2. **price_history**: Lịch sử giá
   - id, product_id, price, effective_date, created_by

3. **inventory_transactions**: Giao dịch tồn kho
   - id, product_id, quantity, type, reference, notes, created_by, created_at

4. **customer_segments**: Phân khúc khách hàng
   - id, name, criteria, created_at, updated_at

5. **loyalty_transactions**: Giao dịch điểm thưởng
   - id, customer_id, points, type, reference, created_at, updated_at

6. **price_rules**: Quy tắc giá
   - id, name, product_id, customer_segment_id, discount_type, discount_value, start_date, end_date

7. **audit_logs**: Nhật ký kiểm toán
   - id, user_id, action, entity, entity_id, details, ip_address, created_at

## 🔌 Tích hợp API

### POS Hardware
- **Máy in hóa đơn**: ESCPOS, Star, Epson
- **Máy quét mã vạch**: USB HID, Bluetooth
- **Ngăn kéo tiền**: Kết nối qua máy in
- **Terminal thanh toán**: SDK thanh toán

### Tích hợp thanh toán
- VNPay
- MoMo
- ZaloPay
- Stripe
- Paypal

### Tích hợp thương mại điện tử
- Shopee
- Lazada 
- Tiki
- WooCommerce
- Shopify

### Tích hợp khác
- Zalo OA
- Google Analytics
- Facebook Pixel
- Email marketing (SendGrid)
- SMS Gateway (Twilio)

## 📊 Các loại báo cáo

### Báo cáo bán hàng
- Doanh số theo thời gian (giờ, ngày, tuần, tháng)
- Doanh số theo danh mục
- Doanh số theo sản phẩm
- Doanh số theo nhân viên
- Doanh số theo phương thức thanh toán
- Phân tích khuyến mãi & giảm giá

### Báo cáo tồn kho
- Tình trạng tồn kho
- Sản phẩm sắp hết
- Phân tích ABC
- Lịch sử nhập/xuất kho
- Giá trị tồn kho
- Tuổi tồn kho

### Báo cáo khách hàng
- Khách hàng theo phân khúc
- Giá trị vòng đời khách hàng (LTV)
- Tỷ lệ giữ chân khách hàng
- Hành vi mua hàng
- Điểm trung thành & sử dụng
- Tần suất mua hàng

### Báo cáo hiệu suất
- Hiệu suất nhân viên
- Thời gian xử lý đơn hàng
- Tỷ lệ chuyển đổi
- Phân tích giỏ hàng bị bỏ
- KPIs theo vai trò
- Phân tích thời gian cao điểm 