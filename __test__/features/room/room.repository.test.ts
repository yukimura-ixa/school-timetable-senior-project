/**
 * Unit Tests: Room Repository - findAvailableForTimeslot & findOccupiedForTimeslot
 * 
 * Tests room availability filtering logic (Issue #83)
 * 
 * Note: Prisma is mocked globally in jest.setup.js
 * 
 * @module __test__/features/room/room.repository.test
 */

import { roomRepository } from '@/features/room/infrastructure/repositories/room.repository';
import prisma from '@/lib/prisma';

// Get reference to the mocked Prisma client (globally mocked in jest.setup.js)
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Room Repository - Availability Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAvailableForTimeslot', () => {
    it('should return all rooms when none are occupied', async () => {
      // Arrange
      const timeslotId = 'MON-1';
      const mockRooms = [
        { RoomID: 1, RoomName: 'A101', Building: 'A', Floor: '1' },
        { RoomID: 2, RoomName: 'A102', Building: 'A', Floor: '1' },
        { RoomID: 3, RoomName: 'B201', Building: 'B', Floor: '2' },
      ];

      mockPrisma.room.findMany = jest.fn(() => Promise.resolve(mockRooms as any));

      // Act
      const result = await roomRepository.findAvailableForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual(mockRooms);
      expect(mockPrisma.room.findMany).toHaveBeenCalledWith({
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
    });

    it('should return only available rooms (exclude occupied ones)', async () => {
      // Arrange
      const timeslotId = 'TUE-2';
      const mockAvailableRooms = [
        { RoomID: 2, RoomName: 'A102', Building: 'A', Floor: '1' },
        { RoomID: 3, RoomName: 'B201', Building: 'B', Floor: '2' },
      ];

      mockPrisma.room.findMany = jest.fn(() => Promise.resolve(mockAvailableRooms as any));

      // Act
      const result = await roomRepository.findAvailableForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual(mockAvailableRooms);
      expect(result).not.toContainEqual(expect.objectContaining({ RoomID: 1 }));
      expect(result.length).toBe(2);
    });

    it('should return empty array when all rooms are occupied', async () => {
      // Arrange
      const timeslotId = 'WED-3';

      mockPrisma.room.findMany = jest.fn(() => Promise.resolve([] as any));

      // Act
      const result = await roomRepository.findAvailableForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should sort results by RoomName in ascending order', async () => {
      // Arrange
      const timeslotId = 'THU-4';
      const mockRooms = [
        { RoomID: 3, RoomName: 'C301', Building: 'C', Floor: '3' },
        { RoomID: 1, RoomName: 'A101', Building: 'A', Floor: '1' },
        { RoomID: 2, RoomName: 'B201', Building: 'B', Floor: '2' },
      ];

      mockPrisma.room.findMany = jest.fn(() => Promise.resolve(mockRooms as any));

      // Act
      await roomRepository.findAvailableForTimeslot(timeslotId);

      // Assert
      expect(mockPrisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { RoomName: 'asc' },
        })
      );
    });
  });

  describe('findOccupiedForTimeslot', () => {
    it('should return array of occupied room IDs', async () => {
      // Arrange
      const timeslotId = 'MON-1';
      const mockSchedules = [
        { RoomID: 1 },
        { RoomID: 3 },
        { RoomID: 5 },
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      // Act
      const result = await roomRepository.findOccupiedForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual([1, 3, 5]);
      expect(mockPrisma.class_schedule.findMany).toHaveBeenCalledWith({
        where: {
          TimeslotID: timeslotId,
          RoomID: {
            not: null,
          },
        },
        select: {
          RoomID: true,
        },
        distinct: ['RoomID'],
      });
    });

    it('should return empty array when no rooms are occupied', async () => {
      // Arrange
      const timeslotId = 'TUE-2';

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve([] as any));

      // Act
      const result = await roomRepository.findOccupiedForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should filter out null RoomIDs', async () => {
      // Arrange
      const timeslotId = 'WED-3';
      const mockSchedules = [
        { RoomID: 1 },
        { RoomID: null },
        { RoomID: 2 },
        { RoomID: null },
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      // Act
      const result = await roomRepository.findOccupiedForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual([1, 2]);
      expect(result.length).toBe(2);
    });

    it('should return distinct room IDs (no duplicates)', async () => {
      // Arrange
      const timeslotId = 'THU-4';
      // Distinct is handled by Prisma query, so mock should only return unique IDs
      const mockSchedules = [
        { RoomID: 1 },
        { RoomID: 2 },
        { RoomID: 3 },
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      // Act
      const result = await roomRepository.findOccupiedForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual([1, 2, 3]);
      expect(mockPrisma.class_schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          distinct: ['RoomID'],
        })
      );
    });
  });

  describe('Integration: Available vs Occupied', () => {
    it('available rooms should exclude occupied room IDs', async () => {
      // Arrange
      const timeslotId = 'FRI-5';
      
      const mockAvailableRooms = [
        { RoomID: 2, RoomName: 'A102', Building: 'A', Floor: '1' },
        { RoomID: 4, RoomName: 'B202', Building: 'B', Floor: '2' },
      ];
      
      const mockOccupiedSchedules = [
        { RoomID: 1 },
        { RoomID: 3 },
      ];

      // Setup mocks
      mockPrisma.room.findMany = jest.fn(() => Promise.resolve(mockAvailableRooms as any));
      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockOccupiedSchedules as any));

      // Act
      const availableRooms = await roomRepository.findAvailableForTimeslot(timeslotId);
      const occupiedRoomIDs = await roomRepository.findOccupiedForTimeslot(timeslotId);

      // Assert
      const availableRoomIDs = availableRooms.map((r: { RoomID: number }) => r.RoomID);
      
      // Available room IDs should not overlap with occupied IDs
      occupiedRoomIDs.forEach((occupiedId: number) => {
        expect(availableRoomIDs).not.toContain(occupiedId);
      });

      // Available rooms should be IDs 2, 4 (not 1, 3)
      expect(availableRoomIDs).toEqual([2, 4]);
      expect(occupiedRoomIDs).toEqual([1, 3]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle timeslot with special characters', async () => {
      // Arrange
      const timeslotId = 'MON-BREAK-1';
      const mockRooms = [
        { RoomID: 1, RoomName: 'Library', Building: 'Main', Floor: '1' },
      ];

      mockPrisma.room.findMany = jest.fn(() => Promise.resolve(mockRooms as any));

      // Act
      const result = await roomRepository.findAvailableForTimeslot(timeslotId);

      // Assert
      expect(result).toEqual(mockRooms);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const timeslotId = 'MON-1';
      const dbError = new Error('Database connection failed');

      mockPrisma.room.findMany = jest.fn(() => Promise.reject(dbError));

      // Act & Assert
      await expect(
        roomRepository.findAvailableForTimeslot(timeslotId)
      ).rejects.toThrow('Database connection failed');
    });
  });
});
