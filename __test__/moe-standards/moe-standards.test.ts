/**
 * Unit Tests for MOE Standards and Validation
 */

import {
  getMOEStandards,
  getMinCoreLessons,
  getMaxCoreLessons,
  validateTotalLessons,
  getSubjectGroups,
  getTrackElectives,
  type YearKey
} from '@/config/moe-standards';

import {
  validateProgramStandards,
  numericYearToKey,
  yearKeyToNumeric,
  isLowerSecondary,
  isUpperSecondary,
  getYearDescription,
  formatValidationResult,
  type SubjectAssignment
} from '@/utils/moe-validation';

describe('MOE Standards Configuration', () => {
  describe('getMOEStandards', () => {
    it('should return standards for all grade levels', () => {
      const years: YearKey[] = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
      
      years.forEach(year => {
        const standard = getMOEStandards(year);
        expect(standard).toBeDefined();
        expect(standard.year).toBe(year);
        expect(standard.coreSubjects.length).toBeGreaterThan(0);
        expect(standard.minTotalLessons).toBeGreaterThan(0);
        expect(standard.maxTotalLessons).toBeGreaterThanOrEqual(standard.minTotalLessons);
      });
    });

    it('should have correct lesson ranges for lower secondary', () => {
      const m1 = getMOEStandards('M1');
      expect(m1.minTotalLessons).toBe(28);
      expect(m1.maxTotalLessons).toBe(32);
    });

    it('should have correct lesson ranges for upper secondary', () => {
      const m4 = getMOEStandards('M4');
      expect(m4.minTotalLessons).toBe(30);
      expect(m4.maxTotalLessons).toBe(34);
    });

    it('should include all 8 core subjects for lower secondary', () => {
      const m1 = getMOEStandards('M1');
      const coreGroups = new Set(m1.coreSubjects.map(s => s.subjectCode));
      
      expect(coreGroups.has('TH')).toBe(true); // Thai
      expect(coreGroups.has('MA')).toBe(true); // Math
      expect(coreGroups.has('SC')).toBe(true); // Science
      expect(coreGroups.has('SS')).toBe(true); // Social Studies
      expect(coreGroups.has('PE')).toBe(true); // PE
      expect(coreGroups.has('AR')).toBe(true); // Arts
      expect(coreGroups.has('CT')).toBe(true); // Career & Tech
      expect(coreGroups.has('EN')).toBe(true); // English
    });

    it('should have reduced core subjects for upper secondary', () => {
      const m4 = getMOEStandards('M4');
      expect(m4.coreSubjects.length).toBeLessThan(getMOEStandards('M1').coreSubjects.length);
    });
  });

  describe('getMinCoreLessons and getMaxCoreLessons', () => {
    it('should calculate correct minimum core lessons', () => {
      const minM1 = getMinCoreLessons('M1');
      expect(minM1).toBeGreaterThan(0);
      
      // Lower secondary should have higher minimum core than upper
      const minM4 = getMinCoreLessons('M4');
      expect(minM1).toBeGreaterThan(minM4);
    });

    it('should calculate correct maximum core lessons', () => {
      const maxM1 = getMaxCoreLessons('M1');
      const minM1 = getMinCoreLessons('M1');
      expect(maxM1).toBeGreaterThanOrEqual(minM1);
    });
  });

  describe('validateTotalLessons', () => {
    it('should pass for valid lesson count', () => {
      const result = validateTotalLessons('M1', 30);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should fail for too few lessons', () => {
      const result = validateTotalLessons('M1', 20);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('ต่ำกว่ามาตรฐาน');
    });

    it('should fail for too many lessons', () => {
      const result = validateTotalLessons('M1', 40);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('เกินมาตรฐาน');
    });

    it('should accept minimum boundary', () => {
      const result = validateTotalLessons('M1', 28);
      expect(result.valid).toBe(true);
    });

    it('should accept maximum boundary', () => {
      const result = validateTotalLessons('M1', 32);
      expect(result.valid).toBe(true);
    });
  });

  describe('getSubjectGroups', () => {
    it('should return all subject groups', () => {
      const groups = getSubjectGroups('M1');
      expect(groups.length).toBeGreaterThan(0);
      expect(groups).toContain('คณิตศาสตร์');
      expect(groups).toContain('วิทยาศาสตร์');
    });
  });

  describe('getTrackElectives', () => {
    it('should return same electives for all lower secondary', () => {
      const m1 = getTrackElectives('M1', 'GENERAL');
      const m2 = getTrackElectives('M2', 'SCIENCE_MATH');
      expect(m1.length).toBe(m2.length);
    });

    it('should return science-math electives for science track', () => {
      const electives = getTrackElectives('M4', 'SCIENCE_MATH');
      const codes = electives.map(e => e.subjectCode);
      expect(codes).toContain('PH'); // Physics
      expect(codes).toContain('CH_SCI'); // Chemistry
      expect(codes).toContain('BI'); // Biology
    });

    it('should return arts-language electives for arts track', () => {
      const electives = getTrackElectives('M4', 'ARTS_LANGUAGE');
      const codes = electives.map(e => e.subjectCode);
      expect(codes).toContain('SS_ADV'); // Advanced Social Studies
      expect(codes).toContain('EN_ADV'); // Advanced English
    });
  });
});

