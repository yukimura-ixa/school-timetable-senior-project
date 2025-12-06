/**
 * Error Types for Server Actions and API Routes
 *
 * Provides type-safe error handling with discriminated unions.
 * Replaces generic `any` error types throughout the application.
 *
 * Created: Week 8 - Type Safety Improvements
 * Pattern: Discriminated unions with 'code' as discriminator
 */

import type { ConflictType } from "@/features/schedule-arrangement/domain/models/conflict.model";

// ============================================================================
// Conflict Errors (Schedule Arrangement)
// ============================================================================

// Re-export ConflictType from domain model for consistency
export type { ConflictType } from "@/features/schedule-arrangement/domain/models/conflict.model";

/**
 * Details about a conflicting schedule
 * Based on domain model but with required fields for error reporting
 */
export interface ConflictingSchedule {
  classId: number;
  subjectCode: string;
  subjectName: string;
  gradeId: string;
  teacherId: number | null;
  teacherName: string;
  timeslotId: string;
  roomId?: number | null;
  roomName?: string | null;
}

export interface ConflictError extends Error {
  code: "CONFLICT";
  conflictDetails: {
    hasConflict: true;
    conflictType: ConflictType;
    message: string;
    conflictingSchedule: ConflictingSchedule;
  };
}

// ============================================================================
// Validation Errors
// ============================================================================

export interface ValidationError extends Error {
  code: "VALIDATION_ERROR";
  field?: string;
  value?: unknown;
}

// ============================================================================
// Authorization Errors
// ============================================================================

export interface AuthorizationError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  requiredRole?: string;
  userRole?: string;
}

// ============================================================================
// Not Found Errors
// ============================================================================

export interface NotFoundError extends Error {
  code: "NOT_FOUND";
  resource: string;
  identifier: string | number;
}

// ============================================================================
// Database Errors
// ============================================================================

export interface DatabaseError extends Error {
  code: "DATABASE_ERROR";
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE";
  table?: string;
}

// ============================================================================
// Locked Schedule Errors
// ============================================================================

export interface LockedScheduleError extends Error {
  code: "LOCKED_SCHEDULE";
  operation: "UPDATE" | "DELETE";
  scheduleId: string;
}

// ============================================================================
// Unknown Errors (Fallback)
// ============================================================================

export interface UnknownError extends Error {
  code: "UNKNOWN_ERROR";
  originalError?: unknown;
}

// ============================================================================
// Discriminated Union of All Error Types
// ============================================================================

export type ServerActionError =
  | ConflictError
  | ValidationError
  | AuthorizationError
  | NotFoundError
  | DatabaseError
  | LockedScheduleError
  | UnknownError;

// ============================================================================
// Type Guards
// ============================================================================

export function isConflictError(error: unknown): error is ConflictError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "CONFLICT"
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "VALIDATION_ERROR"
  );
}

export function isAuthorizationError(
  error: unknown,
): error is AuthorizationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN")
  );
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "NOT_FOUND"
  );
}

export function isLockedScheduleError(
  error: unknown,
): error is LockedScheduleError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "LOCKED_SCHEDULE"
  );
}

export function isServerActionError(
  error: unknown,
): error is ServerActionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as ServerActionError).code === "string"
  );
}

// ============================================================================
// Error Factory Functions
// ============================================================================

export function createConflictError(
  conflictType:
    | ConflictType
    | "TEACHER_CONFLICT"
    | "CLASS_CONFLICT"
    | "ROOM_CONFLICT",
  message: string,
  conflictingSchedule: ConflictingSchedule,
): ConflictError {
  const error = new Error(message) as ConflictError;
  error.code = "CONFLICT";
  error.conflictDetails = {
    hasConflict: true,
    conflictType: conflictType as ConflictType,
    message,
    conflictingSchedule,
  };
  return error;
}

export function createValidationError(
  message: string,
  field?: string,
  value?: unknown,
): ValidationError {
  const error = new Error(message) as ValidationError;
  error.code = "VALIDATION_ERROR";
  if (field) error.field = field;
  if (value !== undefined) error.value = value;
  return error;
}

export function createAuthorizationError(
  type: "UNAUTHORIZED" | "FORBIDDEN",
  message: string,
  requiredRole?: string,
  userRole?: string,
): AuthorizationError {
  const error = new Error(message) as AuthorizationError;
  error.code = type;
  if (requiredRole) error.requiredRole = requiredRole;
  if (userRole) error.userRole = userRole;
  return error;
}

export function createNotFoundError(
  resource: string,
  identifier: string | number,
): NotFoundError {
  const error = new Error(
    `${resource} with identifier ${identifier} not found`,
  ) as NotFoundError;
  error.code = "NOT_FOUND";
  error.resource = resource;
  error.identifier = identifier;
  return error;
}

export function createLockedScheduleError(
  operation: "UPDATE" | "DELETE",
  scheduleId: string,
): LockedScheduleError {
  const error = new Error(
    `Cannot ${operation.toLowerCase()} a locked schedule. This operation is forbidden.`,
  ) as LockedScheduleError;
  error.code = "LOCKED_SCHEDULE";
  error.operation = operation;
  error.scheduleId = scheduleId;
  return error;
}

export function createDatabaseError(
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE",
  message: string,
  table?: string,
): DatabaseError {
  const error = new Error(message) as DatabaseError;
  error.code = "DATABASE_ERROR";
  error.operation = operation;
  if (table) error.table = table;
  return error;
}
