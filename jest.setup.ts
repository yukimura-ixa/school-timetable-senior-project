// Jest Setup - Mock Next.js 16 Cache Components
// This file provides mocks for Next.js 16 features that aren't available in the Jest test environment

// Mock Next.js Cache Components APIs
// These are only called in tests; production code uses real implementations
global.cacheTag = jest.fn(() => { })
global.cacheLife = jest.fn(() => { })

// Fix UTF-8 encoding for terminal output (Thai characters)
if (process.stdout.setEncoding) {
  process.stdout.setEncoding('utf8')
}
if (process.stderr.setEncoding) {
  process.stderr.setEncoding('utf8')
}

// Suppress console warnings during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   warn: jest.fn(),
// };