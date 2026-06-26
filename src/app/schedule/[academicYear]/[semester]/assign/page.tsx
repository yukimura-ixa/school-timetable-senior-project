import { permanentRedirect } from "next/navigation";

// Teacher assignment consolidated under /management/teacher-assignment.
// This legacy route is permanently gone (Phase D deletes its components);
// forward by-grade with the term context so existing links keep working.
export default async function LegacyAssignRedirect({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  permanentRedirect(
    `/management/teacher-assignment?mode=by-grade&year=${academicYear}&semester=${semester}`,
  );
}
