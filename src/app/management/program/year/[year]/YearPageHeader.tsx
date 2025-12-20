"use client";

import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  alpha,
  keyframes,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import type { ReactNode } from "react";

// Keyframe animations
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

// Grade level metadata
export const GRADE_LEVEL_INFO: Record<
  number,
  { label: string; shortLabel: string; color: string; gradient: string }
> = {
  1: {
    label: "มัธยมศึกษาปีที่ 1",
    shortLabel: "ม.1",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  2: {
    label: "มัธยมศึกษาปีที่ 2",
    shortLabel: "ม.2",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  3: {
    label: "มัธยมศึกษาปีที่ 3",
    shortLabel: "ม.3",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  4: {
    label: "มัธยมศึกษาปีที่ 4",
    shortLabel: "ม.4",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  5: {
    label: "มัธยมศึกษาปีที่ 5",
    shortLabel: "ม.5",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
  6: {
    label: "มัธยมศึกษาปีที่ 6",
    shortLabel: "ม.6",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
};

interface YearPageHeaderProps {
  year: number;
  children?: ReactNode;
}

export function YearPageHeader({ year, children }: YearPageHeaderProps) {
  const gradeInfo = GRADE_LEVEL_INFO[year] ?? {
    label: `มัธยมศึกษาปีที่ ${year}`,
    shortLabel: `ม.${year}`,
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        border: "1px solid",
        borderColor: alpha(gradeInfo.color, 0.15),
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${alpha("#1e293b", 0.9)} 0%, ${alpha("#0f172a", 0.95)} 100%)`
            : `linear-gradient(135deg, ${alpha("#f8fafc", 1)} 0%, ${alpha("#f1f5f9", 1)} 100%)`,
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: gradeInfo.gradient,
          opacity: 0.1,
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: gradeInfo.gradient,
          opacity: 0.06,
          animation: `${pulse} 4s ease-in-out infinite 1s`,
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box>
          {/* Breadcrumb navigation */}
          <Button
            href="/management/program"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{
              mb: 2,
              color: "text.secondary",
              "&:hover": {
                color: gradeInfo.color,
                bgcolor: alpha(gradeInfo.color, 0.08),
              },
            }}
          >
            กลับไปหน้าหลัก
          </Button>

          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: gradeInfo.gradient,
                boxShadow: `0 8px 24px ${alpha(gradeInfo.color, 0.35)}`,
              }}
            >
              <SchoolIcon sx={{ color: "#fff", fontSize: 26 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    background: `linear-gradient(135deg, #1e293b 0%, #475569 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  หลักสูตร{gradeInfo.label}
                </Typography>
                <Chip
                  label={gradeInfo.shortLabel}
                  size="small"
                  sx={{
                    bgcolor: alpha(gradeInfo.color, 0.12),
                    color: gradeInfo.color,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: `1px solid ${alpha(gradeInfo.color, 0.2)}`,
                  }}
                />
              </Stack>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                จัดการหลักสูตรการศึกษาสำหรับ {gradeInfo.shortLabel}
              </Typography>
            </Box>
          </Stack>
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}
