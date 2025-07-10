-- =====================================================
-- ENTERPRISE POS SYSTEM - DATABASE SEED DATA
-- Initial data for testing and development
-- =====================================================

-- Clear existing data (for development only)
DELETE FROM users;
DELETE FROM categories;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM payment_methods;
DELETE FROM badges;
DELETE FROM challenges;
DELETE FROM settings;

-- 1. SEED USERS (Admin, Cashier, Staff, Customer)
-- Note: Password is 'password123' hashed with bcrypt
INSERT INTO users (id, email, password_hash, name, role, phone, is_active) VALUES
('usr_admin1', 'admin@khochuan.com', '$2a$10$xVqYLGUuJ3iMCVZxOZeALOVVPvdWnzRKJkYl7e7JmY5/FyU0Z8XFm', 'Quản trị viên', 'admin', '+84901234567', 1),
('usr_cashier1', 'cashier@khochuan.com', '$2a$10$xVqYLGUuJ3iMCVZxOZeALOVVPvdWnzRKJkYl7e7JmY5/FyU0Z8XFm', 'Thu ngân', 'cashier', '+84901234568', 1),
('usr_staff1', 'staff@khochuan.com', '$2a$10$xVqYLGUuJ3iMCVZxOZeALOVVPvdWnzRKJkYl7e7JmY5/FyU0Z8XFm', 'Nhân viên bán hàng', 'staff', '+84901234569', 1),
('usr_customer1', 'customer@khochuan.com', '$2a$10$xVqYLGUuJ3iMCVZxOZeALOVVPvdWnzRKJkYl7e7JmY5/FyU0Z8XFm', 'Nguyễn Văn Khách', 'customer', '+84901234570', 1);

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, description, icon, color, sort_order) VALUES
('cat_electronics', 'Điện tử', 'Các thiết bị điện tử', 'LaptopOutlined', '#1890ff', 1),
('cat_components', 'Linh kiện', 'Linh kiện máy tính', 'DesktopOutlined', '#52c41a', 2),
('cat_peripherals', 'Thiết bị ngoại vi', 'Chuột, bàn phím, màn hình', 'ControlOutlined', '#722ed1', 3),
('cat_networking', 'Mạng', 'Thiết bị mạng', 'WifiOutlined', '#fa8c16', 4),
('cat_accessories', 'Phụ kiện', 'Phụ kiện máy tính', 'AppstoreOutlined', '#eb2f96', 5);

-- 3. SEED PRODUCTS
INSERT INTO products (id, sku, name, description, category_id, price, cost_price, stock_quantity, reorder_level, barcode, image_url, is_active) VALUES
('prod_laptop1', 'SKU-L001', 'Laptop Dell XPS 13', 'Laptop Dell XPS 13 - Core i7, 16GB RAM, 512GB SSD', 'cat_electronics', 25000000, 22000000, 15, 5, 'BARCODE-L001', 'https://example.com/images/dell-xps-13.jpg', 1),
('prod_laptop2', 'SKU-L002', 'Laptop HP Spectre', 'Laptop HP Spectre - Core i5, 8GB RAM, 256GB SSD', 'cat_electronics', 19000000, 16000000, 10, 3, 'BARCODE-L002', 'https://example.com/images/hp-spectre.jpg', 1),
('prod_monitor1', 'SKU-M001', 'Màn hình Dell P2419H', 'Màn hình Dell P2419H 24 inch IPS', 'cat_peripherals', 4500000, 3800000, 20, 5, 'BARCODE-M001', 'https://example.com/images/dell-p2419h.jpg', 1),
('prod_mouse1', 'SKU-MO001', 'Chuột Logitech G Pro', 'Chuột gaming Logitech G Pro Wireless', 'cat_peripherals', 2800000, 2300000, 30, 10, 'BARCODE-MO001', 'https://example.com/images/logitech-gpro.jpg', 1),
('prod_keyboard1', 'SKU-K001', 'Bàn phím Keychron K2', 'Bàn phím cơ Keychron K2 Wireless', 'cat_peripherals', 2100000, 1700000, 25, 8, 'BARCODE-K001', 'https://example.com/images/keychron-k2.jpg', 1),
('prod_ram1', 'SKU-R001', 'RAM Kingston 16GB', 'RAM Kingston 16GB DDR4 3200MHz', 'cat_components', 1500000, 1200000, 50, 15, 'BARCODE-R001', 'https://example.com/images/kingston-ram.jpg', 1),
('prod_ssd1', 'SKU-S001', 'SSD Samsung 970 EVO', 'SSD Samsung 970 EVO 500GB NVMe', 'cat_components', 2300000, 1900000, 40, 10, 'BARCODE-S001', 'https://example.com/images/samsung-970evo.jpg', 1),
('prod_router1', 'SKU-RT001', 'Router ASUS RT-AX86U', 'Router ASUS RT-AX86U Wifi 6', 'cat_networking', 5500000, 4800000, 12, 4, 'BARCODE-RT001', 'https://example.com/images/asus-router.jpg', 1),
('prod_case1', 'SKU-PC001', 'Vỏ máy tính NZXT H510', 'Vỏ máy tính NZXT H510 ATX', 'cat_components', 1800000, 1500000, 15, 5, 'BARCODE-PC001', 'https://example.com/images/nzxt-h510.jpg', 1),
('prod_headset1', 'SKU-H001', 'Tai nghe HyperX Cloud II', 'Tai nghe gaming HyperX Cloud II', 'cat_accessories', 2000000, 1600000, 18, 6, 'BARCODE-H001', 'https://example.com/images/hyperx-cloud2.jpg', 1);

