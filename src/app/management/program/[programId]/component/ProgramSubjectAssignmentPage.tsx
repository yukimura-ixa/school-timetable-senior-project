/**
 * Program Subject Assignment Page — "Catalog → Basket" (Option B)
 *
 * Builds a program's curriculum as a two-pane editor:
 * - Left  "คลังรายวิชา": searchable catalogue grouped by curriculum tier
 *   (พื้นฐาน / เพิ่มเติม / กิจกรรม); click a row or "เพิ่มทั้งหมด" to add.
 * - Right "ในหลักสูตร": the chosen subjects as cards, sorted by MOE learning
 *   area, each with credit min/max steppers + mandatory toggle.
 * - Live credit ledger header (progress toward MinTotalCredits) + save bar.
 *
 * Presentation only — all selection/persistence logic lives in the
 * useProgramSubjects / useSubjectAssignment hooks, reused verbatim.
 */

"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import { useProgramSubjects } from "@/features/program/presentation/hooks/useProgramSubjects";
import { useSubjectAssignment } from "@/features/program/presentation/hooks/useSubjectAssignment";
import { MOEValidationAlert } from "@/features/program/presentation/components/MOEValidationAlert";
import { subjectCreditValues } from "@/models/credit-value";

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

// MOE / สพฐ. learning areas, keyed by the subject code's leading character.
const MOE_RANK: Record<string, number> = {
  ท: 1, ค: 2, ว: 3, ส: 4, พ: 5, ศ: 6, ง: 7, อ: 8, จ: 8, ญ: 8, ฝ: 8, ก: 9,
};
const MOE_AREA: Record<string, string> = {
  ท: "ภาษาไทย",
  ค: "คณิตศาสตร์",
  ว: "วิทยาศาสตร์และเทคโนโลยี",
  ส: "สังคมศึกษาฯ",
  พ: "สุขศึกษาและพลศึกษา",
  ศ: "ศิลปะ",
  ง: "การงานอาชีพ",
  อ: "ภาษาต่างประเทศ",
  จ: "ภาษาต่างประเทศ",
  ก: "กิจกรรมพัฒนาผู้เรียน",
};
const MOE_COLOR: Record<string, string> = {
  ท: "#D8345B", ค: "#E07A2B", ว: "#1E9E55", ส: "#7C4DDB",
  พ: "#0E9AA7", ศ: "#C23AA0", ง: "#B07A2C", อ: "#2563EB",
  จ: "#2563EB", ก: "#64748B",
};

const FALLBACK_AREA = { name: "", color: "#64748B", rank: 50 };
const areaOf = (code: string) => {
  const k = code.charAt(0);
  return {
    name: MOE_AREA[k] ?? FALLBACK_AREA.name,
    color: MOE_COLOR[k] ?? FALLBACK_AREA.color,
    rank: MOE_RANK[k] ?? FALLBACK_AREA.rank,
  };
};

const num = (v: unknown) => Number(v) || 0;
const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
const creditOf = (credit: string) =>
  subjectCreditValues[credit as keyof typeof subjectCreditValues] ?? 0;
const clampCredit = (n: number) =>
  Math.max(0, Math.min(9, Math.round(n * 2) / 2));

// A program holds one term's per-semester credits, but MinTotalCredits (like
// the MoE minimums) is an annual figure. Divide by the terms in a year so the
// ledger compares like with like. Mirrors TERMS_PER_YEAR in moe-validation.
const TERMS_PER_YEAR = 2;

