/**
 * Infrastructure Layer: Subject Repository
 * 
 * Handles all database operations for subjects using Prisma.
 * Pure data access layer with no business logic.
 * 
 * @module subject.repository
 */

import prisma from '@/libs/prisma';
import type { CreateSubjectInput, UpdateSubjectInput } from '../../application/schemas/subject.schemas';

export const subjectRepository = {
  /**
   * Find all subjects ordered by SubjectCode
   */
  async findAll() {
    return prisma.subject.findMany({
      orderBy: {
        SubjectCode: 'asc',
      },
    });
  },

  /**
   * Find a single subject by SubjectCode (primary key)
   */
  async findByCode(subjectCode: string) {
    return prisma.subject.findUnique({
      where: {
        SubjectCode: subjectCode,
      },
    });
  },

  /**
   * Find subject by SubjectName (for duplicate check)
   */
  async findByName(subjectName: string) {
    return prisma.subject.findFirst({
      where: {
        SubjectName: subjectName,
      },
    });
  },

  /**
   * Create a single subject
   * Note: SubjectCode whitespace is trimmed in domain layer before calling this
   */
  async create(data: CreateSubjectInput) {
    return prisma.subject.create({
      data: {
        SubjectCode: data.SubjectCode,
        SubjectName: data.SubjectName,
        Credit: data.Credit,
        Category: data.Category,
        ProgramID: data.ProgramID,
      },
    });
  },

  /**
   * Update a subject by SubjectCode
   * Note: Updating SubjectCode itself may break relations - use with caution
   */
  async update(subjectCode: string, data: UpdateSubjectInput) {
    return prisma.subject.update({
      where: {
        SubjectCode: subjectCode,
      },
      data: {
        SubjectCode: data.SubjectCode,
        SubjectName: data.SubjectName,
        Credit: data.Credit,
        Category: data.Category,
        ProgramID: data.ProgramID,
      },
    });
  },

  /**
   * Delete multiple subjects by SubjectCode array
   */
  async deleteMany(subjectCodes: string[]) {
    return prisma.subject.deleteMany({
      where: {
        SubjectCode: {
          in: subjectCodes,
        },
      },
    });
  },

  /**
   * Get subject count
   */
  async count() {
    return prisma.subject.count();
  },
};
