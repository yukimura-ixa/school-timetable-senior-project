/**
 * Config Feature - Repository Layer
 * 
 * Handles all database operations for table_config using Prisma.
 * Config stores timetable configuration settings as JSON.
 */

import prisma from '@/libs/prisma';
import { semester, Prisma } from '@/prisma/generated';

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
      ConfigID: 'asc',
    },
  });
}

/**
 * Find config by academic year and semester
 * Returns null if not found
 */
export async function findByTerm(
  academicYear: number,
  semester: semester
) {
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
      Config: data.Config,
    },
  });
}

/**
 * Update an existing config
 */
export async function update(
  configId: string,
  data: Partial<Omit<ConfigData, 'ConfigID'>>
) {
  return await prisma.table_config.update({
    where: {
      ConfigID: configId,
    },
    data: {
      ...(data.AcademicYear !== undefined && { AcademicYear: data.AcademicYear }),
      ...(data.Semester !== undefined && { Semester: data.Semester }),
      ...(data.Config !== undefined && { Config: data.Config }),
    },
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
