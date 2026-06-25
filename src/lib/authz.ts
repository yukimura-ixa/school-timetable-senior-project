/**
 * Simple authorization utilities for role checks.
 * Project policy: only "admin" is privileged; everyone else is a guest.
 */

export type AppRole = "admin" | undefined;

export function normalizeAppRole(rawRole: string | null | undefined): AppRole {
  return rawRole === "admin" ? "admin" : undefined;
}

export const toAppRole = normalizeAppRole;

export function isAdminRole(role: AppRole): boolean {
  return role === "admin";
}

export function isGuestRole(role: AppRole): boolean {
  // Anything not admin is considered guest
  return !isAdminRole(role);
}
