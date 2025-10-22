/**
 * Integration Tests: Schedule Repository
 * 
 * Tests for the schedule repository data access layer.
 * These tests verify Prisma queries and data transformations.
 */

import { ScheduleRepository } from './schedule.repository';
import prisma from '@/libs/prisma';
import { semester } from '@prisma/client';

// Mock Prisma client
jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    class_schedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teachers_responsibility: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('ScheduleRepository', () => {
  let repository: ScheduleRepository;

  beforeEach(() => {
    repository = new ScheduleRepository();
    jest.clearAllMocks();
  });

  describe('findSchedulesByTerm', () => {
    it('should fetch and transform schedules for a term', async () => {
      const mockPrismaData = [
        {
          ClassID: 'C1',
          TimeslotID: 'T1',
          SubjectCode: 'MATH101',
          RoomID: 101,
          GradeID: 'M1-1',
          IsLocked: false,
          subject: { SubjectName: 'Mathematics 101' },
          room: { RoomName: 'Room 101' },
          gradelevel: { GradeID: 'M1-1' },
          timeslot: { TimeslotID: 'T1' },
          teachers_responsibility: [
            {
              teacher: {
                TeacherID: 1,
                Prefix: 'Mr.',
                Firstname: 'John',
                Lastname: 'Doe',
              },
            },
          ],
        },
      ];

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue(mockPrismaData);

      const result = await repository.findSchedulesByTerm(2566, 'SEMESTER_1');

      expect(prisma.class_schedule.findMany).toHaveBeenCalledWith({
        where: {
          timeslot: {
            AcademicYear: 2566,
            Semester: 'SEMESTER_1',
          },
        },
        include: expect.any(Object),
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        classId: 'C1',
        timeslotId: 'T1',
        subjectCode: 'MATH101',
        subjectName: 'Mathematics 101',
        roomId: 101,
        roomName: 'Room 101',
        gradeId: 'M1-1',
        isLocked: false,
        teacherId: 1,
        teacherName: 'Mr. John Doe',
      });
    });

    it('should handle schedules without teachers', async () => {
      const mockPrismaData = [
        {
          ClassID: 'C2',
          TimeslotID: 'T2',
          SubjectCode: 'ASSEMBLY',
          RoomID: null,
          GradeID: 'M1-1',
          IsLocked: true,
          subject: { SubjectName: 'Assembly' },
          room: null,
          gradelevel: { GradeID: 'M1-1' },
          timeslot: { TimeslotID: 'T2' },
          teachers_responsibility: [],
        },
      ];

      (prisma.class_schedule.findMany as jest.Mock).mockResolvedValue(mockPrismaData);

      const result = await repository.findSchedulesByTerm(2566, 'SEMESTER_1');

      expect(result[0].teacherId).toBeUndefined();
      expect(result[0].teacherName).toBeUndefined();
      expect(result[0].roomId).toBeNull();
      expect(result[0].roomName).toBeUndefined();
    });
  });

  describe('findResponsibilitiesByTerm', () => {
    it('should fetch and transform teacher responsibilities', async () => {
      const mockPrismaData = [
        {
          RespID: 1,
          TeacherID: 1,
          GradeID: 'M1-1',
          SubjectCode: 'MATH101',
          AcademicYear: 2566,
          Semester: semester.SEMESTER_1,
          TeachHour: 4,
        },
      ];

      (prisma.teachers_responsibility.findMany as jest.Mock).mockResolvedValue(mockPrismaData);

      const result = await repository.findResponsibilitiesByTerm(2566, 'SEMESTER_1');

      expect(prisma.teachers_responsibility.findMany).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2566,
          Semester: 'SEMESTER_1',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        respId: 1,
        teacherId: 1,
        gradeId: 'M1-1',
        subjectCode: 'MATH101',
        academicYear: 2566,
        semester: semester.SEMESTER_1,
        teachHour: 4,
      });
    });
  });

  describe('createSchedule', () => {
    it('should create a new schedule', async () => {
      const mockCreated = {
        ClassID: 'C_NEW',
        TimeslotID: 'T1',
        SubjectCode: 'MATH101',
        RoomID: 101,
        GradeID: 'M1-1',
        IsLocked: false,
        subject: { SubjectName: 'Math' },
        room: { RoomName: 'Room 101' },
        gradelevel: {},
        timeslot: {},
      };

      (prisma.class_schedule.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await repository.createSchedule({
        ClassID: 'C_NEW',
        TimeslotID: 'T1',
        SubjectCode: 'MATH101',
        RoomID: 101,
        GradeID: 'M1-1',
        IsLocked: false,
      });

      expect(prisma.class_schedule.create).toHaveBeenCalledWith({
        data: expect.any(Object),
        include: expect.any(Object),
      });

      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateSchedule', () => {
    it('should update an existing schedule', async () => {
      const mockUpdated = {
        ClassID: 'C1',
        RoomID: 102,
        IsLocked: true,
      };

      (prisma.class_schedule.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await repository.updateSchedule('C1', {
        RoomID: 102,
        IsLocked: true,
      });

      expect(prisma.class_schedule.update).toHaveBeenCalledWith({
        where: { ClassID: 'C1' },
        data: { RoomID: 102, IsLocked: true },
        include: expect.any(Object),
      });

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      const mockDeleted = { ClassID: 'C1' };

      (prisma.class_schedule.delete as jest.Mock).mockResolvedValue(mockDeleted);

      await repository.deleteSchedule('C1');

      expect(prisma.class_schedule.delete).toHaveBeenCalledWith({
        where: { ClassID: 'C1' },
      });
    });
  });

  describe('findScheduleById', () => {
    it('should find a schedule by ID', async () => {
      const mockSchedule = {
        ClassID: 'C1',
        TimeslotID: 'T1',
        subject: {},
        room: {},
        gradelevel: {},
        timeslot: {},
        teachers_responsibility: [],
      };

      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await repository.findScheduleById('C1');

      expect(prisma.class_schedule.findUnique).toHaveBeenCalledWith({
        where: { ClassID: 'C1' },
        include: expect.any(Object),
      });

      expect(result).toEqual(mockSchedule);
    });

    it('should return null if schedule not found', async () => {
      (prisma.class_schedule.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findScheduleById('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('linkTeacherToSchedule', () => {
    it('should link a teacher to a schedule', async () => {
      const mockLinked = { RespID: 1 };

      (prisma.teachers_responsibility.update as jest.Mock).mockResolvedValue(mockLinked);

      await repository.linkTeacherToSchedule('C1', 1);

      expect(prisma.teachers_responsibility.update).toHaveBeenCalledWith({
        where: { RespID: 1 },
        data: {
          class_schedule: {
            connect: { ClassID: 'C1' },
          },
        },
      });
    });
  });

  describe('unlinkTeacherFromSchedule', () => {
    it('should unlink a teacher from a schedule', async () => {
      const mockUnlinked = { RespID: 1 };

      (prisma.teachers_responsibility.update as jest.Mock).mockResolvedValue(mockUnlinked);

      await repository.unlinkTeacherFromSchedule('C1', 1);

      expect(prisma.teachers_responsibility.update).toHaveBeenCalledWith({
        where: { RespID: 1 },
        data: {
          class_schedule: {
            disconnect: { ClassID: 'C1' },
          },
        },
      });
    });
  });
});
