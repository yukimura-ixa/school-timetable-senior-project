/**
 * Lock Feature - Repository Layer
 *
 * Handles all database operations for locked schedules using Prisma.
 * Lock feature uses class_schedule table with IsLocked flag.
 */

import prisma from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";

/**
 * Type for raw locked schedule data from database
 * Includes all relations needed for grouping
 */
export type RawLockedSchedule = {
  ClassID: string;
  TimeslotID: string;
  SubjectCode: string;
  RoomID: number | null;
  GradeID: string;
  IsLocked: boolean;
  subject: {
    SubjectName: string;
    teachers_responsibility: Array<{
      RespID: number;
      teacher: {
        TeacherID: number;
        Firstname: string;
        Lastname: string;
        Department: string | null;
        Email: string | null;
        Role: string | null;
      };
    }>;
  } | null;
  room: {
    RoomID: number;
    RoomName: string;
    Building: string | null;
    Floor: number | null;
  } | null;
  timeslot: {
    TimeslotID: string;
    DayOfWeek: string;
    AcademicYear: number;
    Semester: semester;
    StartTime: Date;
    EndTime: Date;
    BreakTime: string;
  };
};

/**
 * Fetch all locked schedules for a given academic year and semester
 * Returns raw data with all relations for grouping
 */
export async function findLockedSchedules(
  academicYear: number,
  semester: semester,
): Promise<RawLockedSchedule[]> {
  const data = await prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: semester,
      },
      IsLocked: true,
    },
    include: {
      room: true,
      timeslot: true,
      subject: {
        include: {
          teachers_responsibility: {
            distinct: ["TeacherID"],
            include: {
              teacher: true,
            },
          },
        },
      },
    },
  });

  return data as RawLockedSchedule[];
}

/**
 * Type for creating a single locked class schedule
 */
export type CreateLockData = {
  ClassID: string;
  IsLocked: boolean;
  SubjectCode: string;
  TimeslotID: string;
  RoomID: number;
  GradeID: string;
  RespIDs: Array<{ RespID: number }>;
};

/**
 * Create a single locked class schedule
 * Connects all required relations
 */
export async function createLock(data: CreateLockData) {
  return await prisma.class_schedule.create({
    data: {
      ClassID: data.ClassID,
      IsLocked: data.IsLocked,
      teachers_responsibility: {
        connect: data.RespIDs,
      },
      subject: {
        connect: {
          SubjectCode: data.SubjectCode,
        },
      },
      timeslot: {
        connect: {
          TimeslotID: data.TimeslotID,
        },
      },
      room: {
        connect: {
          RoomID: data.RoomID,
        },
      },
      gradelevel: {
        connect: {
          GradeID: data.GradeID,
        },
      },
    },
  });
}

/**
 * Delete multiple locked schedules by ClassIDs
 */
export async function deleteMany(classIds: string[]) {
  return await prisma.class_schedule.deleteMany({
    where: {
      ClassID: {
        in: classIds,
      },
    },
  });
}

/**
 * Count total locked schedules for a given academic year and semester
 */
export async function count(
  academicYear: number,
  semester: semester,
): Promise<number> {
  return await prisma.class_schedule.count({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: semester,
      },
      IsLocked: true,
    },
  });
}

/**
 * Find all grade levels
 */
export async function findAllGradeLevels() {
  return await prisma.gradelevel.findMany({
    orderBy: { GradeID: "asc" },
  });
}

/**
 * Find timeslots for a given academic year and semester
 */
export async function findTimeslotsByTerm(
  academicYear: number,
  semester: semester,
) {
  return await prisma.timeslot.findMany({
    where: {
      AcademicYear: academicYear,
      Semester: semester,
    },
    orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
  });
}

/**
 * Find all rooms
 */
export async function findAllRooms() {
  return await prisma.room.findMany({
    orderBy: { RoomID: "asc" },
  });
}

/**
 * Find all subjects
 */
export async function findAllSubjects() {
  return await prisma.subject.findMany({
    orderBy: { SubjectCode: "asc" },
  });
}

/**
 * Find teacher responsibilities for a given academic year and semester
 */
export async function findTeacherResponsibilitiesByTerm(
  academicYear: number,
  semester: semester,
) {
  return await prisma.teachers_responsibility.findMany({
    where: {
      AcademicYear: academicYear,
      Semester: semester,
    },
    include: {
      teacher: true,
    },
  });
}
