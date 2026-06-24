const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert to Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name, role: role || 'customer' }])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
        role: data[0].role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // --- MOCK/OFFLINE LOGIN FALLBACK ---
    if (email === 'admin@ambagear.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000000', email: 'admin@ambagear.com', role: 'admin' },
        process.env.JWT_SECRET || 'secret_ambagear_123',
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@ambagear.com',
          name: 'Admin AMBA (Offline Mock)',
          role: 'admin'
        }
      });
    }

    // Get user from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || !users.length) {
      return res.status(401).json({ error: 'Email tidak ditemukan' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(404).json({ error: 'User not found' });

    res.json({ user: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;