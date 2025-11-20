// __mocks__/next-auth.js
module.exports = {
  Auth: jest.fn(),
  customFetch: jest.fn(),
  // Add other exports from next-auth that might be used by your tests
};
