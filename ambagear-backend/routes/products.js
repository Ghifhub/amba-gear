const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Get All Products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(404).json({ error: 'Product not found' });

    res.json(data[0]);
  } catch (error) {
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

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }

    const allowedFields = ['name', 'category', 'brand', 'price', 'old_price', 'description', 'specs', 'image_url', 'badge', 'rating', 'reviews_count'];
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || !data.length) return res.status(404).json({ error: 'Product not found' });

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

    // Verify the product exists before deleting
    const { data: existing, error: lookupError } = await supabase
      .from('products')
      .select('id')
      .eq('id', req.params.id);

    if (lookupError) return res.status(400).json({ error: lookupError.message });
    if (!existing || !existing.length) return res.status(404).json({ error: 'Product not found' });

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