-- 4. SEED CUSTOMERS
INSERT INTO customers (id, name, email, phone, address, city, postal_code, loyalty_points, total_spent, visit_count) VALUES
('cust_01', 'Nguyễn Văn A', 'nguyenvana@example.com', '+84901111222', '123 Đường Lê Lợi', 'TP.HCM', '700000', 250, 12500000, 5),
('cust_02', 'Trần Thị B', 'tranthib@example.com', '+84902222333', '456 Đường Nguyễn Huệ', 'TP.HCM', '700000', 180, 8700000, 3),
('cust_03', 'Lê Văn C', 'levanc@example.com', '+84903333444', '789 Đường Lý Tự Trọng', 'TP.HCM', '700000', 320, 15800000, 7),
('cust_04', 'Phạm Thị D', 'phamthid@example.com', '+84904444555', '101 Đường Hai Bà Trưng', 'Hà Nội', '100000', 150, 6500000, 2),
('cust_05', 'Hoàng Văn E', 'hoangvane@example.com', '+84905555666', '202 Đường Trần Hưng Đạo', 'Đà Nẵng', '550000', 210, 9800000, 4);

-- 5. SEED PAYMENT METHODS
INSERT INTO payment_methods (id, name, type, is_active, processing_fee, icon) VALUES
('pm_cash', 'Tiền mặt', 'cash', 1, 0, 'DollarOutlined'),
('pm_visa', 'Thẻ Visa/Master', 'card', 1, 2.5, 'CreditCardOutlined'),
('pm_momo', 'Ví MoMo', 'digital_wallet', 1, 1.5, 'WalletOutlined'),
('pm_vnpay', 'VNPay', 'digital_wallet', 1, 1.8, 'QrcodeOutlined'),
('pm_zalopay', 'ZaloPay', 'digital_wallet', 1, 1.5, 'MobileOutlined');

-- 6. SEED BADGES (Gamification)
INSERT INTO badges (id, name, description, icon, rarity, points, criteria) VALUES
('badge_sales_rookie', 'Nhân viên mới', 'Hoàn thành 5 đơn hàng đầu tiên', 'TrophyOutlined', 'common', 50, '{"type": "sales_count", "value": 5, "condition": "gte"}'),
('badge_sales_pro', 'Chuyên gia bán hàng', 'Hoàn thành 50 đơn hàng', 'CrownOutlined', 'rare', 100, '{"type": "sales_count", "value": 50, "condition": "gte"}'),
('badge_sales_master', 'Bậc thầy bán hàng', 'Hoàn thành 200 đơn hàng', 'StarOutlined', 'epic', 200, '{"type": "sales_count", "value": 200, "condition": "gte"}'),
('badge_revenue_1m', 'Doanh thu 1 triệu', 'Đạt doanh thu 1 triệu VNĐ', 'RiseOutlined', 'common', 50, '{"type": "sales_revenue", "value": 1000000, "condition": "gte"}'),
('badge_revenue_10m', 'Doanh thu 10 triệu', 'Đạt doanh thu 10 triệu VNĐ', 'FireOutlined', 'rare', 100, '{"type": "sales_revenue", "value": 10000000, "condition": "gte"}'),
('badge_revenue_100m', 'Doanh thu 100 triệu', 'Đạt doanh thu 100 triệu VNĐ', 'ThunderboltOutlined', 'legendary', 500, '{"type": "sales_revenue", "value": 100000000, "condition": "gte"}'),
('badge_streak_7', 'Chuỗi 7 ngày', 'Bán hàng liên tục 7 ngày', 'CalendarOutlined', 'common', 70, '{"type": "daily_streak", "value": 7, "condition": "gte"}'),
('badge_streak_30', 'Chuỗi 30 ngày', 'Bán hàng liên tục 30 ngày', 'HistoryOutlined', 'epic', 300, '{"type": "daily_streak", "value": 30, "condition": "gte"}');

