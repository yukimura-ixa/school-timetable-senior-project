/**
 * Program Subject Assignment Page — "Curriculum ledger"
 *
 * Builds a program's curriculum from the full subject catalogue:
 * - Identity + live credit ledger header (progress toward MinTotalCredits)
 * - Search + "selected only" filter
 * - Subjects grouped by the curriculum's own tiers (พื้นฐาน / เพิ่มเติม / กิจกรรม)
 * - Sticky save bar
 *
 * Accent color is derived from the program's track so the editor reads as
 * an extension of that program's identity.
 */

"use client";

import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
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
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useProgramSubjects } from "@/features/program/presentation/hooks/useProgramSubjects";
import { useSubjectAssignment } from "@/features/program/presentation/hooks/useSubjectAssignment";
import { MOEValidationAlert } from "@/features/program/presentation/components/MOEValidationAlert";

interface ProgramSubjectAssignmentPageProps {
  programId: number;
}

const TRACK_META: Record<string, { label: string; color: string }> = {
  SCIENCE_MATH: { label: "วิทย์-คณิต", color: "#2196f3" },
  LANGUAGE_MATH: { label: "ศิลป์-คำนวณ", color: "#43a047" },
  LANGUAGE_ARTS: { label: "ศิลป์-ภาษา", color: "#8e24aa" },
  GENERAL: { label: "ทั่วไป", color: "#546e7a" },
};

const CATEGORY_ORDER = ["CORE", "ADDITIONAL", "ACTIVITY"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  CORE: "วิชาพื้นฐาน",
  ADDITIONAL: "วิชาเพิ่มเติม",
  ACTIVITY: "กิจกรรมพัฒนาผู้เรียน",
};

const num = (v: unknown) => Number(v) || 0;

