import { vi, MockedObject, Mock } from "vitest";
/**
 * Unit tests for Room Availability Logic
 * Tests computeAvailability helper function with various conflict scenarios
 *
 * @vitest-environment happy-dom
 */

import { computeAvailability } from "@/hooks/roomAvailabilityUtils";
import type { class_schedule } from "@/prisma/generated/client";

// Mock the hook module to avoid importing server actions
vi.mock("@/hooks/useRoomAvailability", () => {
  const originalModule = vi.importActual("@/hooks/useRoomAvailability");
  return {
    ...originalModule,
    useRoomAvailability: vi.fn(),
  };
});

describe("computeAvailability", () => {
  describe("with empty selections", () => {
    it("should return available for rooms with no locks when no timeslots selected", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [];
      const selectedTimeslots: string[] = [];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result).toEqual({});
    });

    it("should return partial for rooms with locks when no timeslots selected", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1B" },
        { RoomID: 2, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots: string[] = [];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result).toEqual({
        1: "partial",
        2: "partial",
      });
    });
  });

  describe("with single timeslot selection", () => {
    it("should return available when room has no conflicts", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 2, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1B"]; // Room 1 has 1A, not 1B

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("available");
      expect(result[2]).toBe("available");
    });

    it("should return occupied when room is fully locked for selected timeslot", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 2, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1A"]; // Room 1 is locked at 1A

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("occupied");
      expect(result[2]).toBe("available");
    });
  });

  describe("with multiple timeslot selections", () => {
    it("should return available when room has no conflicts across all selected timeslots", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1B" },
      ];
      const selectedTimeslots = ["1-2567-2A", "1-2567-2B"]; // Different timeslots

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("available");
    });

    it("should return occupied when room is locked for all selected timeslots", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1B" },
        { RoomID: 1, TimeslotID: "1-2567-1C" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"]; // Both locked

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("occupied");
    });

    it("should return partial when room has some conflicts but not all", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"]; // 1A locked, 1B free

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("partial");
    });

    it("should handle 2-timeslot selection (bulk lock use case)", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 101, TimeslotID: "1-2567-1A" },
        { RoomID: 102, TimeslotID: "1-2567-1A" },
        { RoomID: 102, TimeslotID: "1-2567-1B" },
        { RoomID: 103, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[101]).toBe("partial"); // Only 1A locked
      expect(result[102]).toBe("occupied"); // Both 1A and 1B locked
      expect(result[103]).toBe("available"); // Only 2A locked (different timeslot)
    });
  });

  describe("with multiple rooms", () => {
    it("should compute availability independently for each room", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1B" },
        { RoomID: 2, TimeslotID: "1-2567-1A" },
        { RoomID: 3, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("occupied"); // Both timeslots locked
      expect(result[2]).toBe("partial"); // Only 1A locked
      expect(result[3]).toBe("available"); // No conflicts (2A locked but not selected)
    });

    it("should handle rooms with different conflict patterns", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 201, TimeslotID: "1-2567-1A" },
        { RoomID: 201, TimeslotID: "1-2567-1B" },
        { RoomID: 201, TimeslotID: "1-2567-1C" },
        { RoomID: 202, TimeslotID: "1-2567-1A" },
        { RoomID: 203, TimeslotID: "1-2567-2A" },
        { RoomID: 204, TimeslotID: "1-2567-3A" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B", "1-2567-1C"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[201]).toBe("occupied"); // All 3 locked
      expect(result[202]).toBe("partial"); // Only 1A locked
      expect(result[203]).toBe("available"); // No conflicts
      expect(result[204]).toBe("available"); // No conflicts
    });
  });

  describe("edge cases", () => {
    it("should ignore schedules with null RoomID", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: null, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1A" },
      ];
      const selectedTimeslots = ["1-2567-1A"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result).toEqual({ 1: "occupied" });
      expect(result[null as unknown as number]).toBeUndefined();
    });

    it("should handle empty locked schedules", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result).toEqual({});
    });

    it("should handle Set as selectedTimeslots input (Iterable)", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 1, TimeslotID: "1-2567-1A" },
        { RoomID: 1, TimeslotID: "1-2567-1B" },
      ];
      const selectedTimeslots = new Set(["1-2567-1A", "1-2567-1B"]);

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(result[1]).toBe("occupied");
    });

    it("should handle large dataset efficiently", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [];

      // Simulate 100 rooms with various locks
      for (let room = 1; room <= 100; room++) {
        for (let slot = 1; slot <= 5; slot++) {
          lockedSchedules.push({
            RoomID: room,
            TimeslotID: `1-2567-${slot}A`,
          });
        }
      }

      const selectedTimeslots = ["1-2567-1A", "1-2567-2A"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      expect(Object.keys(result)).toHaveLength(100);
      // All rooms have both 1A and 2A locked → occupied (full match with selection)
      expect(result[1]).toBe("occupied");
      expect(result[50]).toBe("occupied");
      expect(result[100]).toBe("occupied");
    });
  });

  describe("real-world scenarios", () => {
    it("should match BulkLockModal workflow (selecting 2 timeslots for bulk creation)", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 301, TimeslotID: "1-2567-1A" },
        { RoomID: 301, TimeslotID: "1-2567-1B" },
        { RoomID: 302, TimeslotID: "1-2567-1A" },
        { RoomID: 303, TimeslotID: "1-2567-2A" },
      ];
      const selectedTimeslots = ["1-2567-1A", "1-2567-1B"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      // Room 301: Both timeslots locked → occupied
      expect(result[301]).toBe("occupied");

      // Room 302: Only 1A locked → partial
      expect(result[302]).toBe("partial");

      // Room 303: Different timeslot locked → available
      expect(result[303]).toBe("available");
    });

    it("should match LockScheduleForm workflow (selecting 1-2 timeslots for single lock)", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 401, TimeslotID: "2-2567-3A" },
        { RoomID: 402, TimeslotID: "2-2567-3B" },
        { RoomID: 403, TimeslotID: "2-2567-3A" },
        { RoomID: 403, TimeslotID: "2-2567-3B" },
      ];
      const selectedTimeslots = ["2-2567-3A"];

      const result = computeAvailability(lockedSchedules, selectedTimeslots);

      // Room 401: 3A locked → occupied
      expect(result[401]).toBe("occupied");

      // Room 402: Only 3B locked → available
      expect(result[402]).toBe("available");

      // Room 403: 3A locked → occupied
      expect(result[403]).toBe("occupied");
    });

    it("should support dynamic re-computation as user changes selection", () => {
      const lockedSchedules: Array<
        Pick<class_schedule, "RoomID" | "TimeslotID">
      > = [
        { RoomID: 501, TimeslotID: "1-2567-1A" },
        { RoomID: 501, TimeslotID: "1-2567-1B" },
      ];

      // Initial selection: 1 timeslot
      let result = computeAvailability(lockedSchedules, ["1-2567-1A"]);
      expect(result[501]).toBe("occupied");

      // User adds second timeslot
      result = computeAvailability(lockedSchedules, ["1-2567-1A", "1-2567-1B"]);
      expect(result[501]).toBe("occupied");

      // User changes to non-conflicting timeslot
      result = computeAvailability(lockedSchedules, ["1-2567-2A"]);
      expect(result[501]).toBe("available");

      // User clears selection
      result = computeAvailability(lockedSchedules, []);
      expect(result[501]).toBe("partial"); // Has some locks but no selection to compare
    });
  });

  describe("table-driven test suite", () => {
    const testCases = [
      {
        description: "no locks, no selection → empty map",
        lockedSchedules: [],
        selectedTimeslots: [],
        expected: {},
      },
      {
        description: "no locks, with selection → empty map",
        lockedSchedules: [],
        selectedTimeslots: ["1-2567-1A"],
        expected: {},
      },
      {
        description:
          "locks present, no selection → partial for all locked rooms",
        lockedSchedules: [
          { RoomID: 1, TimeslotID: "1-2567-1A" },
          { RoomID: 2, TimeslotID: "1-2567-1B" },
        ],
        selectedTimeslots: [],
        expected: { 1: "partial", 2: "partial" },
      },
      {
        description: "full conflict (1 timeslot) → occupied",
        lockedSchedules: [{ RoomID: 1, TimeslotID: "1-2567-1A" }],
        selectedTimeslots: ["1-2567-1A"],
        expected: { 1: "occupied" },
      },
      {
        description: "no conflict (1 timeslot) → available",
        lockedSchedules: [{ RoomID: 1, TimeslotID: "1-2567-1A" }],
        selectedTimeslots: ["1-2567-1B"],
        expected: { 1: "available" },
      },
      {
        description: "full conflict (2 timeslots) → occupied",
        lockedSchedules: [
          { RoomID: 1, TimeslotID: "1-2567-1A" },
          { RoomID: 1, TimeslotID: "1-2567-1B" },
        ],
        selectedTimeslots: ["1-2567-1A", "1-2567-1B"],
        expected: { 1: "occupied" },
      },
      {
        description: "partial conflict (1 of 2 timeslots) → partial",
        lockedSchedules: [{ RoomID: 1, TimeslotID: "1-2567-1A" }],
        selectedTimeslots: ["1-2567-1A", "1-2567-1B"],
        expected: { 1: "partial" },
      },
      {
        description: "mixed: room 1 occupied, room 2 partial, room 3 available",
        lockedSchedules: [
          { RoomID: 1, TimeslotID: "1-2567-1A" },
          { RoomID: 1, TimeslotID: "1-2567-1B" },
          { RoomID: 2, TimeslotID: "1-2567-1A" },
          { RoomID: 3, TimeslotID: "1-2567-2A" },
        ],
        selectedTimeslots: ["1-2567-1A", "1-2567-1B"],
        expected: { 1: "occupied", 2: "partial", 3: "available" },
      },
    ] as const;

    testCases.forEach(
      ({ description, lockedSchedules, selectedTimeslots, expected }) => {
        it(description, () => {
          const result = computeAvailability(
            lockedSchedules as Array<
              Pick<class_schedule, "RoomID" | "TimeslotID">
            >,
            selectedTimeslots as string[],
          );
          expect(result).toEqual(expected);
        });
      },
    );
  });
});
