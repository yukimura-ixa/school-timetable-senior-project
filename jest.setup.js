import '@testing-library/jest-dom'
import React from 'react'

// Polyfill Web APIs for Node.js environment
// Required by Prisma Client and Accelerate extension in Jest tests
// Reference: Node.js built-in Web APIs (Node 18+)
// See: https://nodejs.org/docs/latest-v18.x/api/globals.html

const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')
const { MessageChannel, MessagePort } = require('worker_threads')

// Text encoding (required by Prisma)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Web Streams (required by Prisma Accelerate)
global.ReadableStream = ReadableStream
global.WritableStream = WritableStream
global.TransformStream = TransformStream

// Worker Threads API (required by fetch polyfills)
global.MessageChannel = MessageChannel
global.MessagePort = MessagePort

// Node.js 18+ has native fetch - ensure it's available globally
if (typeof global.fetch === 'undefined') {
  // Fallback for older Node versions (shouldn't happen with Next.js 16)
  console.warn('Native fetch not available, using undici polyfill')
  const { fetch, Headers, Request, Response, FormData } = require('undici')
  global.fetch = fetch
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
  global.FormData = FormData
}

// Mock localStorage for Zustand persist middleware
// Required by stores that use persist() middleware with localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

global.localStorage = new LocalStorageMock();

// Mock Auth.js to prevent ESM import errors
jest.mock('@/lib/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: { 
      id: 'test-user-123', 
      email: 'test@example.com',
      role: 'admin',
    },
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

// Mock Prisma Client to prevent browser environment errors
jest.mock('@/lib/prisma', () => {
  const mockPrismaClient = {
    teacher: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(10),
    },
    class_schedule: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(12),
    },
    gradelevel: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(5),
    },
    room: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(20),
    },
    subject: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(15),
    },
    teachers_responsibility: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    timeslot: {
      findMany: jest.fn().mockResolvedValue([
        { TimeslotID: 'TS_MON_1', DayOfWeek: 'MON', StartTime: '08:00' },
        { TimeslotID: 'TS_MON_2', DayOfWeek: 'MON', StartTime: '09:00' },
        { TimeslotID: 'TS_TUE_1', DayOfWeek: 'TUE', StartTime: '08:00' },
        { TimeslotID: 'TS_WED_1', DayOfWeek: 'WED', StartTime: '08:00' },
        { TimeslotID: 'TS_THU_1', DayOfWeek: 'THU', StartTime: '08:00' },
        { TimeslotID: 'TS_FRI_1', DayOfWeek: 'FRI', StartTime: '08:00' },
      ]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(8),
    },
    table_config: {
      findFirst: jest.fn().mockResolvedValue({ AcademicYear: 2566, Semester: 'SEMESTER_1', Config: {} }),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    program: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  };
  
  return {
    __esModule: true,
    default: mockPrismaClient,
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: React.forwardRef((props, ref) =>
    React.createElement('img', { ...props, ref }),
  ),
}))

// Disable Next.js 16's unhandled rejection handler to prevent stack overflow in Jest
// The handler in node-environment-extensions/unhandled-rejection.tsx causes infinite recursion
// when combined with Jest's async handling. This is a known issue with Next.js 16 + Jest.
// Mock the module to prevent it from loading entirely
jest.mock('next/dist/server/node-environment-extensions/unhandled-rejection', () => ({}), { virtual: true });
jest.mock('next/src/server/node-environment-extensions/unhandled-rejection', () => ({}), { virtual: true });

