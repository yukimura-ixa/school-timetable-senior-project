"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { semester } from "@/prisma/generated";
import { TeacherSelector } from "./TeacherSelector";
import {
  assignTeacherAction,
  unassignTeacherAction,
  getSubjectsWithAssignments,
} from "../../application/actions/teaching-assignment.actions";

interface SubjectData {
  SubjectCode: string;
  SubjectName: string;
  Credit: string;
  assignedTeacher?: {
    RespID: number;
    TeacherID: number;
    TeacherName: string;
    TeachHour: number;
  };
}

interface SubjectAssignmentTableProps {
  gradeId: string;
  semester: semester;
  academicYear: number;
}

/**
 * Subject Assignment Table Component
 * Displays subjects with teacher assignment dropdowns
 */
export function SubjectAssignmentTable({
  gradeId,
  semester,
  academicYear,
}: SubjectAssignmentTableProps) {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects and assignments
  useEffect(() => {
    const fetchData = async () => {
      console.warn("[SubjectAssignmentTable] Starting fetch with:", {
        gradeId,
        semester,
        academicYear,
      });
      setIsLoading(true);
      setError(null);

      try {
        // Fetch subjects with assignments using Server Action
        const subjectsWithAssignments = await getSubjectsWithAssignments(
          gradeId,
          semester,
          academicYear
        );

        console.warn(
          `[SubjectAssignmentTable] Received ${subjectsWithAssignments.length} subjects`
        );
        setSubjects(subjectsWithAssignments);
      } catch (err) {
        console.error("Failed to fetch assignment data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    console.warn("[SubjectAssignmentTable] useEffect triggered:", {
      gradeId,
      semester,
      academicYear,
      shouldFetch: !!(gradeId && semester && academicYear),
    });

    if (gradeId && semester && academicYear) {
      void fetchData();
    }
  }, [gradeId, semester, academicYear]);

  const handleAssign = (
    subjectCode: string,
    teacherId: number,
    teachHour: number
  ) => {
    void (async () => {
      try {
        const result = await assignTeacherAction({
          TeacherID: teacherId,
          SubjectCode: subjectCode,
          GradeID: gradeId,
          Semester: semester,
          AcademicYear: academicYear,
          TeachHour: teachHour,
        });

        if (result.success) {
          // Refresh data
          window.location.reload();
        } else {
          alert(result.error?.message || "เกิดข้อผิดพลาดในการมอบหมาย");
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    })();
  };

  const handleUnassign = async (respId: number) => {
    const confirmed = window.confirm("ต้องการยกเลิกการมอบหมายครูนี้?");
    if (!confirmed) return;

    try {
      const result = await unassignTeacherAction({ RespID: respId });

      if (result.success) {
        // Refresh data
        window.location.reload();
      } else {
        alert(result.error?.message || "เกิดข้อผิดพลาดในการยกเลิก");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>กำลังโหลดข้อมูล...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (subjects.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          ไม่พบรายวิชาสำหรับระดับชั้นนี้
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>รหัสวิชา</strong></TableCell>
            <TableCell><strong>ชื่อวิชา</strong></TableCell>
            <TableCell align="center"><strong>หน่วยกิต</strong></TableCell>
            <TableCell><strong>ครูผู้สอน</strong></TableCell>
            <TableCell align="center"><strong>จำนวนชั่วโมง</strong></TableCell>
            <TableCell align="center"><strong>จัดการ</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.SubjectCode}>
              <TableCell>{subject.SubjectCode}</TableCell>
              <TableCell>{subject.SubjectName}</TableCell>
              <TableCell align="center">{subject.Credit}</TableCell>
              <TableCell>
                {subject.assignedTeacher ? (
                  <Box>
                    <Typography variant="body2">
                      {subject.assignedTeacher.TeacherName}
                    </Typography>
                  </Box>
                ) : (
                  <TeacherSelector
                    subjectCode={subject.SubjectCode}
                    gradeId={gradeId}
                    semester={semester}
                    academicYear={academicYear}
                    defaultHours={parseFloat(subject.Credit) * 2}
                    onAssign={handleAssign}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                {subject.assignedTeacher ? (
                  <Chip
                    label={`${subject.assignedTeacher.TeachHour} ชม./สัปดาห์`}
                    size="small"
                    color="primary"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell align="center">
                {subject.assignedTeacher && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      void handleUnassign(subject.assignedTeacher!.RespID)
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
