const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock supabase before requiring routes
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockEq = jest.fn();
const mockFrom = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

const authRoutes = require('../routes/auth');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

// Lightweight supertest-style helper using Node's built-in http
const http = require('http');

function request(app) {
  const server = http.createServer(app);

  function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
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
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
          },
        };

        let extraHeaders = {};

        const req = http.request({ ...options, ...extraHeaders }, (res) => {
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
    post: (path, body) => makeRequest('POST', path, body),
    get: (path, headers) => {
      return new Promise((resolve, reject) => {
        server.listen(0, () => {
          const port = server.address().port;
          const options = {
            hostname: '127.0.0.1',
            port,
            path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...headers },
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
          req.end();
        });
      });
    },
  };
}

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('POST /api/auth/register', () => {
    it('returns 400 when email is missing', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/auth/register', { password: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email dan password wajib diisi');
    });

    it('returns 400 when password is missing', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/auth/register', { email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email dan password wajib diisi');
    });

    it('returns 400 when both email and password are missing', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/auth/register', {});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email dan password wajib diisi');
    });

    it('returns 201 on successful registration', async () => {
      const mockUser = {
        id: 'uuid-1',
        email: 'new@test.com',
        name: 'Test User',
        role: 'customer',
        password: 'hashed',
      };

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [mockUser], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/register', {
        email: 'new@test.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('defaults role to customer when not provided', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: '1', email: 'a@b.com', name: 'A', role: 'customer' }],
          error: null,
        }),
      });
      mockFrom.mockReturnValue({ insert: insertMock });

      const app = buildApp();
      await request(app).post('/api/auth/register', {
        email: 'a@b.com',
        password: 'pass',
        name: 'A',
      });

      const insertArg = insertMock.mock.calls[0][0][0];
      expect(insertArg.role).toBe('customer');
    });

    it('returns 400 when email already exists (unique violation)', async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate' },
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/register', {
        email: 'dup@test.com',
        password: 'password',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email sudah terdaftar');
    });

    it('returns 400 on other supabase errors', async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '42000', message: 'some db error' },
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/register', {
        email: 'x@x.com',
        password: 'pass',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('some db error');
    });

    it('hashes password before storing', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: '1', email: 'a@b.com', name: 'A', role: 'customer' }],
          error: null,
        }),
      });
      mockFrom.mockReturnValue({ insert: insertMock });

      const app = buildApp();
      await request(app).post('/api/auth/register', {
        email: 'a@b.com',
        password: 'plaintext',
      });

      const insertedPassword = insertMock.mock.calls[0][0][0].password;
      expect(insertedPassword).not.toBe('plaintext');
      const isHashed = await bcrypt.compare('plaintext', insertedPassword);
      expect(isHashed).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when email is missing', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/auth/login', { password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email dan password wajib diisi');
    });

    it('returns 400 when password is missing', async () => {
      const app = buildApp();
      const res = await request(app).post('/api/auth/login', { email: 'a@b.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email dan password wajib diisi');
    });

    it('returns 401 when user is not found', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/login', {
        email: 'noone@test.com',
        password: 'pass',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Email tidak ditemukan');
    });

    it('returns 401 when supabase returns an error', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db err' } }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/login', {
        email: 'a@b.com',
        password: 'pass',
      });

      expect(res.status).toBe(401);
    });

    it('returns 401 when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 12);
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ id: '1', email: 'a@b.com', password: hashedPassword, name: 'A', role: 'customer' }],
            error: null,
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/login', {
        email: 'a@b.com',
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Password salah');
    });

    it('returns token and user on successful login', async () => {
      const hashedPassword = await bcrypt.hash('mypassword', 12);
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{
              id: 'uuid-1',
              email: 'user@test.com',
              password: hashedPassword,
              name: 'User',
              role: 'customer',
            }],
            error: null,
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).post('/api/auth/login', {
        email: 'user@test.com',
        password: 'mypassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('user@test.com');
      expect(res.body.user.name).toBe('User');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify the token is valid
      const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
      expect(decoded.id).toBe('uuid-1');
      expect(decoded.role).toBe('customer');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('returns 401 without a token', async () => {
      const app = buildApp();
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });

    it('returns user profile with valid token', async () => {
      const token = jwt.sign(
        { id: 'uuid-1', email: 'u@t.com', role: 'admin' },
        'test-jwt-secret'
      );
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ id: 'uuid-1', email: 'u@t.com', name: 'Admin', role: 'admin' }],
            error: null,
          }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/auth/profile', {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('u@t.com');
      expect(res.body.user.role).toBe('admin');
    });

    it('returns 404 when user not found in database', async () => {
      const token = jwt.sign(
        { id: 'deleted-user', email: 'gone@t.com', role: 'customer' },
        'test-jwt-secret'
      );
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/auth/profile', {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('returns 400 on supabase error', async () => {
      const token = jwt.sign(
        { id: '1', email: 'a@b.com', role: 'customer' },
        'test-jwt-secret'
      );
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db fail' } }),
        }),
      });

      const app = buildApp();
      const res = await request(app).get('/api/auth/profile', {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('db fail');
    });
  });
});
