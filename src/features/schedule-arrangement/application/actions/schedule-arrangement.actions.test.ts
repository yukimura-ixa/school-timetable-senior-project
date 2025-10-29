/**
 * Integration Tests: Schedule Arrangement Server Actions
 * 
 * Tests the complete flow of Server Actions with mocked Prisma client.
 * Verifies input validation, conflict detection, and database operations.
 * 
 * @module schedule-arrangement.actions.test
 */

// Mock auth.ts from libs folder
jest.mock('@/libs/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: 'test-user-123', email: 'test@example.com' },
  }),
}));

// Mock the Prisma client
jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    class_schedule: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    teachers_responsibility: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import {
  arrangeScheduleAction,
  deleteScheduleAction,
  getSchedulesByTermAction,
  updateScheduleLockAction,
} from './schedule-arrangement.actions';
import prisma from '@/libs/prisma';

describe('Schedule Arrangement Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('arrangeScheduleAction', () => {
    it('should create new schedule when no conflicts exist', async () => {
      const input = {
        classId: 'C_M1-1_T1_MATH101',
        timeslotId: 'T1',
        subjectCode: 'MATH101',
        roomId: 101,
        gradeId: 'M1-1',
        teacherId: 1,
        academicYear: 2566,
        semester: 'SEMESTER_1' as const,
        isLocked: false,
      };

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.teachers_responsibility.findMany as jest.Mock).mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          GradeID: 'M1-1',
          SubjectCode: 'MATH101',
          AcademicYear: 2566,
          Semester: 'SEMESTER_1',
          TeachHour: 4,
        },
      ]);
      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue(null); // No existing schedule
      (prisma.class_schedule.create as jest.Mock).mockResolvedValue({});
      (prisma.teachers_responsibility.update as jest.Mock).mockResolvedValue({});

      const result = await arrangeScheduleAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, created: true });
      expect(prisma.class_schedule.create).toHaveBeenCalled();
    });

    it('should throw error when teacher conflict exists', async () => {
      const input = {
        classId: 'C_M1-1_T1_MATH101',
        timeslotId: 'T1',
        subjectCode: 'MATH101',
        roomId: 101,
        gradeId: 'M1-1',
        teacherId: 1,
        academicYear: 2566,
        semester: 'SEMESTER_1' as const,
        isLocked: false,
      };

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue([
        {
          ClassID: 'C_M2-1_T1_ENG101',
          TimeslotID: 'T1',
          SubjectCode: 'ENG101',
          RoomID: 102,
          GradeID: 'M2-1',
          IsLocked: false,
          subject: { SubjectName: 'English' },
          room: { RoomName: '102' },
          gradelevel: { Year: 1, Number: 1 },
          timeslot: {
            AcademicYear: 2566,
            Semester: 'SEMESTER_1',
          },
          teachers_responsibility: [
            {
              RespID: 2,
              TeacherID: 1,
              teacher: {
                TeacherID: 1,
                Firstname: 'John',
                Lastname: 'Doe',
              },
            },
          ],
        },
      ]);
      (prisma.teachers_responsibility.findMany as jest.Mock).mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          GradeID: 'M1-1',
          SubjectCode: 'MATH101',
          AcademicYear: 2566,
          Semester: 'SEMESTER_1',
          TeachHour: 4,
        },
      ]);

      const result = await arrangeScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONFLICT');
      expect(result.error?.message).toContain('Teacher');
    });

    it('should reject invalid input', async () => {
      const invalidInput = {
        classId: '',
        timeslotId: 'T1',
        subjectCode: 'MATH101',
        roomId: 101,
        gradeId: 'M1-1',
        academicYear: 2566,
        semester: 'SEMESTER_1' as const,
      };

      const result = await arrangeScheduleAction(invalidInput as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteScheduleAction', () => {
    it('should delete schedule when not locked', async () => {
      const input = { classId: 'C_M1-1_T1_MATH101' };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue({
        ClassID: input.classId,
        IsLocked: false,
      });
      (prisma.class_schedule.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, deleted: true });
    });

    it('should throw error when schedule is locked', async () => {
      const input = { classId: 'C_M1-1_T1_MATH101' };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue({
        ClassID: input.classId,
        IsLocked: true,
      });

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FORBIDDEN');
    });

    it('should throw error when schedule not found', async () => {
      const input = { classId: 'C_M1-1_T1_MATH101' };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('getSchedulesByTermAction', () => {
    it('should return schedules for given term', async () => {
      const input = {
        academicYear: 2566,
        semester: 'SEMESTER_1' as const,
      };

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue([
        {
          ClassID: 'C_M1-1_T1_MATH101',
          TimeslotID: 'T1',
          SubjectCode: 'MATH101',
          RoomID: 101,
          GradeID: 'M1-1',
          IsLocked: false,
          subject: { SubjectName: 'Math' },
          room: { RoomName: '101' },
          gradelevel: { Year: 1, Number: 1 },
          timeslot: {
            AcademicYear: 2566,
            Semester: 'SEMESTER_1',
          },
          teachers_responsibility: [
            {
              RespID: 1,
              TeacherID: 1,
              teacher: {
                TeacherID: 1,
                Firstname: 'John',
                Lastname: 'Doe',
              },
            },
          ],
        },
      ]);

      const result = await getSchedulesByTermAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should return empty array when no schedules exist', async () => {
      const input = {
        academicYear: 2566,
        semester: 'SEMESTER_1' as const,
      };

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getSchedulesByTermAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('updateScheduleLockAction', () => {
    it('should lock schedule', async () => {
      const input = {
        classId: 'C_M1-1_T1_MATH101',
        isLocked: true,
      };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue({
        ClassID: input.classId,
        IsLocked: false,
      });
      (prisma.class_schedule.update as jest.Mock).mockResolvedValue({});

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, locked: true });
    });

    it('should unlock schedule', async () => {
      const input = {
        classId: 'C_M1-1_T1_MATH101',
        isLocked: false,
      };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue({
        ClassID: input.classId,
        IsLocked: true,
      });
      (prisma.class_schedule.update as jest.Mock).mockResolvedValue({});

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, locked: false });
    });

    it('should throw error when schedule not found', async () => {
      const input = {
        classId: 'C_M1-1_T1_MATH101',
        isLocked: true,
      };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });
});
