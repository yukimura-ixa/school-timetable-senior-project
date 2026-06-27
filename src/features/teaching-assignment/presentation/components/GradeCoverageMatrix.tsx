"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import { computeCoverage } from "@/features/teaching-assignment/domain/utils/coverage";
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
  const [brushActive, setBrushActive] = useState(false);
  const [brushTeacher, setBrushTeacher] = useState<TeacherPickerOption | null>(
    teachers[0] ?? null,
  );
  const [carryOverOpen, setCarryOverOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const swrKey = ["grade-matrix", gradeYear, academicYear, semester] as const;

  const { data: matrix, mutate } = useSWR(swrKey, async () => {
    const result = await getGradeMatrixAction({ gradeYear, academicYear, semester });
    if (!result.success || !result.data) return null;
    return result.data as GradeMatrixData;
  });

  // Rebuild cells whenever the fetched matrix changes (initial load or after save/mutate).
  useEffect(() => {
    if (matrix) setCells(buildCells(matrix));
  }, [matrix]);

  const creditMap = useMemo<Record<string, string>>(() => {
    if (!matrix) return {};
    return Object.fromEntries(
      matrix.subjects.map((s) => [s.SubjectCode, s.Credit]),
    );
  }, [matrix]);

  // Build CoverageSection[] from current cells so computeCoverage stays pure.
  const { filled, required } = useMemo(() => {
    if (!matrix || !cells) return { filled: 0, required: 0 };
    const coverageSections = matrix.sections.map((sec) => {
      const assignedCodes = cells
        .flat()
        .filter(
          (c) =>
            c.gradeId === sec.GradeID &&
            (c.status === "assigned" || c.status === "suggested"),
        )
        .map((c) => c.subjectCode);
      return { requiredCodes: sec.subjectCodes, assignedCodes };
    });
    return computeCoverage(coverageSections);
  }, [matrix, cells]);

  // Subject rows grouped by LearningArea (order: insertion order).
  const subjectsByArea = useMemo(() => {
    if (!matrix) return [] as [string, GradeMatrixData["subjects"]][];
    const areaMap = new Map<string, GradeMatrixData["subjects"]>();
    for (const s of matrix.subjects) {
      const area = s.LearningArea ?? "อื่นๆ";
      if (!areaMap.has(area)) areaMap.set(area, []);
      areaMap.get(area)!.push(s);
    }
    return Array.from(areaMap.entries());
  }, [matrix]);

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
    // When brush is inactive a per-cell picker popover would open here.
    // Not required by the current test spec; omitted to stay YAGNI.
  };

  const handleSave = async () => {
    if (!cells || !matrix) return;
    setSaving(true);
    try {
      const existing: MatrixAssignment[] = matrix.assignments;
      const desired = cellsToDesired(cells, creditMap);
      await syncGradeMatrixAction({ academicYear, semester, existing, desired });
      await mutate();
    } finally {
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
            <>
              <TableRow key={`area-${area}`}>
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
                            —
                          </Box>
                        ) : (
                          <Button
                            aria-label={`${subj.SubjectCode} ${cell.gradeId}`}
                            size="small"
                            variant={
                              cell.status === "suggested"
                                ? "outlined"
                                : "text"
                            }
                            sx={{
                              minWidth: 0,
                              borderStyle:
                                cell.status === "suggested" ? "dashed" : undefined,
                              opacity:
                                cell.status === "gap" ? 0.6 : 1,
                            }}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                          >
                            {cell.status === "gap"
                              ? "[+]"
                              : String(cell.teacherId ?? "")}
                          </Button>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </>
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
