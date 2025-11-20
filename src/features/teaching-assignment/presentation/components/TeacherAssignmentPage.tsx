"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  DeleteSweep as ClearIcon,
} from "@mui/icons-material";
import type { semester } from '@/prisma/generated/client';;
import { AssignmentFilters } from "./AssignmentFilters";
import { SubjectAssignmentTable } from "./SubjectAssignmentTable";
import {
  copyAssignmentsAction,
  clearAllAssignmentsAction,
} from "../../application/actions/teaching-assignment.actions";

/**
 * Teacher Assignment Management Page
 * Main container component for managing teacher-subject assignments
 */
export function TeacherAssignmentPage() {
  const [gradeId, setGradeId] = useState<string>("");
  const [semester, setSemester] = useState<semester>("SEMESTER_1");
  const [academicYear, setAcademicYear] = useState<number>(2567);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCopyFromPrevious = async () => {
    if (!gradeId) {
      setError("กรุณาเลือกระดับชั้นก่อน");
      return;
    }

    const confirmed = window.confirm(
      `คัดลอกการมอบหมายครูจากภาคเรียนก่อนหน้าไปยัง ${gradeId} - ${semester === "SEMESTER_1" ? "ภาคเรียนที่ 1" : "ภาคเรียนที่ 2"}/${academicYear}?\n\nการดำเนินการนี้จะเพิ่มการมอบหมายใหม่โดยไม่ลบข้อมูลเดิม`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Calculate previous semester
      const prevSemester: semester =
        semester === "SEMESTER_1" ? "SEMESTER_2" : "SEMESTER_1";
      const prevYear = semester === "SEMESTER_1" ? academicYear - 1 : academicYear;

      const result = await copyAssignmentsAction({
        sourceGradeID: gradeId,
        sourceSemester: prevSemester,
        sourceYear: prevYear,
        targetGradeID: gradeId,
        targetSemester: semester,
        targetYear: academicYear,
      });

      if (result.success) {
        setSuccess(
          `คัดลอกสำเร็จ ${result.data?.count || 0} รายการ จากภาคเรียนก่อนหน้า`
        );
        // Force refresh table
        window.location.reload();
      } else {
        setError(result.error?.message || "เกิดข้อผิดพลาดในการคัดลอก");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!gradeId) {
      setError("กรุณาเลือกระดับชั้นก่อน");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ ต้องการลบการมอบหมายครูทั้งหมดใน ${gradeId} - ${semester === "SEMESTER_1" ? "ภาคเรียนที่ 1" : "ภาคเรียนที่ 2"}/${academicYear}?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await clearAllAssignmentsAction({
        GradeID: gradeId,
        Semester: semester,
        AcademicYear: academicYear,
      });

      if (result.success && result.data) {
        const count = typeof result.data.count === 'number' ? result.data.count : 0;
        setSuccess(
          `ลบสำเร็จ ${count} รายการ`
        );
        // Force refresh table
        window.location.reload();
      } else {
        setError(result.error?.message || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          จัดการมอบหมายครูผู้สอน
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เลือกระดับชั้น ภาคเรียน และปีการศึกษา เพื่อมอบหมายครูสอนแต่ละรายวิชา
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <AssignmentFilters
          gradeId={gradeId}
          semester={semester}
          academicYear={academicYear}
          onGradeChange={setGradeId}
          onSemesterChange={setSemester}
          onYearChange={setAcademicYear}
        />
      </Paper>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Actions */}
      {gradeId && (
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={20} /> : <CopyIcon />}
            onClick={() => void handleCopyFromPrevious()}
            disabled={isLoading}
          >
            คัดลอกจากภาคเรียนก่อนหน้า
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={isLoading ? <CircularProgress size={20} /> : <ClearIcon />}
            onClick={() => void handleClearAll()}
            disabled={isLoading}
          >
            ลบการมอบหมายทั้งหมด
          </Button>
        </Box>
      )}

      {/* Assignment Table */}
      {gradeId ? (
        <SubjectAssignmentTable
          gradeId={gradeId}
          semester={semester}
          academicYear={academicYear}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            กรุณาเลือกระดับชั้น ภาคเรียน และปีการศึกษา
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
