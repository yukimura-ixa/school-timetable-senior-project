import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("RoomsAvailableAPI");

/**
 * GET /api/rooms/available
 *
 * Fetches available and occupied rooms for a specific timeslot.
 * Replaces: getAvailableRoomsAction() + getOccupiedRoomsAction() called via SWR
 *
 * Query params:
 *   - timeslot: TimeslotID (required, e.g., "1-2567-MON1")
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     available: Room[],
 *     occupied: Room[],
 *     occupiedIds: number[]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeslotId = searchParams.get("timeslot");

    if (!timeslotId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Missing required parameter: timeslot" },
        },
        { status: 400 },
      );
    }

    // Fetch all rooms and occupied rooms in parallel
    const [allRooms, occupiedSchedules] = await Promise.all([
      prisma.room.findMany({
        orderBy: [{ Building: "asc" }, { Floor: "asc" }, { RoomName: "asc" }],
        select: {
          RoomID: true,
          RoomName: true,
          Building: true,
          Floor: true,
        },
      }),
      prisma.class_schedule.findMany({
        where: { TimeslotID: timeslotId },
        select: { RoomID: true },
        distinct: ["RoomID"],
      }),
    ]);

    const occupiedIds = occupiedSchedules.map((s) => s.RoomID);
    const occupiedIdsSet = new Set(occupiedIds);

    const available = allRooms.filter(
      (room) => !occupiedIdsSet.has(room.RoomID),
    );
    const occupied = allRooms.filter((room) => occupiedIdsSet.has(room.RoomID));

    return NextResponse.json({
      success: true,
      data: {
        available,
        occupied,
        occupiedIds,
      },
    });
  } catch (error) {
    log.error("GET /api/rooms/available failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to fetch rooms",
        },
      },
      { status: 500 },
    );
  }
}
