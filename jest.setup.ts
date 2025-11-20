import '@testing-library/jest-dom'
import React from 'react'

// Polyfill Web APIs for Node.js environment
// Required by Prisma Client and Accelerate extension in Jest tests
// Reference: Node.js built-in Web APIs (Node 18+)
// See: https://nodejs.org/docs/latest-v18.x/api/globals.html

import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, WritableStream, TransformStream } from 'stream/web'

// Text encoding (required by Prisma)
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Web Streams (required by Prisma Accelerate)
global.ReadableStream = ReadableStream as typeof global.ReadableStream
global.WritableStream = WritableStream as typeof global.WritableStream
global.TransformStream = TransformStream as typeof global.TransformStream

class FakeMessagePort {
  onmessage: ((event: { data: unknown }) => void) | null = null
  onmessageerror: ((event: unknown) => void) | null = null
  addEventListener() {}
  removeEventListener() {}
  start() {}
  close() {}
  postMessage(message: unknown) {
    queueMicrotask(() => {
      if (this.onmessage) {
        this.onmessage({ data: message })
      }
    })
  }
  dispatchEvent() {
    return true
  }
}

class FakeMessageChannel {
  port1 = new FakeMessagePort()
  port2 = new FakeMessagePort()
}

globalThis.MessageChannel = FakeMessageChannel as unknown as typeof MessageChannel
globalThis.MessagePort = FakeMessagePort as unknown as typeof MessagePort

// Node.js 18+ has native fetch - ensure it's available globally
if (typeof global.fetch === 'undefined') {
  // Fallback for older Node versions (shouldn't happen with Next.js 16)
  console.warn('Native fetch not available, using undici polyfill')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const undici = require('undici')
  global.fetch = undici.fetch
  global.Headers = undici.Headers
  global.Request = undici.Request
  global.Response = undici.Response
  global.FormData = undici.FormData
}

// Mock localStorage for Zustand persist middleware
// Required by stores that use persist() middleware with localStorage
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }

  get length(): number {
    return Object.keys(this.store).length
  }
}

global.localStorage = new LocalStorageMock()

// Mock Prisma Accelerate extension to prevent network timeouts in tests
// Prevents unpkg.com fetch and schema upload during test initialization
// See: GitHub Issue #54 - Prisma Accelerate Network Timeout
jest.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: () => (client: unknown) => client, // Pass-through mock
}))

// Mock Auth.js to prevent ESM import errors
jest.mock('@/lib/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
    },
  }),
  authWithDevBypass: jest.fn().mockResolvedValue({
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
}))

jest.mock('next/cache', () => ({
  cacheTag: jest.fn(),
  cacheLife: jest.fn(),
}));

// Mock Prisma Client to prevent browser environment errors
jest.mock('@/lib/prisma', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockPrismaClient: any = {
    teacher: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(10),
      upsert: jest.fn().mockResolvedValue({}),
    },
    class_schedule: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(12),
      upsert: jest.fn().mockResolvedValue({}),
    },
    gradelevel: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(5),
      upsert: jest.fn().mockResolvedValue({}),
    },
    room: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(20),
      upsert: jest.fn().mockResolvedValue({}),
    },
    subject: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(15),
      upsert: jest.fn().mockResolvedValue({}),
    },
    student: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest.fn().mockResolvedValue({}),
    },
    teachers_responsibility: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest.fn().mockResolvedValue({}),
    },
    program_subject: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest.fn().mockResolvedValue({}),
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
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(8),
      upsert: jest.fn().mockResolvedValue({}),
    },
    table_config: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ AcademicYear: 2566, Semester: 'SEMESTER_1', Config: {} }),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      upsert: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    program: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((callback: (client: typeof mockPrismaClient) => unknown) =>
      callback(mockPrismaClient)
    ),
  }

  return {
    __esModule: true,
    default: mockPrismaClient,
  }
})

// Mock Next.js Image component
const MockImage = React.forwardRef<HTMLImageElement>((props, ref) =>
  React.createElement('img', { ...props, ref })
)
MockImage.displayName = 'NextImageMock'

jest.mock('next/image', () => ({
  __esModule: true,
  default: MockImage,
}))

// Disable Next.js 16's unhandled rejection handler to prevent stack overflow in Jest
// The handler in node-environment-extensions/unhandled-rejection.tsx causes infinite recursion
// when combined with Jest's async handling. This is a known issue with Next.js 16 + Jest.
// Mock the module to prevent it from loading entirely
jest.mock(
  'next/dist/server/node-environment-extensions/unhandled-rejection',
  () => ({}),
  { virtual: true }
)
jest.mock(
  'next/src/server/node-environment-extensions/unhandled-rejection',
  () => ({}),
  { virtual: true }
)
