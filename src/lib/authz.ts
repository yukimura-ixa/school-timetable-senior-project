/**
 * Simple authorization utilities for role checks.
 * Project policy: only "admin" is privileged; "teacher" and "student" are guests.
 */

export type AppRole = 'admin' | 'teacher' | 'student' | undefined;

export function isAdminRole(role: AppRole): boolean {
  return role === 'admin';
}

export function isGuestRole(role: AppRole): boolean {
  // Anything not admin is considered guest
  return !isAdminRole(role);
}
