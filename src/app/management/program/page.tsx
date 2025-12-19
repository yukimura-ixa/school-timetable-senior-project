import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  alpha,
} from "@mui/material";
import Link from "next/link";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Suspense } from "react";
import prisma from "@/lib/prisma";

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

// Grade level metadata
const GRADE_LEVELS = [
  { year: 1, label: "มัธยมศึกษาปีที่ 1", shortLabel: "ม.1", color: "#2196f3" },
  { year: 2, label: "มัธยมศึกษาปีที่ 2", shortLabel: "ม.2", color: "#4caf50" },
  { year: 3, label: "มัธยมศึกษาปีที่ 3", shortLabel: "ม.3", color: "#ff9800" },
  { year: 4, label: "มัธยมศึกษาปีที่ 4", shortLabel: "ม.4", color: "#9c27b0" },
  { year: 5, label: "มัธยมศึกษาปีที่ 5", shortLabel: "ม.5", color: "#f44336" },
  { year: 6, label: "มัธยมศึกษาปีที่ 6", shortLabel: "ม.6", color: "#00bcd4" },
];

// Card Component
function ProgramYearCard({
  year,
  label,
  shortLabel,
  color,
  count,
}: {
  year: number;
  label: string;
  shortLabel: string;
  color: string;
  count: number;
}) {
  return (
    <Link
      href={`/management/program/year/${year}`}
      style={{ display: "block", height: "100%", textDecoration: "none" }}
    >
      <Card
        elevation={0}
        sx={{
          height: "100%",
          cursor: "pointer",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: color,
            boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(color, 0.1),
                  color: color,
                }}
              >
                <SchoolIcon fontSize="medium" />
              </Box>
              <Chip
                label={shortLabel}
                size="small"
                sx={{
                  bgcolor: alpha(color, 0.1),
                  color: color,
                  fontWeight: 600,
                }}
              />
            </Stack>

            {/* Content */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                หลักสูตร{label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {count > 0 ? `${count} หลักสูตร` : "ยังไม่มีหลักสูตร"}
              </Typography>
            </Box>

            {/* Footer */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ color: color }}
            >
              <Typography variant="body2" fontWeight={500}>
                จัดการ
              </Typography>
              <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading skeleton
function ProgramYearCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          />
          <Box
            sx={{
              height: 24,
              width: "60%",
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              height: 16,
              width: "40%",
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          />
        </Stack>
      </CardContent>
    </Card>
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
            <Typography variant="h4" fontWeight={700} gutterBottom>
              จัดการหลักสูตร
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการหลักสูตรการศึกษาสำหรับแต่ละระดับชั้น
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
