/**
 * Palette Slot - Server Component
 *
 * Fetches available subjects for the selected teacher.
 * If no teacher selected, shows empty state.
 */

import { prisma } from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";
import { PaletteClient } from "./_components/PaletteClient";
import { Alert, AlertTitle } from "@mui/material";

export default async function PaletteSlot({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ teacher?: string }>;
}) {
  const { academicYear, semester: semesterNum } = await params;
  const { teacher } = await searchParams;

  // No teacher selected - show empty state
  if (!teacher) {
    return (
      <Alert severity="info">
        <AlertTitle>เลือกครู</AlertTitle>
        กรุณาเลือกครูเพื่อดูรายวิชาที่สอน
      </Alert>
    );
  }

  const teacherId = parseInt(teacher);
  const semesterEnum =
    semesterNum === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

  // SERVER-SIDE: Fetch teacher's responsibilities (subjects they teach)
  const responsibilities = await prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: teacherId,
      AcademicYear: parseInt(academicYear),
      Semester: semesterEnum,
    },
    include: {
      subject: {
        select: {
          SubjectCode: true,
          SubjectName: true,
          // Credits: false, // Removed invalid false selection
          Credit: true,
        },
      },
      gradelevel: {
        select: {
          GradeID: true,
          Year: true,
          Number: true,
          // GradeName: true, // Removed
        },
      },
    },
    orderBy: {
      subject: {
        SubjectName: "asc",
      },
    },
  });

  // Transform to subject data format
  const subjects = responsibilities.map((resp) => ({
    RespID: resp.RespID,
    SubjectCode: resp.subject.SubjectCode,
    SubjectName: resp.subject.SubjectName,
    Credits:
      resp.subject.Credit === "CREDIT_05"
        ? 0.5
        : resp.subject.Credit === "CREDIT_10"
          ? 1.0
          : resp.subject.Credit === "CREDIT_15"
            ? 1.5
            : 2.0, // Map enum to number if needed, or just use string
    GradeID: resp.gradelevel.GradeID,
    GradeName: `M.${resp.gradelevel.Year}/${resp.gradelevel.Number}`,
    Year: resp.gradelevel.Year,
  }));

  return <PaletteClient subjects={subjects} />;
}
