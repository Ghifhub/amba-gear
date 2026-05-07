-- AMBA GEAR Database Schema
-- Jalankan di Supabase SQL Editor

-- Table Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('mouse', 'keyboard', 'headset')),
  brand VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  description TEXT,
  specs TEXT,
  image_url VARCHAR(255),
  rating DECIMAL(3, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  badge VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Orders (optional, untuk future)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Sample Products Data
INSERT INTO products (name, category, brand, price, description, specs, image_url, rating, reviews_count, badge) VALUES
-- Mouse
('Logitech G Pro X Superlight', 'mouse', 'Logitech', 1299000, 'Mouse gaming wireless ultra-lightweight', 'Sensor HERO 25K • Wireless • 63g', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400', 4.8, 128, 'HOT'),
('Razer Viper Ultimate', 'mouse', 'Razer', 1499000, 'Mouse gaming wireless premium', 'Sensor Focus+ 20K • Wireless • RGB', 'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?w=400', 4.7, 94, NULL),
('SteelSeries Aerox 3', 'mouse', 'SteelSeries', 699000, 'Mouse gaming wireless ergonomic', 'Sensor TrueMove Pro • Wireless • 57g', 'https://images.unsplash.com/photo-1610735843870-9ebfa8e09e42?w=400', 4.5, 67, 'SALE'),

-- Keyboard
('Logitech G915 TKL', 'keyboard', 'Logitech', 2499000, 'Mechanical keyboard wireless premium', 'Lightspeed Wireless • Low Profile • RGB', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 4.9, 156, 'HOT'),
('Razer BlackWidow V3', 'keyboard', 'Razer', 1899000, 'Mechanical keyboard RGB', 'Green Switch • Full Size • RGB', 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400', 4.6, 89, NULL),
('HyperX Alloy Origins', 'keyboard', 'HyperX', 1299000, 'Mechanical keyboard gaming', 'Red Switch • TKL • RGB', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400', 4.4, 54, NULL),

-- Headset
('Logitech G Pro X', 'headset', 'Logitech', 1499000, 'Gaming headset 7.1 surround', '7.1 Surround • Detachable Mic • USB', 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400', 4.8, 203, NULL),
('Razer Kraken Ultimate', 'headset', 'Razer', 1799000, 'Gaming headset THX spatial audio', '7.1 Surround • THX • RGB', 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400', 4.7, 177, 'HOT'),
('HyperX Cloud II', 'headset', 'HyperX', 999000, 'Gaming headset comfort+', '7.1 Surround • Memory Foam • USB', 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', 4.3, 88, 'SALE');

-- Sample Admin User (password: admin123)
-- Password hash untuk 'admin123' (generate dengan bcrypt)
INSERT INTO users (email, password, name, role) VALUES
('admin@ambagear.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMhE6VyS', 'Admin AMBA', 'admin');