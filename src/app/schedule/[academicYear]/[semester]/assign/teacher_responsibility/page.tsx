import { permanentRedirect } from "next/navigation";

// Teacher-centric editing moved to /management/teacher-assignment?mode=by-teacher.
// Preserve the selected teacher: legacy ?TeacherID (PascalCase) maps to the
// canonical ?teacherId (camelCase) the consolidated page reads.
export default async function LegacyTeacherResponsibilityRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ TeacherID?: string }>;
}) {
  const { academicYear, semester } = await params;
  const { TeacherID } = await searchParams;
  const base = `/management/teacher-assignment?mode=by-teacher&year=${academicYear}&semester=${semester}`;
  permanentRedirect(TeacherID ? `${base}&teacherId=${TeacherID}` : base);
}
