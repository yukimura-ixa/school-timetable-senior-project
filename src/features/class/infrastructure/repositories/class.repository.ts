/**
 * Class Feature - Repository Layer
 *
 * Data access layer for class schedule (timetable) operations.
 * Handles all database interactions via Prisma.
 */

import prisma from "@/lib/prisma";
import { semester, Prisma } from "@/prisma/generated/client";

/**
 * Type: Class schedule with full relations
 */
export type ClassScheduleWithRelations = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: {
      include: {
        teacher: true;
      };
    };
    subject: true;
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

/**
 * Type: Class schedule with conflicts data
 */
export type ClassScheduleWithConflicts = Prisma.class_scheduleGetPayload<{
  include: {
    subject: {
      include: {
        teachers_responsibility: true;
      };
    };
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

/**
 * Type: Class schedule with summary data
 */
export type ClassScheduleWithSummary = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: true;
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

/**
 * Find all class schedules by term
 */
export async function findByTerm(
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithRelations[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
    },
    include: {
      teachers_responsibility: {
        include: {
          teacher: true,
        },
      },
      subject: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Find class schedules by teacher and term
 */
export async function findByTeacher(
  teacherId: number,
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithRelations[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      teachers_responsibility: {
        some: {
          TeacherID: teacherId,
        },
      },
    },
    include: {
      teachers_responsibility: {
        include: {
          teacher: true,
        },
      },
      subject: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Find class schedules by grade and term
 */
export async function findByGrade(
  gradeId: string,
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithRelations[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      GradeID: gradeId,
    },
    include: {
      teachers_responsibility: {
        include: {
          teacher: true,
        },
      },
      subject: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Find schedule conflicts for a teacher
 * Returns schedules at same time with OTHER teachers assigned
 */
export async function findConflicts(
  teacherId: number,
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithConflicts[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      teachers_responsibility: {
        some: {
          Semester: sem,
          AcademicYear: academicYear,
          NOT: {
            TeacherID: teacherId,
          },
        },
      },
    },
    include: {
      subject: {
        include: {
          teachers_responsibility: true,
        },
      },
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Find class schedule summary (only schedules with teachers assigned)
 * Excludes empty schedules (no teachers_responsibility)
 */
export async function findSummary(
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithSummary[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      NOT: {
        teachers_responsibility: {
          none: {},
        },
      },
    },
    include: {
      teachers_responsibility: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Find a single class schedule by ClassID
 */
export async function findByClassId(classId: string) {
  return prisma.class_schedule.findUnique({
    where: {
      ClassID: classId,
    },
    include: {
      teachers_responsibility: {
        include: {
          teacher: true,
        },
      },
      subject: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
  });
}

/**
 * Create a new class schedule
 */
export async function create(data: Prisma.class_scheduleCreateInput) {
  return prisma.class_schedule.create({
    data,
  });
}

/**
 * Update a class schedule
 */
export async function update(
  classId: string,
  data: Prisma.class_scheduleUpdateInput,
) {
  return prisma.class_schedule.update({
    where: {
      ClassID: classId,
    },
    data,
  });
}

/**
 * Delete a class schedule
 */
export async function deleteById(classId: string) {
  return prisma.class_schedule.delete({
    where: {
      ClassID: classId,
    },
  });
}

/**
 * Count all class schedules
 */
export async function count(
  where?: Prisma.class_scheduleWhereInput,
): Promise<number> {
  return prisma.class_schedule.count({ where });
}
