import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProgramYearPageClient } from "./ProgramYearPageClient";
import { Box, Paper, Typography, Button, Stack, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { program } from "@/prisma/generated/client";

interface PageProps {
  params: Promise<{ year: string }>;
}

// Fetch programs for a specific year
async function getProgramsByYear(year: number): Promise<program[]> {
  const programs = await prisma.program.findMany({
    where: { Year: year },
    orderBy: { ProgramName: "asc" },
  });
  return programs;
}

// Loading skeleton
function ProgramDataGridSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="rectangular" height={400} />
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Button
                href="/management/program"
                startIcon={<ArrowBackIcon />}
                size="small"
                color="inherit"
              >
                กลับ
              </Button>
            </Stack>
            <Typography variant="h4" fontWeight={700}>
              หลักสูตรมัธยมศึกษาปีที่ {year}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการหลักสูตรการศึกษาสำหรับ ม.{year}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Content */}
      <Suspense fallback={<ProgramDataGridSkeleton />}>
        <ProgramYearContent year={year} />
      </Suspense>
    </Box>
  );
}
