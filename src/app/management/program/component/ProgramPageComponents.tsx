"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Stack,
  alpha,
  keyframes,
} from "@mui/material";
import Link from "next/link";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import type { ReactNode } from "react";
import { GRADE_LEVELS } from "../constants";

// Re-export for backward compatibility
export { GRADE_LEVELS } from "../constants";

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Enhanced Card Component with glassmorphism
export function ProgramYearCard({
  year,
  label,
  shortLabel,
  color,
  gradient,
  count,
}: {
  year: number;
  label: string;
  shortLabel: string;
  color: string;
  gradient: string;
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
          position: "relative",
          overflow: "hidden",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha("#fff", 0.9)} 100%)`,
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: alpha(color, 0.2),
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
            borderColor: alpha(color, 0.4),
            "& .card-icon": {
              animation: `${float} 2s ease-in-out infinite`,
            },
            "& .card-arrow": {
              transform: "translateX(4px)",
            },
            "& .card-glow": {
              opacity: 1,
            },
          },
        }}
      >
        {/* Background glow effect */}
        <Box
          className="card-glow"
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: gradient,
            opacity: 0.15,
            filter: "blur(40px)",
            transition: "opacity 0.3s ease",
          }}
        />

        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                className="card-icon"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: gradient,
                  boxShadow: `0 8px 24px ${alpha(color, 0.35)}`,
                  transition: "all 0.3s ease",
                }}
              >
                <SchoolIcon sx={{ fontSize: 28, color: "#fff" }} />
              </Box>
              <Chip
                label={shortLabel}
                size="small"
                sx={{
                  bgcolor: alpha(color, 0.12),
                  color: color,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  border: `1px solid ${alpha(color, 0.2)}`,
                }}
              />
            </Stack>

            {/* Content */}
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{ color: "text.primary" }}
              >
                หลักสูตร{label}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.08),
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 16, color: color }} />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: color }}
                  >
                    {count > 0 ? `${count} หลักสูตร` : "ยังไม่มีหลักสูตร"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Footer */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ color: color }}
            >
              <Typography variant="body2" fontWeight={600}>
                จัดการ
              </Typography>
              <ArrowForwardIcon
                className="card-arrow"
                fontSize="small"
                sx={{ ml: 0.5, transition: "transform 0.2s ease" }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading skeleton with shimmer effect
export function ProgramYearCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.5s infinite`,
            }}
          />
          <Box
            sx={{
              height: 24,
              width: "70%",
              borderRadius: 1,
              background: `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.5s infinite`,
            }}
          />
          <Box
            sx={{
              height: 18,
              width: "45%",
              borderRadius: 1,
              background: `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.5s infinite`,
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

// Stats summary component (client version for display)
export function ProgramStatsDisplay({
  totalPrograms,
  activeYears,
}: {
  totalPrograms: number;
  activeYears: number;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha("#3b82f6", 0.1),
          border: `1px solid ${alpha("#3b82f6", 0.2)}`,
        }}
      >
        <Typography variant="h5" fontWeight={700} color="#3b82f6">
          {totalPrograms}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          หลักสูตรทั้งหมด
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha("#10b981", 0.1),
          border: `1px solid ${alpha("#10b981", 0.2)}`,
        }}
      >
        <Typography variant="h5" fontWeight={700} color="#10b981">
          {activeYears}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ระดับชั้น
        </Typography>
      </Box>
    </Stack>
  );
}

// Header component with decorative elements
export function ProgramPageHeader({
  children,
  statsSlot,
}: {
  children?: ReactNode;
  statsSlot?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        border: "1px solid",
        borderColor: alpha("#3b82f6", 0.1),
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
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          opacity: 0.08,
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
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
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                boxShadow: `0 8px 24px ${alpha("#3b82f6", 0.35)}`,
              }}
            >
              <SchoolIcon sx={{ color: "#fff", fontSize: 26 }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              จัดการหลักสูตร
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
            จัดการหลักสูตรการศึกษาสำหรับแต่ละระดับชั้น
          </Typography>
          {statsSlot && <Box sx={{ ml: 7.5 }}>{statsSlot}</Box>}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

// Grid wrapper for cards
export function ProgramCardsGrid({
  counts,
}: {
  counts: Record<number, number>;
}) {
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

// Skeleton grid
export function ProgramCardsGridSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <ProgramYearCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
