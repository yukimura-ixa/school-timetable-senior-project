"use client";

import { useState, Fragment } from "react";
import useSWR from "swr";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import {
  getGradeMatrixAction,
  syncGradeMatrixAction,
} from "@/features/teaching-assignment/application/actions/teaching-assignment.actions";
import {
  buildCells,
  cellsToDesired,
  type Cell,
  type GradeMatrixData,
  type MatrixAssignment,
} from "./grade-matrix.logic";
import {
  computeCoverage,
  type CoverageSection,
} from "@/features/teaching-assignment/domain/utils/coverage";
import { CoverageHeader } from "./CoverageHeader";
import { TeacherBrush } from "./TeacherBrush";
import { CarryOverDialog } from "./CarryOverDialog";
import { type TeacherPickerOption } from "./TeacherPicker";

export interface GradeCoverageMatrixProps {
  gradeYear: number;
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
  teachers: TeacherPickerOption[];
}

export function GradeCoverageMatrix({
  gradeYear,
  academicYear,
  semester,
  teachers,
}: GradeCoverageMatrixProps) {
  const [cells, setCells] = useState<Cell[][] | null>(null);
  const [matrixSnapshot, setMatrixSnapshot] = useState<GradeMatrixData | null | undefined>(
    undefined,
  );
  const [brushActive, setBrushActive] = useState(false);
  const [brushTeacher, setBrushTeacher] = useState<TeacherPickerOption | null>(
    teachers[0] ?? null,
  );
  const [carryOverOpen, setCarryOverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: matrix, mutate } = useSWR(
    ["grade-matrix", gradeYear, academicYear, semester],
    async () => {
      const result = await getGradeMatrixAction({ gradeYear, academicYear, semester });
      if (!result.success || !result.data) return null;
      return result.data as GradeMatrixData;
    },
    { revalidateOnFocus: false },
  );

  // Adjust cells during render whenever the fetched matrix changes.
  // Mirrors the TeacherCentricEditor snapshot pattern (avoids setState-in-effect).
  if (matrixSnapshot !== matrix) {
    setMatrixSnapshot(matrix);
    if (matrix) setCells(buildCells(matrix));
  }

  const creditMap: Record<string, string> = matrix
    ? Object.fromEntries(matrix.subjects.map((s) => [s.SubjectCode, s.Credit]))
    : {};

  // Coverage: per section tally assigned vs required codes.
  const coverageSections: CoverageSection[] =
    matrix && cells
      ? matrix.sections.map((sec) => ({
          requiredCodes: sec.subjectCodes,
          assignedCodes: sec.subjectCodes.filter((code) =>
            cells.some(
              (row) =>
                row.some(
                  (c) =>
                    c.gradeId === sec.GradeID &&
                    c.subjectCode === code &&
                    (c.status === "assigned" || c.status === "suggested"),
                ),
            ),
          ),
        }))
      : [];
  const { filled, required } = computeCoverage(coverageSections);

  // Subject rows grouped by LearningArea (insertion order).
  const subjectsByArea: [string, GradeMatrixData["subjects"]][] = [];
  if (matrix) {
    const areaMap = new Map<string, GradeMatrixData["subjects"]>();
    for (const s of matrix.subjects) {
      const area = s.LearningArea ?? "อื่นๆ";
      if (!areaMap.has(area)) areaMap.set(area, []);
      areaMap.get(area)!.push(s);
    }
    for (const entry of areaMap.entries()) subjectsByArea.push(entry);
  }

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (!cells) return;
    const cell = cells[rowIdx]?.[colIdx];
    if (!cell || cell.status === "na") return;

    if (brushActive && brushTeacher) {
      setCells((prev) => {
        if (!prev) return prev;
        return prev.map((row, r) =>
          row.map((c, ci) => {
            if (r !== rowIdx || ci !== colIdx) return c;
            return {
              ...c,
              teacherId: brushTeacher.id,
              status: "assigned" as const,
            };
          }),
        );
      });
    }
    // When brush is inactive, a per-cell picker popover would open here (YAGNI).
  };

  const handleSave = async () => {
    if (!cells || !matrix) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const existing: MatrixAssignment[] = matrix.assignments;
      const desired = cellsToDesired(cells, creditMap);
      const res = await syncGradeMatrixAction({ academicYear, semester, existing, desired });
      if (!res.success) {
        setError(res.error?.message ?? "บันทึกไม่สำเร็จ");
        setSaving(false);
        return;
      }
      setSuccess("บันทึกข้อมูลสำเร็จ");
      await mutate().catch(() => undefined);
      setSaving(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการบันทึก");
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (matrix) setCells(buildCells(matrix));
  };

  if (!matrix || !cells) {
    return <CircularProgress />;
  }

  const sections = matrix.sections;

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 1 }}>
          {success}
        </Alert>
      )}
      <CoverageHeader filled={filled} required={required} />

      <TeacherBrush
        teachers={teachers}
        brushTeacher={brushTeacher}
        onBrushTeacherChange={setBrushTeacher}
        brushActive={brushActive}
        onToggle={() => setBrushActive((v) => !v)}
      />

      <Button
        size="small"
        variant="outlined"
        sx={{ mb: 1 }}
        onClick={() => setCarryOverOpen(true)}
      >
        นำเข้าจากภาคเรียนก่อน
      </Button>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>วิชา</TableCell>
            {sections.map((sec) => (
              <TableCell key={sec.GradeID}>{sec.GradeID}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {subjectsByArea.map(([area, subjects]) => (
            <Fragment key={area}>
              <TableRow>
                <TableCell
                  colSpan={sections.length + 1}
                  sx={{ bgcolor: "action.hover", fontWeight: "bold" }}
                >
                  <Typography variant="caption">{area}</Typography>
                </TableCell>
              </TableRow>
              {subjects.map((subj) => {
                const rowIdx = matrix.subjects.findIndex(
                  (s) => s.SubjectCode === subj.SubjectCode,
                );
                const row = cells[rowIdx] ?? [];
                return (
                  <TableRow key={subj.SubjectCode}>
                    <TableCell>
                      <Typography variant="body2">{subj.SubjectCode}</Typography>
                    </TableCell>
                    {row.map((cell, colIdx) => (
                      <TableCell key={cell.gradeId} sx={{ p: 0.5 }}>
                        {cell.status === "na" ? (
                          <Box
                            component="span"
                            sx={{ color: "text.disabled", px: 1 }}
                          >
                            -
                          </Box>
                        ) : (
                          <Button
                            aria-label={`${subj.SubjectCode} ${cell.gradeId}`}
                            size="small"
                            variant="text"
                            sx={{
                              minWidth: 0,
                              opacity: cell.status === "gap" ? 0.6 : 1,
                              p: 0.5,
                            }}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                          >
                            {cell.status === "gap" ? (
                              "[+]"
                            ) : (() => {
                              const t = teachers.find((x) => x.id === cell.teacherId);
                              const label = t
                                ? `${t.prefix}${t.firstname} ${t.lastname}`.trim()
                                : String(cell.teacherId ?? "");
                              return (
                                <Chip
                                  size="small"
                                  label={label}
                                  variant={cell.status === "suggested" ? "outlined" : "filled"}
                                  sx={
                                    cell.status === "suggested"
                                      ? { borderStyle: "dashed" }
                                      : undefined
                                  }
                                />
                              );
                            })()}
                          </Button>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => void handleSave()}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          บันทึก
        </Button>
        <Button variant="outlined" onClick={handleDiscard} disabled={saving}>
          ยกเลิก
        </Button>
      </Box>

      <CarryOverDialog
        open={carryOverOpen}
        gradeYear={gradeYear}
        academicYear={academicYear}
        semester={semester}
        cells={cells}
        onApply={(applied) => setCells(applied)}
        onClose={() => setCarryOverOpen(false)}
      />
    </Box>
  );
}
