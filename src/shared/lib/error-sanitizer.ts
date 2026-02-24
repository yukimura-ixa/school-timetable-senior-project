/**
 * Sanitize error messages to prevent leaking internal details (table names,
 * column names, query details) to clients in production.
 *
 * Business logic errors (not found, conflict, forbidden, etc.) are safe to
 * forward. Prisma/infrastructure errors are replaced with a generic Thai
 * message in production; development mode forwards everything for debugging.
 */

const SAFE_PATTERNS = [
  "not found",
  "conflict",
  "already exists",
  "forbidden",
  "permission",
  "locked",
  "validation",
  "invalid",
  "ไม่พบ",
  "ซ้ำ",
  "ไม่มีสิทธิ์",
  "ถูกล็อค",
] as const;

export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "เกิดข้อผิดพลาดที่ไม่คาดคิด";

  const msg = error.message.toLowerCase();

  // Business logic errors are safe to forward
  if (SAFE_PATTERNS.some((p) => msg.includes(p))) {
    return error.message;
  }

  // In development, forward everything for debugging
  if (process.env.NODE_ENV === "development") {
    return error.message;
  }

  // In production, return generic message (real error already logged server-side)
  return "เกิดข้อผิดพลาดภายในระบบ";
}
