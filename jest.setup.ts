jest.mock('next-auth', () => ({
  Auth: jest.fn(),
  customFetch: jest.fn(),
}));

jest.mock('@auth/core', () => ({
  Auth: jest.fn(),
  customFetch: jest.fn(),
}));