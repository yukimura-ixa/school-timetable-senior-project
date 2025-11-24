/**
 * Program Subject Assignment Page - Modernized
 *
 * Features:
 * - Clean Architecture with custom hooks
 * - SWR data fetching with caching
 * - Skeleton loading states
 * - Better UX with MUI components
 * - Memoized calculations
 * - Type-safe implementation
 */

"use client";

import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Paper,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useProgramSubjects } from "@/features/program/presentation/hooks/useProgramSubjects";
import { useSubjectAssignment } from "@/features/program/presentation/hooks/useSubjectAssignment";
import { MOEValidationAlert } from "@/features/program/presentation/components/MOEValidationAlert";
import { AssignmentSummary } from "@/features/program/presentation/components/AssignmentSummary";

interface ProgramSubjectAssignmentPageProps {
  programId: number;
}

/**
 * Main component for assigning subjects to a program
 * Follows Clean Architecture with presentation-layer hooks
 */
export default function ProgramSubjectAssignmentPage({
  programId,
}: ProgramSubjectAssignmentPageProps) {
  // Data fetching with SWR
  const { program, subjects, isLoading, mutateProgram } =
    useProgramSubjects(programId);

  // Assignment logic with optimistic updates
  const {
    subjectConfigs,
    assigning,
    validation,
    selectedCount,
    handleToggle,
    handleConfigChange,
    handleAssign,
  } = useSubjectAssignment(programId, subjects, program, (_updatedProgram) => {
    // Revalidate program data after successful assignment
    void mutateProgram();
  });

  // Loading skeleton state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={400} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Container>
    );
  }

  // Empty state - no subjects available
  if (subjects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          จัดการรายวิชาในหลักสูตร
        </Typography>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            ไม่พบรายวิชาในระบบ กรุณาเพิ่มรายวิชาก่อนจัดการหลักสูตร
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        จัดการรายวิชาในหลักสูตร: {program?.ProgramName ?? "กำลังโหลด..."}
      </Typography>

      {/* Summary Statistics */}
      <AssignmentSummary subjectConfigs={subjectConfigs} subjects={subjects} />

      {/* Subject Selection Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">เลือก</TableCell>
              <TableCell>รหัสวิชา</TableCell>
              <TableCell>ชื่อวิชา</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell align="center">หน่วยกิตต่ำสุด</TableCell>
              <TableCell align="center">หน่วยกิตสูงสุด</TableCell>
              <TableCell align="center">บังคับ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => {
              const config = subjectConfigs[subject.SubjectCode];
              if (!config) return null;

              return (
                <TableRow
                  key={subject.SubjectCode}
                  sx={{
                    backgroundColor: config.selected
                      ? "action.selected"
                      : "inherit",
                    "&:hover": { backgroundColor: "action.hover" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={config.selected}
                      onChange={() => handleToggle(subject.SubjectCode)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{subject.SubjectCode}</TableCell>
                  <TableCell sx={{ fontWeight: config.selected ? 600 : 400 }}>
                    {subject.SubjectName}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={config.selected ? "primary" : "text.secondary"}
                    >
                      {subject.Category}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={config.minCredits}
                      onChange={(e) =>
                        handleConfigChange(
                          subject.SubjectCode,
                          "minCredits",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={!config.selected}
                      inputProps={{
                        min: 0,
                        max: 10,
                        step: 0.5,
                        style: { width: 60, textAlign: "center" },
                      }}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "rgba(0, 0, 0, 0.38)",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={config.maxCredits}
                      onChange={(e) =>
                        handleConfigChange(
                          subject.SubjectCode,
                          "maxCredits",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={!config.selected}
                      inputProps={{
                        min: 0,
                        max: 10,
                        step: 0.5,
                        style: { width: 60, textAlign: "center" },
                      }}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "rgba(0, 0, 0, 0.38)",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={config.isMandatory}
                      onChange={(e) =>
                        handleConfigChange(
                          subject.SubjectCode,
                          "isMandatory",
                          e.target.checked,
                        )
                      }
                      disabled={!config.selected}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Button */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleAssign()}
          disabled={assigning || selectedCount === 0}
          size="large"
          sx={{ minWidth: 200 }}
        >
          {assigning ? "กำลังบันทึก..." : `บันทึก ${selectedCount} รายวิชา`}
        </Button>

        {selectedCount === 0 && (
          <Typography variant="body2" color="text.secondary">
            กรุณาเลือกรายวิชาอย่างน้อย 1 รายวิชา
          </Typography>
        )}
      </Box>

      {/* MOE Validation Results */}
      <MOEValidationAlert
        validation={validation}
        programName={program?.ProgramName}
      />
    </Container>
  );
}
