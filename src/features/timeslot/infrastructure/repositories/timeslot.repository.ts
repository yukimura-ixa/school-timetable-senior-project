/**
 * Infrastructure Layer: Timeslot Repository
 * 
 * Handles all database operations for timeslots using Prisma.
 * Pure data access layer with no business logic.
 * 
 * @module timeslot.repository
 */

import prisma from '@/libs/prisma';
import type { timeslot, semester } from '@/prisma/generated';

export const timeslotRepository = {
  /**
   * Find all timeslots for a given academic year and semester
   * Returns unsorted data (sorting handled in domain layer)
   */
  async findByTerm(academicYear: number, semester: semester) {
    return prisma.timeslot.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });
  },

  /**
   * Find a single timeslot by ID
   */
  async findById(timeslotId: string) {
    return prisma.timeslot.findUnique({
      where: {
        TimeslotID: timeslotId,
      },
    });
  },

  /**
   * Check if timeslots exist for a term
   */
  async findFirst(academicYear: number, semester: semester) {
    return prisma.timeslot.findFirst({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });
  },

  /**
   * Create multiple timeslots at once
   */
  async createMany(timeslots: timeslot[]) {
    return prisma.timeslot.createMany({
      data: timeslots,
    });
  },

  /**
   * Delete all timeslots for a given term
   * Note: This should be called in a transaction with table_config and teachers_responsibility deletes
   */
  async deleteByTerm(academicYear: number, semester: semester) {
    return prisma.timeslot.deleteMany({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });
  },

  /**
   * Get timeslot count
   */
  async count() {
    return prisma.timeslot.count();
  },

  /**
   * Get timeslot count for a specific term
   */
  async countByTerm(academicYear: number, semester: semester) {
    return prisma.timeslot.count({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });
  },
};

/**
 * Table Config Repository
 * Manages timetable configuration storage
 */
export const tableConfigRepository = {
  /**
   * Find config by term
   */
  async findByTerm(academicYear: number, semester: semester) {
    const configId = `${semester[9]}/${academicYear}`;
    return prisma.table_config.findUnique({
      where: {
        ConfigID: configId,
      },
    });
  },

  /**
   * Create table config
   */
  async create(academicYear: number, semester: semester, config: any) {
    const configId = `${semester[9]}/${academicYear}`;
    return prisma.table_config.create({
      data: {
        ConfigID: configId,
        AcademicYear: academicYear,
        Semester: semester,
        Config: config,
      },
    });
  },

  /**
   * Delete table config by term
   */
  async deleteByTerm(academicYear: number, semester: semester) {
    const configId = `${semester[9]}/${academicYear}`;
    return prisma.table_config.delete({
      where: {
        ConfigID: configId,
      },
    });
  },
};

/**
 * Teachers Responsibility Repository Helper
 * For cascade deletion when term is deleted
 */
export const teachersResponsibilityRepository = {
  /**
   * Delete all teacher responsibilities for a term
   */
  async deleteByTerm(academicYear: number, semester: semester) {
    return prisma.teachers_responsibility.deleteMany({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });
  },
};
