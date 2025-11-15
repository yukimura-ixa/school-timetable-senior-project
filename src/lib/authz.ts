/**
 * Simple authorization utilities for role checks.
 * Project policy: only "admin" is privileged; "teacher" and "student" are guests.
 */

export type AppRole = 'admin' | 'teacher' | 'student' | undefined;

export function normalizeAppRole(rawRole: string | null | undefined): AppRole {
  if (rawRole === 'admin' || rawRole === 'teacher' || rawRole === 'student') {
    return rawRole;
  }
  return undefined;
}

export const toAppRole = normalizeAppRole;

export function isAdminRole(role: AppRole): boolean {
  return role === 'admin';
}

export function isGuestRole(role: AppRole): boolean {
  // Anything not admin is considered guest
  return !isAdminRole(role);
}
