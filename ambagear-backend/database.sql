-- ============================================
-- AMBA GEAR Database Schema - Full Update
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Table Users (sudah ada, skip jika sudah)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Categories (BARU)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Products (update + kolom baru)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('mouse', 'keyboard', 'headset')),
  brand VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  description TEXT,
  specs TEXT,
  image_url VARCHAR(500),
  rating DECIMAL(3, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  badge VARCHAR(50),
  stok INTEGER DEFAULT 0,
  jumlah_view INTEGER DEFAULT 0,
  status_produk VARCHAR(20) DEFAULT 'tersedia' CHECK (status_produk IN ('tersedia', 'habis', 'nonaktif')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jika kolom stok/view belum ada pada tabel products lama, tambahkan:
ALTER TABLE products ADD COLUMN IF NOT EXISTS stok INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS jumlah_view INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status_produk VARCHAR(20) DEFAULT 'tersedia';

-- Table WhatsApp Inquiries (BARU)
CREATE TABLE IF NOT EXISTS whatsapp_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_customer VARCHAR(255) NOT NULL,
  nomor_wa VARCHAR(20) NOT NULL,
  produk_diminati VARCHAR(255),
  pesan TEXT,
  tanggal_interaksi TIMESTAMP DEFAULT NOW(),
  status_follow_up VARCHAR(20) DEFAULT 'pending' CHECK (status_follow_up IN ('pending', 'diproses', 'selesai')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Website Analytics (BARU)
CREATE TABLE IF NOT EXISTS website_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  jumlah_pengunjung INTEGER DEFAULT 0,
  klik_wa INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: allow anon read for categories
CREATE POLICY IF NOT EXISTS "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow admin insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow admin update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow admin delete categories" ON categories FOR DELETE USING (true);

-- RLS Policies: allow all for inquiries (anon insert for customer, admin read/update/delete)
CREATE POLICY IF NOT EXISTS "Allow public insert inquiries" ON whatsapp_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow admin all inquiries" ON whatsapp_inquiries FOR ALL USING (true);

-- RLS Policies: analytics - admin full access
CREATE POLICY IF NOT EXISTS "Allow admin all analytics" ON website_analytics FOR ALL USING (true);

-- Seed Categories default
INSERT INTO categories (nama_kategori, deskripsi) VALUES
  ('mouse', 'Periferal mouse gaming dengan sensor tinggi, ergonomi, dan desain untuk kompetitif.'),
  ('keyboard', 'Keyboard mekanikal gaming dengan switch premium, RGB, dan ketahanan tinggi.'),
  ('headset', 'Headset gaming dengan audio surround, mikrofon jernih, dan kenyamanan panjang.')
ON CONFLICT (nama_kategori) DO NOTHING;

-- Seed Analytics dummy (7 hari terakhir)
INSERT INTO website_analytics (tanggal, jumlah_pengunjung, klik_wa, page_views) VALUES
  (CURRENT_DATE - 6, 142, 18, 521),
  (CURRENT_DATE - 5, 163, 22, 598),
  (CURRENT_DATE - 4, 118, 14, 407),
  (CURRENT_DATE - 3, 201, 31, 714),
  (CURRENT_DATE - 2, 178, 25, 633),
  (CURRENT_DATE - 1, 215, 38, 812),
  (CURRENT_DATE, 94, 12, 381)
ON CONFLICT (tanggal) DO NOTHING;

-- Seed WhatsApp Inquiries dummy
INSERT INTO whatsapp_inquiries (nama_customer, nomor_wa, produk_diminati, pesan, tanggal_interaksi, status_follow_up) VALUES
  ('Rizky Pratama', '081234567890', 'Logitech G403 HERO', 'Halo, masih tersedia? Berapa ongkir ke Surabaya?', NOW() - INTERVAL '2 days', 'selesai'),
  ('Dani Kusuma', '085798123456', 'Logitech G915 TKL', 'Min mau tanya, ini ada varian putih?', NOW() - INTERVAL '1 day', 'diproses'),
  ('Aisyah Nurul', '089671234567', 'HyperX Cloud II', 'Apakah compatible dengan PS5?', NOW() - INTERVAL '3 hours', 'pending'),
  ('Bagas Eko', '082345671234', 'Rexus Thundervox', 'Beli 2 bisa dapat diskon?', NOW() - INTERVAL '1 hour', 'pending'),
  ('Fajar Maulana', '081398765432', 'HyperX Pulsefire Dart', 'Garansi berapa lama gan?', NOW() - INTERVAL '5 hours', 'diproses')
ON CONFLICT DO NOTHING;

-- Seed Products (hapus lama, masukkan baru dengan stok)
-- Opsional: jalankan jika ingin reset semua produk dengan data terbaru
DELETE FROM products;
INSERT INTO products (name, category, brand, price, description, image_url, rating, reviews_count, badge, stok, jumlah_view, status_produk) VALUES
  ('Logitech G403 HERO', 'mouse', 'Logitech', 699000, 'Didesain untuk kenyamanan, G403 dibuat berkontur dengan pegangan karet untuk kontrol tambahan. Sensor HERO 25K memungkinkanmu untuk menelusuri dengan sangat akurat.', 'assets/logitech_g403_hero_tampak_atas-removebg.png', 4.8, 128, 'HOT', 15, 312, 'tersedia'),
  ('DAXA Air IV Pro Wireless Gen 2', 'mouse', 'Rexus', 599000, 'Mouse gaming Wireless Gen 2 dengan sensor Pixart PAW3395 26.000 DPI. Dilengkapi switch Kailh GM 8.0, baterai tahan lama ±44 jam, dan 4 pilihan casing eksklusif.', 'assets/rexus_daxa_air_3_tampak_atas-removebg.png', 4.6, 85, NULL, 8, 198, 'tersedia'),
  ('HyperX Pulsefire Dart', 'mouse', 'HyperX', 1399000, 'Mouse gaming wireless premium dengan koneksi 2.4GHz RF (1ms response) dan daya tahan baterai hingga 50 jam. Didesain ergonomis dengan side grips leatherette empuk.', 'assets/hyperx_pulsefire_dart_top_view-removebg.png', 4.7, 92, 'SALE', 5, 241, 'tersedia'),
  ('Logitech G915 TKL', 'keyboard', 'Logitech', 2499000, 'Keyboard mekanikal wireless premium ultra-tipis dengan teknologi Lightspeed Wireless 1ms dan RGB LIGHTSYNC. Material aircraft-grade aluminum alloy.', 'assets/Logitech_g915_tkl-removebg-preview.png', 4.9, 156, 'HOT', 10, 489, 'tersedia'),
  ('Rexus Daiva', 'keyboard', 'Rexus', 799000, 'Keyboard mekanikal TKL yang kokoh dengan switch Outemu dan pencahayaan RGB yang bisa dikustomisasi. Layout TKL 87 Keys.', 'assets/Rexus_daiva-removebg-preview.png', 4.5, 64, NULL, 12, 134, 'tersedia'),
  ('HyperX Alloy Origins', 'keyboard', 'HyperX', 1299000, 'Keyboard gaming ringkas dengan switch mekanikal HyperX kustom dan bodi full aluminum. Kabel detachable USB-C.', 'assets/HyperX_Alloy_Origins-removebg-preview.png', 4.8, 112, NULL, 7, 267, 'tersedia'),
  ('Logitech G Pro X', 'headset', 'Logitech', 1499000, 'Headset gaming kelas profesional dengan teknologi mikrofon Blue VO!CE untuk komunikasi yang jernih. Driver PRO-G 50mm, DTS Headphone:X 2.0 surround sound.', 'assets/Logitech G Refurbished PRO X 2 LIGHTSPEED.png', 4.8, 203, NULL, 6, 378, 'tersedia'),
  ('Rexus Thundervox HX25', 'headset', 'Rexus', 499000, 'Headset gaming virtual 7.1 dengan driver 50mm yang menghasilkan suara bass mendalam dan detail. LED RGB Breathing effect.', 'assets/Rexus Thundervox HX25.png', 4.4, 150, 'SALE', 20, 156, 'tersedia'),
  ('HyperX Cloud II', 'headset', 'HyperX', 999000, 'Headset gaming legendaris dengan busa memory foam yang sangat nyaman untuk sesi gaming lama. Virtual 7.1 surround sound, noise-cancelling detachable mic.', 'assets/HyperX Cloud II Gaming Headset.png', 4.9, 310, 'HOT', 9, 521, 'tersedia');