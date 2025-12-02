/**
 * Application Layer: Room Server Actions
 *
 * Server Actions for room management feature.
 * Uses action wrapper for auth, validation, and error handling.
 *
 * @module room.actions
 */

"use server";

import * as v from "valibot";
import { createAction } from "@/shared/lib/action-wrapper";
import { roomRepository } from "../../infrastructure/repositories/room.repository";
import { checkDuplicateRoom } from "../../domain/services/room-validation.service";
import {
  createRoomSchema,
  createRoomsSchema,
  updateRoomSchema,
  updateRoomsSchema,
  deleteRoomsSchema,
  getRoomByIdSchema,
  getAvailableRoomsSchema,
  getOccupiedRoomsSchema,
  type CreateRoomInput,
  type CreateRoomsInput,
  type UpdateRoomInput,
  type UpdateRoomsInput,
  type DeleteRoomsInput,
  type GetRoomByIdInput,
  type GetAvailableRoomsInput,
  type GetOccupiedRoomsInput,
} from "../schemas/room.schemas";

/**
 * Get all rooms ordered by RoomID
 *
 * @returns Array of all rooms
 *
 * @example
 * ```tsx
 * const rooms = await getRoomsAction();
 * if (!rooms.success) {
 *   console.error(rooms.error);
 * } else {
 *   console.log(rooms.data); // room[]
 * }
 * ```
 */
export const getRoomsAction = createAction(
  v.object({}),
  async () => {
    return await roomRepository.findAll();
  },
);

/**
 * Get a single room by ID
 *
 * @param input - Room ID
 * @returns Single room or null
 *
 * @example
 * ```tsx
 * const result = await getRoomByIdAction({ RoomID: 1 });
 * if (result.success) {
 *   console.log(result.data); // room | null
 * }
 * ```
 */
export const getRoomByIdAction = createAction(
  getRoomByIdSchema,
  async (input: GetRoomByIdInput) => {
    const room = await roomRepository.findById(input.RoomID);
    return room;
  },
);

/**
 * Get available rooms for a specific timeslot
 *
 * Returns rooms that are NOT scheduled for the given timeslot.
 *
 * @param input - Timeslot ID
 * @returns Array of available rooms
 *
 * @example
 * ```tsx
 * const result = await getAvailableRoomsAction({ TimeslotID: 'T1' });
 * if (result.success) {
 *   console.log(result.data); // room[]
 * }
 * ```
 */
export const getAvailableRoomsAction = createAction(
  getAvailableRoomsSchema,
  async (input: GetAvailableRoomsInput) => {
    const availableRooms = await roomRepository.findAvailableForTimeslot(
      input.TimeslotID,
    );
    return availableRooms;
  },
);

/**
 * Get occupied room IDs for a specific timeslot
 *
 * Returns array of RoomIDs that are already scheduled for the given timeslot.
 * Useful for displaying unavailable/occupied rooms in UI.
 *
 * @param input - Timeslot ID
 * @returns Array of occupied room IDs
 *
 * @example
 * ```tsx
 * const result = await getOccupiedRoomsAction({ TimeslotID: 'T1' });
 * if (result.success) {
 *   console.log(result.data); // number[]
 * }
 * ```
 */
export const getOccupiedRoomsAction = createAction(
  getOccupiedRoomsSchema,
  async (input: GetOccupiedRoomsInput) => {
    const occupiedRoomIDs = await roomRepository.findOccupiedForTimeslot(
      input.TimeslotID,
    );
    return occupiedRoomIDs;
  },
);

/**
 * Create a single room
 *
 * Validates:
 * - No duplicate room (exact match on RoomName, Building, Floor)
 *
 * @param input - Room data
 * @returns Created room with RoomID
 *
 * @example
 * ```tsx
 * const result = await createRoomAction({
 *   RoomName: '301',
 *   Building: 'อาคาร 1',
 *   Floor: '3',
 * });
 *
 * if (!result.success) {
 *   alert(result.error);
 * } else {
 *   console.log('Created room:', result.data.RoomID);
 * }
 * ```
 */
export const createRoomAction = createAction(
  createRoomSchema,
  async (input: CreateRoomInput) => {
    // 1. Check for duplicate room
    const existingRoom = await roomRepository.findDuplicate(input);
    const duplicateCheck = checkDuplicateRoom(input, existingRoom);

    if (duplicateCheck.isDuplicate) {
      throw new Error(duplicateCheck.reason);
    }

    // 2. Create room
    const newRoom = await roomRepository.create(input);

    // 3. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('rooms');

    return newRoom;
  },
);

