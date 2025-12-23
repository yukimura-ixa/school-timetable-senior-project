"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useTeachers, useSubjects, useGradeLevels } from "@/hooks";
import type {
  teacher,
  subject,
  gradelevel,
  teachers_responsibility,
} from "@/prisma/generated/client";
import useSWR from "swr";
import { getAssignmentsAction } from "@/features/assign/application/actions/assign.actions";
import QuickAssignmentPanel from "./QuickAssignmentPanel";
import { LockedScheduleList } from "../components/LockedScheduleList";
import { useTeacherLockedSchedules } from "../hooks/useTeacherLockedSchedules";
import type { ActionResult } from "@/shared/lib/action-wrapper";

// Type for responsibility data with subject relation
interface ResponsibilityWithSubject extends teachers_responsibility {
  subject?: {
    Category?: string;
    SubjectName?: string;
    Credit?: string;
  };
  gradelevel?: {
    Year: number;
    Number: number;
  };
  ClassID?: number;
}
import Loading from "@/app/loading";
import ErrorBoundary from "@/components/error/ErrorBoundary";
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

// Props for server-side data passing
export interface ShowTeacherDataProps {
  initialTeachers?: teacher[];
  initialSubjects?: subject[];
  initialGradeLevels?: gradelevel[];
}

function ShowTeacherData({
  initialTeachers = [],
  initialSubjects = [],
  initialGradeLevels = [],
}: ShowTeacherDataProps) {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  // Sync URL params with global store
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );

  const [teacher, setTeacher] = useState<teacher | null>(null);

  // Use SWR with fallback data from server-side fetch
  const teacherData = useTeachers();
  const subjectsData = useSubjects();
  const gradesData = useGradeLevels();

  // Merge initial data with SWR data (SWR will use initial data until revalidation)
  const teachers =
    teacherData.data.length > 0 ? teacherData.data : initialTeachers;
  const subjects =
    subjectsData.data.length > 0 ? subjectsData.data : initialSubjects;
  const grades =
    gradesData.data.length > 0 ? gradesData.data : initialGradeLevels;

  // Sync teacher from URL on mount/navigation
  useEffect(() => {
    const tIdParam = searchParams.get("TeacherID");
    if (tIdParam && teachers.length > 0) {
      const tId = parseInt(tIdParam, 10);
      if (!isNaN(tId)) {
        const found = teachers.find((t) => t.TeacherID === tId);
        if (found && found.TeacherID !== teacher?.TeacherID) {
          setTeacher(found);
        }
      }
    }
  }, [searchParams, teachers, teacher]);

  // Determine loading state - show loading only if both initial and SWR data are empty
  const isLoading =
    initialTeachers.length === 0 &&
    (teacherData.isLoading || subjectsData.isLoading || gradesData.isLoading);

  // Fetch teacher assignments using Server Action
  const responsibilityData = useSWR(
    teacher && semester && academicYear
      ? ["assignments", teacher.TeacherID, semester, academicYear]
      : null,
    async ([, teacherId, sem, year]) => {
      return await getAssignmentsAction({
        TeacherID: teacherId,
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
        AcademicYear: parseInt(year),
      });
    },
  );

  const { lockedSchedules, isLoading: isLockedLoading } =
    useTeacherLockedSchedules(
      teacher?.TeacherID,
      academicYear ? parseInt(academicYear) : undefined,
      semester,
    );

  const [teachHour, setTeachHour] = useState<number>(0);
  useEffect(() => {
    if (responsibilityData.data) {
      let sumTeachHour = 0;
      const result = responsibilityData.data as ActionResult<
        ResponsibilityWithSubject[]
      >;
      const data = result?.data;

      if (Array.isArray(data)) {
        data.forEach((item) => {
          sumTeachHour += item.TeachHour || 0;
        });
      }
      setTeachHour(sumTeachHour);
    }
  }, [responsibilityData.data]);

  // Calculate subject statistics
  const subjectStats = useMemo(() => {
    try {
      const result = responsibilityData.data as
        | ActionResult<ResponsibilityWithSubject[]>
        | undefined;
      const data = result?.data;
      if (!Array.isArray(data)) return { total: 0, byCategory: {} };

      const byCategory: Record<string, number> = {};
      data.forEach((item) => {
        const category = item.subject?.Category || "อื่นๆ";
        byCategory[category] = (byCategory[category] || 0) + 1;
      });
      return { total: data.length, byCategory };
    } catch {
      return { total: 0, byCategory: {} };
    }
  }, [responsibilityData.data]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    try {
      const result = responsibilityData.data as
        | ActionResult<ResponsibilityWithSubject[]>
        | undefined;
      const data = result?.data;
      if (!Array.isArray(data)) return { total: 0, uniqueClasses: 0 };

      const uniqueClasses = new Set(data.map((item) => item.GradeID)).size;
      return { total: data.length, uniqueClasses };
    } catch {
      return { total: 0, uniqueClasses: 0 };
    }
  }, [responsibilityData.data]);

  // Navigate to assign detail
  const handleViewAssignments = () => {
    if (teacher) {
      router.push(
        `${pathName}/teacher_responsibility?teacherId=${teacher.TeacherID}`,
      );
    }
  };

  // Handle teacher select
  const handleTeacherSelect = (
    _event: React.SyntheticEvent,
    value: teacher | null,
  ) => {
    setTeacher(value);
    if (value) {
      const newUrl = `${pathName}?TeacherID=${value.TeacherID}`;
      // Use history.pushState to update URL without triggering server component refresh
      window.history.pushState(null, "", newUrl);
    } else {
      window.history.pushState(null, "", pathName);
    }
  };

  // Show loading state only on initial render when no data is available
  if (isLoading) {
    return <Loading />;
  }

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Teacher Search Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <PersonSearchIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6">เลือกครูผู้สอน</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Autocomplete
            options={teachers}
            getOptionLabel={(option) =>
              `${option.Prefix}${option.Firstname} ${option.Lastname}`
            }
            value={teacher}
            onChange={handleTeacherSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="ค้นหาครูผู้สอน"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.7)",
                    opacity: 1,
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.TeacherID}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                    {option.Firstname?.charAt(0) || "?"}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">
                      {option.Prefix}
                      {option.Firstname} {option.Lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.Department || "ไม่ระบุกลุ่มสาระ"}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
            sx={{ flex: 1, minWidth: 300 }}
            noOptionsText="ไม่พบครูผู้สอน"
            loadingText="กำลังโหลด..."
          />
        </Box>
      </Paper>

      {/* Teacher Data Display */}
      {teacher ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Teacher Info Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    fontSize: 24,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {teacher.Firstname?.charAt(0) || "?"}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {teacher.Prefix}
                    {teacher.Firstname} {teacher.Lastname}
                  </Typography>
                  <Chip
                    icon={<SchoolIcon />}
                    label={teacher.Department || "ไม่ระบุกลุ่มสาระ"}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleViewAssignments}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                }}
              >
                ดูรายละเอียด
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Stats Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {/* Teaching Hours */}
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  background:
                    teachHour > 22
                      ? "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)"
                      : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  borderRadius: 2,
                  color: "white",
                  border: teachHour > 22 ? "2px solid #fff" : "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon />
                  <Typography variant="body2">ชั่วโมงสอน/สัปดาห์</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {teachHour}
                  {teachHour > 22 ? " !" : ""}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((teachHour / 22) * 100, 100)}
                  sx={{
                    mt: 1,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "white",
                    },
                  }}
                />
              </Card>

              {/* Subjects */}
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  borderRadius: 2,
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SubjectIcon />
                  <Typography variant="body2">วิชาที่สอน</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {subjectStats.total}
                </Typography>
              </Card>

              {/* Classes */}
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  borderRadius: 2,
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ClassIcon />
                  <Typography variant="body2">ชั้นเรียน</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {classStats.uniqueClasses}
                </Typography>
              </Card>

              {/* Utilization */}
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  borderRadius: 2,
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingUpIcon />
                  <Typography variant="body2">อัตราการใช้งาน</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {Math.min(Math.round((teachHour / 22) * 100), 100)}%
                </Typography>
              </Card>
            </Box>
          </Paper>

          {/* Locked Schedules Section */}
          {!isLockedLoading && (
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.1)",
                overflow: "hidden",
                mb: 3,
              }}
            >
              <LockedScheduleList items={lockedSchedules} />
            </Paper>
          )}

          {/* Quick Assignment Panel */}
          {semester &&
            academicYear &&
            (() => {
              // Transform responsibility data to currentAssignments format
              const result = responsibilityData.data as
                | ActionResult<ResponsibilityWithSubject[]>
                | undefined;
              const respData = result?.data;
              const currentAssignments = Array.isArray(respData)
                ? respData.map((item) => ({
                    RespID: item.RespID.toString(),
                    SubjectCode: item.SubjectCode,
                    SubjectName: item.subject?.SubjectName || "Unknown",
                    GradeID: item.GradeID,
                    GradeName: item.gradelevel
                      ? `ม.${item.gradelevel.Year}/${item.gradelevel.Number}`
                      : item.GradeID,
                    TeachHour: item.TeachHour,
                  }))
                : [];

              return (
                <QuickAssignmentPanel
                  teacher={teacher}
                  semester={parseInt(semester)}
                  academicYear={parseInt(academicYear)}
                  subjects={subjects}
                  grades={grades}
                  currentAssignments={currentAssignments}
                  onAssignmentAdded={() => responsibilityData.mutate()}
                  onAssignmentDeleted={() => responsibilityData.mutate()}
                />
              );
            })()}
        </Box>
      ) : (
        /* No Teacher Selected State */
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 3,
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)",
            border: "2px dashed rgba(102,126,234,0.3)",
          }}
        >
          <AssignmentIcon
            sx={{ fontSize: 64, color: "primary.main", opacity: 0.5, mb: 2 }}
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

  return <ErrorBoundary>{content}</ErrorBoundary>;
}

export default ShowTeacherData;
