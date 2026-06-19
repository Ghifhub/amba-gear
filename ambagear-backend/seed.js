const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  { 
    name: 'Logitech G403 HERO', 
    category: 'mouse', 
    brand: 'Logitech', 
    price: 699000, 
    description: 'Didesain untuk kenyamanan, G403 dibuat berkontur dengan pegangan karet untuk kontrol tambahan. Sensor HERO 25K memungkinkanmu untuk menelusuri dengan sangat akurat. Full-spectrum LIGHTSYNC RGB dan 6 tombol yang dapat diprogram membuatmu memegang kendali.', 
    specs: `<div class="specs-content">
  <div class="spec-group">
    <h4>Dimensi</h4>
    <ul>
      <li>Tinggi: 43 mm</li>
      <li>Lebar: 68 mm</li>
      <li>Panjang: 124 mm</li>
      <li>Berat: 87.3 g</li>
    </ul>
  </div>
  <div class="spec-group">
    <h4>Spesifikasi Teknis</h4>
    <p><strong>Spesifikasi Umum</strong></p>
    <ul>
      <li>Jumlah Tombol: 6 tombol yang dapat diprogram</li>
      <li>Teknologi Tombol: Sistem Pengencangan Tombol Mekanik</li>
      <li>Resolusi: 100 – 25.600 DPI</li>
      <li>LIGHTSYNC RGB: Memerlukan Software Logitech G HUB</li>
      <li>Pemberat ekstra opsional: 10 g</li>
      <li>Panjang kabel: 2,1 m</li>
      <li>Pegangan samping karet dual-injected: Ya</li>
    </ul>
    <p><strong>Pelacakan</strong></p>
    <ul>
      <li>Sensor: HERO 25K</li>
      <li>Resolusi - Penelusuran: 100 – 25.600 DPI</li>
      <li>Akselerasi maks.: Diuji pada lebih dari 40 G *Diuji di Logitech G240 Gaming Mouse Pad</li>
      <li>Kecepatan maks.: Diuji pada lebih dari 400 IPS *Diuji di Logitech G240 Gaming Mouse Pad</li>
    </ul>
    <p><strong>Daya tanggap</strong></p>
    <ul>
      <li>Format data USB: 16 bit/sumbu</li>
      <li>Report rate USB: 1000Hz (1ms)</li>
      <li>Mikroprosesor: 32-bit ARM</li>
    </ul>
  </div>
  <div class="spec-group">
    <h4>Persyaratan Sistem</h4>
    <ul>
      <li>Windows® 7 atau versi terbaru</li>
      <li>macOS 10.11 atau versi terbaru</li>
      <li>Port USB</li>
      <li>Koneksi internet untuk pengunduhan software opsional</li>
    </ul>
  </div>
  <div class="spec-group">
    <h4>Informasi Garansi</h4>
    <p>Garansi Hardware Terbatas 2 Tahun</p>
  </div>
  <div class="spec-group">
    <h4>Nomor Komponen</h4>
    <p>Hitam : 910-005634</p>
  </div>
</div>`, 
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', 
    rating: 4.8, 
    reviews_count: 128, 
    badge: 'HOT' 
  },
  { name: 'Rexus Daxa Air III', category: 'mouse', brand: 'Rexus', price: 599000, description: 'Mouse gaming ringan dengan sensor akurat untuk performa optimal.', specs: 'Sensor PAW3370 • Wireless • 72g', image_url: 'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?w=400', rating: 4.6, reviews_count: 85, badge: null },
  { name: 'HyperX Pulsefire Dart', category: 'mouse', brand: 'HyperX', price: 1399000, description: 'Mouse gaming wireless premium dengan kenyamanan maksimal.', specs: 'Sensor Pixart 3389 • Wireless Qi Charging', image_url: 'https://images.unsplash.com/photo-1610735843870-9ebfa8e09e42?w=400', rating: 4.7, reviews_count: 92, badge: 'SALE' },
  { name: 'Logitech G915 TKL', category: 'keyboard', brand: 'Logitech', price: 2499000, description: 'Mechanical keyboard wireless premium, ultra-tipis.', specs: 'Lightspeed Wireless • Low Profile • RGB', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', rating: 4.9, reviews_count: 156, badge: 'HOT' },
  { name: 'Rexus Daiva', category: 'keyboard', brand: 'Rexus', price: 799000, description: 'Keyboard mekanikal kokoh dengan pencahayaan RGB.', specs: 'Outemu Switch • Full Size • RGB', image_url: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400', rating: 4.5, reviews_count: 64, badge: null },
  { name: 'HyperX Alloy Origins', category: 'keyboard', brand: 'HyperX', price: 1299000, description: 'Mechanical keyboard gaming dengan switch kustom.', specs: 'HyperX Red Switch • TKL • RGB', image_url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400', rating: 4.8, reviews_count: 112, badge: null },
  { name: 'Logitech G Pro X', category: 'headset', brand: 'Logitech', price: 1499000, description: 'Gaming headset dengan teknologi Blue VO!CE.', specs: '7.1 Surround • Detachable Mic • USB', image_url: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400', rating: 4.8, reviews_count: 203, badge: null },
  { name: 'Rexus Thundervox', category: 'headset', brand: 'Rexus', price: 499000, description: 'Headset gaming virtual 7.1 dengan bass tebal.', specs: 'Virtual 7.1 • RGB • Braided Cable', image_url: 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400', rating: 4.4, reviews_count: 150, badge: 'SALE' },
  { name: 'HyperX Cloud II', category: 'headset', brand: 'HyperX', price: 999000, description: 'Headset legendaris dengan kenyamanan busa memory foam.', specs: '7.1 Surround • Memory Foam • USB', image_url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 4.9, reviews_count: 310, badge: 'HOT' }
];

async function seed() {
  try {
    console.log('Deleting existing products...');
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
      console.error('Error deleting products:', deleteError);
      process.exit(1);
    }
    
    console.log('Inserting 9 new products...');
    const { error: insertError } = await supabase.from('products').insert(products);
    if (insertError) {
      console.error('Error inserting products:', insertError);
      process.exit(1);
    }

    console.log('Successfully seeded 9 products!');
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    process.exit(1);
  }
}

seed();
