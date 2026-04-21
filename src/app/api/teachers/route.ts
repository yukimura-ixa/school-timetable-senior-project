import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("TeachersAPI");

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
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const role = normalizeAppRole(session.user?.role);
    if (!isAdminRole(role)) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

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
    log.error("GET /api/teachers failed", { error: error instanceof Error ? error.message : String(error) });
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
