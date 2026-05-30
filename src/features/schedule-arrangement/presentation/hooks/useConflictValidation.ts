/**
 * useConflictValidation Hook
 *
 * Encapsulates conflict detection and validation logic for schedule arrangement.
 * Checks for teacher conflicts, room conflicts, and locked timeslots.
 *
 * Week 5.4 - Custom Hooks Extraction
 */

import { useArrangementUIStore } from "../stores/arrangement-ui.store";
// Import from schedule.types.ts (strict camelCase types) instead of @/types (legacy PascalCase)
import type { SubjectData } from "@/types/schedule.types";

export interface ConflictType {
  type: "teacher" | "room" | "lock" | "none";
  message: string;
  severity: "error" | "warning" | "info";
}

export interface ConflictValidationOperations {
  // Conflict checking
  checkTimeslotConflict: (
    timeslotID: string,
    subject: SubjectData,
  ) => ConflictType;
  checkTeacherConflict: (timeslotID: string, teacherID: number) => boolean;
  checkRoomConflict: (timeslotID: string, roomID: number | null) => boolean;
  checkLockConflict: (timeslotID: string) => boolean;

  // Validation helpers
  isTimeslotAvailable: (timeslotID: string, subject: SubjectData) => boolean;
  getConflictMessage: (timeslotID: string, subject: SubjectData) => string;

  // Conflict data
  conflictsByTimeslot: Map<string, ConflictType>;
  lockedTimeslots: Set<string>;

  // Batch validation
  validateMultipleTimeslots: (
    timeslotIDs: string[],
    subject: SubjectData,
  ) => Map<string, ConflictType>;
}

/**
 * Custom hook for conflict validation
 *
 * Provides comprehensive conflict detection for schedule arrangement.
 * Checks teacher availability, room availability, and locked timeslots.
 *
 * @example
 * ```typescript
 * const {
 *   checkTimeslotConflict,
 *   isTimeslotAvailable,
 *   getConflictMessage
 * } = useConflictValidation();
 *
 * // Check if subject can be added to timeslot
 * const conflict = checkTimeslotConflict('T1', selectedSubject);
 * if (conflict.type !== 'none') {
 *   console.error(conflict.message);
 * }
 * ```
 */
export function useConflictValidation(): ConflictValidationOperations {
  // Get store state
  const { timeSlotData, lockData, currentTeacherID } = useArrangementUIStore();

  /**
   * Get set of locked timeslot IDs
   */
  const lockedTimeslots = (() => {
    const locked = new Set<string>();
    lockData.forEach((lock) => {
      if (lock.TimeslotID) {
        locked.add(lock.TimeslotID);
      }
    });
    return locked;
  })();

  /**
   * Check if timeslot is locked
   */
  const checkLockConflict = (timeslotID: string): boolean => {
    return lockedTimeslots.has(timeslotID);
  };

  /**
   * Check if teacher has conflict at timeslot
   * (Teacher already scheduled in another class at this time)
   */
  const checkTeacherConflict = (
    timeslotID: string,
    teacherID: number,
  ): boolean => {
    if (!teacherID) return false;

    // Find timeslot details
    const timeslot = timeSlotData.AllData.find(
      (slot) => slot.TimeslotID === timeslotID,
    );
    if (!timeslot) return false;

    // Check if teacher is scheduled in any other timeslot at the same time
    const conflictingSlots = timeSlotData.AllData.filter((slot) => {
      return (
        slot.TimeslotID !== timeslotID &&
        slot.DayOfWeek === timeslot.DayOfWeek &&
        slot.StartTime === timeslot.StartTime &&
        slot.subject?.teacherID === teacherID
      );
    });

    return conflictingSlots.length > 0;
  };

  /**
   * Check if room has conflict at timeslot
   * (Room already occupied by another class at this time)
   */
  const checkRoomConflict = (
    timeslotID: string,
    roomID: number | null,
  ): boolean => {
    if (!roomID) return false;

    // Find timeslot details
    const timeslot = timeSlotData.AllData.find(
      (slot) => slot.TimeslotID === timeslotID,
    );
    if (!timeslot) return false;

    // Check if room is occupied in any other timeslot at the same time
    const conflictingSlots = timeSlotData.AllData.filter((slot) => {
      return (
        slot.TimeslotID !== timeslotID &&
        slot.DayOfWeek === timeslot.DayOfWeek &&
        slot.StartTime === timeslot.StartTime &&
        slot.subject?.roomID === roomID // Fixed: RoomID → roomID (camelCase)
      );
    });

    return conflictingSlots.length > 0;
  };

  /**
   * Check for any conflicts when adding subject to timeslot
   */
  const checkTimeslotConflict = (
    timeslotID: string,
    subject: SubjectData,
  ): ConflictType => {
    // Check lock conflict first (highest priority)
    if (checkLockConflict(timeslotID)) {
      return {
        type: "lock",
        message: "This timeslot is locked and cannot be modified",
        severity: "error",
      };
    }

    // Check teacher conflict
    if (
      currentTeacherID &&
      checkTeacherConflict(timeslotID, parseInt(currentTeacherID))
    ) {
      return {
        type: "teacher",
        message: "Teacher is already scheduled in another class at this time",
        severity: "error",
      };
    }

    // Check room conflict
    if (subject.roomID && checkRoomConflict(timeslotID, subject.roomID)) {
      return {
        type: "room",
        message: "Room is already occupied by another class at this time",
        severity: "error",
      };
    }

    // No conflicts
    return {
      type: "none",
      message: "",
      severity: "info",
    };
  };

  /**
   * Check if timeslot is available for subject
   */
  const isTimeslotAvailable = (
    timeslotID: string,
    subject: SubjectData,
  ): boolean => {
    const conflict = checkTimeslotConflict(timeslotID, subject);
    return conflict.type === "none";
  };

  /**
   * Get conflict message for timeslot
   */
  const getConflictMessage = (
    timeslotID: string,
    subject: SubjectData,
  ): string => {
    const conflict = checkTimeslotConflict(timeslotID, subject);
    return conflict.message;
  };

  /**
   * Get conflicts for all timeslots
   */
  const conflictsByTimeslot = (() => {
    const conflicts = new Map<string, ConflictType>();

    timeSlotData.AllData.forEach((slot) => {
      if (slot.subject && Object.keys(slot.subject).length > 0) {
        const conflict = checkTimeslotConflict(slot.TimeslotID, slot.subject);
        if (conflict.type !== "none") {
          conflicts.set(slot.TimeslotID, conflict);
        }
      }
    });

    return conflicts;
  })();

  /**
   * Validate multiple timeslots for a subject
   * Useful for finding all available timeslots for a subject
   */
  const validateMultipleTimeslots = (
    timeslotIDs: string[],
    subject: SubjectData,
  ): Map<string, ConflictType> => {
    const results = new Map<string, ConflictType>();

    timeslotIDs.forEach((timeslotID) => {
      const conflict = checkTimeslotConflict(timeslotID, subject);
      results.set(timeslotID, conflict);
    });

    return results;
  };

  return {
    checkTimeslotConflict,
    checkTeacherConflict,
    checkRoomConflict,
    checkLockConflict,
    isTimeslotAvailable,
    getConflictMessage,
    conflictsByTimeslot,
    lockedTimeslots,
    validateMultipleTimeslots,
  };
}
