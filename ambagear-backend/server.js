const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

app.get('/', (req, res) => res.json({
  message: 'AMBA GEAR API',
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth',
    products: '/api/products'
  }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 AMBA GEAR API running on port ${PORT}`));