"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { resolveAssignmentMode } from "../../application/mode";
import { resolveTeacherIdFromParams } from "../../application/teacher-id-param";
import { resolveTermFromParams } from "../../application/term-params";
import { useTeachers } from "@/hooks/use-teachers";
import { TeacherPicker, type TeacherPickerOption } from "./TeacherPicker";
import { LockedScheduleList } from "./LockedScheduleList";
import { useTeacherLockedSchedules } from "../../application/hooks/useTeacherLockedSchedules";
import { TeacherWorkloadCard } from "./TeacherWorkloadCard";
import type { AssignmentWithRelations } from "./TeacherCentricEditor";
import {
  computeTeacherStats,
  type TeacherStatsRow,
} from "../../domain/utils/teacher-stats";
import useSWR from "swr";
import { getAssignmentsAction } from "@/features/assign/application/actions/assign.actions";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { semester } from "@/prisma/generated/client";
import { AssignmentFilters } from "./AssignmentFilters";
import { GradeCoverageMatrix } from "./GradeCoverageMatrix";

/**
 * Teacher Assignment Management Page
 * Main container component for managing teacher-subject assignments
 */
export function TeacherAssignmentPage() {
  const searchParams = useSearchParams();
  const seededTerm = resolveTermFromParams(searchParams);
  const [gradeId, setGradeId] = useState<string>(seededTerm.gradeId ?? "");
  const [semester, setSemester] = useState<semester>(
    seededTerm.semester ?? "SEMESTER_1",
  );
  const [academicYear, setAcademicYear] = useState<number>(
    seededTerm.academicYear ?? 2567,
  );
  const router = useRouter();
  const pathname = usePathname();
  const mode = resolveAssignmentMode(searchParams);
  const handleModeChange = (
    _e: React.MouseEvent<HTMLElement>,
    newMode: string | null,
  ) => {
    if (!newMode) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("mode", newMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const teachersData = useTeachers();
  const teacherOptions = useMemo<TeacherPickerOption[]>(
    () =>
      teachersData.data.map((t) => ({
        id: t.TeacherID,
        prefix: t.Prefix,
        firstname: t.Firstname,
        lastname: t.Lastname,
        department: t.Department,
      })),
    [teachersData.data],
  );
  // Derived straight from the URL — no state/effect needed (avoids cascading renders).
  const selectedTeacherId = resolveTeacherIdFromParams(searchParams);
  const selectedTeacher = useMemo(
    () =>
      selectedTeacherId
        ? (teacherOptions.find((t) => t.id === selectedTeacherId) ?? null)
        : null,
    [selectedTeacherId, teacherOptions],
  );
  const handleTeacherChange = (teacher: TeacherPickerOption | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (teacher) {
      params.set("teacherId", String(teacher.id));
    } else {
      params.delete("teacherId");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const semesterNum = semester === "SEMESTER_1" ? "1" : "2";
  const { lockedSchedules, isLoading: isLockedLoading } =
    useTeacherLockedSchedules(
      selectedTeacherId ?? undefined,
      academicYear,
      semesterNum,
    );
  const teacherAssignmentsSWR = useSWR(
    selectedTeacherId
      ? ["teacher-assignments", selectedTeacherId, semester, academicYear]
      : null,
    async ([, teacherId, sem, year]) => {
      const result = await getAssignmentsAction({
        TeacherID: teacherId,
        Semester: sem,
        AcademicYear: year,
      });
      return result.success && Array.isArray(result.data) ? result.data : [];
    },
  );
  const teacherStats = useMemo(
    () =>
      computeTeacherStats(
        (teacherAssignmentsSWR.data ?? []) as TeacherStatsRow[],
      ),
    [teacherAssignmentsSWR.data],
  );
  const teacherAssignments = (teacherAssignmentsSWR.data ??
    []) as AssignmentWithRelations[];

  // Derive grade year (1–6) from gradeId format "M{Year}-{Number}" (e.g. "M1-1" → 1)
  const gradeYear = gradeId ? parseInt(gradeId.slice(1)) : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          จัดการมอบหมายครูผู้สอน
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          เลือกระดับชั้น ภาคเรียน และปีการศึกษา เพื่อมอบหมายครูสอนแต่ละรายวิชา
        </Typography>
      </Box>
      {/* View mode */}
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        size="small"
        aria-label="มุมมอง"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="by-grade">มุมมองชั้นเรียน</ToggleButton>
        <ToggleButton value="by-teacher">มุมมองครู</ToggleButton>
      </ToggleButtonGroup>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <AssignmentFilters
          gradeId={gradeId}
          semester={semester}
          academicYear={academicYear}
          onGradeChange={setGradeId}
          onSemesterChange={setSemester}
          onYearChange={setAcademicYear}
          hideGradeSelector={mode === "by-teacher"}
        />
      </Paper>
      {mode === "by-teacher" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              เลือกครูผู้สอน
            </Typography>
            <TeacherPicker
              teachers={teacherOptions}
              value={selectedTeacher}
              onChange={handleTeacherChange}
              disabled={teachersData.isLoading}
            />
          </Paper>

          {selectedTeacher ? (
            <>
              <TeacherWorkloadCard
                teachHour={teacherStats.teachHour}
                subjectCount={teacherStats.subjectCount}
                classCount={teacherStats.classCount}
              />
              <Paper sx={{ p: 0 }}>
                {isLockedLoading ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <LockedScheduleList items={lockedSchedules} />
                )}
              </Paper>
              {/* Read-only assignment summary; matrix is the editing surface */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  รายวิชาที่รับผิดชอบ (ดูได้อย่างเดียว)
                </Typography>
                {teacherAssignments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    ยังไม่มีการมอบหมายรายวิชา
                  </Typography>
                ) : (
                  <List dense>
                    {teacherAssignments.map(
                      (a, i) => (
                        <ListItem key={a.RespID ?? i}>
                          <ListItemText
                            primary={a.SubjectName}
                            secondary={`ชั้น ${a.gradelevel?.GradeID ?? a.GradeID}`}
                          />
                        </ListItem>
                      ),
                    )}
                  </List>
                )}
              </Paper>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                }}
              >
                กรุณาเลือกครูผู้สอนเพื่อดูข้อมูล
              </Typography>
            </Paper>
          )}
        </Box>
      )}
      {/* Coverage Matrix */}
      {mode === "by-grade" &&
        (gradeYear ? (
          <GradeCoverageMatrix
            gradeYear={gradeYear}
            academicYear={academicYear}
            semester={semester}
            teachers={teacherOptions}
          />
        ) : (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
              }}
            >
              กรุณาเลือกระดับชั้น ภาคเรียน และปีการศึกษา
            </Typography>
          </Paper>
        ))}
    </Container>
  );
}
