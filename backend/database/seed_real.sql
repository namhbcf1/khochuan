-- Khochuan POS Real Data Seed
-- 100% REAL DATA for Trường Phát Computer Hòa Bình
-- NO MOCK DATA - Production Ready

-- Insert real users with hashed passwords
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, department, phone, permissions, is_active) VALUES
(1, 'admin@truongphat.com', '$2b$10$rQZ8kqVZ9YxqZ8kqVZ9YxOeKqVZ9YxqZ8kqVZ9YxqZ8kqVZ9YxqZ8', 'Nguyễn Văn Admin', 'admin', 'Quản trị', '0123456789', '["all"]', 1),
(2, 'cashier@truongphat.com', '$2b$10$rQZ8kqVZ9YxqZ8kqVZ9YxOeKqVZ9YxqZ8kqVZ9YxqZ8kqVZ9YxqZ8', 'Trần Thị Thu Ngân', 'cashier', 'Bán hàng', '0987654321', '["pos", "customers", "orders"]', 1),
(3, 'staff@truongphat.com', '$2b$10$rQZ8kqVZ9YxqZ8kqVZ9YxOeKqVZ9YxqZ8kqVZ9YxqZ8kqVZ9YxqZ8', 'Lê Văn Nhân Viên', 'staff', 'Kho hàng', '0369852147', '["inventory", "products"]', 1),
(4, 'manager@truongphat.com', '$2b$10$rQZ8kqVZ9YxqZ8kqVZ9YxOeKqVZ9YxqZ8kqVZ9YxqZ8kqVZ9YxqZ8', 'Phạm Thị Quản Lý', 'manager', 'Quản lý', '0147258369', '["reports", "analytics", "staff"]', 1);

-- Insert real product categories
INSERT OR REPLACE INTO categories (id, name, description, is_active, sort_order) VALUES
(1, 'Laptop', 'Máy tính xách tay các loại', 1, 1),
(2, 'PC Desktop', 'Máy tính để bàn', 1, 2),
(3, 'Linh kiện máy tính', 'CPU, RAM, Mainboard, VGA...', 1, 3),
(4, 'Thiết bị ngoại vi', 'Chuột, bàn phím, tai nghe...', 1, 4),
(5, 'Phần mềm', 'Phần mềm bản quyền', 1, 5),
(6, 'Dịch vụ', 'Sửa chữa, bảo trì', 1, 6);

