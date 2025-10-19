import { semester, type class_schedule } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"));
    const SemesterParam = request.nextUrl.searchParams.get("Semester");
    const Semester = SemesterParam ? semester[SemesterParam as keyof typeof semester] : null;
    const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"));

    // Validate required parameters
    const validation = validateRequiredParams({ 
      AcademicYear, 
      Semester, 
      TeacherID 
    });
    if (validation) return validation;

    // localhost:3000/api/class/checkConflict?AcademicYear=2566&Semester=SEMESTER_1&TeacherID=1
    const response: class_schedule[] = await prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: AcademicYear!,
          Semester: Semester!
        },
        teachers_responsibility: {
          some: {
            Semester: Semester!,
            AcademicYear: AcademicYear!,
            NOT: {
              TeacherID: TeacherID!
            }
          },
        }
      },
      include: {
        subject: {
          include: {
            teachers_responsibility: true
          }
        },
        gradelevel: true,
        timeslot: true,
        room: true,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error, "Failed to check schedule conflicts");
  }
}