function CreditField({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <TextField
      type="number"
      size="small"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      sx={{
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      slotProps={{
        htmlInput: {
          min: 0,
          max: 10,
          step: 0.5,
          style: { width: 46, textAlign: "center", padding: "5px 6px" },
        },
      }}
    />
  );
}

export default function ProgramSubjectAssignmentPage({
  programId,
}: ProgramSubjectAssignmentPageProps) {
  const { program, subjects, isLoading, mutateProgram } =
    useProgramSubjects(programId);

  const {
    subjectConfigs,
    assigning,
    validation,
    selectedCount,
    handleToggle,
    handleConfigChange,
    handleAssign,
  } = useSubjectAssignment(programId, subjects, program, () => {
    void mutateProgram();
  });

  const [search, setSearch] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const accent = TRACK_META[program?.Track ?? "GENERAL"]?.color ?? "#546e7a";

  const totalCredits = useMemo(
    () =>
      subjects.reduce((sum, s) => {
        const c = subjectConfigs[s.SubjectCode];
        return c?.selected ? sum + num(c.minCredits) : sum;
      }, 0),
    [subjects, subjectConfigs],
  );

  const mandatoryCount = useMemo(
    () =>
      Object.values(subjectConfigs).filter((c) => c.selected && c.isMandatory)
        .length,
    [subjectConfigs],
  );

  const target = program?.MinTotalCredits ?? 0;
  const progressPct = target > 0 ? Math.min(100, (totalCredits / target) * 100) : 0;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORY_ORDER.map((cat) => {
      const all = subjects.filter((s) => s.Category === cat);
      const selected = all.filter((s) => subjectConfigs[s.SubjectCode]?.selected);
      const credits = selected.reduce(
        (sum, s) => sum + num(subjectConfigs[s.SubjectCode]?.minCredits),
        0,
      );
      const items = all.filter((s) => {
        const c = subjectConfigs[s.SubjectCode];
        if (selectedOnly && !c?.selected) return false;
        if (!q) return true;
        return (
          s.SubjectCode.toLowerCase().includes(q) ||
          s.SubjectName.toLowerCase().includes(q)
        );
      });
      return { cat, total: all.length, selected: selected.length, credits, items };
    }).filter((g) => g.total > 0);
  }, [subjects, subjectConfigs, search, selectedOnly]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rounded" width="100%" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={420} />
      </Container>
    );
  }

  if (subjects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          จัดการรายวิชาในหลักสูตร
        </Typography>
        <Paper variant="outlined" sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            ยังไม่มีรายวิชาในระบบ — เพิ่มรายวิชาที่หน้า &ldquo;ข้อมูลวิชา&rdquo; ก่อนจึงจะจัดหลักสูตรได้
          </Typography>
        </Paper>
      </Container>
    );
  }

  const trackLabel = program?.Track
    ? (TRACK_META[program.Track]?.label ?? program.Track)
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Identity + credit ledger */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          borderTop: `3px solid ${accent}`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", letterSpacing: 1.2 }}
            >
              จัดการรายวิชาในหลักสูตร
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {program?.ProgramName ?? "กำลังโหลด..."}
            </Typography>
            <Stack
              direction="row"
              gap={1}
              sx={{ mt: 1.25, flexWrap: "wrap" }}
            >
              {trackLabel && (
                <Chip
                  size="small"
                  label={trackLabel}
                  sx={{
                    bgcolor: alpha(accent, 0.12),
                    color: accent,
                    fontWeight: 700,
                  }}
                />
              )}
              {program?.ProgramCode && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={program.ProgramCode}
                  sx={{ fontFamily: "monospace" }}
                />
              )}
              {program?.Year != null && (
                <Chip size="small" variant="outlined" label={`ม.${program.Year}`} />
              )}
            </Stack>
          </Box>

          {/* Ledger */}
          <Box sx={{ minWidth: { sm: 240 }, flexShrink: 0 }}>
            <Stack direction="row" gap={0.75} sx={{ alignItems: "baseline" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: accent,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {totalCredits}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {target > 0 ? `/ ${target} หน่วยกิต` : "หน่วยกิต"}
              </Typography>
            </Stack>
            {target > 0 && (
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 8,
                  borderRadius: 99,
                  mt: 1,
                  bgcolor: alpha(accent, 0.15),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: accent,
                    borderRadius: 99,
                  },
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 0.75 }}
            >
              เลือกแล้ว {selectedCount} วิชา · บังคับ {mandatoryCount} วิชา
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={1.5}
        sx={{ mt: 2.5, alignItems: { sm: "center" } }}
      >
        <TextField
          size="small"
          placeholder="ค้นหารหัสหรือชื่อวิชา"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: { sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={selectedOnly}
              onChange={(e) => setSelectedOnly(e.target.checked)}
              size="small"
            />
          }
          label="เฉพาะที่เลือก"
        />
      </Stack>

      {/* Grouped subjects */}
      {groups.map((g) => (
        <Accordion
          key={g.cat}
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{
            mt: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            "&::before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack
              direction="row"
              gap={1.25}
              sx={{ width: "100%", pr: 1, alignItems: "center" }}
            >
              <Box
                sx={{
                  width: 4,
                  alignSelf: "stretch",
                  borderRadius: 99,
                  bgcolor: g.selected > 0 ? accent : "divider",
                }}
              />
              <Typography sx={{ fontWeight: 700 }}>
                {CATEGORY_LABEL[g.cat] ?? g.cat}
              </Typography>
              <Chip
                size="small"
                label={`${g.selected}/${g.total}`}
                sx={{
                  fontWeight: 700,
                  bgcolor: g.selected > 0 ? alpha(accent, 0.12) : "action.hover",
                  color: g.selected > 0 ? accent : "text.secondary",
                }}
              />
              <Box sx={{ flex: 1 }} />
              {g.credits > 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {g.credits} หน่วยกิต
                </Typography>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {g.items.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ p: 2, color: "text.secondary" }}
              >
                ไม่พบรายวิชาที่ตรงกับเงื่อนไข
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>รหัสวิชา</TableCell>
                      <TableCell>ชื่อวิชา</TableCell>
                      <TableCell align="center">หน่วยกิต ต่ำสุด / สูงสุด</TableCell>
                      <TableCell align="center">บังคับ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {g.items.map((subject) => {
                      const config = subjectConfigs[subject.SubjectCode];
                      if (!config) return null;
                      return (
                        <TableRow
                          key={subject.SubjectCode}
                          hover
                          sx={{
                            borderLeft: `3px solid ${
                              config.selected ? accent : "transparent"
                            }`,
                            bgcolor: config.selected
                              ? alpha(accent, 0.06)
                              : "inherit",
                            transition: "background-color 0.15s",
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={config.selected}
                              onChange={() => handleToggle(subject.SubjectCode)}
                              sx={{
                                color: alpha(accent, 0.6),
                                "&.Mui-checked": { color: accent },
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {subject.SubjectCode}
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: config.selected ? 600 : 400 }}
                          >
                            {subject.SubjectName}
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              gap={0.75}
                              sx={{ justifyContent: "center", alignItems: "center" }}
                            >
                              <CreditField
                                value={config.minCredits}
                                disabled={!config.selected}
                                onChange={(v) =>
                                  handleConfigChange(
                                    subject.SubjectCode,
                                    "minCredits",
                                    v,
                                  )
                                }
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "text.disabled" }}
                              >
                                /
                              </Typography>
                              <CreditField
                                value={config.maxCredits}
                                disabled={!config.selected}
                                onChange={(v) =>
                                  handleConfigChange(
                                    subject.SubjectCode,
                                    "maxCredits",
                                    v,
                                  )
                                }
                              />
                            </Stack>
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
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* MOE validation */}
      <Box sx={{ mt: 2 }}>
        <MOEValidationAlert
          validation={validation}
          programName={program?.ProgramName}
        />
      </Box>

      {/* Sticky save bar */}
      <Paper
        elevation={4}
        sx={{
          position: "sticky",
          bottom: 16,
          mt: 3,
          p: 2,
          borderRadius: 3,
          borderLeft: `4px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {selectedCount} รายวิชา · {totalCredits} หน่วยกิต
          </Typography>
          {selectedCount === 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              เลือกรายวิชาอย่างน้อย 1 วิชาเพื่อบันทึก
            </Typography>
          ) : target > 0 && totalCredits < target ? (
            <Typography variant="caption" sx={{ color: "warning.main" }}>
              ยังขาดอีก {target - totalCredits} หน่วยกิตจากเป้าหมาย
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={() => void handleAssign()}
          disabled={assigning || selectedCount === 0}
          size="large"
          sx={{
            minWidth: 180,
            bgcolor: accent,
            "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
          }}
        >
          {assigning ? "กำลังบันทึก..." : `บันทึก ${selectedCount} รายวิชา`}
        </Button>
      </Paper>
    </Container>
  );
}
