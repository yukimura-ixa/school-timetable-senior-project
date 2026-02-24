import { Suspense } from "react";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import { notFound } from "next/navigation";
import { ProgramYearPageClient } from "./ProgramYearPageClient";
import { YearPageHeader } from "./YearPageHeader";
import { Box, Stack, Skeleton } from "@mui/material";
import type { program } from "@/prisma/generated/client";

interface PageProps {
  params: Promise<{ year: string }>;
}

// Fetch programs for a specific year
async function getProgramsByYear(year: number): Promise<program[]> {
  return programRepository.findByYear(year);
}

// Loading skeleton with shimmer
function ProgramDataGridSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}

// Main content
async function ProgramYearContent({ year }: { year: number }) {
  const programs = await getProgramsByYear(year);

  return <ProgramYearPageClient year={year} initialData={programs} />;
}

// Page component
export default async function ProgramYearPage({ params }: PageProps) {
  const { year: yearParam } = await params;
  const year = parseInt(yearParam, 10);

  // Validate year
  if (isNaN(year) || year < 1 || year > 6) {
    notFound();
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
      {/* Header */}
      <YearPageHeader year={year} />

      {/* Content */}
      <Suspense fallback={<ProgramDataGridSkeleton />}>
        <ProgramYearContent year={year} />
      </Suspense>
    </Box>
  );
}
