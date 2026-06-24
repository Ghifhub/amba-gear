const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

const defaultCategories = [
  { id: '1', nama_kategori: 'mouse', deskripsi: 'Periferal mouse gaming dengan sensor tinggi dan ergonomi terbaik.' },
  { id: '2', nama_kategori: 'keyboard', deskripsi: 'Keyboard mekanikal gaming dengan switch premium dan RGB.' },
  { id: '3', nama_kategori: 'headset', deskripsi: 'Headset gaming dengan audio surround dan mikrofon jernih.' }
];

// GET all categories
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('nama_kategori');
    if (error) { console.warn('Supabase offline, returning default categories'); return res.json(defaultCategories); }
    res.json(data);
  } catch (e) {
    res.json(defaultCategories);
  }
});

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').eq('id', req.params.id);
    if (error || !data.length) return res.status(404).json({ error: 'Category not found' });
    res.json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { nama_kategori, deskripsi } = req.body;
    if (!nama_kategori) return res.status(400).json({ error: 'nama_kategori wajib diisi' });

    const { data, error } = await supabase.from('categories').insert([{ nama_kategori, deskripsi }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Category created', category: data[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { data, error } = await supabase.from('categories').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category updated', category: data[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Category deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
