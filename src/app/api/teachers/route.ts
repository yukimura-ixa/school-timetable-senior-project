import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/teachers
 *
 * Fetches all teachers for the arrange page teacher selector.
 * Replaces: getTeachersAction() called via SWR
 *
 * Query params: None (returns all teachers)
 *
 * Response format matches Server Action for backwards compatibility:
 * { success: true, data: Teacher[] }
 */
export async function GET(_request: NextRequest) {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: [{ Firstname: "asc" }, { Lastname: "asc" }],
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
        Department: true,
        Email: true,
        Role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("[API] GET /api/teachers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to fetch teachers",
        },
      },
      { status: 500 },
    );
  }
}
