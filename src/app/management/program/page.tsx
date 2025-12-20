import { Box, Grid } from "@mui/material";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { GRADE_LEVELS } from "./constants";
import {
  ProgramYearCard,
  ProgramYearCardSkeleton,
  ProgramStatsDisplay,
  ProgramPageHeader,
} from "./component/ProgramPageComponents";

// Fetch program counts per year
async function getProgramCountsByYear() {
  const counts = await prisma.program.groupBy({
    by: ["Year"],
    _count: { ProgramID: true },
    where: { IsActive: true },
  });

  const result: Record<number, number> = {};
  for (const item of counts) {
    result[item.Year] = item._count.ProgramID;
  }
  return result;
}

// Stats summary component (server version)
async function ProgramStats() {
  const counts = await getProgramCountsByYear();
  const totalPrograms = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const activeYears = Object.keys(counts).length;

  return (
    <ProgramStatsDisplay
      totalPrograms={totalPrograms}
      activeYears={activeYears}
    />
  );
}

// Main content
async function ProgramContent() {
  const counts = await getProgramCountsByYear();

  return (
    <Grid container spacing={3}>
      {GRADE_LEVELS.map((grade) => (
        <Grid key={grade.year} size={{ xs: 12, sm: 6, md: 4 }}>
          <ProgramYearCard {...grade} count={counts[grade.year] ?? 0} />
        </Grid>
      ))}
    </Grid>
  );
}

// Page
export default function ProgramManagementPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
      {/* Header */}
      <ProgramPageHeader
        statsSlot={
          <Suspense fallback={null}>
            <ProgramStats />
          </Suspense>
        }
      />

      {/* Grid of Year Cards */}
      <Suspense
        fallback={
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProgramYearCardSkeleton />
              </Grid>
            ))}
          </Grid>
        }
      >
        <ProgramContent />
      </Suspense>
    </Box>
  );
}
