const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock analytics data (fallback jika Supabase offline)
const mockAnalytics = {
  summary: { total_products: 9, total_categories: 3, total_views: 2696, total_wa_clicks: 160, available_products: 9, out_of_stock: 0 },
  weekly: [
    { tanggal: new Date(Date.now() - 6*86400000).toISOString().split('T')[0], jumlah_pengunjung: 142, klik_wa: 18, page_views: 521 },
    { tanggal: new Date(Date.now() - 5*86400000).toISOString().split('T')[0], jumlah_pengunjung: 163, klik_wa: 22, page_views: 598 },
    { tanggal: new Date(Date.now() - 4*86400000).toISOString().split('T')[0], jumlah_pengunjung: 118, klik_wa: 14, page_views: 407 },
    { tanggal: new Date(Date.now() - 3*86400000).toISOString().split('T')[0], jumlah_pengunjung: 201, klik_wa: 31, page_views: 714 },
    { tanggal: new Date(Date.now() - 2*86400000).toISOString().split('T')[0], jumlah_pengunjung: 178, klik_wa: 25, page_views: 633 },
    { tanggal: new Date(Date.now() - 1*86400000).toISOString().split('T')[0], jumlah_pengunjung: 215, klik_wa: 38, page_views: 812 },
    { tanggal: new Date().toISOString().split('T')[0], jumlah_pengunjung: 94, klik_wa: 12, page_views: 381 }
  ],
  top_products: [
    { name: 'HyperX Cloud II', category: 'headset', jumlah_view: 521 },
    { name: 'Logitech G915 TKL', category: 'keyboard', jumlah_view: 489 },
    { name: 'Logitech G Pro X', category: 'headset', jumlah_view: 378 },
    { name: 'Logitech G403 HERO', category: 'mouse', jumlah_view: 312 },
    { name: 'HyperX Alloy Origins', category: 'keyboard', jumlah_view: 267 }
  ]
};

// GET dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const [prodRes, catRes, analyticsRes] = await Promise.all([
      supabase.from('products').select('id, status_produk, stok'),
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('website_analytics').select('klik_wa').gte('tanggal', new Date(Date.now() - 30*86400000).toISOString().split('T')[0])
    ]);

    if (prodRes.error) return res.json(mockAnalytics.summary);

    const products = prodRes.data || [];
    const totalWA = (analyticsRes.data || []).reduce((sum, r) => sum + (r.klik_wa || 0), 0);
    res.json({
      total_products: products.length,
      total_categories: catRes.data?.length || 3,
      total_views: products.reduce((s, p) => s + (p.jumlah_view || 0), 0),
      total_wa_clicks: totalWA,
      available_products: products.filter(p => p.stok > 0 || p.status_produk === 'tersedia').length,
      out_of_stock: products.filter(p => p.stok === 0 || p.status_produk === 'habis').length
    });
  } catch (e) {
    res.json(mockAnalytics.summary);
  }
});

// GET weekly analytics
router.get('/weekly', auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('website_analytics').select('*').gte('tanggal', new Date(Date.now() - 7*86400000).toISOString().split('T')[0]).order('tanggal');
    if (error || !data?.length) return res.json(mockAnalytics.weekly);
    res.json(data);
  } catch (e) {
    res.json(mockAnalytics.weekly);
  }
});

// GET top products by views
router.get('/top-products', auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('name, category, jumlah_view').order('jumlah_view', { ascending: false }).limit(5);
    if (error || !data?.length) return res.json(mockAnalytics.top_products);
    res.json(data);
  } catch (e) {
    res.json(mockAnalytics.top_products);
  }
});

// POST increment product view
router.post('/view/:id', async (req, res) => {
  try {
    const { data: prod } = await supabase.from('products').select('jumlah_view').eq('id', req.params.id).single();
    if (prod) {
      await supabase.from('products').update({ jumlah_view: (prod.jumlah_view || 0) + 1 }).eq('id', req.params.id);
    }
    res.json({ message: 'View counted' });
  } catch (e) {
    res.json({ message: 'ok' });
  }
});

// POST increment WA click
router.post('/wa-click', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('website_analytics').select('*').eq('tanggal', today).single();
    if (data) {
      await supabase.from('website_analytics').update({ klik_wa: (data.klik_wa || 0) + 1 }).eq('tanggal', today);
    } else {
      await supabase.from('website_analytics').insert([{ tanggal: today, klik_wa: 1, jumlah_pengunjung: 0 }]);
    }
    res.json({ message: 'WA click counted' });
  } catch (e) {
    res.json({ message: 'ok' });
  }
});

module.exports = router;
