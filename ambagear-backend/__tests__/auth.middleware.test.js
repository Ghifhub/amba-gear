const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('returns 401 when no Authorization header is provided', () => {
    req.header.mockReturnValue(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is empty string', () => {
    req.header.mockReturnValue('');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('returns 401 when token is invalid', () => {
    req.header.mockReturnValue('Bearer invalid-token');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'test@test.com', role: 'customer' },
      'test-secret',
      { expiresIn: '-1s' }
    );
    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when token is signed with wrong secret', () => {
    const badToken = jwt.sign({ id: 1 }, 'wrong-secret');
    req.header.mockReturnValue(`Bearer ${badToken}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('sets req.user and calls next() for a valid token', () => {
    const payload = { id: 1, email: 'user@test.com', role: 'admin' };
    const validToken = jwt.sign(payload, 'test-secret');
    req.header.mockReturnValue(`Bearer ${validToken}`);

    authMiddleware(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('strips "Bearer " prefix correctly', () => {
    const payload = { id: 42, email: 'a@b.com', role: 'customer' };
    const token = jwt.sign(payload, 'test-secret');
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.user.id).toBe(42);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
