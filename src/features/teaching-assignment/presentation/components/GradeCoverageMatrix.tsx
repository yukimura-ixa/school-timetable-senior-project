"use client";

import { useState, Fragment } from "react";
import useSWR from "swr";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  getGradeMatrixAction,
  syncGradeMatrixAction,
} from "@/features/teaching-assignment/application/actions/teaching-assignment.actions";
import {
  buildCells,
  cellsToDesired,
  setCellTeacher,
  clearCell,
  fillSubjectRow,
  countChanges,
  type Cell,
  type GradeMatrixData,
  type MatrixAssignment,
} from "./grade-matrix.logic";
import { computeCoverage } from "@/features/teaching-assignment/domain/utils/coverage";
import { CoverageHeader } from "./CoverageHeader";
import { CarryOverDialog } from "./CarryOverDialog";
import { type TeacherPickerOption } from "./TeacherPicker";

export interface GradeCoverageMatrixProps {
  gradeYear: number;
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
  teachers: TeacherPickerOption[];
}

const teacherLabel = (t: TeacherPickerOption) =>
  `${t.prefix}${t.firstname} ${t.lastname}`.trim();

export function GradeCoverageMatrix({
  gradeYear,
  academicYear,
  semester,
  teachers,
}: GradeCoverageMatrixProps) {
  const [cells, setCells] = useState<Cell[][] | null>(null);
  const [matrixSnapshot, setMatrixSnapshot] = useState<
    GradeMatrixData | null | undefined
  >(undefined);
  const [carryOverOpen, setCarryOverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cell-edit popover state.
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [target, setTarget] = useState<{
    gradeId: string;
    subjectCode: string;
    subjectName: string;
  } | null>(null);

  const { data: matrix, mutate } = useSWR(
    ["grade-matrix", gradeYear, academicYear, semester],
    async () => {
      const result = await getGradeMatrixAction({
        gradeYear,
        academicYear,
        semester,
      });
      if (!result.success || !result.data) return null;
      return result.data as GradeMatrixData;
    },
    { revalidateOnFocus: false },
  );

  // Adjust cells during render whenever the fetched matrix changes (snapshot pattern).
  if (matrixSnapshot !== matrix) {
    setMatrixSnapshot(matrix);
    if (matrix) setCells(buildCells(matrix));
  }

  const creditMap: Record<string, string> = matrix
    ? Object.fromEntries(matrix.subjects.map((s) => [s.SubjectCode, s.Credit]))
    : {};

  // Per-section coverage (for column meters) + overall totals.
  const sectionCoverage: Record<string, { filled: number; required: number }> =
    {};
  if (matrix && cells) {
    for (const sec of matrix.sections) {
      const required = sec.subjectCodes.length;
      const filled = sec.subjectCodes.filter((code) =>
        cells.some((row) =>
          row.some(
            (c) =>
              c.gradeId === sec.GradeID &&
              c.subjectCode === code &&
              (c.status === "assigned" || c.status === "suggested"),
          ),
        ),
      ).length;
      sectionCoverage[sec.GradeID] = { filled, required };
    }
  }
  const { filled, required } =
    matrix && cells
      ? computeCoverage(
          matrix.sections.map((sec) => ({
            requiredCodes: sec.subjectCodes,
            assignedCodes: sec.subjectCodes.filter(
              (code) => (sectionCoverage[sec.GradeID]?.filled ?? 0) > 0
                ? cells.some((row) =>
                    row.some(
                      (c) =>
                        c.gradeId === sec.GradeID &&
                        c.subjectCode === code &&
                        (c.status === "assigned" || c.status === "suggested"),
                    ),
                  )
                : false,
            ),
          })),
        )
      : { filled: 0, required: 0 };

  const dirty = matrix && cells ? countChanges(buildCells(matrix), cells) : 0;

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

  const openCellMenu = (
    e: React.MouseEvent<HTMLElement>,
    gradeId: string,
    subjectCode: string,
    subjectName: string,
  ) => {
    setAnchorEl(e.currentTarget);
    setTarget({ gradeId, subjectCode, subjectName });
  };
  const closeCellMenu = () => {
    setAnchorEl(null);
    setTarget(null);
  };

  const targetCell =
    target && cells
      ? cells
          .flat()
          .find(
            (c) =>
              c.gradeId === target.gradeId &&
              c.subjectCode === target.subjectCode,
          ) ?? null
      : null;
  const targetTeacher =
    targetCell?.teacherId != null
      ? (teachers.find((t) => t.id === targetCell.teacherId) ?? null)
      : null;

  const pickTeacher = (t: TeacherPickerOption | null) => {
    if (!target || !cells || !t) return;
    setCells(setCellTeacher(cells, target.gradeId, target.subjectCode, t.id));
    closeCellMenu();
  };
  const clearTarget = () => {
    if (!target || !cells) return;
    setCells(clearCell(cells, target.gradeId, target.subjectCode));
    closeCellMenu();
  };
  const fillRow = () => {
    if (!target || !cells || targetCell?.teacherId == null) return;
    setCells(fillSubjectRow(cells, target.subjectCode, targetCell.teacherId));
    closeCellMenu();
  };

  const handleSave = async () => {
    if (!cells || !matrix) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const existing: MatrixAssignment[] = matrix.assignments;
      const desired = cellsToDesired(cells, creditMap);
      const res = await syncGradeMatrixAction({
        academicYear,
        semester,
        existing,
        desired,
      });
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
    <Box sx={{ pb: 10 }}>
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

      {/* Legend + carry-over */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
          <Chip size="small" label="มอบหมายแล้ว" />
          <Chip
            size="small"
            variant="outlined"
            label="เสนอจากเทอมก่อน"
            sx={{ borderStyle: "dashed" }}
          />
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label="ยังว่าง"
          />
          <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
            · ไม่อยู่ในหลักสูตร
          </Typography>
        </Stack>
        <Button size="small" variant="outlined" onClick={() => setCarryOverOpen(true)}>
          นำเข้าจากภาคเรียนก่อน
        </Button>
      </Box>

      <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "30%" }}>วิชา</TableCell>
            {sections.map((sec) => {
              const cov = sectionCoverage[sec.GradeID];
              const secPct = cov && cov.required > 0 ? (cov.filled / cov.required) * 100 : 100;
              const secDone = cov ? cov.filled >= cov.required : true;
              return (
                <TableCell key={sec.GradeID} align="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {`ม.${gradeYear}/${sec.number}`}
                  </Typography>
                  {cov && (
                    <>
                      <Typography
                        variant="caption"
                        color={secDone ? "success.main" : "text.secondary"}
                      >
                        {cov.filled}/{cov.required}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={secPct}
                        color={secDone ? "success" : "primary"}
                        sx={{ height: 4, borderRadius: 2, mt: 0.25 }}
                      />
                    </>
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {subjectsByArea.map(([area, subjects]) => (
            <Fragment key={area}>
              <TableRow>
                <TableCell
                  colSpan={sections.length + 1}
                  sx={{ bgcolor: "action.hover", py: 0.5 }}
                >
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 700, letterSpacing: 1 }}
                  >
                    {area}
                  </Typography>
                </TableCell>
              </TableRow>
              {subjects.map((subj) => {
                const rowIdx = matrix.subjects.findIndex(
                  (s) => s.SubjectCode === subj.SubjectCode,
                );
                const row = cells[rowIdx] ?? [];
                return (
                  <TableRow key={subj.SubjectCode} hover>
                    <TableCell>
                      <Typography variant="body2">{subj.SubjectName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subj.SubjectCode}
                      </Typography>
                    </TableCell>
                    {row.map((cell) => (
                      <TableCell key={cell.gradeId} align="center" sx={{ p: 0.5 }}>
                        {cell.status === "na" ? (
                          <Box component="span" sx={{ color: "text.disabled" }}>
                            ·
                          </Box>
                        ) : cell.status === "gap" ? (
                          <Button
                            aria-label={`${subj.SubjectCode} ${cell.gradeId}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            startIcon={
                              <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />
                            }
                            sx={{ minWidth: 64, borderStyle: "dashed" }}
                            onClick={(e) =>
                              openCellMenu(
                                e,
                                cell.gradeId,
                                subj.SubjectCode,
                                subj.SubjectName,
                              )
                            }
                          >
                            เพิ่มครู
                          </Button>
                        ) : (
                          <Chip
                            aria-label={`${subj.SubjectCode} ${cell.gradeId}`}
                            size="small"
                            label={
                              teachers.find((x) => x.id === cell.teacherId)
                                ? teacherLabel(
                                    teachers.find((x) => x.id === cell.teacherId)!,
                                  )
                                : String(cell.teacherId ?? "")
                            }
                            variant={cell.status === "suggested" ? "outlined" : "filled"}
                            color={cell.status === "suggested" ? "default" : "primary"}
                            onClick={(e) =>
                              openCellMenu(
                                e,
                                cell.gradeId,
                                subj.SubjectCode,
                                subj.SubjectName,
                              )
                            }
                            sx={{
                              cursor: "pointer",
                              maxWidth: "100%",
                              ...(cell.status === "suggested"
                                ? { borderStyle: "dashed" }
                                : {}),
                            }}
                          />
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

      {/* Cell edit popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeCellMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          {target && (
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {target.subjectName} ·{" "}
              {`ม.${gradeYear}/${
                sections.find((s) => s.GradeID === target.gradeId)?.number ?? ""
              }`}
            </Typography>
          )}
          <Autocomplete
            size="small"
            autoHighlight
            options={teachers}
            value={targetTeacher}
            getOptionLabel={teacherLabel}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            onChange={(_, v) => pickTeacher(v)}
            renderInput={(params) => (
              <TextField {...params} label="ค้นหาครูผู้สอน" autoFocus />
            )}
          />
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
            <Button
              size="small"
              color="error"
              disabled={targetCell?.teacherId == null}
              onClick={clearTarget}
            >
              ลบครู
            </Button>
            <Button
              size="small"
              disabled={targetCell?.teacherId == null}
              onClick={fillRow}
            >
              เติมทั้งแถว
            </Button>
          </Stack>
        </Box>
      </Popover>

      {/* Sticky save bar */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          mt: 2,
          py: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          zIndex: 2,
        }}
      >
        <Typography variant="body2" color={dirty > 0 ? "warning.main" : "text.secondary"}>
          {dirty > 0 ? `${dirty} รายการที่ยังไม่บันทึก` : "ไม่มีการเปลี่ยนแปลง"}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          onClick={handleDiscard}
          disabled={saving || dirty === 0}
        >
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => void handleSave()}
          disabled={saving || dirty === 0}
          startIcon={
            saving ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          บันทึก
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
