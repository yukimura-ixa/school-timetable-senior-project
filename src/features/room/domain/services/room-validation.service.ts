/**
 * Domain Layer: Room Validation Service
 * 
 * Pure business logic functions for room validation.
 * No I/O operations, no Prisma, no external dependencies.
 * 
 * @module room-validation.service
 */

import type { CreateRoomInput } from '../../application/schemas/room.schemas';
import type { room } from '@/prisma/generated';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
}

/**
 * Check if room data is a duplicate
 * 
 * @param newRoom - New room data to validate
 * @param existingRoom - Existing room from database (if found)
 * @returns Validation result with duplicate status and reason
 */
export function checkDuplicateRoom(
  newRoom: CreateRoomInput,
  existingRoom: room | null
): DuplicateCheckResult {
  if (!existingRoom) {
    return { isDuplicate: false };
  }

  // Check for exact match (all fields identical)
  const isExactMatch =
    existingRoom.RoomName === newRoom.RoomName &&
    existingRoom.Building === newRoom.Building &&
    existingRoom.Floor === newRoom.Floor;

  if (isExactMatch) {
    return {
      isDuplicate: true,
      reason: 'มีข้อมูลห้องอยู่แล้ว กรุณาตรวจสอบอีกครั้ง',
    };
  }

  return { isDuplicate: false };
}