describe('MOE Validation Utilities', () => {
  describe('numericYearToKey and yearKeyToNumeric', () => {
    it('should convert numeric year to key', () => {
      expect(numericYearToKey(1)).toBe('M1');
      expect(numericYearToKey(6)).toBe('M6');
    });

    it('should convert key to numeric year', () => {
      expect(yearKeyToNumeric('M1')).toBe(1);
      expect(yearKeyToNumeric('M6')).toBe(6);
    });

    it('should throw error for invalid numeric year', () => {
      expect(() => numericYearToKey(0)).toThrow();
      expect(() => numericYearToKey(7)).toThrow();
    });

    it('should round-trip correctly', () => {
      expect(yearKeyToNumeric(numericYearToKey(3))).toBe(3);
      expect(numericYearToKey(yearKeyToNumeric('M5'))).toBe('M5');
    });
  });

  describe('isLowerSecondary and isUpperSecondary', () => {
    it('should identify lower secondary years', () => {
      expect(isLowerSecondary('M1')).toBe(true);
      expect(isLowerSecondary('M2')).toBe(true);
      expect(isLowerSecondary('M3')).toBe(true);
      expect(isLowerSecondary('M4')).toBe(false);
    });

    it('should identify upper secondary years', () => {
      expect(isUpperSecondary('M4')).toBe(true);
      expect(isUpperSecondary('M5')).toBe(true);
      expect(isUpperSecondary('M6')).toBe(true);
      expect(isUpperSecondary('M3')).toBe(false);
    });

    it('should work with numeric years', () => {
      expect(isLowerSecondary(1)).toBe(true);
      expect(isUpperSecondary(4)).toBe(true);
    });
  });

  describe('getYearDescription', () => {
    it('should return Thai description', () => {
      const desc = getYearDescription('M1');
      expect(desc).toContain('มัธยมศึกษา');
      expect(desc).toContain('1');
    });

    it('should work with numeric year', () => {
      const desc = getYearDescription(4);
      expect(desc).toContain('มัธยมศึกษา');
      expect(desc).toContain('4');
    });
  });

  describe('validateProgramStandards', () => {
    const createValidM1Program = (): SubjectAssignment[] => [
      { subjectCode: 'TH', subjectName: 'ภาษาไทย', weeklyLessons: 4, category: 'CORE', group: 'ภาษาไทย' },
      { subjectCode: 'MA', subjectName: 'คณิตศาสตร์', weeklyLessons: 4, category: 'CORE', group: 'คณิตศาสตร์' },
      { subjectCode: 'SC', subjectName: 'วิทยาศาสตร์', weeklyLessons: 3, category: 'CORE', group: 'วิทยาศาสตร์' },
      { subjectCode: 'SS', subjectName: 'สังคมศึกษา', weeklyLessons: 3, category: 'CORE', group: 'สังคมศึกษา' },
      { subjectCode: 'PE', subjectName: 'พลศึกษา', weeklyLessons: 2, category: 'CORE', group: 'พลศึกษา' },
      { subjectCode: 'AR', subjectName: 'ศิลปะ', weeklyLessons: 2, category: 'CORE', group: 'ศิลปะ' },
      { subjectCode: 'CT', subjectName: 'การงาน', weeklyLessons: 2, category: 'CORE', group: 'การงานอาชีพ' },
      { subjectCode: 'EN', subjectName: 'ภาษาอังกฤษ', weeklyLessons: 2, category: 'CORE', group: 'ภาษาอังกฤษ' },
      { subjectCode: 'CH', subjectName: 'ภาษาจีน', weeklyLessons: 2, category: 'ELECTIVE', group: 'ภาษาต่างประเทศ' },
      { subjectCode: 'CP', subjectName: 'คอมพิวเตอร์', weeklyLessons: 2, category: 'ELECTIVE', group: 'การงานอาชีพ' },
      { subjectCode: 'HR', subjectName: 'ชั้นเรียน', weeklyLessons: 1, category: 'ACTIVITY', group: 'กิจกรรม' },
      { subjectCode: 'CLUB', subjectName: 'ชุมนุม', weeklyLessons: 1, category: 'ACTIVITY', group: 'กิจกรรม' }
    ];

    it('should validate compliant program', () => {
      const result = validateProgramStandards({
        year: 'M1',
        subjects: createValidM1Program()
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary.totalLessons).toBe(28);
    });

    it('should detect missing core subjects', () => {
      const subjects = createValidM1Program().filter(s => s.subjectCode !== 'TH');
      
      const result = validateProgramStandards({
        year: 'M1',
        subjects
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ขาดวิชาแกนหลัก'))).toBe(true);
      expect(result.summary.missingCoreSubjects).toContain('ภาษาไทย');
    });

    it('should detect too few total lessons', () => {
      const subjects = createValidM1Program().slice(0, 6); // Only 6 subjects
      
      const result = validateProgramStandards({
        year: 'M1',
        subjects
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ต่ำกว่ามาตรฐาน'))).toBe(true);
    });

    it('should detect too many total lessons', () => {
      const subjects = createValidM1Program();
      // Add excessive electives
      subjects.push(
        { subjectCode: 'EXTRA1', subjectName: 'Extra 1', weeklyLessons: 3, category: 'ELECTIVE', group: 'Test' },
        { subjectCode: 'EXTRA2', subjectName: 'Extra 2', weeklyLessons: 3, category: 'ELECTIVE', group: 'Test' }
      );
      
      const result = validateProgramStandards({
        year: 'M1',
        subjects
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('เกินมาตรฐาน'))).toBe(true);
    });

    it('should warn about missing homeroom', () => {
      const subjects = createValidM1Program().filter(s => s.subjectCode !== 'HR');
      
      const result = validateProgramStandards({
        year: 'M1',
        subjects
      });

      expect(result.warnings.some(w => w.includes('ชั้นเรียน'))).toBe(true);
    });

    it('should warn about insufficient core subject lessons', () => {
      const subjects = createValidM1Program();
      // Reduce Thai lessons below minimum
      const thaiSubject = subjects.find(s => s.subjectCode === 'TH');
      if (thaiSubject) {
        thaiSubject.weeklyLessons = 2; // Below minimum of 4
      }
      
      const result = validateProgramStandards({
        year: 'M1',
        subjects
      });

      expect(result.warnings.some(w => w.includes('ภาษาไทย') && w.includes('น้อยกว่า'))).toBe(true);
    });

    it('should calculate correct lesson breakdown', () => {
      const result = validateProgramStandards({
        year: 'M1',
        subjects: createValidM1Program()
      });

      expect(result.summary.coreLessons).toBe(22);
      expect(result.summary.electiveLessons).toBe(4);
      expect(result.summary.activityLessons).toBe(2);
      expect(result.summary.totalLessons).toBe(28);
    });
  });

  describe('formatValidationResult', () => {
    it('should format valid result', () => {
      const result = validateProgramStandards({
        year: 'M1',
        subjects: [
          { subjectCode: 'TH', subjectName: 'ภาษาไทย', weeklyLessons: 4, category: 'CORE', group: 'ภาษาไทย' },
          { subjectCode: 'MA', subjectName: 'คณิตศาสตร์', weeklyLessons: 4, category: 'CORE', group: 'คณิตศาสตร์' },
          { subjectCode: 'SC', subjectName: 'วิทยาศาสตร์', weeklyLessons: 3, category: 'CORE', group: 'วิทยาศาสตร์' },
          { subjectCode: 'SS', subjectName: 'สังคมศึกษา', weeklyLessons: 3, category: 'CORE', group: 'สังคมศึกษา' },
          { subjectCode: 'PE', subjectName: 'พลศึกษา', weeklyLessons: 2, category: 'CORE', group: 'พลศึกษา' },
          { subjectCode: 'AR', subjectName: 'ศิลปะ', weeklyLessons: 2, category: 'CORE', group: 'ศิลปะ' },
          { subjectCode: 'CT', subjectName: 'การงาน', weeklyLessons: 2, category: 'CORE', group: 'การงานอาชีพ' },
          { subjectCode: 'EN', subjectName: 'ภาษาอังกฤษ', weeklyLessons: 2, category: 'CORE', group: 'ภาษาอังกฤษ' },
          { subjectCode: 'CH', subjectName: 'ภาษาจีน', weeklyLessons: 2, category: 'ELECTIVE', group: 'ภาษาต่างประเทศ' },
          { subjectCode: 'CP', subjectName: 'คอมพิวเตอร์', weeklyLessons: 2, category: 'ELECTIVE', group: 'การงานอาชีพ' },
          { subjectCode: 'HR', subjectName: 'ชั้นเรียน', weeklyLessons: 1, category: 'ACTIVITY', group: 'กิจกรรม' },
          { subjectCode: 'CLUB', subjectName: 'ชุมนุม', weeklyLessons: 1, category: 'ACTIVITY', group: 'กิจกรรม' }
        ]
      });

      const formatted = formatValidationResult(result);
      expect(formatted).toContain('สรุป');
      expect(formatted).toContain('รวมทั้งหมด');
      expect(formatted).toContain('✅');
    });

    it('should format invalid result with errors', () => {
      const result = validateProgramStandards({
        year: 'M1',
        subjects: [
          { subjectCode: 'TH', subjectName: 'ภาษาไทย', weeklyLessons: 4, category: 'CORE', group: 'ภาษาไทย' }
        ]
      });

      const formatted = formatValidationResult(result);
      expect(formatted).toContain('❌');
      expect(formatted).toContain('ข้อผิดพลาด');
    });
  });
});
