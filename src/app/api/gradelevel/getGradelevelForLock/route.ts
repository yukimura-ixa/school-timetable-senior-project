import prisma from "@/libs/prisma";
import { semester, type gradelevel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // localhost:3000/api/gradelevel/getGradelevelForLock?SubjectCode=โครงงาน
  try {
    const SubjectCode = request.nextUrl.searchParams.get("SubjectCode");
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"));
    const SemesterParam = request.nextUrl.searchParams.get("Semester");
    const Semester = SemesterParam ? semester[SemesterParam as keyof typeof semester] : null;
    const TeacherIDsRaw = request.nextUrl.searchParams.getAll("TeacherID");
    const TeacherIDs = TeacherIDsRaw.map((id) => safeParseInt(id)).filter((id): id is number => id !== null);

    const validation = validateRequiredParams({ SubjectCode, AcademicYear, Semester });
    if (validation) return validation;

    const groupby = await prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: AcademicYear!,
        Semester: Semester!,
        SubjectCode: SubjectCode!,
        TeacherID: {
          in: TeacherIDs
        }
      },
    });

    const sameGrade = groupby.reduce<Record<string, typeof groupby>>((acc, curr) => {
      if (!acc[curr.GradeID]) {
        acc[curr.GradeID] = [];
      }
      acc[curr.GradeID].push(curr);
      return acc;
    }, {});

    const moreThanOne = Object.keys(sameGrade).filter((key) => sameGrade[key].length > 1);

    const searchGradeID = moreThanOne.length > 0 
      ? moreThanOne 
      : TeacherIDs.length === 1 
        ? Object.keys(sameGrade) 
        : [];

    const data: gradelevel[] = await prisma.gradelevel.findMany({
      where: {
        GradeID: {
          in: searchGradeID
        }
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch grade levels for lock");
  }
}