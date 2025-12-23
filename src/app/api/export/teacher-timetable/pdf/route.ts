import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";
import { generateTeacherTimetablePDF } from "@/features/export/pdf/generators/teacher-pdf-generator";
import type { TeacherTimetableData } from "@/features/export/pdf/templates/teacher-timetable-pdf";
import {
  extractDayFromTimeslotId,
  extractPeriodFromTimeslotId,
} from "@/utils/timeslot-id";

// Client-side request payload format
interface ClientPayload {
  teacherId: number;
  teacherName: string;
  semester: string;
  academicYear: string;
  timeslots: Array<{
    timeslotId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    breaktime: string | null;
  }>;
  scheduleEntries: Array<{
    timeslotId: string;
    gradeLevel: string;
    subjectCode: string;
    subjectName: string;
    roomName: string;
  }>;
  totalCredits: number;
  totalHours: number;
}

// Day mapping from English to Thai
const DAY_MAP: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  MONDAY: "จันทร์",
  TUESDAY: "อังคาร",
  WEDNESDAY: "พุธ",
  THURSDAY: "พฤหัสบดี",
  FRIDAY: "ศุกร์",
};

/**
 * Teacher Timetable PDF Export API Route
 *
 * POST /api/export/teacher-timetable/pdf
 *
 * Admin-only access enforced per new RBAC policy
 * Generates PDF server-side using @react-pdf/renderer
 */
export async function POST(req: NextRequest) {
  // Admin-only RBAC enforcement
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = normalizeAppRole(session?.user?.role);

  if (!isAdminRole(userRole)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 },
    );
  }

  try {
    const clientData: ClientPayload = await req.json();

    // Validate required fields
    if (
      !clientData.teacherId ||
      !clientData.teacherName ||
      !clientData.semester ||
      !clientData.academicYear
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create a lookup map from scheduleEntries by timeslotId
    const scheduleMap = new Map<
      string,
      (typeof clientData.scheduleEntries)[0]
    >();
    for (const entry of clientData.scheduleEntries) {
      scheduleMap.set(entry.timeslotId, entry);
    }

    // Transform client data to PDF template format
    // Merge timeslots with scheduleEntries
    const transformedTimeslots: TeacherTimetableData["timeslots"] =
      clientData.timeslots.map((slot) => {
        const scheduleEntry = scheduleMap.get(slot.timeslotId);

        // Extract day and period from timeslotId or dayOfWeek field
        let day = slot.dayOfWeek;
        let period = 1;

        try {
          day = extractDayFromTimeslotId(slot.timeslotId) || slot.dayOfWeek;
          period = extractPeriodFromTimeslotId(slot.timeslotId) || 1;
        } catch {
          // Fallback: try to extract period from timeslotId
          const match = slot.timeslotId.match(/(\d+)$/);
          if (match && match[1]) {
            period = parseInt(match[1], 10);
          }
        }

        // Map English day codes to Thai
        const thaiDay = DAY_MAP[day.toUpperCase()] || day;

        return {
          day: thaiDay,
          period,
          subject: scheduleEntry
            ? `${scheduleEntry.subjectCode} ${scheduleEntry.subjectName}`
            : undefined,
          room: scheduleEntry?.roomName || undefined,
          class: scheduleEntry?.gradeLevel || undefined,
        };
      });

    // Build the transformed data for PDF template
    const pdfData: TeacherTimetableData = {
      teacherId: clientData.teacherId,
      teacherName: clientData.teacherName,
      semester: parseInt(clientData.semester, 10),
      academicYear: parseInt(clientData.academicYear, 10),
      timeslots: transformedTimeslots,
      totalCredits: clientData.totalCredits,
      totalHours: clientData.totalHours,
    };

    // Generate PDF
    const pdfBlob = await generateTeacherTimetablePDF(pdfData);

    // Convert Blob to Buffer for Response
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="teacher-${clientData.teacherId}-${clientData.semester}-${clientData.academicYear}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[PDF Export] Teacher timetable generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
