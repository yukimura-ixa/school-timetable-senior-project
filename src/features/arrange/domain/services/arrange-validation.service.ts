/**
 * Arrange Feature - Validation Service
 * 
 * Pure functions for validating and processing teacher schedule arrangement.
 * All functions are side-effect free and testable.
 */

import type { SyncTeacherScheduleOutput } from '../../application/schemas/arrange.schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Basic schedule from repository
 */
export interface BasicSchedule {
  ClassID: string;
  TimeslotID: string;
}

/**
 * Schedule slot from the sync request
 */
export type ScheduleSlot = SyncTeacherScheduleOutput['Schedule'][number];

/**
 * Subject data within a schedule slot
 */
export type SubjectData = Exclude<ScheduleSlot['subject'], Record<string, never>>;

/**
 * Result of schedule sync operation
 */
export interface ScheduleSyncResult {
  deleted: Array<{ ClassID: string }>;
  added: Array<{
    ClassID: string;
    TimeslotID: string;
    SubjectCode: string;
    GradeID: string;
    RoomID: number;
    RespID: number;
  }>;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a slot is empty (will delete existing schedule)
 * 
 * @param slot - Schedule slot to check
 * @returns True if slot has empty subject object
 */
export function isEmptySlot(slot: ScheduleSlot): boolean {
  return Object.keys(slot.subject).length === 0;
}

/**
 * Check if subject is locked (should skip processing)
 * 
 * @param subject - Subject data
 * @returns True if subject is locked
 */
export function isLockedSubject(subject: SubjectData): boolean {
  return subject.IsLocked === true;
}

/**
 * Check if this is a new subject being added (no existing ClassID)
 * 
 * @param subject - Subject data
 * @returns True if subject has no ClassID (new assignment)
 */
export function isNewSubject(subject: SubjectData): boolean {
  return !subject.ClassID;
}

/**
 * Check if subject was moved to a different timeslot
 * 
 * @param subject - Subject data
 * @param newTimeslotId - The new TimeslotID from the slot
 * @returns True if subject's original timeslot differs from new timeslot
 */
export function isMovedSubject(subject: SubjectData, newTimeslotId: string): boolean {
  return subject.timeslot?.TimeslotID !== undefined && 
         subject.timeslot.TimeslotID !== newTimeslotId;
}

/**
 * Extract RespID from subject data (handles multiple formats)
 * 
 * @param subject - Subject data
 * @returns RespID or undefined if not found
 */
export function getRespID(subject: SubjectData): number | undefined {
  // Direct RespID field
  if (subject.RespID) {
    return subject.RespID;
  }
  
  // RespID from teachers_responsibility array
  if (subject.teachers_responsibility && subject.teachers_responsibility.length > 0) {
    return subject.teachers_responsibility[0]?.RespID;
  }
  
  return undefined;
}

/**
 * Extract RoomID from subject data
 * 
 * @param subject - Subject data
 * @returns RoomID or undefined if not found
 */
export function getRoomID(subject: SubjectData): number | undefined {
  return subject.room?.RoomID;
}

/**
 * Generate ClassID from components
 * Format: "{TimeslotID}-{SubjectCode}-{GradeID}"
 * 
 * @param timeslotId - Timeslot ID
 * @param subjectCode - Subject code
 * @param gradeId - Grade ID
 * @returns Generated ClassID
 */
export function generateClassID(
  timeslotId: string,
  subjectCode: string,
  gradeId: string
): string {
  return `${timeslotId}-${subjectCode}-${gradeId}`;
}

/**
 * Validate schedule slot has all required fields for creation
 * 
 * @param subject - Subject data
 * @returns Error message if validation fails, undefined if valid
 */
export function validateScheduleSlot(subject: SubjectData): string | undefined {
  if (!subject.SubjectCode) {
    return 'SubjectCode is required';
  }
  if (!subject.GradeID) {
    return 'GradeID is required';
  }
  if (getRoomID(subject) === undefined) {
    return 'RoomID is required';
  }
  if (getRespID(subject) === undefined) {
    return 'RespID is required';
  }
  return undefined;
}

// ============================================================================
// Business Logic Functions
// ============================================================================

/**
 * Calculate schedule changes based on current state and new slots
 * This implements the core drag-and-drop logic
 * 
 * @param slots - Array of schedule slots from the UI
 * @param existingSchedules - Current unlocked schedules in the database
 * @returns Object with arrays of schedules to delete and create
 */
export function calculateScheduleChanges(
  slots: ScheduleSlot[],
  existingSchedules: BasicSchedule[]
): ScheduleSyncResult {
  const result: ScheduleSyncResult = {
    deleted: [],
    added: [],
  };

  // Create map for quick lookup of existing schedules
  const existingMap = new Map(
    existingSchedules.map(schedule => [schedule.TimeslotID, schedule])
  );

  for (const slot of slots) {
    const existingSchedule = existingMap.get(slot.TimeslotID);

    // Case 1: Empty slot
    if (isEmptySlot(slot)) {
      if (existingSchedule) {
        // Delete existing schedule in this timeslot
        result.deleted.push({ ClassID: existingSchedule.ClassID });
      }
      continue;
    }

    // Slot has subject data
    const subject = slot.subject as SubjectData;

    // Skip locked subjects
    if (isLockedSubject(subject)) {
      continue;
    }

    // Validate required fields
    const validationError = validateScheduleSlot(subject);
    if (validationError) {
      console.warn(`Skipping invalid slot at TimeslotID ${slot.TimeslotID}: ${validationError}`);
      continue;
    }

    const roomID = getRoomID(subject)!;
    const respID = getRespID(subject)!;

    // Case 2: New subject (drag new assignment to timeslot)
    if (isNewSubject(subject)) {
      const newClassID = generateClassID(slot.TimeslotID, subject.SubjectCode!, subject.GradeID!);
      result.added.push({
        ClassID: newClassID,
        TimeslotID: slot.TimeslotID,
        SubjectCode: subject.SubjectCode!,
        GradeID: subject.GradeID!,
        RoomID: roomID,
        RespID: respID,
      });
      continue;
    }

    // Case 3: Moved subject (drag existing subject to different timeslot)
    if (isMovedSubject(subject, slot.TimeslotID)) {
      // Delete from old timeslot if it exists and is different
      if (existingSchedule) {
        result.deleted.push({ ClassID: existingSchedule.ClassID });
      }

      // Create in new timeslot
      const newClassID = generateClassID(slot.TimeslotID, subject.SubjectCode!, subject.GradeID!);
      result.added.push({
        ClassID: newClassID,
        TimeslotID: slot.TimeslotID,
        SubjectCode: subject.SubjectCode!,
        GradeID: subject.GradeID!,
        RoomID: roomID,
        RespID: respID,
      });
    }

    // Case 4: Subject stays in same timeslot - no action needed
  }

  return result;
}

/**
 * Filter out locked subjects from schedule slots
 * 
 * @param slots - Array of schedule slots
 * @returns Filtered array without locked subjects
 */
export function filterLockedSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
  return slots.filter(slot => {
    if (isEmptySlot(slot)) return true;
    const subject = slot.subject as SubjectData;
    return !isLockedSubject(subject);
  });
}

/**
 * Count total changes (for logging/debugging)
 * 
 * @param result - Sync result
 * @returns Total number of changes (deleted + added)
 */
export function countChanges(result: ScheduleSyncResult): number {
  return result.deleted.length + result.added.length;
}