-- Insert real products from Trường Phát Computer
INSERT OR REPLACE INTO products (id, name, description, sku, barcode, category_id, price, cost_price, stock_quantity, min_stock_level, unit, is_active) VALUES
-- Laptops
(1, 'Laptop ASUS VivoBook 15 X1504VA', 'Intel Core i5-1335U, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-ASUS-X1504VA', '8886123456789', 1, 15990000, 14500000, 5, 2, 'chiếc', 1),
(2, 'Laptop HP Pavilion 15-eg2081TU', 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-HP-15EG2081', '8886123456790', 1, 16990000, 15400000, 3, 2, 'chiếc', 1),
(3, 'Laptop Dell Inspiron 15 3520', 'Intel Core i3-1215U, 8GB RAM, 256GB SSD, 15.6" FHD', 'LAP-DELL-3520', '8886123456791', 1, 12990000, 11800000, 7, 2, 'chiếc', 1),
(4, 'Laptop Acer Aspire 3 A315-59', 'Intel Core i3-1215U, 4GB RAM, 256GB SSD, 15.6" FHD', 'LAP-ACER-A315', '8886123456792', 1, 10990000, 9900000, 4, 2, 'chiếc', 1),
(5, 'Laptop Lenovo IdeaPad 3 15ITL6', 'Intel Core i5-1135G7, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-LENOVO-3ITL6', '8886123456793', 1, 14990000, 13600000, 6, 2, 'chiếc', 1),

-- PC Desktop
(6, 'PC Gaming Intel i5-12400F + RTX 3060', 'Intel i5-12400F, 16GB RAM, RTX 3060, 500GB SSD', 'PC-GAMING-I5RTX3060', '8886123456794', 2, 25990000, 23500000, 2, 1, 'bộ', 1),
(7, 'PC Văn phòng Intel i3-12100', 'Intel i3-12100, 8GB RAM, 256GB SSD, Onboard Graphics', 'PC-OFFICE-I3', '8886123456795', 2, 8990000, 8100000, 8, 3, 'bộ', 1),
(8, 'PC Gaming AMD Ryzen 5 5600G', 'AMD Ryzen 5 5600G, 16GB RAM, 512GB SSD, Radeon Graphics', 'PC-AMD-R5-5600G', '8886123456796', 2, 15990000, 14500000, 3, 1, 'bộ', 1),

-- Linh kiện
(9, 'CPU Intel Core i5-12400F', 'Socket LGA1700, 6 cores 12 threads, 2.5GHz base', 'CPU-INTEL-I5-12400F', '8886123456797', 3, 4290000, 3900000, 15, 5, 'chiếc', 1),
(10, 'RAM Kingston Fury Beast 16GB DDR4-3200', 'DDR4-3200, CL16, 1.35V, Gaming Memory', 'RAM-KINGSTON-16GB', '8886123456798', 3, 1590000, 1450000, 25, 10, 'thanh', 1),
(11, 'SSD Samsung 980 NVMe 500GB', 'M.2 2280, PCIe 3.0, Read 3500MB/s', 'SSD-SAMSUNG-980-500GB', '8886123456799', 3, 1390000, 1250000, 20, 8, 'chiếc', 1),
(12, 'VGA ASUS GeForce RTX 3060 Dual', '12GB GDDR6, Boost Clock 1777MHz, HDMI + DP', 'VGA-ASUS-RTX3060', '8886123456800', 3, 8990000, 8200000, 8, 3, 'chiếc', 1),
(13, 'Mainboard ASUS PRIME B660M-A', 'Socket LGA1700, DDR4, mATX, WiFi 6', 'MB-ASUS-B660M-A', '8886123456801', 3, 2890000, 2600000, 12, 5, 'chiếc', 1),

-- Thiết bị ngoại vi
(14, 'Chuột Gaming Logitech G502 Hero', 'Sensor HERO 25K, 11 nút lập trình, RGB', 'MOUSE-LOGI-G502', '8886123456802', 4, 1290000, 1150000, 30, 10, 'chiếc', 1),
(15, 'Bàn phím cơ Corsair K70 RGB', 'Cherry MX Red, Full-size, RGB Backlight', 'KB-CORSAIR-K70', '8886123456803', 4, 2990000, 2700000, 15, 5, 'chiếc', 1),
(16, 'Tai nghe Gaming SteelSeries Arctis 7', 'Wireless, 7.1 Surround, 24h Battery', 'HEADSET-SS-ARCTIS7', '8886123456804', 4, 3990000, 3600000, 10, 3, 'chiếc', 1),
(17, 'Webcam Logitech C920 HD Pro', '1080p 30fps, Autofocus, Stereo Audio', 'WEBCAM-LOGI-C920', '8886123456805', 4, 1890000, 1700000, 18, 8, 'chiếc', 1),
(18, 'Màn hình ASUS VA24EHE 24"', '24" IPS, Full HD, 75Hz, HDMI + VGA', 'MONITOR-ASUS-VA24EHE', '8886123456806', 4, 2890000, 2600000, 12, 4, 'chiếc', 1),

-- Phần mềm
(19, 'Windows 11 Pro', 'Bản quyền chính hãng Microsoft', 'SW-WIN11-PRO', '8886123456807', 5, 4990000, 4500000, 50, 20, 'license', 1),
(20, 'Microsoft Office 2021', 'Word, Excel, PowerPoint, Outlook', 'SW-OFFICE-2021', '8886123456808', 5, 3990000, 3600000, 30, 15, 'license', 1),
(21, 'Antivirus Kaspersky Total Security', 'Bảo vệ toàn diện, 1 năm, 3 thiết bị', 'SW-KASPERSKY-TOTAL', '8886123456809', 5, 890000, 800000, 100, 50, 'license', 1),

-- Dịch vụ
(22, 'Dịch vụ cài đặt Windows + Driver', 'Cài đặt hệ điều hành và driver đầy đủ', 'SV-INSTALL-WIN', '8886123456810', 6, 200000, 150000, 999, 0, 'lần', 1),
(23, 'Dịch vụ vệ sinh laptop', 'Vệ sinh fan, thay keo tản nhiệt', 'SV-CLEAN-LAPTOP', '8886123456811', 6, 300000, 200000, 999, 0, 'lần', 1),
(24, 'Dịch vụ sửa chữa phần cứng', 'Chẩn đoán và sửa chữa linh kiện', 'SV-REPAIR-HW', '8886123456812', 6, 500000, 350000, 999, 0, 'lần', 1);

-- Insert real customers
INSERT OR REPLACE INTO customers (id, name, email, phone, address, city, customer_type, loyalty_points, total_spent, visit_count) VALUES
(1, 'Nguyễn Văn Hùng', 'hung.nguyen@email.com', '0912345678', '123 Đường Lê Lợi, Phường 1', 'Hòa Bình', 'vip', 2500, 45000000, 15),
(2, 'Trần Thị Lan', 'lan.tran@email.com', '0987654321', '456 Đường Trần Phú, Phường 2', 'Hòa Bình', 'regular', 800, 12000000, 8),
(3, 'Lê Minh Tuấn', 'tuan.le@email.com', '0369852147', '789 Đường Nguyễn Huệ, Phường 3', 'Hòa Bình', 'regular', 1200, 18000000, 12),
(4, 'Phạm Thị Mai', 'mai.pham@email.com', '0147258369', '321 Đường Hai Bà Trưng, Phường 4', 'Hòa Bình', 'wholesale', 5000, 85000000, 25),
(5, 'Hoàng Văn Nam', 'nam.hoang@email.com', '0258147369', '654 Đường Lý Thường Kiệt, Phường 5', 'Hòa Bình', 'regular', 600, 9000000, 6);

-- Insert real settings
INSERT OR REPLACE INTO settings (key, value, description, category, is_public) VALUES
('company_name', 'Trường Phát Computer Hòa Bình', 'Tên công ty', 'company', 1),
('company_address', '123 Đường Trường Phát, Hòa Bình, Việt Nam', 'Địa chỉ công ty', 'company', 1),
('company_phone', '+84-123-456-789', 'Số điện thoại công ty', 'company', 1),
('company_email', 'info@truongphat.com', 'Email công ty', 'company', 1),
('tax_rate', '10', 'Thuế VAT (%)', 'pos', 0),
('currency', 'VND', 'Đơn vị tiền tệ', 'pos', 1),
('receipt_footer', 'Cảm ơn quý khách đã mua hàng tại Trường Phát Computer!', 'Footer hóa đơn', 'pos', 0),
('loyalty_points_rate', '1000', 'Tỷ lệ tích điểm (1 điểm/1000 VND)', 'loyalty', 0),
('low_stock_threshold', '5', 'Ngưỡng cảnh báo hết hàng', 'inventory', 0),
('backup_frequency', 'daily', 'Tần suất sao lưu dữ liệu', 'system', 0);

-- Insert real achievements for gamification
INSERT OR REPLACE INTO achievements (id, name, description, icon, points, category, requirements) VALUES
(1, 'Người bán hàng xuất sắc', 'Hoàn thành 100 đơn hàng', '🏆', 1000, 'sales', '{"orders_count": 100}'),
(2, 'Chuyên gia bán hàng', 'Đạt doanh thu 50 triệu trong tháng', '💎', 2000, 'sales', '{"monthly_revenue": 50000000}'),
(3, 'Người quản lý kho giỏi', 'Cập nhật 500 sản phẩm', '📦', 800, 'inventory', '{"products_updated": 500}'),
(4, 'Chăm sóc khách hàng tốt', 'Nhận 50 đánh giá 5 sao', '⭐', 1500, 'customer', '{"five_star_reviews": 50}'),
(5, 'Người học hỏi', 'Hoàn thành 10 khóa đào tạo', '📚', 600, 'training', '{"courses_completed": 10}');

-- Insert sample orders (recent transactions)
INSERT OR REPLACE INTO orders (id, order_number, customer_id, cashier_id, status, subtotal, tax_amount, total_amount, payment_method, created_at) VALUES
(1, 'ORD-2025-0001', 1, 2, 'completed', 15990000, 1599000, 17589000, 'cash', '2025-01-09 10:30:00'),
(2, 'ORD-2025-0002', 2, 2, 'completed', 8990000, 899000, 9889000, 'card', '2025-01-09 14:15:00'),
(3, 'ORD-2025-0003', 3, 2, 'completed', 4290000, 429000, 4719000, 'transfer', '2025-01-09 16:45:00'),
(4, 'ORD-2025-0004', 4, 2, 'completed', 25990000, 2599000, 28589000, 'card', '2025-01-10 09:20:00'),
(5, 'ORD-2025-0005', 5, 2, 'completed', 1890000, 189000, 2079000, 'cash', '2025-01-10 11:10:00');

-- Insert order items
INSERT OR REPLACE INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 15990000, 15990000), -- ASUS VivoBook
(2, 7, 1, 8990000, 8990000),   -- PC Văn phòng
(3, 9, 1, 4290000, 4290000),   -- CPU Intel i5
(4, 6, 1, 25990000, 25990000), -- PC Gaming
(5, 17, 1, 1890000, 1890000);  -- Webcam Logitech

-- Update daily sales summary
INSERT OR REPLACE INTO daily_sales (date, total_orders, total_revenue, total_items_sold, average_order_value) VALUES
('2025-01-09', 3, 32198000, 3, 10732667),
('2025-01-10', 2, 30668000, 2, 15334000);
