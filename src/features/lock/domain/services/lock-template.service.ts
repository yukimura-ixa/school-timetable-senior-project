/**
 * Lock Template Service
 * 
 * Business logic for applying lock templates to schedules
 */

import type { LockTemplate } from '../models/lock-template.model';

export interface ApplyTemplateInput {
  template: LockTemplate;
  academicYear: number;
  semester: string;
  configId: string;
  
  // Available data from database
  availableGrades: Array<{
    GradeID: string;
    GradeName: string;
    Level: number;
  }>;
  availableTimeslots: Array<{
    TimeslotID: string;
    Day: string;
    PeriodStart: number;
  }>;
  availableRooms: Array<{
    RoomID: number;
    Name: string;
  }>;
  availableSubjects: Array<{
    SubjectID: string;
    Name_TH: string;
  }>;
  availableResponsibilities: Array<{
    RespID: number;
    SubjectCode: string;
    TeacherID: number;
  }>;
}

export interface ResolvedLock {
  SubjectCode: string;
  RoomID: number;
  TimeslotID: string;
  GradeID: string;
  RespID: number;
}

/**
 * Resolve template configuration to actual locks
 */
export function resolveTemplate(input: ApplyTemplateInput): {
  locks: ResolvedLock[];
  warnings: string[];
  errors: string[];
} {
  const { template, availableGrades, availableTimeslots, availableRooms, availableSubjects, availableResponsibilities } = input;
  const { config } = template;
  
  const locks: ResolvedLock[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Step 1: Filter grades based on template criteria
  let targetGrades = availableGrades;
  
  switch (config.gradeFilter.type) {
    case 'junior':
      targetGrades = availableGrades.filter(g => g.Level >= 1 && g.Level <= 3);
      break;
    case 'senior':
      targetGrades = availableGrades.filter(g => g.Level >= 4 && g.Level <= 6);
      break;
    case 'specific':
      if (config.gradeFilter.gradeIds) {
        targetGrades = availableGrades.filter(g => config.gradeFilter.gradeIds!.includes(g.GradeID));
      }
      break;
    case 'all':
      // Use all grades
      break;
  }

  if (targetGrades.length === 0) {
    errors.push('ไม่พบชั้นเรียนที่ตรงกับเกณฑ์');
    return { locks, warnings, errors };
  }

  // Step 2: Filter timeslots based on template criteria
  const targetTimeslots = availableTimeslots.filter(t => {
    const dayMatch = config.timeslotFilter.days.includes(t.Day);
    const periodMatch = config.timeslotFilter.periods.includes(t.PeriodStart);
    return dayMatch && periodMatch;
  });

  if (targetTimeslots.length === 0) {
    errors.push('ไม่พบคาบเรียนที่ตรงกับเกณฑ์');
    return { locks, warnings, errors };
  }

  // Step 3: Resolve room
  let roomId: number | null = config.roomId;
  
  if (!roomId) {
    // Try to find room by name
    const room = availableRooms.find(r => r.Name === config.roomName);
    if (room) {
      roomId = room.RoomID;
    } else {
      // Use first available room as fallback
      if (availableRooms.length > 0 && availableRooms[0]) {
        roomId = availableRooms[0].RoomID;
        warnings.push(`ไม่พบห้อง "${config.roomName}" ใช้ห้อง "${availableRooms[0]?.Name}" แทน`);
      } else {
        errors.push('ไม่พบห้องเรียนในระบบ');
        return { locks, warnings, errors };
      }
    }
  }

  // Step 4: Check if subject exists, if not we'll need to create it
  const subjectExists = availableSubjects.some(s => s.SubjectID === config.subjectCode);
  if (!subjectExists) {
    warnings.push(`วิชา "${config.subjectCode}" ยังไม่มีในระบบ จะต้องสร้างก่อน`);
  }

  // Step 5: Get responsibility (teacher assignment)
  // For lock templates, we might use a dummy teacher or the first available
  const resp = availableResponsibilities.find(r => r.SubjectCode === config.subjectCode);
  let respId: number;
  
  if (resp) {
    respId = resp.RespID;
  } else {
    // Use first available responsibility as fallback
    if (availableResponsibilities.length > 0 && availableResponsibilities[0]) {
      respId = availableResponsibilities[0].RespID;
      warnings.push(`ไม่พบครูที่สอนวิชา "${config.subjectCode}" ใช้ครูคนแรกแทน`);
    } else {
      errors.push('ไม่พบข้อมูลครูในระบบ');
      return { locks, warnings, errors };
    }
  }

  // Step 6: Generate locks (Cartesian product)
  for (const timeslot of targetTimeslots) {
    for (const grade of targetGrades) {
      locks.push({
        SubjectCode: config.subjectCode,
        RoomID: roomId,
        TimeslotID: timeslot.TimeslotID,
        GradeID: grade.GradeID,
        RespID: respId,
      });
    }
  }

  return { locks, warnings, errors };
}

/**
 * Validate that a template can be applied
 */
export function validateTemplate(input: ApplyTemplateInput): {
  valid: boolean;
  errors: string[];
} {
  const { locks, errors } = resolveTemplate(input);
  
  return {
    valid: locks.length > 0 && errors.length === 0,
    errors,
  };
}

/**
 * Get summary of what will be created
 */
export function getTemplateSummary(input: ApplyTemplateInput): {
  totalLocks: number;
  gradeCount: number;
  timeslotCount: number;
  affectedGrades: string[];
  affectedTimeslots: string[];
} {
  const { locks } = resolveTemplate(input);
  
  const uniqueGrades = new Set(locks.map(l => l.GradeID));
  const uniqueTimeslots = new Set(locks.map(l => l.TimeslotID));
  
  return {
    totalLocks: locks.length,
    gradeCount: uniqueGrades.size,
    timeslotCount: uniqueTimeslots.size,
    affectedGrades: Array.from(uniqueGrades),
    affectedTimeslots: Array.from(uniqueTimeslots),
  };
}
