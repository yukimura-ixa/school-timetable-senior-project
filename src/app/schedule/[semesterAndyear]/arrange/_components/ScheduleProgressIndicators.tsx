"use client";

import React, { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Box,
  Tooltip,
  Grid,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as EmptyIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface ProgressItem {
  id: string;
  name: string;
  total: number;
  completed: number;
  conflicts: number;
}

interface ScheduleProgressIndicatorsProps {
  teacherProgress?: ProgressItem[];
  classProgress?: ProgressItem[];
  overallProgress?: {
    totalSlots: number;
    filledSlots: number;
    conflictSlots: number;
  };
}

export function ScheduleProgressIndicators({
  teacherProgress = [],
  classProgress = [],
  overallProgress,
}: ScheduleProgressIndicatorsProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================================
  // CALCULATIONS & FILTERING
  // ============================================================================

  const calculatePercentage = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getProgressColor = (
    percentage: number,
    hasConflicts: boolean,
  ): "success" | "warning" | "error" | "primary" => {
    if (hasConflicts) return "error";
    if (percentage === 100) return "success";
    if (percentage >= 50) return "primary";
    return "warning";
  };

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teacherProgress;
    const query = searchQuery.toLowerCase();
    return teacherProgress.filter((t) => t.name.toLowerCase().includes(query));
  }, [teacherProgress, searchQuery]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classProgress;
    const query = searchQuery.toLowerCase();
    return classProgress.filter((c) => c.name.toLowerCase().includes(query));
  }, [classProgress, searchQuery]);

  const overallPercentage = overallProgress
    ? calculatePercentage(
        overallProgress.filledSlots,
        overallProgress.totalSlots,
      )
    : 0;

  // ============================================================================
  // STYLED COMPONENTS (EMBEDDED)
  // ============================================================================

  const glassStyle = {
    background: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: "blur(12px)",
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.08)}`,
  };

  const gradientProgress = (color: string) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: alpha(color, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 4,
      background: `linear-gradient(90deg, ${alpha(color, 0.7)} 0%, ${color} 100%)`,
    },
  });

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressItem = (
    item: ProgressItem,
    icon: React.ReactNode,
    type: "teacher" | "class",
  ) => {
    const percentage = calculatePercentage(item.completed, item.total);
    const hasConflicts = item.conflicts > 0;
    const baseColor =
      type === "teacher"
        ? theme.palette.primary.main
        : theme.palette.secondary.main;
    const statusColor = getProgressColor(percentage, hasConflicts);
    const muiColor =
      statusColor === "primary" ? baseColor : theme.palette[statusColor].main;

    return (
      <Grid item xs={12} sm={6} md={4} key={item.id}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            ...glassStyle,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 12px 40px 0 ${alpha(muiColor, 0.15)}`,
              borderColor: alpha(muiColor, 0.3),
            },
            "&::before": hasConflicts
              ? {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 4,
                  height: "100%",
                  backgroundColor: theme.palette.error.main,
                }
              : {},
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: alpha(muiColor, 0.1),
                    color: muiColor,
                    display: "flex",
                  }}
                >
                  {icon}
                </Box>
                <Tooltip title={item.name} arrow>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </Typography>
                </Tooltip>
              </Stack>
              <Typography variant="caption" fontWeight="bold" color={muiColor}>
                {percentage}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={gradientProgress(muiColor)}
            />

            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="500"
              >
                {item.completed} / {item.total} คาบ
              </Typography>

              {hasConflicts ? (
                <Chip
                  icon={<WarningIcon sx={{ fontSize: "12px !important" }} />}
                  label={`ขัดแย้ง: ${item.conflicts}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                />
              ) : percentage === 100 ? (
                <CheckIcon
                  sx={{ fontSize: 16, color: theme.palette.success.main }}
                />
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Stack spacing={3}>
      {/* Search & Filters */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <TextField
          placeholder="ค้นหาครู หรือ ห้องเรียน..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
          >
            <FilterIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Overall Progress Section - Phase 2 Premium */}
      {overallProgress && !searchQuery && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            ...glassStyle,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="center"
          >
            {/* Left: Progress Circle Representation */}
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                p: 2,
                borderRadius: "50%",
                background: `conic-gradient(${theme.palette.primary.main} ${overallPercentage}%, ${alpha(theme.palette.primary.main, 0.1)} 0%)`,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h5" fontWeight="800" color="primary">
                  {overallPercentage}%
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2} sx={{ flex: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  ความคืบหน้าของตารางสอน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ภาพรวมการจัดตารางสอนทั้งหมดในภาคเรียนนี้
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={overallPercentage}
                sx={{
                  ...gradientProgress(theme.palette.primary.main),
                  height: 12,
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 16, color: "success.main" }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        จัดแล้ว
                      </Typography>
                      <Typography variant="body2" fontWeight="700">
                        {overallProgress.filledSlots} คาบ
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.action.disabled, 0.1),
                      }}
                    >
                      <EmptyIcon
                        sx={{ fontSize: 16, color: "text.disabled" }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        คงเหลือ
                      </Typography>
                      <Typography variant="body2" fontWeight="700">
                        {overallProgress.totalSlots -
                          overallProgress.filledSlots}{" "}
                        คาบ
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                {overallProgress.conflictSlots > 0 && (
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        }}
                      >
                        <WarningIcon
                          sx={{ fontSize: 16, color: "error.main" }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          ขัดแย้ง
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          color="error.main"
                        >
                          {overallProgress.conflictSlots} รายการ
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Teacher Progress List */}
      {(filteredTeachers.length > 0 || !searchQuery) && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <PersonIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="700">
              ความคืบหน้าตามครูผู้สอน
            </Typography>
            <Chip
              label={`${filteredTeachers.length} ท่าน`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: "600",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
          </Stack>

          <Grid container spacing={2}>
            {filteredTeachers.map((teacher) =>
              renderProgressItem(
                teacher,
                <PersonIcon fontSize="small" />,
                "teacher",
              ),
            )}
            {filteredTeachers.length === 0 && searchQuery && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  ไม่พบข้อมูลคุณครูสำหรับการค้นหา "{searchQuery}"
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Class Progress List */}
      {(filteredClasses.length > 0 || !searchQuery) && (
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2, mt: 4 }}
          >
            <SchoolIcon fontSize="small" color="secondary" />
            <Typography variant="subtitle2" fontWeight="700">
              ความคืบหน้าตามห้องเรียน
            </Typography>
            <Chip
              label={`${filteredClasses.length} ห้อง`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: "600",
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: "secondary.main",
              }}
            />
          </Stack>

          <Grid container spacing={2}>
            {filteredClasses.map((classItem) =>
              renderProgressItem(
                classItem,
                <SchoolIcon fontSize="small" />,
                "class",
              ),
            )}
            {filteredClasses.length === 0 && searchQuery && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  ไม่พบข้อมูลห้องเรียนสำหรับการค้นหา "{searchQuery}"
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Empty Result State */}
      {filteredTeachers.length === 0 &&
        filteredClasses.length === 0 &&
        searchQuery && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              ...glassStyle,
              borderRadius: 4,
            }}
          >
            <SearchIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 2, opacity: 0.5 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ไม่พบผลการค้นหา
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองใช้คำค้นหาอื่น เช่น ชื่อครู หรือ รหัสห้องเรียน
            </Typography>
          </Paper>
        )}

      {/* Global Empty State */}
      {teacherProgress.length === 0 &&
        classProgress.length === 0 &&
        !overallProgress && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              ...glassStyle,
              borderRadius: 4,
            }}
          >
            <ScheduleIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2, opacity: 0.3 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ยังไม่มีข้อมูลความคืบหน้า
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กรุณาจัดตารางสอนเพื่อติดตามความคืบหน้า
            </Typography>
          </Paper>
        )}
    </Stack>
  );
}
