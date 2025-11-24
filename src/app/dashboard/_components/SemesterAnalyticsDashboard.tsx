"use client";

/**
 * SemesterAnalyticsDashboard Component
 * Display comprehensive analytics and statistics for semesters
 */

import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Room as RoomIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

type Props = {
  semesters: SemesterDTO[];
};

type SemesterStats = {
  total: number;
  byStatus: {
    draft: number;
    published: number;
    locked: number;
    archived: number;
  };
  byAcademicYear: Record<number, number>;
  avgCompleteness: number;
  pinned: number;
  recentlyAccessed: number;
  totalClasses: number;
  totalTeachers: number;
  totalSubjects: number;
  totalRooms: number;
  completenessDistribution: {
    low: number; // 0-30%
    medium: number; // 31-79%
    high: number; // 80-100%
  };
};

const STATUS_COLORS = {
  DRAFT: "#9e9e9e",
  PUBLISHED: "#4caf50",
  LOCKED: "#ff9800",
  ARCHIVED: "#f44336",
} as const;

const STATUS_LABELS = {
  DRAFT: "แบบร่าง",
  PUBLISHED: "เผยแพร่",
  LOCKED: "ล็อก",
  ARCHIVED: "เก็บถาวร",
} as const;

export function SemesterAnalyticsDashboard({ semesters }: Props) {
  const stats = useMemo<SemesterStats>(() => {
    const byStatus = {
      draft: 0,
      published: 0,
      locked: 0,
      archived: 0,
    };

    const byAcademicYear: Record<number, number> = {};
    const completenessDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    };

    let totalCompleteness = 0;
    let pinned = 0;
    let recentlyAccessed = 0;
    let totalClasses = 0;
    let totalTeachers = 0;
    let totalSubjects = 0;
    let totalRooms = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    semesters.forEach((semester) => {
      // Status count
      switch (semester.status) {
        case "DRAFT":
          byStatus.draft++;
          break;
        case "PUBLISHED":
          byStatus.published++;
          break;
        case "LOCKED":
          byStatus.locked++;
          break;
        case "ARCHIVED":
          byStatus.archived++;
          break;
      }

      // Academic year count
      byAcademicYear[semester.academicYear] =
        (byAcademicYear[semester.academicYear] || 0) + 1;

      // Completeness
      totalCompleteness += semester.configCompleteness;
      if (semester.configCompleteness < 31) {
        completenessDistribution.low++;
      } else if (semester.configCompleteness < 80) {
        completenessDistribution.medium++;
      } else {
        completenessDistribution.high++;
      }

      // Pinned
      if (semester.isPinned) {
        pinned++;
      }

      // Recently accessed
      if (
        semester.lastAccessedAt &&
        new Date(semester.lastAccessedAt) > thirtyDaysAgo
      ) {
        recentlyAccessed++;
      }

      // Totals
      totalClasses += semester.classCount || 0;
      totalTeachers += semester.teacherCount || 0;
      totalSubjects += semester.subjectCount || 0;
      totalRooms += semester.roomCount || 0;
    });

    return {
      total: semesters.length,
      byStatus,
      byAcademicYear,
      avgCompleteness:
        semesters.length > 0 ? totalCompleteness / semesters.length : 0,
      pinned,
      recentlyAccessed,
      totalClasses,
      totalTeachers,
      totalSubjects,
      totalRooms,
      completenessDistribution,
    };
  }, [semesters]);

  const academicYears = useMemo(
    () =>
      Object.entries(stats.byAcademicYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .slice(0, 5), // Top 5 years
    [stats.byAcademicYear],
  );

  const getCompletenessColor = (percentage: number) => {
    if (percentage < 31) return "#f44336"; // Red
    if (percentage < 80) return "#ff9800"; // Orange
    return "#4caf50"; // Green
  };

  if (semesters.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AssessmentIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          สถิติภาพรวม
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Overview Stats */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <SchoolIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  ภาคเรียนทั้งหมด
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  ความสมบูรณ์เฉลี่ย
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={getCompletenessColor(stats.avgCompleteness)}
              >
                {stats.avgCompleteness.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <StarIcon sx={{ color: "#ffc107" }} fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  ปักหมุด
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.pinned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <AssessmentIcon color="info" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  เข้าถึง 30 วันล่าสุด
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.recentlyAccessed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                สถานะภาคเรียน
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {Object.entries({
                  DRAFT: stats.byStatus.draft,
                  PUBLISHED: stats.byStatus.published,
                  LOCKED: stats.byStatus.locked,
                  ARCHIVED: stats.byStatus.archived,
                }).map(([status, count]) => {
                  const percentage =
                    stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <Box key={status}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={
                              STATUS_LABELS[
                                status as keyof typeof STATUS_LABELS
                              ]
                            }
                            size="small"
                            sx={{
                              bgcolor:
                                STATUS_COLORS[
                                  status as keyof typeof STATUS_COLORS
                                ],
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                          <Typography variant="body2">
                            {count} ภาคเรียน
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              STATUS_COLORS[
                                status as keyof typeof STATUS_COLORS
                              ],
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Completeness Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                การกระจายความสมบูรณ์
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {[
                  {
                    label: "ต่ำ (0-30%)",
                    value: stats.completenessDistribution.low,
                    color: "#f44336",
                  },
                  {
                    label: "ปานกลาง (31-79%)",
                    value: stats.completenessDistribution.medium,
                    color: "#ff9800",
                  },
                  {
                    label: "สูง (80-100%)",
                    value: stats.completenessDistribution.high,
                    color: "#4caf50",
                  },
                ].map((item) => {
                  const percentage =
                    stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                  return (
                    <Box key={item.label}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={item.label}
                            size="small"
                            sx={{
                              bgcolor: item.color,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                          <Typography variant="body2">
                            {item.value} ภาคเรียน
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: item.color,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Totals */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ข้อมูลทรัพยากรรวม
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Tooltip title="จำนวนห้องเรียนทั้งหมดในทุกภาคเรียน">
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "primary.50",
                        borderRadius: 1,
                      }}
                    >
                      <ClassIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalClasses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ห้องเรียน
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Tooltip title="จำนวนครูทั้งหมดในทุกภาคเรียน">
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "success.50",
                        borderRadius: 1,
                      }}
                    >
                      <PersonIcon
                        color="success"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalTeachers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ครู
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Tooltip title="จำนวนวิชาทั้งหมดในทุกภาคเรียน">
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "warning.50",
                        borderRadius: 1,
                      }}
                    >
                      <SchoolIcon
                        color="warning"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalSubjects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        วิชา
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Tooltip title="จำนวนห้องเรียนทั้งหมดในทุกภาคเรียน">
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "error.50",
                        borderRadius: 1,
                      }}
                    >
                      <RoomIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalRooms}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ห้อง
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Years Distribution */}
        {academicYears.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  ปีการศึกษา (5 ล่าสุด)
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {academicYears.map(([year, count]) => {
                    const percentage =
                      stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <Box key={year}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {year}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">
                              {count} ภาคเรียน
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary"
                            >
                              {percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
