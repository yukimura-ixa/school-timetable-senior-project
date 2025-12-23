/**
 * Config Feature - Repository Layer
 *
 * Handles all database operations for table_config using Prisma.
 * Config stores timetable configuration settings as JSON.
 */

import prisma from "@/lib/prisma";
import {
  withPrismaTransaction,
  type TransactionClient,
} from "@/lib/prisma-transaction";
import { semester, Prisma } from "@/prisma/generated/client";
import type { SemesterStatus } from "@/prisma/generated/client";
import type { FullConfigData } from "../../types/config-types";

/**
 * Type for config data
 */
export type ConfigData = {
  ConfigID: string;
  AcademicYear: number;
  Semester: semester;
  Config: Prisma.JsonValue;
};

/**
 * Get all configs ordered by ConfigID
 */
export async function findAll() {
  return await prisma.table_config.findMany({
    orderBy: {
      ConfigID: "asc",
    },
  });
}

/**
 * Find config by academic year and semester
 * Returns null if not found
 */
export async function findByTerm(academicYear: number, semester: semester) {
  return await prisma.table_config.findFirst({
    where: {
      AcademicYear: academicYear,
      Semester: semester,
    },
  });
}

/**
 * Find config by ConfigID (primary key)
 * Returns null if not found
 */
export async function findByConfigId(configId: string) {
  return await prisma.table_config.findUnique({
    where: {
      ConfigID: configId,
    },
  });
}

/**
 * Create a new config
 */
export async function create(data: ConfigData) {
  return await prisma.table_config.create({
    data: {
      ConfigID: data.ConfigID,
      AcademicYear: data.AcademicYear,
      Semester: data.Semester,
      Config: data.Config as Prisma.InputJsonValue,
    },
  });
}

/**
 * Update an existing config
 */
export async function update(
  configId: string,
  data: Partial<Omit<ConfigData, "ConfigID">>,
) {
  const updateData: Prisma.table_configUpdateInput = {
    ...(data.AcademicYear !== undefined && { AcademicYear: data.AcademicYear }),
    ...(data.Semester !== undefined && { Semester: data.Semester }),
    ...(data.Config !== undefined && {
      Config: data.Config as Prisma.InputJsonValue,
    }),
  };
  return await prisma.table_config.update({
    where: { ConfigID: configId },
    data: updateData,
  });
}

/**
 * Delete a config by ConfigID
 */
export async function deleteById(configId: string) {
  return await prisma.table_config.delete({
    where: {
      ConfigID: configId,
    },
  });
}

/**
 * Count total configs
 */
export async function count(): Promise<number> {
  return await prisma.table_config.count();
}

/**
 * Update config status
 */
export async function updateStatus(
  configId: string,
  status: SemesterStatus,
  publishedAt?: Date | null,
) {
  return await prisma.table_config.update({
    where: { ConfigID: configId },
    data: {
      status,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      updatedAt: new Date(),
    },
  });
}

/**
 * Update config completeness percentage
 */
export async function updateCompleteness(
  configId: string,
  completeness: number,
) {
  return await prisma.table_config.update({
    where: { ConfigID: configId },
    data: {
      configCompleteness: completeness,
      updatedAt: new Date(),
    },
  });
}

/**
 * Count entities for completeness calculation
 */
export async function countEntitiesForCompleteness(
  academicYear: number,
  semester: semester,
) {
  const [timeslotCount, teacherCount, subjectCount, classCount, roomCount] =
    await Promise.all([
      prisma.timeslot.count({
        where: {
          AcademicYear: academicYear,
          Semester: semester,
        },
      }),
      prisma.teachers_responsibility.count({
        where: {
          AcademicYear: academicYear,
          Semester: semester,
        },
      }),
      prisma.subject.count(),
      prisma.gradelevel.count(),
      prisma.room.count(),
    ]);

  return {
    timeslotCount,
    teacherCount,
    subjectCount,
    classCount,
    roomCount,
  };
}

/**
 * Count timeslots for a given academic term
 */
export async function countTimeslotsForTerm(
  academicYear: number,
  semester: semester,
) {
  return await prisma.timeslot.count({
    where: {
      AcademicYear: academicYear,
      Semester: semester,
    },
  });
}

/**
 * Get config with schedule counts
 */
export async function findByIdWithCounts(
  configId: string,
  academicYear: number,
  semester: semester,
) {
  const config = await prisma.table_config.findUnique({
    where: { ConfigID: configId },
  });

  if (!config) {
    return null;
  }

  const [timeslotCount, teacherCount, classScheduleCount] = await Promise.all([
    prisma.timeslot.count({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    }),
    prisma.teachers_responsibility.count({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    }),
    prisma.class_schedule.count({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: semester,
        },
      },
    }),
  ]);

  return {
    ...config,
    counts: {
      timeslots: timeslotCount,
      teachers: teacherCount,
      schedules: classScheduleCount,
    },
  };
}

/**
 * Get timetable configuration for a specific semester
 * Returns only the Config JSON field
 */
export async function getTimetableConfig(
  academicYear: number,
  semester: semester,
) {
  const config = await prisma.table_config.findFirst({
    where: {
      AcademicYear: academicYear,
      Semester: semester,
    },
    select: {
      Config: true,
    },
  });

  return config?.Config ?? null;
}

/**
 * Fetches the data required to run the publish readiness check for a config.
 */
export async function findFullConfigData(
  configId: string,
): Promise<FullConfigData | null> {
  const config = await findByConfigId(configId);
  if (!config) {
    return null;
  }

  const { AcademicYear, Semester } = config;
  const [totalTimeslots, schedules, grades, programs] = await Promise.all([
    countTimeslotsForTerm(AcademicYear, Semester),
    prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear,
          Semester,
        },
      },
    }),
    prisma.gradelevel.findMany(),
    prisma.program.findMany({
      where: {
        IsActive: true,
      },
      include: {
        program_subject: {
          include: {
            subject: true,
          },
        },
      },
    }),
  ]);

  const requiredSubjects = new Map<string, string[]>();
  grades.forEach((grade) => {
    if (!grade.ProgramID) {
      return;
    }

    const gradeProgram = programs.find(
      (program) => program.ProgramID === grade.ProgramID,
    );

    if (!gradeProgram) {
      return;
    }

    const required = gradeProgram.program_subject
      .filter((ps) => ps.IsMandatory)
      .map((ps) => ps.SubjectCode);

    requiredSubjects.set(grade.GradeID, required);
  });

  return {
    configId,
    schedules,
    grades,
    programs,
    totalTimeslots,
    requiredSubjects,
  };
}

export async function transaction<T>(
  callback: (tx: TransactionClient) => Promise<T>,
) {
  return withPrismaTransaction(callback);
}
