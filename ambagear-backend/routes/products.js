const express = require('express');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { sendSuccess, sendError, handleRouteError, sendNotFound } = require('../utils/responseHelpers');

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
    if (error) return sendError(res, error.message);
    sendSuccess(res, data);
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id);

    if (error) return sendError(res, error.message);
    if (!data.length) return sendNotFound(res, 'Product');
    sendSuccess(res, data[0]);
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Create Product (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, category, brand, price, description, image_url, badge } = req.body;

    if (!name || !category || !brand || !price) {
      return sendError(res, 'Name, category, brand, and price are required');
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, category, brand, price, description, image_url, badge }])
      .select();

    if (error) return sendError(res, error.message);
    sendSuccess(res, { message: 'Product created', product: data[0] }, 201);
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Update Product (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) return sendError(res, error.message);
    if (!data.length) return sendNotFound(res, 'Product');
    sendSuccess(res, { message: 'Product updated', product: data[0] });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Delete Product (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) return sendError(res, error.message);
    sendSuccess(res, { message: 'Product deleted' });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
