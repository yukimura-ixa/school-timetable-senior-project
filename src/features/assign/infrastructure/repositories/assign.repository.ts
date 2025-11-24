/**
 * Assign Feature - Repository Layer
 *
 * Data access layer for teacher responsibility (assign) operations.
 * Handles all database interactions via Prisma.
 */

import prisma from "@/lib/prisma";
import {
  withPrismaTransaction,
  type TransactionClient,
} from "@/lib/prisma-transaction";
import { semester, Prisma } from "@/prisma/generated/client";

type SubjectCodeRecord = { SubjectCode: string | null };

/**
 * Type: Teacher responsibility with full relations
 */
export type TeacherResponsibilityWithRelations =
  Prisma.teachers_responsibilityGetPayload<{
    include: {
      subject: true;
      gradelevel: true;
      teacher: true;
    };
  }>;

/**
 * Type: Teacher responsibility with class schedules (for available slots)
 */
export type TeacherResponsibilityWithSchedules =
  Prisma.teachers_responsibilityGetPayload<{
    include: {
      subject: true;
      gradelevel: true;
      teacher: true;
      class_schedule: true;
    };
  }>;

/**
 * Type: Subject with responsibilities
 */
export type SubjectWithResponsibilities = Prisma.subjectGetPayload<{
  include: {
    teachers_responsibility: true;
  };
}>;

/**
 * Find responsibilities by teacher and term with full relations
 */
export async function findByTeacherAndTerm(
  teacherId: number,
  academicYear: number,
  sem: semester,
): Promise<TeacherResponsibilityWithRelations[]> {
  return prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: teacherId,
      AcademicYear: academicYear,
      Semester: sem,
    },
    include: {
      subject: true,
      gradelevel: true,
      teacher: true,
    },
  });
}

/**
 * Find responsibilities with class schedules for available slot calculation
 */
export async function findAvailableByTeacherAndTerm(
  teacherId: number,
  academicYear: number,
  sem: semester,
): Promise<TeacherResponsibilityWithSchedules[]> {
  return prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: teacherId,
      AcademicYear: academicYear,
      Semester: sem,
    },
    include: {
      subject: true,
      gradelevel: true,
      teacher: true,
      class_schedule: true,
    },
  });
}

/**
 * Find subjects with locked responsibilities (grouped by SubjectCode)
 */
export async function findLockedSubjectsByTerm(
  academicYear: number,
  sem: semester,
): Promise<SubjectWithResponsibilities[]> {
  // First, group by SubjectCode to get distinct subjects
  const groupedSubjects = (await prisma.teachers_responsibility.groupBy({
    by: ["SubjectCode"],
    where: {
      AcademicYear: academicYear,
      Semester: sem,
    },
  })) as SubjectCodeRecord[];

  const subjectCodes = groupedSubjects
    .map((item) => item.SubjectCode)
    .filter((code): code is string => Boolean(code));

  if (subjectCodes.length === 0) {
    return [];
  }

  // Then fetch subjects with their responsibilities
  const subjects = await prisma.subject.findMany({
    where: {
      SubjectCode: {
        in: subjectCodes,
      },
    },
    include: {
      teachers_responsibility: {
        where: {
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
    },
  });

  return subjects;
}

/**
 * Find all responsibilities matching criteria
 */
export async function findMany(
  where: Prisma.teachers_responsibilityWhereInput,
) {
  return prisma.teachers_responsibility.findMany({
    where,
  });
}

/**
 * Create a new teacher responsibility
 */
export async function create(data: Prisma.teachers_responsibilityCreateInput) {
  return prisma.teachers_responsibility.create({
    data,
  });
}

/**
 * Delete a teacher responsibility by RespID
 */
export async function deleteById(respId: number) {
  return prisma.teachers_responsibility.delete({
    where: {
      RespID: respId,
    },
  });
}

/**
 * Delete class schedules by teacher and term
 * Used for cascade deletion when responsibilities change
 */
export async function deleteSchedulesByTeacherAndTerm(
  teacherId: number,
  academicYear: number,
  sem: semester,
) {
  return prisma.class_schedule.deleteMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      teachers_responsibility: {
        every: {
          TeacherID: teacherId,
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
    },
  });
}

/**
 * Count all responsibilities
 */
export async function count(
  where?: Prisma.teachers_responsibilityWhereInput,
): Promise<number> {
  return prisma.teachers_responsibility.count({ where });
}

/**
 * Find a single teacher responsibility by RespID
 */
export async function findByRespId(respId: number) {
  return await prisma.teachers_responsibility.findUnique({
    where: { RespID: respId },
    include: {
      subject: true,
      gradelevel: true,
      teacher: true,
    },
  });
}

export async function transaction<T>(
  callback: (tx: TransactionClient) => Promise<T>,
) {
  return withPrismaTransaction(callback);
}
