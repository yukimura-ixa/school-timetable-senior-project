/**
 * Config Lifecycle Schemas
 * Valibot schemas for config status management
 */

import * as v from "valibot";

// Config status transitions
export const ConfigStatusSchema = v.picklist([
  "DRAFT",
  "PUBLISHED",
  "LOCKED",
  "ARCHIVED",
]);

// Update config status
export const UpdateConfigStatusSchema = v.object({
  configId: v.string(),
  status: ConfigStatusSchema,
  reason: v.optional(v.string()),
});

// Calculate config completeness
export const ConfigCompletenessSchema = v.object({
  hasTimeslots: v.boolean(),
  hasTeachers: v.boolean(),
  hasSubjects: v.boolean(),
  hasClasses: v.boolean(),
  hasRooms: v.boolean(),
});

// Type exports
export type ConfigStatus = v.InferOutput<typeof ConfigStatusSchema>;
export type UpdateConfigStatus = v.InferOutput<typeof UpdateConfigStatusSchema>;
export type ConfigCompleteness = v.InferOutput<typeof ConfigCompletenessSchema>;

/**
 * Calculate config completeness percentage
 * Based on key setup steps completed
 */
export function calculateCompleteness(config: ConfigCompleteness): number {
  const weights = {
    hasTimeslots: 30, // Most important
    hasTeachers: 20,
    hasSubjects: 20,
    hasClasses: 20,
    hasRooms: 10,
  };

  let total = 0;
  if (config.hasTimeslots) total += weights.hasTimeslots;
  if (config.hasTeachers) total += weights.hasTeachers;
  if (config.hasSubjects) total += weights.hasSubjects;
  if (config.hasClasses) total += weights.hasClasses;
  if (config.hasRooms) total += weights.hasRooms;

  return total;
}

/**
 * Validate status transition
 * Ensures only valid state changes are allowed
 */
export function canTransitionStatus(
  currentStatus: ConfigStatus,
  newStatus: ConfigStatus,
  completeness: number
): { allowed: boolean; reason?: string } {
  // DRAFT → PUBLISHED: Must be at least 30% complete (has timeslots)
  if (currentStatus === "DRAFT" && newStatus === "PUBLISHED") {
    if (completeness < 30) {
      return {
        allowed: false,
        reason: "ต้องตั้งค่าคาบเรียนก่อนเผยแพร่",
      };
    }
    return { allowed: true };
  }

  // PUBLISHED → LOCKED: Always allowed
  if (currentStatus === "PUBLISHED" && newStatus === "LOCKED") {
    return { allowed: true };
  }

  // LOCKED → ARCHIVED: Always allowed
  if (currentStatus === "LOCKED" && newStatus === "ARCHIVED") {
    return { allowed: true };
  }

  // Reverse transitions (admin only)
  if (newStatus === "DRAFT" && currentStatus === "PUBLISHED") {
    return { allowed: true };
  }

  if (newStatus === "PUBLISHED" && currentStatus === "LOCKED") {
    return { allowed: true };
  }

  if (newStatus === "LOCKED" && currentStatus === "ARCHIVED") {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `ไม่สามารถเปลี่ยนสถานะจาก ${currentStatus} เป็น ${newStatus}`,
  };
}
