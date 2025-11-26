/**
 * Action Wrapper - Reusable Server Action Infrastructure
 *
 * Provides automatic:
 * - Authentication checking
 * - Input validation with Valibot
 * - Error handling with structured responses
 * - Logging (can be extended)
 *
 * @example
 * ```typescript
 * const myAction = createAction(
 *   mySchema,
 *   async (input) => {
 *     // Just business logic here
 *     return result;
 *   }
 * );
 * ```
 */

import * as v from "valibot";
// Use auth for session retrieval
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  isConflictError,
  isValidationError,
  isLockedScheduleError,
  type ServerActionError,
} from "@/types";

/**
 * Standard result shape for all Server Actions
 */
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
    field?: string; // For validation errors
  };
}

/**
 * Error codes for consistent error handling
 */
export const ActionErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ActionErrorCodeType =
  (typeof ActionErrorCode)[keyof typeof ActionErrorCode];

/**
 * Create a type-safe Server Action with automatic error handling
 *
 * @param schema - Valibot schema for input validation
 * @param handler - Business logic function (receives validated input)
 * @returns Server Action function that returns ActionResult<TOutput>
 *
 * @example
 * ```typescript
 * const createTeacherAction = createAction(
 *   createTeacherSchema,
 *   async (input) => {
 *     const teacher = await teacherRepository.create(input);
 *     return teacher;
 *   }
 * );
 * ```
 */
export function createAction<TInput, TOutput>(
  schema: v.GenericSchema<TInput>,
  handler: (input: TInput, userId: string) => Promise<TOutput>,
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Authentication check
      const session = await auth.api.getSession({
        headers: await headers(),
        asResponse: false,
      });

      if (!session || !session.user) {
        return {
          success: false,
          error: {
            message: "You must be logged in to perform this action",
            code: ActionErrorCode.UNAUTHORIZED,
          },
        };
      }

      // 2. Input validation with Valibot
      const validationResult = v.safeParse(schema, input);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: "Invalid input data",
            code: ActionErrorCode.VALIDATION_ERROR,
            details: validationResult.issues,
          },
        };
      }

      // 3. Execute business logic
      const data = await handler(
        validationResult.output,
        session.user.id || "",
      );

      // 4. Return success
      return {
        success: true,
        data,
      };
    } catch (error) {
      // 5. Error handling
      console.error("[Server Action Error]:", error);

      // Handle known error types with type guards
      if (isConflictError(error)) {
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.CONFLICT,
            details: error.conflictDetails,
          },
        };
      }

      // Handle validation errors
      if (isValidationError(error)) {
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.VALIDATION_ERROR,
            field: error.field,
          },
        };
      }

      // Handle locked schedule errors
      if (isLockedScheduleError(error)) {
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.FORBIDDEN,
          },
        };
      }

      // Handle generic Error instances
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return {
            success: false,
            error: {
              message: error.message,
              code: ActionErrorCode.NOT_FOUND,
            },
          };
        }

        if (
          error.message.includes("conflict") ||
          error.message.includes("already exists")
        ) {
          return {
            success: false,
            error: {
              message: error.message,
              code: ActionErrorCode.CONFLICT,
            },
          };
        }

        if (
          error.message.includes("forbidden") ||
          error.message.includes("permission")
        ) {
          return {
            success: false,
            error: {
              message: error.message,
              code: ActionErrorCode.FORBIDDEN,
            },
          };
        }

        // Generic error
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.INTERNAL_ERROR,
          },
        };
      }

      // Unknown error type
      return {
        success: false,
        error: {
          message: "An unexpected error occurred",
          code: ActionErrorCode.INTERNAL_ERROR,
          details: error,
        },
      };
    }
  };
}

/**
 * Variant of createAction that doesn't require authentication
 * Use sparingly - only for public actions
 */
export function createPublicAction<TInput, TOutput>(
  schema: v.GenericSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Input validation only (no auth check)
      const validationResult = v.safeParse(schema, input);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: "Invalid input data",
            code: ActionErrorCode.VALIDATION_ERROR,
            details: validationResult.issues,
          },
        };
      }

      // 2. Execute business logic
      const data = await handler(validationResult.output);

      // 3. Return success
      return {
        success: true,
        data,
      };
    } catch (error) {
      // 4. Error handling (same as createAction)
      console.error("[Public Action Error]:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.INTERNAL_ERROR,
          },
        };
      }

      return {
        success: false,
        error: {
          message: "An unexpected error occurred",
          code: ActionErrorCode.INTERNAL_ERROR,
        },
      };
    }
  };
}
