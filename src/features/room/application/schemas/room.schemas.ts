/**
 * Application Layer: Room Schemas
 *
 * Valibot schemas for room feature with TypeScript type inference.
 * Defines validation rules for all room-related operations.
 *
 * @module room.schemas
 */

import * as v from "valibot";

/**
 * Schema for creating a single room
 */
export const createRoomSchema = v.object({
  RoomName: v.pipe(v.string(), v.minLength(1, "ชื่อห้องห้ามว่าง")),
  Building: v.pipe(v.string(), v.minLength(1, "ชื่ออาคารห้ามว่าง")),
  Floor: v.pipe(v.string(), v.minLength(1, "ชั้นห้ามว่าง")),
});

export type CreateRoomInput = v.InferOutput<typeof createRoomSchema>;

/**
 * Schema for creating multiple rooms (bulk operation)
 */
export const createRoomsSchema = v.array(createRoomSchema);

export type CreateRoomsInput = v.InferOutput<typeof createRoomsSchema>;

/**
 * Schema for updating a room
 */
export const updateRoomSchema = v.object({
  RoomID: v.number("รหัสห้องต้องเป็นตัวเลข"),
  RoomName: v.pipe(v.string(), v.minLength(1, "ชื่อห้องห้ามว่าง")),
  Building: v.pipe(v.string(), v.minLength(1, "ชื่ออาคารห้ามว่าง")),
  Floor: v.pipe(v.string(), v.minLength(1, "ชั้นห้ามว่าง")),
});

export type UpdateRoomInput = v.InferOutput<typeof updateRoomSchema>;

/**
 * Schema for updating multiple rooms (bulk operation)
 */
export const updateRoomsSchema = v.array(updateRoomSchema);

export type UpdateRoomsInput = v.InferOutput<typeof updateRoomsSchema>;

/**
 * Schema for deleting rooms (by IDs)
 */
export const deleteRoomsSchema = v.array(
  v.number("รหัสห้องต้องเป็นตัวเลข"),
  "ต้องระบุรายการห้องที่ต้องการลบ",
);

export type DeleteRoomsInput = v.InferOutput<typeof deleteRoomsSchema>;

/**
 * Schema for getting a single room by ID
 */
export const getRoomByIdSchema = v.object({
  RoomID: v.number("รหัสห้องต้องเป็นตัวเลข"),
});

export type GetRoomByIdInput = v.InferOutput<typeof getRoomByIdSchema>;

/**
 * Schema for getting available rooms for a specific timeslot
 */
export const getAvailableRoomsSchema = v.object({
  TimeslotID: v.pipe(v.string(), v.minLength(1, "รหัสช่วงเวลาห้ามว่าง")),
});

export type GetAvailableRoomsInput = v.InferOutput<
  typeof getAvailableRoomsSchema
>;

/**
 * Schema for getting occupied room IDs for a specific timeslot
 */
export const getOccupiedRoomsSchema = v.object({
  TimeslotID: v.pipe(v.string(), v.minLength(1, "รหัสช่วงเวลาห้ามว่าง")),
});

export type GetOccupiedRoomsInput = v.InferOutput<
  typeof getOccupiedRoomsSchema
>;
