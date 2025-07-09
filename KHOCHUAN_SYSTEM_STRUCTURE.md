# Kiến trúc Hệ thống POS Thông minh - Khochuan

## 📁 Cấu trúc Hệ thống

```
khochuan/
├── 🔧 backend/                       # Backend API & Server
│   ├── database/                    # Database migrations & schema
│   │   ├── migrations/              # Database migration scripts
│   │   ├── schema.sql               # Database schema
│   │   └── seed.sql                 # Seed data
│   ├── docs/                        # API documentation
│   │   ├── api-endpoints.md         # API endpoints documentation
│   │   └── deployment.md            # Deployment instructions
│   ├── migrations/                  # Migration scripts
│   │   ├── 0001_create_users_table.sql
│   │   ├── 0002_create_products_table.sql
│   │   ├── 0003_create_orders_table.sql
│   │   └── [17+ migration files]
│   ├── src/                         # Source code
│   │   ├── ai/                      # AI services
│   │   │   ├── customerSegmentation.js
│   │   │   ├── demandForecasting.js
│   │   │   ├── priceOptimization.js
│   │   │   ├── recommendationEngine.js
│   │   │   └── salesPrediction.js
│   │   ├── controllers/             # Request controllers
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   ├── reportController.js
│   │   │   ├── settingsController.js
│   │   │   ├── staffController.js
│   │   │   ├── supplierController.js
│   │   │   └── userController.js
│   │   ├── middleware/              # Middleware
│   │   │   ├── auth.js
│   │   │   ├── cache.js
│   │   │   ├── cors.js
│   │   │   ├── errorHandler.js
│   │   │   ├── logger.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/                  # API routes
│   │   │   ├── ai.js
│   │   │   ├── analytics.js
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── dashboard.js
│   │   │   ├── ecommerce.js
│   │   │   ├── gamification.js
│   │   │   ├── index.js
│   │   │   ├── inventory.js
│   │   │   ├── orders.js
│   │   │   ├── products.js
│   │   │   ├── reports.js
│   │   │   └── users.js
│   │   ├── services/                # Business logic
│   │   │   ├── aiService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── authService.js
│   │   │   ├── customerService.js
│   │   │   ├── emailService.js
│   │   │   ├── ecommerceService.js
│   │   │   ├── gamificationService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── notificationService.js
│   │   │   ├── orderService.js
│   │   │   ├── paymentService.js
│   │   │   ├── productService.js
│   │   │   ├── reportService.js
│   │   │   ├── smsService.js
│   │   │   ├── staffService.js
│   │   │   └── userService.js
│   │   ├── utils/                   # Utilities
│   │   │   ├── calculations.js
│   │   │   ├── constants.js
│   │   │   ├── cors.js
│   │   │   ├── database.js
│   │   │   ├── encryption.js
│   │   │   ├── formatters.js
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── webhooks.js
│   │   ├── websocket/               # WebSocket
│   │   │   ├── connectionManager.js
│   │   │   ├── notifications.js
│   │   │   ├── realTimeUpdates.js
│   │   │   └── wsServer.js
│   │   └── index.js                 # Main entry point
│   ├── Dockerfile                   # Docker configuration
│   ├── env.example                  # Environment variables example
│   ├── package.json                 # Dependencies
│   ├── server.js                    # Server startup
│   └── wrangler.toml                # Cloudflare configuration
│
└── 🎨 frontend/                     # Frontend client application
    ├── public/                      # Static public assets
    ├── src/                         # Source code
    │   └── [Detailed frontend structure below]
    ├── _headers                     # Netlify/CF headers
    ├── _redirects                   # Netlify/CF redirects
    ├── env.example                  # Environment variables example
    ├── index.html                   # HTML entry
    ├── package.json                 # Dependencies
    ├── tests/                       # Test files
    └── vite.config.js               # Vite configuration
```

## 📁 Cấu trúc Chi tiết Frontend (src/)

