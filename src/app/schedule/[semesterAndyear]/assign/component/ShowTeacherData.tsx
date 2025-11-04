"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTeachers, useSubjects, useGradeLevels } from "@/hooks";
import type { teacher, teachers_responsibility } from "@/prisma/generated";
import useSWR from "swr";
import { getAssignmentsAction } from "@/features/assign/application/actions/assign.actions";
import QuickAssignmentPanel from "./QuickAssignmentPanel";

// Type for responsibility data with subject relation
interface ResponsibilityWithSubject extends teachers_responsibility {
  subject?: {
    Category?: string;
    SubjectName?: string;
  };
  ClassID?: string;
}
import Loading from "@/app/loading";
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Divider,
  Card,
  LinearProgress,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SchoolIcon from "@mui/icons-material/School";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SubjectIcon from "@mui/icons-material/MenuBook";
import ClassIcon from "@mui/icons-material/Class";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useSemesterSync } from "@/hooks";

function ShowTeacherData() {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams();
  
  // Sync URL params with global store
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);

  const [teacher, setTeacher] = useState<teacher | null>(null);
  const teacherData = useTeachers();
  const subjectsData = useSubjects();
  const gradesData = useGradeLevels();
  
  // Fetch teacher assignments using Server Action
  const responsibilityData = useSWR(
    teacher && semester && academicYear
      ? ['assignments', teacher.TeacherID, semester, academicYear]
      : null,
    async ([, teacherId, sem, year]) => {
      return await getAssignmentsAction({
        TeacherID: teacherId,
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
        AcademicYear: parseInt(year),
      });
    }
  );

  const [teachHour, setTeachHour] = useState<number>(0);
  useEffect(() => {
    if (responsibilityData.data) {
      let sumTeachHour = 0;
      const data = responsibilityData.data as ResponsibilityWithSubject[];
      data.forEach((item) => {
        sumTeachHour += item.TeachHour;
      });
      setTeachHour(sumTeachHour);
    }
  }, [responsibilityData.data]);

  // Calculate subject statistics
  const subjectStats = useMemo(() => {
    const data = responsibilityData.data as ResponsibilityWithSubject[] | undefined;
    if (!data || data.length === 0) {
      return {
        totalSubjects: 0,
        coreSubjects: 0,
        additionalSubjects: 0,
        activitySubjects: 0,
        uniqueClasses: 0,
      };
    }

    const uniqueClasses = new Set(
      data.map((item) => item.ClassID).filter((id): id is string => !!id)
    );

    return {
      totalSubjects: data.length,
      coreSubjects: data.filter(
        (item) => item.subject?.Category === "CORE"
      ).length,
      additionalSubjects: data.filter(
        (item) => item.subject?.Category === "ADDITIONAL"
      ).length,
      activitySubjects: data.filter(
        (item) => item.subject?.Category === "ACTIVITY"
      ).length,
      uniqueClasses: uniqueClasses.size,
    };
  }, [responsibilityData.data]);

  if (teacherData.isLoading) {
    return <Loading />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Modern Teacher Selection */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <PersonSearchIcon color="primary" />
          <Typography variant="h6">เลือกครูผู้สอน</Typography>
        </Box>
        <Autocomplete
          options={teacherData.data || []}
          value={teacher}
          onChange={(_event, newValue) => {
            setTeacher(newValue);
          }}
          getOptionLabel={(option) =>
            `${option.Firstname} ${option.Lastname}`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="ค้นหาครูผู้สอน"
              placeholder="พิมพ์ชื่อ นามสกุล หรือภาควิชา"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key, ...otherProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <Box
                component="li"
                key={option.TeacherID}
                {...otherProps}
                sx={{ gap: 2, display: "flex", alignItems: "center" }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  {option.Firstname[0]}
                  {option.Lastname[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">
                    {option.Prefix} {option.Firstname} {option.Lastname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.Department}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          filterOptions={(options, { inputValue }) => {
            if (!inputValue) return options;
            const searchLower = inputValue.toLowerCase();
            return options.filter((option) => {
              const searchStr =
                `${option.Firstname} ${option.Lastname} ${option.Department}`.toLowerCase();
              return searchStr.includes(searchLower);
            });
          }}
          loading={teacherData.isLoading}
          noOptionsText="ไม่พบข้อมูลครูผู้สอน"
          sx={{ width: "100%" }}
        />
      </Paper>

      {/* Teacher Workload Dashboard */}
      {teacher && responsibilityData.data && (
        <>
          {/* Teacher Info Card */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 56,
                  height: 56,
                  fontSize: "1.5rem",
                }}
              >
                {teacher.Firstname[0]}
                {teacher.Lastname[0]}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  {teacher.Prefix} {teacher.Firstname} {teacher.Lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {teacher.Department}
                </Typography>
              </Box>
              <Chip
                icon={<SchoolIcon />}
                label={`${teachHour} คาบ/สัปดาห์`}
                color={
                  teachHour === 0
                    ? "default"
                    : teachHour > 25
                    ? "error"
                    : teachHour > 20
                    ? "warning"
                    : "success"
                }
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Statistics Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {/* Total Teaching Hours */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "primary.lighter",
                    borderColor: "primary.main",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="primary.main">
                      {teachHour}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    คาบสอนรวม/สัปดาห์
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((teachHour / 25) * 100, 100)}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color={
                      teachHour > 25
                        ? "error"
                        : teachHour > 20
                        ? "warning"
                        : "success"
                    }
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    เป้าหมาย: 20-25 คาบ
                  </Typography>
                </Card>

              {/* Total Subjects */}
                <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <SubjectIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="text.primary">
                      {subjectStats.totalSubjects}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    วิชาที่รับผิดชอบ
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1,
                      justifyContent: "center",
                    }}
                  >
                    {subjectStats.coreSubjects > 0 && (
                      <Chip
                        size="small"
                        label={`หลัก ${subjectStats.coreSubjects}`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {subjectStats.additionalSubjects > 0 && (
                      <Chip
                        size="small"
                        label={`เพิ่มเติม ${subjectStats.additionalSubjects}`}
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Card>

              {/* Classes Taught */}
                <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <ClassIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="text.primary">
                      {subjectStats.uniqueClasses}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    จำนวนห้องเรียน
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {subjectStats.uniqueClasses > 8
                      ? "⚠️ สอนหลายห้อง"
                      : "✓ เหมาะสม"}
                  </Typography>
                </Card>

              {/* Average Hours per Subject */}
                <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <TrendingUpIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="text.primary">
                      {subjectStats.totalSubjects > 0
                        ? (teachHour / subjectStats.totalSubjects).toFixed(1)
                        : "0"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    คาบเฉลี่ย/วิชา
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    กระจายภาระงาน
                  </Typography>
                </Card>
            </Box>
          </Paper>

          {/* Quick Assignment Panel */}
          <QuickAssignmentPanel
            teacher={teacher}
            academicYear={parseInt(academicYear)}
            semester={parseInt(semester)}
            subjects={subjectsData.data || []}
            grades={gradesData.data || []}
            currentAssignments={
              (responsibilityData.data as ResponsibilityWithSubject[] | undefined)?.map((item) => ({
                RespID: item.RespID.toString(),
                SubjectCode: item.SubjectCode,
                SubjectName: item.subject?.SubjectName || "",
                GradeID: parseInt(item.GradeID),
                GradeName: `ม.${item.GradeID.toString()[0]}/${item.GradeID.toString()[2]}`,
                TeachHour: item.TeachHour,
              })) || []
            }
            onAssignmentAdded={() => {
              void responsibilityData.mutate();
            }}
            onAssignmentUpdated={() => {
              void responsibilityData.mutate();
            }}
            onAssignmentDeleted={() => {
              void responsibilityData.mutate();
            }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<AssignmentIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              router.push(
                `${pathName}/teacher_responsibility?TeacherID=${teacher.TeacherID}`
              );
            }}
            sx={{ py: 2 }}
          >
            ดูรายละเอียดวิชาที่รับผิดชอบทั้งหมด
          </Button>
        </>
      )}

      {/* Empty State */}
      {!teacher && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "background.default",
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <PersonSearchIcon
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            กรุณาเลือกครูผู้สอน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เลือกครูจากช่องค้นหาด้านบนเพื่อดูข้อมูลภาระงานสอน
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ShowTeacherData;
