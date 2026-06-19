describe('Supabase Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws error when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_ANON_KEY = 'some-key';

    expect(() => {
      require('../config/supabase');
    }).toThrow('Missing Supabase environment variables');
  });

  it('throws error when SUPABASE_ANON_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_ANON_KEY;

    expect(() => {
      require('../config/supabase');
    }).toThrow('Missing Supabase environment variables');
  });

  it('throws error when both env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    expect(() => {
      require('../config/supabase');
    }).toThrow('Missing Supabase environment variables');
  });

  it('exports supabase client when env vars are set', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';

    const { supabase } = require('../config/supabase');
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
