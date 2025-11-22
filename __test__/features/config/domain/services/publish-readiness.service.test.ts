/**
 * Unit Tests for Publish Readiness Domain Service
 * 
 * @jest-environment node
 */
import { checkPublishReadiness } from '@/features/config/domain/services/publish-readiness.service';
import type { FullConfigData } from '@/features/config/types/config-types';
import * as moeValidationService from '@/features/program/domain/services/moe-validation.service';

jest.mock('@/features/program/domain/services/moe-validation.service', () => ({
  validateProgramMOECredits: jest.fn(),
  createMOEValidationResult: jest.requireActual('@/features/program/domain/services/moe-validation.service').createMOEValidationResult,
}));

const mockedValidateProgramMOECredits = jest.mocked(
  moeValidationService.validateProgramMOECredits
);

describe('checkPublishReadiness', () => {
    const mockBaseConfigData: FullConfigData = {
        configId: '1-2567',
        schedules: [],
        grades: [
        { GradeID: 'M1-1', Year: 1, Number: 1, StudentCount: 30, ProgramID: 1 },
        ],
        programs: [
            { 
                ProgramID: 1, ProgramCode: 'sci-math', ProgramName: 'Science-Math', Year: 1, IsActive: true, Track: 'SCIENCE_MATH', Description: '', MinTotalCredits: 0,
                program_subject: [
                    { ProgramSubjectID: 1, ProgramID: 1, SubjectCode: 'TH101', Category: 'CORE', IsMandatory: true, MinCredits: 1.5, MaxCredits: 1.5, SortOrder: 1, subject: { SubjectCode: 'TH101', SubjectName: 'Thai', Credit: 'CREDIT_15', Category: 'CORE', LearningArea: 'THAI', ActivityType: null, IsGraded: true, Description: '' } }
                ] 
            }
        ],
        totalTimeslots: 35,
        requiredSubjects: new Map([['M1-1', ['TH101']]]),
    };

afterEach(() => {
    jest.resetAllMocks();
});

  it('should return "ready" status when all checks pass', () => {
    const readyData: FullConfigData = {
      ...mockBaseConfigData,
      schedules: Array(35).fill({ GradeID: 'M1-1', SubjectCode: 'TH101' }),
    };
    mockedValidateProgramMOECredits.mockReturnValue(
      moeValidationService.createMOEValidationResult({ isValid: true })
    );

    const result = checkPublishReadiness(readyData);
    expect(result.status).toBe('ready');
    expect(result.issues).toHaveLength(0);
  });

  it('should return "incomplete" status if timetables are not complete', () => {
    const incompleteData: FullConfigData = {
      ...mockBaseConfigData,
      schedules: Array(30).fill({ GradeID: 'M1-1', SubjectCode: 'TH101' }), // 30 out of 35
    };
    mockedValidateProgramMOECredits.mockReturnValue(
      moeValidationService.createMOEValidationResult({ isValid: true })
    );

    const result = checkPublishReadiness(incompleteData);
    expect(result.status).toBe('incomplete');
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.stringContaining('ชั้น 1/1: ยังไม่ครบ'),
    ]));
  });

  it('should return "moe-failed" status if MoE compliance fails', () => {
    const moeFailedData: FullConfigData = {
        ...mockBaseConfigData,
        schedules: Array(35).fill({ GradeID: 'M1-1', SubjectCode: 'TH101' }),
    };
    mockedValidateProgramMOECredits.mockReturnValue(
      moeValidationService.createMOEValidationResult({
        isValid: false,
        errors: ['Credit requirement not met'],
      })
    );

    const result = checkPublishReadiness(moeFailedData);
    expect(result.status).toBe('moe-failed');
    expect(result.issues).toEqual(expect.arrayContaining([
        expect.stringContaining('หลักสูตร ม.1 (Science-Math): Credit requirement not met'),
    ]));
  });

  it('should return "incomplete" status if both timetable and MoE checks fail', () => {
    const bothFailedData: FullConfigData = {
        ...mockBaseConfigData,
        schedules: Array(20).fill({ GradeID: 'M1-1', SubjectCode: 'TH101' }),
    };

    mockedValidateProgramMOECredits.mockReturnValue(
      moeValidationService.createMOEValidationResult({
        isValid: false,
        errors: ['Credit requirement not met'],
      })
    );

    const result = checkPublishReadiness(bothFailedData);
    expect(result.status).toBe('incomplete');
    expect(result.issues).toHaveLength(2);
  });
});