```
frontend/src/
├── 🔐 auth/                          # Hệ thống xác thực & phân quyền
│   ├── AuthContext.jsx              # Context xác thực toàn cục
│   ├── ProtectedRoute.jsx           # Route bảo vệ theo role
│   ├── RoleBasedAccess.jsx          # Component kiểm soát quyền truy cập
│   └── permissions.js               # Ma trận phân quyền chi tiết
│
├── 🎨 components/                    # Components dùng chung
│   ├── common/                      # Components cơ bản
│   │   ├── Layout/
│   │   │   ├── AdminLayout.jsx      # Layout cho Admin
│   │   │   ├── CashierLayout.jsx    # Layout cho Thu ngân
│   │   │   └── StaffLayout.jsx      # Layout cho Nhân viên
│   │   ├── Header/
│   │   │   ├── index.jsx            # Header component
│   │   │   └── styles.css           # Header styles
│   │   ├── Sidebar/
│   │   │   ├── index.jsx            # Sidebar component
│   │   │   └── styles.css           # Sidebar styles
│   │   ├── Footer/
│   │   │   ├── index.jsx            # Footer component
│   │   │   └── styles.css           # Footer styles
│   │   ├── ErrorBoundary.jsx        # Error handling
│   │   └── LoadingSpinner.jsx       # Loading indicator
│   │
│   ├── ui/                          # UI Components tái sử dụng
│   │   ├── DataTable/               # Bảng dữ liệu nâng cao
│   │   │   ├── DataTable.jsx        # Main data table
│   │   │   └── index.jsx            # Export
│   │   ├── Charts/                  # Biểu đồ & visualizations
│   │   │   └── index.jsx            # Charts components
│   │   ├── Forms/                   # Form components
│   │   │   ├── FormBuilder.jsx      # Dynamic form builder
│   │   │   ├── FormField.jsx        # Form field
│   │   │   ├── FormValidation.jsx   # Form validation
│   │   │   ├── InputField.jsx       # Input field
│   │   │   ├── SelectField.jsx      # Select field
│   │   │   ├── CheckboxField.jsx    # Checkbox field
│   │   │   ├── RadioField.jsx       # Radio field
│   │   │   └── DatePicker.jsx       # Date picker
│   │   ├── Modals/                  # Modal components
│   │   │   ├── BaseModal.jsx        # Base modal
│   │   │   ├── ConfirmModal.jsx     # Confirmation modal
│   │   │   ├── DetailModal.jsx      # Detail modal
│   │   │   └── FormModal.jsx        # Form modal
│   │   ├── LoadingSpinner/          # Loading indicators
│   │   │   ├── LoadingSpinner.jsx   # Loading spinner
│   │   │   └── styles.css           # Loading spinner styles
│   │   └── Notifications/           # Thông báo & alerts
│   │       └── index.jsx            # Notification system
│   │
│   ├── Admin/                       # Admin components
│   │   └── Dashboard.jsx            # Admin dashboard
│   │
│   ├── Analytics/                   # Analytics components
│   │   └── ReportsView.jsx          # Reports view
│   │
│   ├── Customers/                   # Customer components
│   │   └── CustomerList.jsx         # Customer list
│   │
│   ├── Orders/                      # Orders components
│   │   └── OrderHistory.jsx         # Order history
│   │
│   ├── POS/                         # POS components
│   │   ├── CheckoutTerminal.jsx     # Checkout terminal
│   │   └── Terminal.jsx             # POS terminal
│   │
│   ├── Products/                    # Products components
│   │   └── ProductList.jsx          # Product list
│   │
│   ├── Staff/                       # Staff components
│   │   └── StaffDashboard.jsx       # Staff dashboard
│   │
│   └── features/                    # Feature-specific components
│       ├── ProductGrid/             # Lưới sản phẩm cho POS
│       │   └── index.jsx            # Product grid component
│       ├── Cart/                    # Giỏ hàng
│       │   └── index.jsx            # Cart component
│       ├── PaymentTerminal/         # Máy thanh toán
│       │   └── index.jsx            # Payment terminal component
│       ├── InventoryTracker/        # Theo dõi tồn kho real-time
│       │   └── index.jsx            # Inventory tracker component
│       ├── AIRecommendations/       # Gợi ý AI
│       │   └── index.jsx            # AI recommendations component
│       └── GamificationWidgets/     # Widgets game hóa
│           └── index.jsx            # Gamification widgets
│
├── 📱 pages/                        # Các trang chính theo role
│   ├── admin/                       # 🔑 Giao diện Quản trị viên
│   │   ├── Dashboard/
│   │   │   ├── AnalyticsDashboard.jsx  # Dashboard analytics
│   │   │   ├── RevenueOverview.jsx     # Revenue overview
│   │   │   └── PerformanceMetrics.jsx  # Performance metrics
│   │   ├── Products/
│   │   │   ├── ProductManagement.jsx   # Product management
│   │   │   ├── ProductForm.jsx         # Product form
│   │   │   ├── BulkOperations.jsx      # Bulk operations
│   │   │   └── PriceOptimization.jsx   # AI price optimization
│   │   ├── Inventory/
│   │   │   ├── InventoryDashboard.jsx  # Inventory dashboard
│   │   │   ├── StockMovements.jsx      # Stock movements
│   │   │   ├── DemandForecasting.jsx   # AI dự báo nhu cầu
│   │   │   └── WarehouseManagement.jsx # Warehouse management
│   │   ├── Orders/
│   │   │   ├── OrderManagement.jsx     # Order management
│   │   │   ├── OrderAnalytics.jsx      # Order analytics
│   │   │   └── ReturnProcessing.jsx    # Return processing
│   │   ├── Reports/
│   │   │   ├── ReportCenter.jsx        # Report center
│   │   │   ├── CustomReports.jsx       # Custom reports
│   │   │   ├── OmnichannelAnalytics.jsx # Omnichannel analytics
│   │   │   ├── BusinessIntelligence.jsx # Business intelligence
│   │   │   ├── InventoryReport.jsx     # Inventory report
│   │   │   ├── SalesReport.jsx         # Sales report
│   │   │   └── StaffReport.jsx         # Staff report
│   │   ├── Staff/
│   │   │   ├── StaffManagement.jsx     # Staff management
│   │   │   ├── PerformanceTracking.jsx # Performance tracking
│   │   │   ├── GamificationConfig.jsx  # Cấu hình game hóa
│   │   │   └── CommissionSettings.jsx  # Commission settings
│   │   ├── Customers/
│   │   │   ├── CustomerManagement.jsx  # Customer management
│   │   │   ├── LoyaltyPrograms.jsx     # Loyalty programs
│   │   │   ├── CustomerSegmentation.jsx # AI phân khúc khách hàng
│   │   │   ├── CustomerAnalytics.jsx   # Customer analytics
│   │   │   └── PersonalizationEngine.jsx # Personalization engine
│   │   ├── Integrations/
│   │   │   ├── EcommerceChannels.jsx   # Shopee, Lazada, Tiki
│   │   │   ├── PaymentGateways.jsx     # Payment gateways
│   │   │   ├── ThirdPartyApps.jsx      # Third-party apps
│   │   │   └── APIManagement.jsx       # API management
│   │   └── Settings/
│   │       ├── SystemSettings.jsx      # System settings
│   │       ├── UserRoles.jsx           # User roles
│   │       ├── SecuritySettings.jsx    # Security settings
│   │       ├── CompanyProfile.jsx      # Company profile
│   │       └── HardwareManager.jsx     # Hardware manager
│   │
│   ├── cashier/                     # 💰 Giao diện Thu ngân
│   │   ├── POS/
│   │   │   ├── POSTerminal.jsx      # Terminal chính
│   │   │   ├── ProductSelector.jsx  # Chọn sản phẩm
│   │   │   ├── CartManager.jsx      # Quản lý giỏ hàng
│   │   │   ├── PaymentProcessor.jsx # Xử lý thanh toán
│   │   │   ├── ReceiptPrinter.jsx   # In hóa đơn
│   │   │   ├── SmartSuggestions.jsx # Gợi ý AI bán thêm/chéo
│   │   │   └── POSTerminal.css      # POS terminal styles
│   │   ├── Orders/
│   │   │   ├── OrderHistory.jsx     # Lịch sử đơn hàng ca làm
│   │   │   ├── Returns.jsx          # Xử lý đổi trả
│   │   │   └── OrderTracking.jsx    # Order tracking
│   │   ├── Customers/
│   │   │   ├── CustomerLookup.jsx   # Tra cứu khách hàng
│   │   │   ├── LoyaltyPoints.jsx    # Điểm thưởng
│   │   │   └── MembershipCheck.jsx  # Membership check
│   │   └── Session/
│   │       ├── ShiftStart.jsx       # Mở ca
│   │       ├── ShiftEnd.jsx         # Đóng ca
│   │       ├── CashCount.jsx        # Kiểm đếm tiền
│   │       └── SessionReports.jsx   # Báo cáo ca làm
│   │
│   ├── staff/                       # 👥 Giao diện Nhân viên (Game hóa)
│   │   ├── Dashboard/
│   │   │   ├── PersonalDashboard.jsx    # Dashboard cá nhân
│   │   │   ├── PerformanceOverview.jsx  # Tổng quan hiệu suất
│   │   │   ├── CommissionTracker.jsx    # Theo dõi hoa hồng
│   │   │   └── GoalProgress.jsx         # Tiến độ mục tiêu
│   │   ├── Gamification/
│   │   │   ├── Leaderboard.jsx          # Bảng xếp hạng
│   │   │   ├── AchievementCenter.jsx    # Trung tâm thành tích
│   │   │   ├── BadgeCollection.jsx      # Bộ sưu tập huy hiệu
│   │   │   ├── ChallengeHub.jsx         # Trung tâm thử thách
│   │   │   ├── RewardStore.jsx          # Cửa hàng phần thưởng
│   │   │   └── TeamCompetitions.jsx     # Cuộc thi nhóm
│   │   ├── Sales/
│   │   │   ├── MySales.jsx              # Doanh số cá nhân
│   │   │   ├── SalesTargets.jsx         # Mục tiêu bán hàng
│   │   │   ├── ProductRecommendations.jsx # Sản phẩm nên bán
│   │   │   └── CustomerInsights.jsx     # Thông tin khách hàng
│   │   ├── Training/
│   │   │   ├── TrainingCenter.jsx       # Trung tâm đào tạo
│   │   │   ├── ProductKnowledge.jsx     # Kiến thức sản phẩm
│   │   │   ├── SalesSkills.jsx          # Kỹ năng bán hàng
│   │   │   └── Certifications.jsx       # Chứng chỉ
│   │   └── Profile/
│   │       ├── PersonalProfile.jsx      # Hồ sơ cá nhân
│   │       ├── PerformanceHistory.jsx   # Lịch sử hiệu suất
│   │       ├── CommissionHistory.jsx    # Lịch sử hoa hồng
│   │       └── Preferences.jsx          # Tùy chọn cá nhân
│   │
│   ├── customer/                    # 👤 Giao diện Khách hàng
│   │   ├── CustomerLookup.jsx       # Tra cứu thông tin
│   │   ├── QrLookup.jsx             # Tra cứu qua QR
│   │   └── Terms.jsx                # Điều khoản
│   │
│   ├── Dashboard.jsx                # Dashboard chung
│   ├── Analytics.jsx                # Analytics chung
│   ├── Customers.jsx                # Customers chung
│   ├── Orders.jsx                   # Orders chung
│   ├── Products.jsx                 # Products chung
│   ├── Settings.jsx                 # Settings chung
│   ├── Profile.jsx                  # Profile chung
│   ├── Login.jsx                    # Đăng nhập
│   └── Register.jsx                 # Đăng ký
│
├── 🤖 services/                     # Services & APIs
│   ├── api/                         # API clients
│   │   ├── auth.js                  # Authentication API
│   │   ├── products.js              # Products API
│   │   ├── orders.js                # Orders API
│   │   ├── inventory.js             # Inventory API
│   │   ├── customers.js             # Customers API
│   │   ├── analytics.js             # Analytics API
│   │   ├── gamification.js          # Gamification API
│   │   └── integrations.js          # Integrations API
│   │
│   ├── api.js                       # API base service
│   │
│   ├── ai/                          # AI Services
│   │   ├── demandForecasting.js     # Dự báo nhu cầu
│   │   ├── recommendationEngine.js  # Engine gợi ý
│   │   ├── priceOptimization.js     # Tối ưu giá
│   │   ├── customerSegmentation.js  # Phân khúc khách hàng
│   │   └── salesPrediction.js       # Dự đoán bán hàng
│   │
│   ├── hardware/                    # Hardware integrations
│   │   ├── printerService.js        # Dịch vụ máy in
│   │   ├── barcodeScanner.js        # Máy quét mã vạch
│   │   ├── cashDrawer.js            # Ngăn kéo tiền
│   │   └── paymentTerminal.js       # Terminal thanh toán
│   │
│   ├── ecommerce/                   # E-commerce integrations
│   │   ├── shopeeIntegration.js     # Tích hợp Shopee
│   │   ├── lazadaIntegration.js     # Tích hợp Lazada
│   │   ├── tikiIntegration.js       # Tích hợp Tiki
│   │   └── unifiedCommerce.js       # Thương mại hợp nhất
│   │
│   └── notifications/               # Notification services
│       ├── realTimeUpdates.js       # Cập nhật thời gian thực
│       ├── pushNotifications.js     # Push notifications
│       ├── emailService.js          # Dịch vụ email
│       └── smsService.js            # Dịch vụ SMS
│
├── 🛠️ utils/                        # Utilities & Helpers
│   ├── constants/                   # Constants
│   │   ├── roles.js                 # Định nghĩa roles
│   │   ├── permissions.js           # Ma trận quyền
│   │   ├── gameRules.js             # Quy tắc game hóa
│   │   └── businessRules.js         # Quy tắc kinh doanh
│   │
│   ├── constants.js                 # Global constants
│   │
│   ├── helpers/                     # Helper functions
│   │   ├── formatters.js            # Định dạng dữ liệu
│   │   ├── validators.js            # Validation
│   │   ├── calculators.js           # Tính toán (hoa hồng, thuế)
│   │   ├── dateUtils.js             # Utilities ngày tháng
│   │   ├── encryption.js            # Mã hóa
│   │   ├── analyticsUtils.js        # Analytics utilities
│   │   ├── authUtils.js             # Authentication utilities
│   │   └── cacheUtils.js            # Cache utilities
│   │
│   ├── helpers.js                   # Global helpers
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useAuth.js               # Hook xác thực
│   │   ├── usePermissions.js        # Hook phân quyền
│   │   ├── useRealTime.js           # Hook real-time data
│   │   ├── useLocalStorage.js       # Hook local storage
│   │   ├── useGameification.js      # Hook game hóa
│   │   ├── useAI.js                 # Hook AI services
│   │   └── useWebSocket.js          # WebSocket hook
│   │
│   ├── context/                     # Context providers
│   │   ├── AppContext.jsx           # Context toàn cục
│   │   ├── ThemeContext.jsx         # Context theme
│   │   ├── GameContext.jsx          # Context game hóa
│   │   └── CartContext.jsx          # Context giỏ hàng
│   │
│   └── validations.js               # Validation utilities
│
├── 🎨 styles/                       # Styles & Themes
│   ├── global.css                   # Global styles
│   ├── animations.css               # Animation styles
│   ├── components.css               # Components styles
│   ├── components/                  # Component styles
│   │   └── index.css                # Component index styles
│   └── themes/                      # Themes
│       ├── adminTheme.css           # Admin theme
│       ├── cashierTheme.css         # Cashier theme
│       └── staffTheme.css           # Staff theme
│
├── 📦 assets/                       # Static assets
│   ├── images/                      # Images
│   │   └── placeholder.png          # Placeholder image
│   ├── icons/                       # Icons
│   │   └── placeholder.svg          # Placeholder icon
│   ├── sounds/                      # Sound effects
│   │   └── placeholder.mp3          # Placeholder sound
│   └── animations/                  # Animations
│       └── placeholder.json         # Placeholder animation
│
├── 🧪 __tests__/                    # Tests
│   ├── components/                  # Component tests
│   │   └── placeholder.test.js      # Placeholder test
│   ├── pages/                       # Page tests
│   │   └── placeholder.test.js      # Placeholder test
│   ├── services/                    # Service tests
│   │   └── placeholder.test.js      # Placeholder test
│   └── utils/                       # Utility tests
│       └── placeholder.test.js      # Placeholder test
│
├── App.jsx                          # Root component
├── index.js                         # Entry point
├── index.css                        # Root styles
└── routes.jsx                       # Route definitions
```

