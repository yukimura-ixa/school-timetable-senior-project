import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { semester } from "@prisma/client";
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // localhost:3000/api/assign/getAvailableResp?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566
  try {
    const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"));
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"));
    const SemesterParam = request.nextUrl.searchParams.get("Semester");
    const Semester = SemesterParam ? semester[SemesterParam as keyof typeof semester] : null;

    const validation = validateRequiredParams({ TeacherID, AcademicYear, Semester });
    if (validation) return validation;

    const data = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: TeacherID!,
        AcademicYear: AcademicYear!,
        Semester: Semester!,
      },
      include: {
        subject: true,
        teacher: true,
        gradelevel: true,
        class_schedule: true
      }
    });

    const subjectsBox = [];
    for (const resp of data) {
      const loopCredit = resp.TeachHour - resp.class_schedule.length;
      for (let i = 0; i < loopCredit; i++) {
        subjectsBox.push(resp);
      }
    }

    const results = subjectsBox.map((resp, index) => ({ 
      ...resp, 
      SubjectName: resp.subject.SubjectName, 
      itemID: index + 1 
    }));
    return NextResponse.json(results);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch available responsibilities");
  }
}