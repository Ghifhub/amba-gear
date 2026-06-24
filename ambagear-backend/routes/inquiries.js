const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

const mockInquiries = [
  { id: '1', nama_customer: 'Rizky Pratama', nomor_wa: '081234567890', produk_diminati: 'Logitech G403 HERO', pesan: 'Halo, masih tersedia? Berapa ongkir ke Surabaya?', tanggal_interaksi: new Date(Date.now() - 2*24*3600000).toISOString(), status_follow_up: 'selesai' },
  { id: '2', nama_customer: 'Dani Kusuma', nomor_wa: '085798123456', produk_diminati: 'Logitech G915 TKL', pesan: 'Min mau tanya, ini ada varian putih?', tanggal_interaksi: new Date(Date.now() - 1*24*3600000).toISOString(), status_follow_up: 'diproses' },
  { id: '3', nama_customer: 'Aisyah Nurul', nomor_wa: '089671234567', produk_diminati: 'HyperX Cloud II', pesan: 'Apakah compatible dengan PS5?', tanggal_interaksi: new Date(Date.now() - 3*3600000).toISOString(), status_follow_up: 'pending' },
  { id: '4', nama_customer: 'Bagas Eko', nomor_wa: '082345671234', produk_diminati: 'Rexus Thundervox HX25', pesan: 'Beli 2 bisa dapat diskon?', tanggal_interaksi: new Date(Date.now() - 1*3600000).toISOString(), status_follow_up: 'pending' },
  { id: '5', nama_customer: 'Fajar Maulana', nomor_wa: '081398765432', produk_diminati: 'HyperX Pulsefire Dart', pesan: 'Garansi berapa lama gan?', tanggal_interaksi: new Date(Date.now() - 5*3600000).toISOString(), status_follow_up: 'diproses' }
];

// GET all inquiries
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('whatsapp_inquiries').select('*').order('tanggal_interaksi', { ascending: false });
    if (status) query = query.eq('status_follow_up', status);
    const { data, error } = await query;
    if (error) { console.warn('Supabase offline, returning mock inquiries'); return res.json(mockInquiries); }
    res.json(data);
  } catch (e) {
    res.json(mockInquiries);
  }
});

// POST create inquiry (public - from customer WA interaction log)
router.post('/', async (req, res) => {
  try {
    const { nama_customer, nomor_wa, produk_diminati, pesan } = req.body;
    if (!nama_customer || !nomor_wa) return res.status(400).json({ error: 'Nama dan nomor WA wajib diisi' });
    const { data, error } = await supabase.from('whatsapp_inquiries').insert([{ nama_customer, nomor_wa, produk_diminati, pesan }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Inquiry recorded', inquiry: data[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update status follow-up (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { data, error } = await supabase.from('whatsapp_inquiries').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry updated', inquiry: data[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE inquiry (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { error } = await supabase.from('whatsapp_inquiries').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Inquiry deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