function Stepper({
  value,
  onMinus,
  onPlus,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const btn = {
    borderRadius: 0,
    width: 26,
    height: 28,
    color: "text.secondary",
  } as const;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
      }}
    >
      <IconButton size="small" onClick={onMinus} sx={btn} aria-label="ลด">
        <RemoveIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          width: 36,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          borderLeft: "1px solid",
          borderRight: "1px solid",
          borderColor: "divider",
          lineHeight: "28px",
        }}
      >
        {fmt(value)}
      </Typography>
      <IconButton size="small" onClick={onPlus} sx={btn} aria-label="เพิ่ม">
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
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

  const [catalogSearch, setCatalogSearch] = useState("");

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

  // MinTotalCredits is annual; the editor works in one term, so compare the
  // per-term selection against the per-term target.
  const target = (program?.MinTotalCredits ?? 0) / TERMS_PER_YEAR;
  const progressPct =
    target > 0 ? Math.min(100, (totalCredits / target) * 100) : 0;
  const shortfall = Math.round((target - totalCredits) * 10) / 10;

  // Add a subject and seed its credit window from the catalogue credit, so a
  // freshly-added subject reads its real credit instead of the hook's `?? 1`.
  const addSubject = (code: string, credit: string) => {
    if (subjectConfigs[code]?.selected) return;
    handleToggle(code);
    const cr = creditOf(credit);
    handleConfigChange(code, "minCredits", cr);
    handleConfigChange(code, "maxCredits", cr);
  };

  const removeSubject = (code: string) => {
    if (subjectConfigs[code]?.selected) handleToggle(code);
  };

  // Steppers keep the min ≤ max invariant the bare hook does not enforce.
  const adjust = (
    code: string,
    field: "minCredits" | "maxCredits",
    delta: number,
  ) => {
    const cur = subjectConfigs[code];
    if (!cur) return;
    const v = clampCredit(num(cur[field]) + delta);
    handleConfigChange(code, field, v);
    if (field === "minCredits" && v > num(cur.maxCredits))
      handleConfigChange(code, "maxCredits", v);
    if (field === "maxCredits" && v < num(cur.minCredits))
      handleConfigChange(code, "minCredits", v);
  };

  // Left pane — unselected subjects, grouped by tier, filtered by search.
  const catalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return CATEGORY_ORDER.map((cat) => {
      const rows = subjects.filter((s) => {
        if (s.Category !== cat) return false;
        if (subjectConfigs[s.SubjectCode]?.selected) return false;
        if (!q) return true;
        return (
          s.SubjectCode.toLowerCase().includes(q) ||
          s.SubjectName.toLowerCase().includes(q)
        );
      });
      return { cat, rows };
    }).filter((g) => g.rows.length > 0);
  }, [subjects, subjectConfigs, catalogSearch]);

  // Right pane — selected subjects, sorted by MOE learning area then code.
  const basket = useMemo(() => {
    return subjects
      .filter((s) => subjectConfigs[s.SubjectCode]?.selected)
      .sort((a, b) => {
        const ra = areaOf(a.SubjectCode).rank;
        const rb = areaOf(b.SubjectCode).rank;
        return ra - rb || a.SubjectCode.localeCompare(b.SubjectCode, "th");
      });
  }, [subjects, subjectConfigs]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rounded" width="100%" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={520} />
      </Container>
    );
  }

  if (subjects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          จัดการรายวิชาในหลักสูตร
        </Typography>
        <Paper
          variant="outlined"
          sx={{ p: 5, textAlign: "center", borderRadius: 3 }}
        >
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            ยังไม่มีรายวิชาในระบบ — เพิ่มรายวิชาที่หน้า &ldquo;ข้อมูลวิชา&rdquo;
            ก่อนจึงจะจัดหลักสูตรได้
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
          spacing={2}
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
            <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap" }}>
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
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: accent,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt(totalCredits)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {target > 0 ? `/ ${fmt(target)} หน่วยกิต` : "หน่วยกิต"}
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

      {/* Two-pane editor */}
      <Paper
        variant="outlined"
        sx={{
          mt: 2.5,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: { md: 560 },
        }}
      >
        {/* Catalog */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: { md: "1px solid" },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: { xs: "divider", md: "divider" },
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 1.25 }}
            >
              คลังรายวิชา
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="ค้นหาเพื่อเพิ่มวิชา"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
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
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
            {catalog.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
              >
                เพิ่มรายวิชาครบทุกวิชาแล้ว
              </Typography>
            ) : (
              catalog.map((g) => (
                <Box key={g.cat}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", px: 2, pt: 1.5, pb: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 3,
                        height: 14,
                        borderRadius: 1,
                        bgcolor: "action.disabled",
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "text.secondary" }}
                    >
                      {CATEGORY_LABEL[g.cat] ?? g.cat}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button
                      size="small"
                      onClick={() =>
                        g.rows.forEach((s) =>
                          addSubject(s.SubjectCode, s.Credit),
                        )
                      }
                      sx={{ color: accent, minWidth: 0 }}
                    >
                      + เพิ่มทั้งหมด ({g.rows.length})
                    </Button>
                  </Stack>
                  {g.rows.map((s) => {
                    const area = areaOf(s.SubjectCode);
                    return (
                      <Stack
                        key={s.SubjectCode}
                        direction="row"
                        spacing={1.5}
                        onClick={() => addSubject(s.SubjectCode, s.Credit)}
                        sx={{
                          alignItems: "center",
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:hover": { bgcolor: alpha(accent, 0.05) },
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1.5,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: alpha(area.color, 0.12),
                            color: area.color,
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: "text.secondary",
                            width: 62,
                            flexShrink: 0,
                          }}
                        >
                          {s.SubjectCode}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {s.SubjectName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.disabled", flexShrink: 0 }}
                        >
                          {fmt(creditOf(s.Credit))} นก.
                        </Typography>
                      </Stack>
                    );
                  })}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Basket */}
        <Box
          sx={{
            width: { xs: "100%", md: 430 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: "action.hover",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              ในหลักสูตร
            </Typography>
            <Chip
              size="small"
              label={`${selectedCount} วิชา`}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(accent, 0.12),
                color: accent,
              }}
            />
          </Stack>
          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
            {basket.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ยังไม่มีรายวิชา
                  <br />
                  เลือกจากคลังด้านซ้ายเพื่อเพิ่ม
                </Typography>
              </Box>
            ) : (
              basket.map((s, i) => {
                const config = subjectConfigs[s.SubjectCode];
                if (!config) return null;
                const area = areaOf(s.SubjectCode);
                return (
                  <Paper
                    key={s.SubjectCode}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      borderLeft: `4px solid ${area.color}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          color: area.color,
                          bgcolor: alpha(area.color, 0.12),
                          borderRadius: 1,
                          px: 0.75,
                          py: 0.25,
                          minWidth: 26,
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "monospace", color: "text.secondary" }}
                          >
                            {s.SubjectCode}
                          </Typography>
                          {area.name && (
                            <Typography
                              variant="caption"
                              sx={{ color: area.color, fontWeight: 600 }}
                            >
                              {area.name}
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                          {s.SubjectName}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeSubject(s.SubjectCode)}
                        aria-label="นำออก"
                        sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{
                        alignItems: "center",
                        mt: 1.25,
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        flexWrap: "wrap",
                        rowGap: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        หน่วยกิต
                      </Typography>
                      <Stepper
                        value={num(config.minCredits)}
                        onMinus={() => adjust(s.SubjectCode, "minCredits", -0.5)}
                        onPlus={() => adjust(s.SubjectCode, "minCredits", 0.5)}
                      />
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        /
                      </Typography>
                      <Stepper
                        value={num(config.maxCredits)}
                        onMinus={() => adjust(s.SubjectCode, "maxCredits", -0.5)}
                        onPlus={() => adjust(s.SubjectCode, "maxCredits", 0.5)}
                      />
                      <Box sx={{ flex: 1 }} />
                      <Chip
                        size="small"
                        label="บังคับ"
                        onClick={() =>
                          handleConfigChange(
                            s.SubjectCode,
                            "isMandatory",
                            !config.isMandatory,
                          )
                        }
                        sx={{
                          cursor: "pointer",
                          fontWeight: 600,
                          bgcolor: config.isMandatory
                            ? accent
                            : "action.selected",
                          color: config.isMandatory ? "#fff" : "text.secondary",
                          "&:hover": {
                            bgcolor: config.isMandatory
                              ? accent
                              : "action.selected",
                          },
                        }}
                      />
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Box>
        </Box>
      </Paper>

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
            {selectedCount} รายวิชา · {fmt(totalCredits)} หน่วยกิต · บังคับ{" "}
            {mandatoryCount}
          </Typography>
          {selectedCount === 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              เลือกรายวิชาอย่างน้อย 1 วิชาเพื่อบันทึก
            </Typography>
          ) : target > 0 && shortfall > 0 ? (
            <Typography variant="caption" sx={{ color: "warning.main" }}>
              ยังขาดอีก {fmt(shortfall)} หน่วยกิตจากเป้าหมาย
            </Typography>
          ) : target > 0 && shortfall < 0 ? (
            <Typography variant="caption" sx={{ color: "success.main" }}>
              เกินเป้าหมาย {fmt(-shortfall)} หน่วยกิต
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
