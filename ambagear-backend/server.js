const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => res.json({
  message: 'AMBA GEAR API',
  version: '2.0.0',
  endpoints: {
    auth: '/api/auth',
    products: '/api/products',
    categories: '/api/categories',
    inquiries: '/api/inquiries',
    analytics: '/api/analytics'
  }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 AMBA GEAR API v2 running on port ${PORT}`));