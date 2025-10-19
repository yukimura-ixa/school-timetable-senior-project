import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { teachers_responsibility, semester } from "@prisma/client";
import { subjectCreditValues } from "@/models/credit-value";
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export async function GET(request: NextRequest) {
  // localhost:3000/api/assign?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566
  try {
    const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"));
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"));
    const SemesterParam = request.nextUrl.searchParams.get("Semester");
    const Semester = SemesterParam ? semester[SemesterParam as keyof typeof semester] : null;

    const validation = validateRequiredParams({ TeacherID, AcademicYear, Semester });
    if (validation) return validation;

    const data: teachers_responsibility[] = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: TeacherID!,
        AcademicYear: AcademicYear!,
        Semester: Semester!,
      },
      include: {
        subject: true,
        gradelevel: true,
        teacher: true,
      },
    });

    const results = data.map((resp) => ({ 
      ...resp, 
      SubjectName: resp.subject.SubjectName, 
      Credit: resp.subject.Credit 
    }));
    return NextResponse.json(results);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch teacher responsibilities");
  }
}

interface ResponsibilityInput {
  RespID?: number;
  SubjectCode: string;
  GradeID: string;
  Credit: string;
}

interface AssignPostBody {
  TeacherID: number;
  AcademicYear: number;
  Semester: string;
  Resp: ResponsibilityInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AssignPostBody = await request.json();
    const results: Array<{ created?: teachers_responsibility; deleted?: teachers_responsibility }> = [];

    const existingResponsibilities = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: body.TeacherID,
        AcademicYear: body.AcademicYear,
        Semester: semester[body.Semester as keyof typeof semester],
      },
    });

    const incomingResponsibilities = body.Resp;
    const diff = existingResponsibilities.filter(
      (resp) => !incomingResponsibilities.some((incoming) => incoming.RespID === resp.RespID)
    );

    for (const resp of incomingResponsibilities) {
      if (!resp.RespID) {
        const newResp = await prisma.teachers_responsibility.create({
          data: {
            TeacherID: body.TeacherID,
            AcademicYear: body.AcademicYear,
            Semester: semester[body.Semester as keyof typeof semester],
            SubjectCode: resp.SubjectCode,
            GradeID: resp.GradeID,
            TeachHour: subjectCreditValues[resp.Credit] * 2,
          }
        });
        results.push({ created: newResp });
      }
    }

    for (const resp of diff) {
      const deletedResp = await prisma.teachers_responsibility.delete({
        where: {
          RespID: resp.RespID
        }
      });
      results.push({ deleted: deletedResp });
    }

    await prisma.class_schedule.deleteMany({
      where: {
        timeslot: {
          AcademicYear: body.AcademicYear,
          Semester: semester[body.Semester as keyof typeof semester]
        },
        teachers_responsibility: {
          every: {
            TeacherID: body.TeacherID,
            AcademicYear: body.AcademicYear,
            Semester: semester[body.Semester as keyof typeof semester],
          }
        }
      }
    });

    return NextResponse.json({ status: "success", results });
  } catch (error) {
    return createErrorResponse(error, "Failed to update teacher responsibilities");
  }
}
