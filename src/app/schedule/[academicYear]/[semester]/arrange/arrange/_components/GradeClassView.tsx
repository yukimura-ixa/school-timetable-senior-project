/**
 * Presentation Layer: Grade Class View Component
 *
 * Displays all class schedules for a specific grade level.
 * Shows which subjects have been assigned to each class.
 *
 * @module GradeClassView
 */

"use client";

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import type {
  class_schedule,
  gradelevel,
  subject,
  teacher,
  room,
  timeslot,
} from "@/prisma/generated/client";

interface ClassScheduleData {
  class: gradelevel;
  schedules: (class_schedule & {
    subject: subject;
    timeslot: timeslot;
    teachers_responsibility: Array<{
      teacher: teacher;
    }>;
    room: room | null;
  })[];
  totalPeriods: number;
  assignedPeriods: number;
}

interface GradeClassViewProps {
  /** Grade level to display (7-12) */
  gradeLevel: number;

  /** All classes for this grade */
  classes: ClassScheduleData[];

  /** Expected periods per week (unused, kept for future use) */
  _expectedPeriodsPerWeek?: number;

  /** Loading state */
  isLoading?: boolean;
}

/**
 * Single class card
 */
function ClassCard({ classData }: { classData: ClassScheduleData }) {
  const completionPercentage =
    classData.totalPeriods > 0
      ? (classData.assignedPeriods / classData.totalPeriods) * 100
      : 0;

  const isComplete = completionPercentage >= 100;
  const isPartial = completionPercentage > 0 && completionPercentage < 100;

  // Group schedules by subject
  const schedulesBySubject = React.useMemo(() => {
    const grouped: Record<string, typeof classData.schedules> = {};
    classData.schedules.forEach((schedule) => {
      const key = schedule.subject.SubjectCode;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    return grouped;
  }, [classData.schedules]);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        border: "2px solid",
        borderColor: isComplete
          ? "success.main"
          : isPartial
            ? "warning.main"
            : "divider",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Class Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                ม.{classData.class.Year}/{classData.class.Number}
              </Typography>
            </Stack>
            {isComplete && <CheckIcon color="success" />}
            {isPartial && <WarningIcon color="warning" />}
          </Stack>

          {/* Progress */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                ความคืบหน้า
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {classData.assignedPeriods} / {classData.totalPeriods} คาบ
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              color={isComplete ? "success" : isPartial ? "warning" : "inherit"}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {completionPercentage.toFixed(0)}%
            </Typography>
          </Box>

          <Divider />

          {/* Subjects List */}
          {Object.keys(schedulesBySubject).length === 0 ? (
            <Alert severity="info" variant="outlined">
              <AlertTitle>ยังไม่มีการจัดตาราง</AlertTitle>
              ห้องนี้ยังไม่มีวิชาที่ถูกจัดเข้าตาราง
            </Alert>
          ) : (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                วิชาที่จัดแล้ว ({Object.keys(schedulesBySubject).length} วิชา)
              </Typography>
              <Stack spacing={1}>
                {Object.entries(schedulesBySubject).map(
                  ([subjectCode, schedules]) => {
                    const subject = schedules[0]?.subject;
                    const teacher =
                      schedules[0]?.teachers_responsibility[0]?.teacher;
                    const periodsAssigned = schedules.length;

                    return (
                      <Paper
                        key={subjectCode}
                        variant="outlined"
                        sx={{ p: 1.5, bgcolor: "grey.50" }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight="medium">
                            {subject?.SubjectName}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            gap={0.5}
                          >
                            <Chip
                              icon={<PersonIcon fontSize="small" />}
                              label={
                                teacher
                                  ? `${teacher.Prefix}${teacher.Firstname}`
                                  : "ไม่ระบุครู"
                              }
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={`${periodsAssigned} คาบ`}
                              size="small"
                              color="primary"
                              variant="filled"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  },
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Grade class view component
 */
export function GradeClassView({
  gradeLevel,
  classes,
  _expectedPeriodsPerWeek = 40,
  isLoading = false,
}: GradeClassViewProps) {
  const totalClasses = classes.length;
  const completedClasses = classes.filter(
    (c) => c.assignedPeriods >= c.totalPeriods,
  ).length;
  const partialClasses = classes.filter(
    (c) => c.assignedPeriods > 0 && c.assignedPeriods < c.totalPeriods,
  ).length;
  const emptyClasses = classes.filter((c) => c.assignedPeriods === 0).length;

  const overallProgress =
    totalClasses > 0
      ? (classes.reduce((sum, c) => sum + c.assignedPeriods, 0) /
          classes.reduce((sum, c) => sum + c.totalPeriods, 0)) *
        100
      : 0;

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
          <LinearProgress sx={{ width: "100%", maxWidth: 400 }} />
        </Stack>
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>ไม่มีข้อมูลห้องเรียน</AlertTitle>
        ไม่พบห้องเรียนสำหรับมัธยมศึกษาปีที่ {gradeLevel}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "primary.50" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight="bold">
            มัธยมศึกษาปีที่ {gradeLevel}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {totalClasses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ห้องทั้งหมด
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}
              >
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {completedClasses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  จัดครบแล้ว
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", bgcolor: "warning.50" }}
              >
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {partialClasses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  จัดบางส่วน
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", bgcolor: "grey.100" }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  {emptyClasses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ยังไม่จัด
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Overall Progress */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight="medium">
                ความคืบหน้ารวม
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {overallProgress.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              color={
                overallProgress >= 100
                  ? "success"
                  : overallProgress > 0
                    ? "warning"
                    : "inherit"
              }
              sx={{ height: 10, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Class Cards Grid */}
      <Grid container spacing={2}>
        {classes.map((classData) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            key={classData.class.GradeID}
          >
            <ClassCard classData={classData} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
