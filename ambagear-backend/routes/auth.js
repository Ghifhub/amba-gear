const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');
const { sendSuccess, sendError, handleRouteError, sendNotFound } = require('../utils/responseHelpers');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email dan password wajib diisi');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name, role: role || 'customer' }])
      .select();

    if (error) {
      if (error.code === '23505') {
        return sendError(res, 'Email sudah terdaftar');
      }
      return sendError(res, error.message);
    }

    sendSuccess(res, {
      message: 'User created successfully',
      user: {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
        role: data[0].role
      }
    }, 201);
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email dan password wajib diisi');
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || !users.length) {
      return sendError(res, 'Email tidak ditemukan', 401);
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendError(res, 'Password salah', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', req.user.id);

    if (error) return sendError(res, error.message);
    if (!data.length) return sendNotFound(res, 'User');

    sendSuccess(res, { user: data[0] });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
