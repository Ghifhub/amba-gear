const http = require('http');

// Mock supabase config to prevent env var check from throwing
jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn() },
}));

// Set required env vars
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '0';

describe('Server', () => {
  let app;

  beforeAll(() => {
    app = require('../server');
  });

  function request(method, path) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          { hostname: '127.0.0.1', port, path, method },
          (res) => {
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
          }
        );
        req.on('error', (err) => {
          server.close();
          reject(err);
        });
        req.end();
      });
    });
  }

  it('responds to GET / with API info', async () => {
    const res = await request('GET', '/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('AMBA GEAR API');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.endpoints).toEqual({
      auth: '/api/auth',
      products: '/api/products',
    });
  });

  it('returns JSON response', async () => {
    const res = await request('GET', '/');
    expect(typeof res.body).toBe('object');
  });

  it('has auth routes mounted', async () => {
    const res = await request('POST', '/api/auth/login');
    // Should get 400 (missing fields), not 404
    expect(res.status).not.toBe(404);
  });

  it('has product routes mounted', async () => {
    const res = await request('GET', '/api/products');
    // Should not 404, route exists
    expect(res.status).not.toBe(404);
  });
});
