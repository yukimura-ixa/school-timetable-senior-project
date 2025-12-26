import { Suspense } from "react";
import { cookies } from "next/headers";
import ShowTeacherData from "./component/ShowTeacherData";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import { Box, Skeleton, Paper } from "@mui/material";

// Loading skeleton for the page
function AssignPageSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, my: 5 }}>
      {/* Teacher Search Section Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
        }}
      >
        <Skeleton
          variant="text"
          width={200}
          height={32}
          sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
        />
        <Skeleton
          variant="rounded"
          height={56}
          sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.2)" }}
        />
      </Paper>

      {/* Content Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: 3,
          textAlign: "center",
          border: "2px dashed rgba(102,126,234,0.3)",
        }}
      >
        <Skeleton
          variant="circular"
          width={64}
          height={64}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton variant="text" width={200} height={32} sx={{ mx: "auto" }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mx: "auto" }} />
      </Paper>
    </Box>
  );
}

// Server Component that fetches data
async function AssignPageContent() {
  // Fetch all data in parallel on the server
  const [teachersResult, subjectsResult, gradeLevelsResult] = await Promise.all(
    [getTeachersAction({}), getSubjectsAction({}), getGradeLevelsAction({})],
  );

  const initialTeachers = teachersResult.success ? teachersResult.data : [];
  const initialSubjects = subjectsResult.success ? subjectsResult.data : [];
  const initialGradeLevels = gradeLevelsResult.success
    ? gradeLevelsResult.data
    : [];

  return (
    <ShowTeacherData
      initialTeachers={initialTeachers}
      initialSubjects={initialSubjects}
      initialGradeLevels={initialGradeLevels}
    />
  );
}

/**
 * Schedule Assign Page - Server Component
 * Prefetches teacher, subject, and grade level data on the server
 * for faster initial page load
 */
export default async function ClassifySubjectPage() {
  // Force dynamic rendering for Next.js 16
  await cookies();

  return (
    <div className="flex flex-col gap-3 my-5">
      <Suspense fallback={<AssignPageSkeleton />}>
        <AssignPageContent />
      </Suspense>
    </div>
  );
}
