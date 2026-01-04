import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";
import { generateStudentTimetablePDF } from "@/features/export/pdf/generators/student-pdf-generator";
import { createLogger } from "@/lib/logger";

const log = createLogger("API:StudentPdfExport");
import type { StudentTimetableData } from "@/features/export/pdf/templates/student-timetable-pdf";

function safeFilenamePart(value: unknown): string {
  const text =
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
      ? String(value)
      : "";
  const sanitized = text
    .replace(/[\r\n"]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized.slice(0, 80) : "unknown";
}

/**
 * POST /api/export/student-timetable/pdf
 * 
 * Admin-only endpoint to generate student timetable PDFs server-side.
 * Returns a PDF file with Thai text support (Sarabun font).
 * 
 * RBAC: Admin access required (403 for non-admin)
 * 
 * Request body: StudentTimetableData
 * Response: application/pdf with Content-Disposition attachment
 */
export async function POST(req: NextRequest) {
  log.debug("Student timetable PDF export request");
  
  try {
    // Auth check - admin only
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const userRole = normalizeAppRole(session?.user?.role);

    if (!isAdminRole(userRole)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const data: StudentTimetableData = await req.json();

    // Validate required fields
    if (!data.gradeId || !data.semester || !data.academicYear) {
      return NextResponse.json(
        { error: "Missing required fields: gradeId, semester, academicYear" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBlob = await generateStudentTimetablePDF(data);

    // Convert Blob to Buffer
    const buffer = await pdfBlob.arrayBuffer();

    // Return PDF with download headers
    const filename = `student-${safeFilenamePart(data.gradeId)}-${safeFilenamePart(
      data.semester,
    )}-${safeFilenamePart(data.academicYear)}.pdf`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    log.logError(error, { route: "/api/export/student-timetable/pdf" });
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
