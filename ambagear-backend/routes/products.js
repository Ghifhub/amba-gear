const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

const fallbackProducts = [
  { id: '1', name: 'Logitech G403 HERO', category: 'mouse', brand: 'Logitech', price: 699000, description: 'Didesain untuk kenyamanan, G403 dibuat berkontur dengan pegangan karet untuk kontrol tambahan. Sensor HERO 25K memungkinkanmu untuk menelusuri dengan sangat akurat.', rating: 4.8, reviews_count: 128, badge: 'HOT', image_url: 'assets/logitech_g403_hero_tampak_atas-removebg.png', stok: 15, jumlah_view: 312, status_produk: 'tersedia' },
  { id: '2', name: 'DAXA Air IV Pro Wireless Gen 2', category: 'mouse', brand: 'Rexus', price: 599000, description: 'Mouse gaming Wireless Gen 2 dengan sensor Pixart PAW3395 26.000 DPI. Dilengkapi switch Kailh GM 8.0, baterai tahan lama ±44 jam, dan 4 pilihan casing eksklusif.', rating: 4.6, reviews_count: 85, image_url: 'assets/rexus_daxa_air_3_tampak_atas-removebg.png', stok: 8, jumlah_view: 198, status_produk: 'tersedia' },
  { id: '3', name: 'HyperX Pulsefire Dart', category: 'mouse', brand: 'HyperX', price: 1399000, description: 'Mouse gaming wireless premium dengan koneksi 2.4GHz RF (1ms response) dan daya tahan baterai hingga 50 jam. Didesain ergonomis dengan side grips leatherette empuk.', rating: 4.7, reviews_count: 92, badge: 'SALE', image_url: 'assets/hyperx_pulsefire_dart_top_view-removebg.png', stok: 5, jumlah_view: 241, status_produk: 'tersedia' },
  { id: '4', name: 'Logitech G915 TKL', category: 'keyboard', brand: 'Logitech', price: 2499000, description: 'Keyboard mekanikal wireless premium ultra-tipis dengan teknologi Lightspeed Wireless 1ms dan RGB LIGHTSYNC.', rating: 4.9, reviews_count: 156, badge: 'HOT', image_url: 'assets/Logitech_g915_tkl-removebg-preview.png', stok: 10, jumlah_view: 489, status_produk: 'tersedia' },
  { id: '5', name: 'Rexus Daiva', category: 'keyboard', brand: 'Rexus', price: 799000, description: 'Keyboard mekanikal TKL yang kokoh dengan switch Outemu dan pencahayaan RGB yang bisa dikustomisasi.', rating: 4.5, reviews_count: 64, image_url: 'assets/Rexus_daiva-removebg-preview.png', stok: 12, jumlah_view: 134, status_produk: 'tersedia' },
  { id: '6', name: 'HyperX Alloy Origins', category: 'keyboard', brand: 'HyperX', price: 1299000, description: 'Keyboard gaming ringkas dengan switch mekanikal HyperX kustom dan bodi full aluminum. Software HyperX NGENUITY, kabel detachable USB-C.', rating: 4.8, reviews_count: 112, image_url: 'assets/HyperX_Alloy_Origins-removebg-preview.png', stok: 7, jumlah_view: 267, status_produk: 'tersedia' },
  { id: '7', name: 'Logitech G Pro X', category: 'headset', brand: 'Logitech', price: 1499000, description: 'Headset gaming kelas profesional dengan teknologi mikrofon Blue VO!CE untuk komunikasi yang jernih. Driver PRO-G 50mm, DTS Headphone:X 2.0 surround sound.', rating: 4.8, reviews_count: 203, image_url: 'assets/Logitech G Refurbished PRO X 2 LIGHTSPEED.png', stok: 6, jumlah_view: 378, status_produk: 'tersedia' },
  { id: '8', name: 'Rexus Thundervox HX25', category: 'headset', brand: 'Rexus', price: 499000, description: 'Headset gaming virtual 7.1 dengan driver 50mm yang menghasilkan suara bass mendalam dan detail. Earpad Protein Leather nyaman, LED RGB Breathing effect.', rating: 4.4, reviews_count: 150, badge: 'SALE', image_url: 'assets/Rexus Thundervox HX25.png', stok: 20, jumlah_view: 156, status_produk: 'tersedia' },
  { id: '9', name: 'HyperX Cloud II', category: 'headset', brand: 'HyperX', price: 999000, description: 'Headset gaming legendaris dengan busa memory foam yang sangat nyaman untuk sesi gaming lama. Virtual 7.1 surround sound, noise-cancelling detachable mic, frame solid aluminum.', rating: 4.9, reviews_count: 310, badge: 'HOT', image_url: 'assets/HyperX Cloud II Gaming Headset.png', stok: 9, jumlah_view: 521, status_produk: 'tersedia' }
];

function getMockProducts(category) {
  if (category) {
    return fallbackProducts.filter(p => p.category === category);
  }
  return fallbackProducts;
}

// Get All Products
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase offline, using fallback products:', error.message);
      return res.json(getMockProducts(category));
    }
    res.json(data);
  } catch (error) {
    console.warn('Supabase offline, using fallback products:', error.message);
    res.json(getMockProducts(category));
  }
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id);

    if (error) {
      const mock = fallbackProducts.find(p => p.id == req.params.id);
      if (mock) return res.json(mock);
      return res.status(400).json({ error: error.message });
    }
    if (!data.length) {
      const mock = fallbackProducts.find(p => p.id == req.params.id);
      if (mock) return res.json(mock);
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data[0]);
  } catch (error) {
    const mock = fallbackProducts.find(p => p.id == req.params.id);
    if (mock) return res.json(mock);
    res.status(500).json({ error: error.message });
  }
});

// Create Product (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create products' });
    }

    const { name, category, brand, price, description, image_url, badge } = req.body;

    if (!name || !category || !brand || !price) {
      return res.status(400).json({ error: 'Name, category, brand, and price are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, category, brand, price, description, image_url, badge }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Product created', product: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Product (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update products' });
    }

    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product updated', product: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete products' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;