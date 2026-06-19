const express = require('express');
const jwt = require('jsonwebtoken');
const http = require('http');

const mockFrom = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

const productRoutes = require('../routes/products');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
  return app;
}

function request(app) {
  function makeRequest(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
          },
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            server.close();
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode, body: data });
            }
          });
        });
        req.on('error', (err) => {
          server.close();
          reject(err);
        });
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  return {
    get: (path, headers) => makeRequest('GET', path, null, headers),
    post: (path, body, headers) => makeRequest('POST', path, body, headers),
    put: (path, body, headers) => makeRequest('PUT', path, body, headers),
    delete: (path, headers) => makeRequest('DELETE', path, null, headers),
  };
}

function adminToken() {
  return jwt.sign({ id: '1', email: 'admin@test.com', role: 'admin' }, 'test-jwt-secret');
}

function customerToken() {
  return jwt.sign({ id: '2', email: 'user@test.com', role: 'customer' }, 'test-jwt-secret');
}

describe('Products Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('GET /api/products', () => {
    it('returns all products', async () => {
      const products = [
        { id: '1', name: 'Mouse A', category: 'mouse', price: 100 },
        { id: '2', name: 'Keyboard B', category: 'keyboard', price: 200 },
      ];
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: products, error: null }),
          then: function (resolve) {
            return Promise.resolve({ data: products, error: null }).then(resolve);
          },
        }),
      });
      // For the no-category path, the query resolves directly
      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: products, error: null }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(products);
    });

    it('filters products by category when query param provided', async () => {
      const mice = [{ id: '1', name: 'Mouse A', category: 'mouse', price: 100 }];
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mice, error: null }),
      });
      mockFrom.mockReturnValue({ select: selectMock });

      const app = buildApp();
      const res = await request(app).get('/api/products?category=mouse');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mice);
    });

    it('returns 400 on supabase error', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'query error' } }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('query error');
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product by id', async () => {
      const product = { id: 'uuid-1', name: 'Mouse', price: 500 };
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [product], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/products/uuid-1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(product);
    });

    it('returns 404 when product not found', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/products/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Product not found');
    });

    it('returns 400 on supabase error', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db err' } }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/products/bad-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('db err');
    });
  });

  describe('POST /api/products (Create)', () => {
    it('returns 401 without auth token', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/products', { name: 'Test' });

      expect(res.status).toBe(401);
    });

    it('returns 403 when non-admin tries to create', async () => {
      const app = buildApp();
      const res = await request(app).post(
        '/api/products',
        { name: 'Test', category: 'mouse', brand: 'X', price: 100 },
        { Authorization: `Bearer ${customerToken()}` }
      );

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only admin can create products');
    });

    it('returns 400 when required fields are missing', async () => {
      const app = buildApp();
      const res = await request(app).post(
        '/api/products',
        { name: 'Test' },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name, category, brand, and price are required');
    });

    it('returns 400 when name is missing', async () => {
      const app = buildApp();
      const res = await request(app).post(
        '/api/products',
        { category: 'mouse', brand: 'X', price: 100 },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name, category, brand, and price are required');
    });

    it('creates product successfully as admin', async () => {
      const newProduct = {
        id: 'new-uuid',
        name: 'New Mouse',
        category: 'mouse',
        brand: 'TestBrand',
        price: 999000,
        description: 'A new mouse',
      };

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [newProduct], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post(
        '/api/products',
        { name: 'New Mouse', category: 'mouse', brand: 'TestBrand', price: 999000, description: 'A new mouse' },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Product created');
      expect(res.body.product.name).toBe('New Mouse');
    });

    it('returns 400 on supabase insert error', async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post(
        '/api/products',
        { name: 'X', category: 'mouse', brand: 'Y', price: 100 },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('insert failed');
    });
  });

  describe('PUT /api/products/:id (Update)', () => {
    it('returns 401 without auth token', async () => {
      const app = buildApp();
      const res = await request(app).put('/api/products/uuid-1', { name: 'Updated' });

      expect(res.status).toBe(401);
    });

    it('returns 403 when non-admin tries to update', async () => {
      const app = buildApp();
      const res = await request(app).put(
        '/api/products/uuid-1',
        { name: 'Updated' },
        { Authorization: `Bearer ${customerToken()}` }
      );

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only admin can update products');
    });

    it('updates product successfully as admin', async () => {
      const updated = { id: 'uuid-1', name: 'Updated Mouse', price: 800000 };
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [updated], error: null }),
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).put(
        '/api/products/uuid-1',
        { name: 'Updated Mouse', price: 800000 },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product updated');
      expect(res.body.product.name).toBe('Updated Mouse');
    });

    it('returns 404 when product to update is not found', async () => {
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).put(
        '/api/products/nonexistent',
        { name: 'X' },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Product not found');
    });

    it('returns 400 on supabase update error', async () => {
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: null, error: { message: 'update err' } }),
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).put(
        '/api/products/uuid-1',
        { name: 'X' },
        { Authorization: `Bearer ${adminToken()}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('update err');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('returns 401 without auth token', async () => {
      const app = buildApp();
      const res = await request(app).delete('/api/products/uuid-1');

      expect(res.status).toBe(401);
    });

    it('returns 403 when non-admin tries to delete', async () => {
      const app = buildApp();
      const res = await request(app).delete('/api/products/uuid-1', {
        Authorization: `Bearer ${customerToken()}`,
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only admin can delete products');
    });

    it('deletes product successfully as admin', async () => {
      mockFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).delete('/api/products/uuid-1', {
        Authorization: `Bearer ${adminToken()}`,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product deleted');
    });

    it('returns 400 on supabase delete error', async () => {
      mockFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'delete err' } }),
        }),
      });

      const app = buildApp();
      const res = await request(app).delete('/api/products/uuid-1', {
        Authorization: `Bearer ${adminToken()}`,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('delete err');
    });
  });
});