## 🔑 Ma trận Phân quyền Chi tiết

### Admin (Quản trị viên)
- ✅ **Toàn quyền** trên tất cả modules
- 🎯 Dashboard BI toàn diện
- 🤖 Cấu hình AI/ML
- ⚙️ Quản lý hệ thống
- 📊 Báo cáo nâng cao
- 👥 Quản lý nhân viên
- 📱 Quản lý kênh bán hàng

### Cashier (Thu ngân)
- ✅ **POS Terminal**
- 🛒 Xử lý đơn hàng
- 👤 Tra cứu khách hàng
- 🧾 In hóa đơn
- 💰 Mở/đóng ca, kiểm tiền
- 📦 Kiểm tra tồn kho
- 🔄 Xử lý đổi/trả

### Staff (Nhân viên)
- ✅ **Dashboard cá nhân**
- 🎮 Hệ thống game hóa
- 📈 Hiệu suất cá nhân
- 🏆 Thành tích và thử thách
- 📊 Doanh số bán hàng
- 🎓 Đào tạo & chứng chỉ

## 📱 Giao diện người dùng theo vai trò

### Giao diện Admin
- Dashboard phân tích kinh doanh
- Quản lý sản phẩm & tồn kho
- Quản lý nhân viên & phân quyền
- Phân khúc khách hàng & tiếp thị
- Báo cáo & phân tích nâng cao
- Cài đặt hệ thống & tích hợp

### Giao diện Thu ngân
- Terminal bán hàng (POS)
- Quản lý đơn hàng & hóa đơn
- Xử lý thanh toán đa kênh
- Tra cứu thông tin khách hàng
- Quản lý ca làm việc

### Giao diện Nhân viên
- Dashboard cá nhân
- Hệ thống game hóa & thành tích
- Theo dõi hiệu suất & hoa hồng
- Đào tạo & phát triển kỹ năng 