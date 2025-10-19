import { NextResponse } from "next/server";

/**
 * Standard error response format for API routes.
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

/**
 * Create a standardized error response for API routes.
 * Safely handles unknown error types and provides consistent error format.
 * 
 * @param error - The error object (unknown type)
 * @param defaultMessage - Default message if error cannot be parsed
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with error details
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred",
  status: number = 500
): NextResponse<ApiErrorResponse> {
  console.error(error);

  let message = defaultMessage;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  }

  return NextResponse.json(
    {
      error: "API Error",
      message,
      status,
    },
    { status }
  );
}

/**
 * Validate required query parameters.
 * 
 * @param params - Object containing parameter name and value pairs
 * @returns Error response if validation fails, null otherwise
 */
export function validateRequiredParams(
  params: Record<string, unknown>
): NextResponse<ApiErrorResponse> | null {
  const missingParams = Object.entries(params)
    .filter(([, value]) => value === null || value === undefined)
    .map(([key]) => key);

  if (missingParams.length > 0) {
    return NextResponse.json(
      {
        error: "Validation Error",
        message: `Missing required parameters: ${missingParams.join(", ")}`,
        status: 400,
      },
      { status: 400 }
    );
  }

  return null;
}