/**
 * Create multiple rooms (bulk operation)
 *
 * Validates each room:
 * - No duplicate room
 *
 * @param input - Array of room data
 * @returns Array of created room IDs
 *
 * @example
 * ```tsx
 * const result = await createRoomsAction([
 *   { RoomName: '301', Building: 'อาคาร 1', Floor: '3' },
 *   { RoomName: '302', Building: 'อาคาร 1', Floor: '3' },
 * ]);
 *
 * if (result.success) {
 *   console.log('Created room IDs:', result.data); // [1, 2]
 * }
 * ```
 */
export const createRoomsAction = createAction(
  createRoomsSchema,
  async (input: CreateRoomsInput) => {
    const createdRooms = await Promise.all(
      input.map(async (roomData) => {
        // 1. Check for duplicate room
        const existingRoom = await roomRepository.findDuplicate(roomData);
        const duplicateCheck = checkDuplicateRoom(roomData, existingRoom);

        if (duplicateCheck.isDuplicate) {
          throw new Error(duplicateCheck.reason);
        }

        // 2. Create room
        return await roomRepository.create(roomData);
      }),
    );

    // 3. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('rooms');

    // Return array of IDs
    return createdRooms.map((r: any) => r.RoomID);
  },
);

/**
 * Update a single room
 *
 * Validates:
 * - Room exists
 *
 * @param input - Updated room data with RoomID
 * @returns Updated room
 *
 * @example
 * ```tsx
 * const result = await updateRoomAction({
 *   RoomID: 1,
 *   RoomName: '301',
 *   Building: 'อาคาร 2',
 *   Floor: '3',
 * });
 *
 * if (!result.success) {
 *   alert(result.error);
 * }
 * ```
 */
export const updateRoomAction = createAction(
  updateRoomSchema,
  async (input: UpdateRoomInput) => {
    // 1. Check if room exists
    const existingRoom = await roomRepository.findById(input.RoomID);

    if (!existingRoom) {
      throw new Error("ไม่พบข้อมูลห้อง กรุณาตรวจสอบอีกครั้ง");
    }

    // 2. Update room
    const updatedRoom = await roomRepository.update(input.RoomID, {
      RoomName: input.RoomName,
      Building: input.Building,
      Floor: input.Floor,
    });

    // 3. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('rooms');

    return updatedRoom;
  },
);

/**
 * Update multiple rooms (bulk operation)
 *
 * @param input - Array of updated room data
 * @returns Array of updated room IDs
 *
 * @example
 * ```tsx
 * const result = await updateRoomsAction([
 *   { RoomID: 1, RoomName: '301', Building: 'อาคาร 1', Floor: '3' },
 *   { RoomID: 2, RoomName: '302', Building: 'อาคาร 1', Floor: '3' },
 * ]);
 * ```
 */
export const updateRoomsAction = createAction(
  updateRoomsSchema,
  async (input: UpdateRoomsInput) => {
    const updatedRooms = await Promise.all(
      input.map(async (roomData) => {
        // 1. Check if room exists
        const existingRoom = await roomRepository.findById(roomData.RoomID);

        if (!existingRoom) {
          throw new Error("ไม่พบข้อมูลห้อง กรุณาตรวจสอบอีกครั้ง");
        }

        // 2. Update room
        return await roomRepository.update(roomData.RoomID, {
          RoomName: roomData.RoomName,
          Building: roomData.Building,
          Floor: roomData.Floor,
        });
      }),
    );

    // 3. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('rooms');

    // Return array of IDs
    return updatedRooms.map((r: any) => r.RoomID);
  },
);

/**
 * Delete multiple rooms
 *
 * @param input - Array of room IDs to delete
 * @returns Delete count
 *
 * @example
 * ```tsx
 * const result = await deleteRoomsAction([1, 2, 3]);
 * if (result.success) {
 *   console.log(`Deleted ${result.data.count} rooms`);
 * }
 * ```
 */
export const deleteRoomsAction = createAction(
  deleteRoomsSchema,
  async (input: DeleteRoomsInput) => {
    const result = await roomRepository.deleteMany(input);

    // Revalidate cache (optional - for future cache optimization)
    // revalidateTag('rooms');

    return result;
  },
);
