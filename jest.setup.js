import '@testing-library/jest-dom'
import React from 'react'

// Mock Auth.js to prevent ESM import errors
jest.mock('@/libs/auth', () => ({
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
jest.mock('@/libs/prisma', () => {
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

