/**
 * Infrastructure Layer: Room Repository
 * 
 * Handles all database operations for rooms using Prisma.
 * Pure data access layer with no business logic.
 * Uses React cache() for request-level memoization.
 * 
 * @module room.repository
 */

import { cache } from 'react';
import prisma from '@/lib/prisma';
import type { CreateRoomInput, UpdateRoomInput } from '../../application/schemas/room.schemas';

/**
 * Find all rooms ordered by RoomID
 * Cached per request using React cache()
 */
const findAllRooms = cache(async () => {
  return prisma.room.findMany({
    orderBy: {
      RoomID: 'asc',
    },
  });
});

/**
 * Find a single room by ID
 * Cached per request using React cache()
 */
const findRoomById = cache(async (roomId: number) => {
  return prisma.room.findUnique({
    where: {
      RoomID: roomId,
    },
  });
});

export const roomRepository = {
  /**
   * Find all rooms ordered by RoomID
   * Cached per request using React cache()
   */
  async findAll() {
    return findAllRooms();
  },

  /**
   * Find a single room by ID
   * Cached per request using React cache()
   */
  async findById(roomId: number) {
    return findRoomById(roomId);
  },

  /**
   * Check if a room with exact details already exists
   */
  async findDuplicate(data: CreateRoomInput) {
    return prisma.room.findFirst({
      where: {
        RoomName: data.RoomName,
        Building: data.Building,
        Floor: data.Floor,
      },
    });
  },

  /**
   * Find available rooms for a specific timeslot
   * (rooms that are NOT scheduled for the given timeslot)
   */
  async findAvailableForTimeslot(timeslotId: string) {
    return prisma.room.findMany({
      where: {
        class_schedule: {
          every: {
            NOT: {
              TimeslotID: timeslotId,
            },
          },
        },
      },
      orderBy: {
        RoomName: 'asc',
      },
    });
  },

  /**
   * Create a single room
   */
  async create(data: CreateRoomInput) {
    return prisma.room.create({
      data: {
        RoomName: data.RoomName,
        Building: data.Building,
        Floor: data.Floor,
      },
    });
  },

  /**
   * Update a room by ID
   */
  async update(roomId: number, data: Omit<UpdateRoomInput, 'RoomID'>) {
    return prisma.room.update({
      where: {
        RoomID: roomId,
      },
      data: {
        RoomName: data.RoomName,
        Building: data.Building,
        Floor: data.Floor,
      },
    });
  },

  /**
   * Delete multiple rooms by IDs
   */
  async deleteMany(roomIds: number[]) {
    return prisma.room.deleteMany({
      where: {
        RoomID: {
          in: roomIds,
        },
      },
    });
  },

  /**
   * Get room count (useful for statistics)
   */
  async count() {
    return prisma.room.count();
  },
};
