import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/gradelevels
 *
 * Fetches all grade levels for the arrange page tabs.
 * Replaces: getGradeLevelsAction() called via SWR
 *
 * Query params:
 *   - year (optional): Filter by academic year
 *   - semester (optional): Filter by semester
 *
 * Response format matches Server Action:
 * { success: true, data: GradeLevel[] }
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const searchParams = request.nextUrl.searchParams;
    const _year = searchParams.get("year");
    const _semester = searchParams.get("semester");

    const gradeLevels = await prisma.gradelevel.findMany({
      orderBy: [{ Year: "asc" }, { Number: "asc" }],
      select: {
        GradeID: true,
        Year: true,
        Number: true,
        program: true,
        // GradeName: true, // Removed
      },
    });

    return NextResponse.json({
      success: true,
      data: gradeLevels,
    });
  } catch (error) {
    console.error("[API] GET /api/gradelevels error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch grade levels",
        },
      },
      { status: 500 },
    );
  }
}
