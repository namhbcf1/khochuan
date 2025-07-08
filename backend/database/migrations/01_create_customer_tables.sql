-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookup
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price REAL NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  shipping_address TEXT,
  shipping_fee REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_at TIMESTAMP,
  shipped_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create index on customer_id for faster lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  serial_number TEXT,
  warranty_months INTEGER DEFAULT 0,
  warranty_expiry TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_serial_number ON order_items(serial_number);

-- Create staff_scores table for gamification
CREATE TABLE IF NOT EXISTS staff_scores (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  badge TEXT,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  season TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create logs table for activity tracking
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  ref_id TEXT,
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 