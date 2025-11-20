import { describe, it, expect } from '@jest/globals';
import {
  validateProgramMOECredits,
  calculateLearningAreaCredits,
} from '@/features/program/domain/services/moe-validation.service';
import { SubjectCategory, LearningArea } from '@/prisma/generated/client';
import type { program_subject, subject } from '@/prisma/generated/client';

describe('MOE Validation Service', () => {
  describe('validateProgramMOECredits', () => {
    it('should validate compliant junior program (M.1-M.3)', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 1,
          SubjectCode: 'THAI01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 5,
          MaxCredits: 5,
          SortOrder: 1,
          subject: {
            SubjectCode: 'THAI01',
            SubjectName: 'ภาษาไทย',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.THAI,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 2,
          ProgramID: 1,
          SubjectCode: 'MATH01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 5,
          MaxCredits: 5,
          SortOrder: 2,
          subject: {
            SubjectCode: 'MATH01',
            SubjectName: 'คณิตศาสตร์',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 3,
          ProgramID: 1,
          SubjectCode: 'SCI01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 5,
          MaxCredits: 5,
          SortOrder: 3,
          subject: {
            SubjectCode: 'SCI01',
            SubjectName: 'วิทยาศาสตร์',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.SCIENCE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 4,
          ProgramID: 1,
          SubjectCode: 'SOC01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 4,
          MaxCredits: 4,
          SortOrder: 4,
          subject: {
            SubjectCode: 'SOC01',
            SubjectName: 'สังคมศึกษา',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.SOCIAL,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 5,
          ProgramID: 1,
          SubjectCode: 'HEALTH01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 5,
          subject: {
            SubjectCode: 'HEALTH01',
            SubjectName: 'สุขศึกษาและพลศึกษา',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.HEALTH_PE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 6,
          ProgramID: 1,
          SubjectCode: 'ART01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 6,
          subject: {
            SubjectCode: 'ART01',
            SubjectName: 'ศิลปะ',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.ARTS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 7,
          ProgramID: 1,
          SubjectCode: 'CAREER01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 7,
          subject: {
            SubjectCode: 'CAREER01',
            SubjectName: 'การงานอาชีพ',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.CAREER,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 8,
          ProgramID: 1,
          SubjectCode: 'ENG01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: 8,
          subject: {
            SubjectCode: 'ENG01',
            SubjectName: 'ภาษาอังกฤษ',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.FOREIGN_LANGUAGE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 9,
          ProgramID: 1,
          SubjectCode: 'ACT01',
          Category: SubjectCategory.ACTIVITY,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 9,
          subject: {
            SubjectCode: 'ACT01',
            SubjectName: 'ชุมนุม',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.ACTIVITY,
            LearningArea: null,
            ActivityType: 'CLUB',
            IsGraded: false,
            Description: '',
          },
        },
      ];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.totalCredits).toBe(28); // THAI:5 + MATH:5 + SCI:5 + SOC:4 + HEALTH:2 + ARTS:2 + CAREER:2 + FOREIGN:3 = 28
      expect(result.requiredCredits).toBe(28); // Junior total
    });

    it('should detect insufficient credits for junior program', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 1,
          SubjectCode: 'THAI01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3, // Should be 5
          MaxCredits: 3,
          SortOrder: 1,
          subject: {
            SubjectCode: 'THAI01',
            SubjectName: 'ภาษาไทย',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.THAI,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
      ];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('ภาษาไทย');
      expect(result.errors[0]).toContain('5');
      // The actual implementation shows current credits (3)
      expect(result.errors[0]).toContain('(ขาด');
    });

    it('should validate compliant senior program (M.4-M.6)', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 2,
          SubjectCode: 'THAI04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: 1,
          subject: {
            SubjectCode: 'THAI04',
            SubjectName: 'ภาษาไทย ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.THAI,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 2,
          ProgramID: 2,
          SubjectCode: 'MATH04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: 2,
          subject: {
            SubjectCode: 'MATH04',
            SubjectName: 'คณิตศาสตร์ ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 3,
          ProgramID: 2,
          SubjectCode: 'SCI04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: 3,
          subject: {
            SubjectCode: 'SCI04',
            SubjectName: 'วิทยาศาสตร์ ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.SCIENCE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 4,
          ProgramID: 2,
          SubjectCode: 'SOC04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 4,
          subject: {
            SubjectCode: 'SOC04',
            SubjectName: 'สังคมศึกษา ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.SOCIAL,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 5,
          ProgramID: 2,
          SubjectCode: 'HEALTH04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 5,
          subject: {
            SubjectCode: 'HEALTH04',
            SubjectName: 'สุขศึกษาและพลศึกษา ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.HEALTH_PE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 6,
          ProgramID: 2,
          SubjectCode: 'ART04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 6,
          subject: {
            SubjectCode: 'ART04',
            SubjectName: 'ศิลปะ ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.ARTS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 7,
          ProgramID: 2,
          SubjectCode: 'CAREER04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 7,
          subject: {
            SubjectCode: 'CAREER04',
            SubjectName: 'การงานอาชีพ ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.CAREER,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 8,
          ProgramID: 2,
          SubjectCode: 'ENG04',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 8,
          subject: {
            SubjectCode: 'ENG04',
            SubjectName: 'ภาษาอังกฤษ ม.4',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.FOREIGN_LANGUAGE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
      ];

      const result = validateProgramMOECredits(4, mockProgramSubjects);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalCredits).toBe(17); // THAI:3 + MATH:3 + SCI:3 + SOC:2 + HEALTH:2 + ARTS:1 + CAREER:1 + FOREIGN:2 = 17
      expect(result.requiredCredits).toBe(17);
    });

    it('should warn if activities are missing', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 1,
          SubjectCode: 'THAI01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 5,
          MaxCredits: 5,
          SortOrder: 1,
          subject: {
            SubjectCode: 'THAI01',
            SubjectName: 'ภาษาไทย',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.THAI,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        // ... other core subjects (27 credits total)
      ];

      // Mock complete credits but no activities
      const completeSubjects = [...mockProgramSubjects];
      for (let i = 0; i < 7; i++) {
        completeSubjects.push({
          ProgramSubjectID: i + 10,
          ProgramID: 1,
          SubjectCode: `SUBJ${i}`,
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: i + 10,
          subject: {
            SubjectCode: `SUBJ${i}`,
            SubjectName: `Subject ${i}`,
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        });
      }

      const result = validateProgramMOECredits(1, completeSubjects);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('กิจกรรมพัฒนาผู้เรียน');
    });

    it('should reject invalid year', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [];

      const result = validateProgramMOECredits(7, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ปีต้องอยู่ระหว่าง 1-6');
    });

    it('should handle edge case with zero credits', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.totalCredits).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('calculateLearningAreaCredits', () => {
    it('should sum credits for specific learning area', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 1,
          SubjectCode: 'MATH01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 1,
          subject: {
            SubjectCode: 'MATH01',
            SubjectName: 'คณิตศาสตร์ 1',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 2,
          ProgramID: 1,
          SubjectCode: 'MATH02',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2.5,
          MaxCredits: 2.5,
          SortOrder: 2,
          subject: {
            SubjectCode: 'MATH02',
            SubjectName: 'คณิตศาสตร์ 2',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 3,
          ProgramID: 1,
          SubjectCode: 'SCI01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: 3,
          subject: {
            SubjectCode: 'SCI01',
            SubjectName: 'วิทยาศาสตร์',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.SCIENCE,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
      ];

      const mathCredits = calculateLearningAreaCredits(mockProgramSubjects, LearningArea.MATHEMATICS);
      const scienceCredits = calculateLearningAreaCredits(mockProgramSubjects, LearningArea.SCIENCE);

      expect(mathCredits).toBe(4.5); // 2 + 2.5
      expect(scienceCredits).toBe(3);
    });

    it('should return 0 for learning area with no subjects', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [];

      const artCredits = calculateLearningAreaCredits(mockProgramSubjects, LearningArea.ARTS);

      expect(artCredits).toBe(0);
    });

    it('should exclude activity subjects from credit calculation', () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> = [
        {
          ProgramSubjectID: 1,
          ProgramID: 1,
          SubjectCode: 'MATH01',
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 2,
          MaxCredits: 2,
          SortOrder: 1,
          subject: {
            SubjectCode: 'MATH01',
            SubjectName: 'คณิตศาสตร์',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: '',
          },
        },
        {
          ProgramSubjectID: 2,
          ProgramID: 1,
          SubjectCode: 'ACT01',
          Category: SubjectCategory.ACTIVITY,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 2,
          subject: {
            SubjectCode: 'ACT01',
            SubjectName: 'ชุมนุม',
            Credit: 'CREDIT_10',
            Category: SubjectCategory.ACTIVITY,
            LearningArea: null,
            ActivityType: 'CLUB',
            IsGraded: false,
            Description: '',
          },
        },
      ];

      const mathCredits = calculateLearningAreaCredits(mockProgramSubjects, LearningArea.MATHEMATICS);

      expect(mathCredits).toBe(2); // Only MATH01, ACT01 excluded
    });
  });
});