-- 7. SEED CHALLENGES
INSERT INTO challenges (id, title, description, type, target_value, reward_points, start_date, end_date) VALUES
('challenge_daily_1', 'Bán 5 sản phẩm', 'Bán ít nhất 5 sản phẩm trong ngày', 'daily', 5, 50, date('now'), date('now', '+1 day')),
('challenge_daily_2', 'Doanh thu 5 triệu', 'Đạt doanh thu 5 triệu trong ngày', 'daily', 5000000, 80, date('now'), date('now', '+1 day')),
('challenge_weekly_1', 'Bán 20 sản phẩm', 'Bán ít nhất 20 sản phẩm trong tuần', 'weekly', 20, 150, date('now'), date('now', '+7 day')),
('challenge_weekly_2', 'Doanh thu 20 triệu', 'Đạt doanh thu 20 triệu trong tuần', 'weekly', 20000000, 200, date('now'), date('now', '+7 day')),
('challenge_monthly_1', 'Bán 100 sản phẩm', 'Bán ít nhất 100 sản phẩm trong tháng', 'monthly', 100, 500, date('now'), date('now', '+30 day')),
('challenge_monthly_2', 'Doanh thu 100 triệu', 'Đạt doanh thu 100 triệu trong tháng', 'monthly', 100000000, 1000, date('now'), date('now', '+30 day'));

-- 8. SEED SETTINGS
INSERT INTO settings (id, key, value, type, description, is_public) VALUES
('setting_company_name', 'company_name', 'Trường Phát Computer', 'string', 'Tên công ty', 1),
('setting_company_address', 'company_address', '123 Đường Lê Lợi, Quận 1, TP.HCM', 'string', 'Địa chỉ công ty', 1),
('setting_company_phone', 'company_phone', '+84901234567', 'string', 'Số điện thoại công ty', 1),
('setting_company_email', 'company_email', 'info@truongphatcomputer.com', 'string', 'Email công ty', 1),
('setting_company_website', 'company_website', 'https://truongphatcomputer.com', 'string', 'Website công ty', 1),
('setting_tax_rate', 'tax_rate', '8', 'number', 'Thuế suất mặc định (%)', 1),
('setting_currency', 'currency', 'VND', 'string', 'Đơn vị tiền tệ', 1),
('setting_currency_symbol', 'currency_symbol', '₫', 'string', 'Ký hiệu tiền tệ', 1),
('setting_loyalty_points_ratio', 'loyalty_points_ratio', '1000', 'number', 'Số tiền để đổi 1 điểm thưởng', 1),
('setting_loyalty_redeem_ratio', 'loyalty_redeem_ratio', '100', 'number', 'Giá trị của 1 điểm thưởng (VND)', 1),
('setting_receipt_header', 'receipt_header', 'Trường Phát Computer - Chuyên linh kiện máy tính', 'string', 'Tiêu đề hóa đơn', 0),
('setting_receipt_footer', 'receipt_footer', 'Cảm ơn quý khách đã mua hàng!', 'string', 'Chân trang hóa đơn', 0),
('setting_gamification_enabled', 'gamification_enabled', 'true', 'boolean', 'Bật/tắt tính năng gamification', 0),
('setting_ai_recommendations', 'ai_recommendations', 'true', 'boolean', 'Bật/tắt đề xuất AI', 0),
('setting_theme', 'theme', '{"primaryColor":"#1890ff","secondaryColor":"#52c41a","darkMode":false}', 'json', 'Cài đặt giao diện', 1);