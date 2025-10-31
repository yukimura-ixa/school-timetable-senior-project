/**
 * Infrastructure Layer: Teacher Repository
 * 
 * Handles all database operations for teachers using Prisma.
 * Pure data access layer with no business logic.
 * Uses React cache() for request-level memoization.
 * 
 * @module teacher.repository
 */

import { cache } from 'react';
import prisma from '@/lib/prisma';
import type { CreateTeacherInput, UpdateTeacherInput } from '../../application/schemas/teacher.schemas';

/**
 * Find all teachers ordered by firstname
 * Cached per request using React cache()
 */
const findAllTeachers = cache(async () => {
  return prisma.teacher.findMany({
    orderBy: {
      Firstname: 'asc',
    },
  });
});

/**
 * Find a single teacher by ID
 * Cached per request using React cache()
 */
const findTeacherById = cache(async (teacherId: number) => {
  return prisma.teacher.findUnique({
    where: {
      TeacherID: teacherId,
    },
  });
});

export const teacherRepository = {
  /**
   * Find all teachers ordered by firstname
   * Cached per request using React cache()
   */
  async findAll() {
    return findAllTeachers();
  },

  /**
   * Find a single teacher by ID
   * Cached per request using React cache()
   */
  async findById(teacherId: number) {
    return findTeacherById(teacherId);
  },

  /**
   * Check if a teacher with exact details already exists
   */
  async findDuplicate(data: CreateTeacherInput) {
    return prisma.teacher.findFirst({
      where: {
        Prefix: data.Prefix,
        Firstname: data.Firstname,
        Lastname: data.Lastname,
        Email: data.Email,
        Department: data.Department,
      },
    });
  },

  /**
   * Check if an email is already in use
   */
  async findByEmail(email: string) {
    return prisma.teacher.findFirst({
      where: {
        Email: email,
      },
    });
  },

  /**
   * Create a single teacher
   */
  async create(data: CreateTeacherInput) {
    return prisma.teacher.create({
      data: {
        Prefix: data.Prefix,
        Firstname: data.Firstname,
        Lastname: data.Lastname,
        Department: data.Department,
        Email: data.Email,
      },
    });
  },

  /**
   * Update a teacher by ID
   */
  async update(teacherId: number, data: Omit<UpdateTeacherInput, 'TeacherID'>) {
    return prisma.teacher.update({
      where: {
        TeacherID: teacherId,
      },
      data: {
        Prefix: data.Prefix,
        Firstname: data.Firstname,
        Lastname: data.Lastname,
        Department: data.Department,
        Email: data.Email,
      },
    });
  },

  /**
   * Delete multiple teachers by IDs
   */
  async deleteMany(teacherIds: number[]) {
    return prisma.teacher.deleteMany({
      where: {
        TeacherID: {
          in: teacherIds,
        },
      },
    });
  },

  /**
   * Get teacher count (useful for statistics)
   */
  async count() {
    return prisma.teacher.count();
  },
};
