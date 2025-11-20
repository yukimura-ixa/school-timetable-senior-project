/**
 * Infrastructure Layer: Subject Repository
 * 
 * Handles all database operations for subjects using Prisma.
 * Pure data access layer with no business logic.
 * 
 * @module subject.repository
 */

import prisma from '@/lib/prisma';
import type { subject } from @/prisma/generated/client';
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
   * Find subjects by grade through program relationship
   * Returns subjects available for a specific grade level
   * Note: Subjects are determined by the grade's program, not by semester
   */
  async findByGrade(gradeId: string): Promise<subject[]> {
    // Get the gradelevel with its program
    const gradelevel = await prisma.gradelevel.findUnique({
      where: { GradeID: gradeId },
      include: {
        program: {
          include: {
            program_subject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!gradelevel?.program) {
      return [];
    }

    // Extract subjects from program_subject relation
    const subjects = gradelevel.program.program_subject.map(ps => ps.subject);

    return subjects;
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
        LearningArea: data.LearningArea,
        ActivityType: data.ActivityType,
        IsGraded: data.IsGraded,
        Description: data.Description,
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
        LearningArea: data.LearningArea,
        ActivityType: data.ActivityType,
        IsGraded: data.IsGraded,
        Description: data.Description,
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
