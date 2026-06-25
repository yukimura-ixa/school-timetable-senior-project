"use client";

/**
 * Admin editor for grade_fundamental — the per-year CORE template every program
 * of a grade inherits. Edits here propagate to all programs of that grade that
 * have not set a per-program override. Each row change writes immediately (same
 * model as the program editor's inherited section); deletes confirm first.
 */

import { useState } from "react";
import useSWR from "swr";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSnackbar } from "notistack";
import {
  getFundamentalsByYearAction,
  createFundamentalAction,
  updateFundamentalAction,
  deleteFundamentalAction,
} from "@/features/program/application/actions/program.actions";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { subjectCreditValues } from "@/models/credit-value";
import { moeArea as areaOf } from "@/features/program/domain/moe-learning-area";

const INHERIT = "#475569"; // slate — the shared "template" identity, distinct from a program's track accent
const YEARS = [1, 2, 3, 4, 5, 6];

const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
const clampCredit = (n: number) => Math.max(0, Math.min(9, Math.round(n * 2) / 2));
const creditOf = (credit: string) =>
  subjectCreditValues[credit as keyof typeof subjectCreditValues] ?? 1;

type Subject = {
  SubjectCode: string;
  SubjectName: string;
  Category: string;
  Credit: string;
};

type FundamentalRow = {
  GradeFundamentalID: number;
  SubjectCode: string;
  MinCredits: number;
  SortOrder: number;
  subject: { SubjectName: string };
};

function unwrap<T>(res: { success: boolean; data?: T } | undefined, fallback: T): T {
  return res && "success" in res && res.success && res.data !== undefined
    ? res.data
    : fallback;
}

function CreditStepper({
  value,
  onMinus,
  onPlus,
  disabled,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  disabled?: boolean;
}) {
  const btn = { borderRadius: 0, width: 28, height: 28, color: INHERIT } as const;
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
      <IconButton size="small" onClick={onMinus} disabled={disabled} sx={btn} aria-label="ลดหน่วยกิต">
        <RemoveIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Typography
        variant="body2"
        sx={{ width: 38, textAlign: "center", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}
      >
        {fmt(value)}
      </Typography>
      <IconButton size="small" onClick={onPlus} disabled={disabled} sx={btn} aria-label="เพิ่มหน่วยกิต">
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}

export function FundamentalsTemplateEditor() {
  const { enqueueSnackbar } = useSnackbar();
  const [year, setYear] = useState(1);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState<Subject | null>(null);

  const {
    data: rowsRes,
    isLoading,
    mutate,
  } = useSWR(["fundamentals-by-year", year], async ([, y]) =>
    getFundamentalsByYearAction({ Year: y }),
  );
  const { data: subjectsRes } = useSWR("subjects-all", async () => getSubjectsAction({}));

  const rows = unwrap(rowsRes, [] as FundamentalRow[]);
  const subjects = unwrap(subjectsRes, [] as Subject[]);

  const totalCredits = rows.reduce((s, r) => s + r.MinCredits, 0);

  // CORE subjects not already in this year's template — the add picker options.
  // React Compiler memoizes this; a manual useMemo here can't be preserved.
  const takenCodes = new Set(rows.map((r) => r.SubjectCode));
  const available = subjects.filter(
    (s) => s.Category === "CORE" && !takenCodes.has(s.SubjectCode),
  );

  const adjust = async (id: number, current: number, delta: number) => {
    setSavingId(id);
    try {
      await updateFundamentalAction({
        GradeFundamentalID: id,
        Year: year,
        MinCredits: clampCredit(current + delta),
      });
      await mutate();
    } catch {
      enqueueSnackbar("บันทึกไม่สำเร็จ", { variant: "error" });
    }
    setSavingId(null);
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`ลบ "${name}" ออกจากเทมเพลตชั้น ม.${year}?\nจะมีผลกับทุกหลักสูตรของชั้นนี้`)) {
      return;
    }
    setSavingId(id);
    try {
      await deleteFundamentalAction({ GradeFundamentalID: id, Year: year });
      await mutate();
      enqueueSnackbar("ลบออกจากเทมเพลตแล้ว", { variant: "success" });
    } catch {
      enqueueSnackbar("ลบไม่สำเร็จ", { variant: "error" });
    }
    setSavingId(null);
  };

  const add = async () => {
    if (!pick) return;
    setAdding(true);
    try {
      const nextSort = rows.reduce((m, r) => Math.max(m, r.SortOrder), 0) + 1;
      await createFundamentalAction({
        Year: year,
        SubjectCode: pick.SubjectCode,
        MinCredits: creditOf(pick.Credit),
        SortOrder: nextSort,
      });
      setPick(null);
      await mutate();
      enqueueSnackbar("เพิ่มวิชาพื้นฐานแล้ว", { variant: "success" });
    } catch {
      enqueueSnackbar("เพิ่มไม่สำเร็จ", { variant: "error" });
    }
    setAdding(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, borderTop: `3px solid ${INHERIT}` }}>
        <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 1.2 }}>
          แอดมิน · เทมเพลตวิชาพื้นฐานรายชั้น
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: INHERIT }}>
              วิชาพื้นฐาน ม.{year}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
              {YEARS.map((y) => (
                <Chip
                  key={y}
                  label={`ม.${y}`}
                  onClick={() => setYear(y)}
                  sx={{
                    fontWeight: 700,
                    cursor: "pointer",
                    bgcolor: y === year ? INHERIT : "transparent",
                    color: y === year ? "#fff" : "text.secondary",
                    border: "1px solid",
                    borderColor: y === year ? INHERIT : "divider",
                    "&:hover": { bgcolor: y === year ? INHERIT : alpha(INHERIT, 0.08) },
                  }}
                />
              ))}
            </Stack>
          </Box>
          <Box sx={{ textAlign: { sm: "right" }, flexShrink: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INHERIT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {rows.length}
              <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 0.75 }}>
                วิชา · {fmt(totalCredits)} นก.
              </Typography>
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ใช้กับทุกหลักสูตรชั้น ม.{year}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", mt: 2, p: 1.5, borderRadius: 2, bgcolor: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
      >
        <WarningAmberIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2">
          การแก้ไขเทมเพลตนี้{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>
            มีผลกับทุกหลักสูตร
          </Box>{" "}
          ของชั้น ม.{year} ที่ไม่ได้ตั้งค่ายกเว้น/ปรับเฉพาะไว้
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={48} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={48} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={48} />
          </Box>
        ) : rows.length === 0 ? (
          <Typography variant="body2" sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
            ยังไม่มีวิชาพื้นฐานในชั้นนี้ · เพิ่มได้ด้านล่าง
          </Typography>
        ) : (
          rows.map((r, i) => {
            const area = areaOf(r.SubjectCode);
            const busy = savingId === r.GradeFundamentalID;
            return (
              <Stack
                key={r.GradeFundamentalID}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", opacity: busy ? 0.6 : 1 }}
              >
                <Typography variant="caption" sx={{ width: 20, textAlign: "right", color: "text.disabled", flexShrink: 0 }}>
                  {i + 1}
                </Typography>
                <Box sx={{ width: 4, height: 28, borderRadius: 1, bgcolor: area.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontFamily: "monospace", width: 66, color: "text.secondary", flexShrink: 0 }}>
                  {r.SubjectCode}
                </Typography>
                <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}>
                  {r.subject.SubjectName}
                </Typography>
                <CreditStepper
                  value={r.MinCredits}
                  disabled={busy}
                  onMinus={() => void adjust(r.GradeFundamentalID, r.MinCredits, -0.5)}
                  onPlus={() => void adjust(r.GradeFundamentalID, r.MinCredits, 0.5)}
                />
                <Typography variant="caption" sx={{ color: "text.disabled", flexShrink: 0 }}>
                  นก.
                </Typography>
                <IconButton
                  size="small"
                  disabled={busy}
                  aria-label="ลบ"
                  onClick={() => void remove(r.GradeFundamentalID, r.subject.SubjectName)}
                  sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            );
          })
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ p: 2, bgcolor: alpha(INHERIT, 0.03), alignItems: { sm: "center" } }}>
          <Autocomplete
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
            options={available}
            value={pick}
            onChange={(_, v) => setPick(v)}
            getOptionLabel={(o) => `${o.SubjectCode} · ${o.SubjectName}`}
            isOptionEqualToValue={(o, v) => o.SubjectCode === v.SubjectCode}
            renderInput={(params) => <TextField {...params} placeholder="เลือกวิชาพื้นฐาน (CORE) เพื่อเพิ่ม" />}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!pick || adding}
            onClick={() => void add()}
            sx={{ bgcolor: INHERIT, "&:hover": { bgcolor: INHERIT, filter: "brightness(0.92)" }, flexShrink: 0 }}
          >
            เพิ่มวิชาพื้นฐาน
          </Button>
        </Stack>
      </Paper>

      <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 1.5, px: 0.5 }}>
        การเปลี่ยนแปลงบันทึกทันทีและสะท้อนไปยังทุกหลักสูตรชั้น ม.{year} (ยกเว้นที่ตั้งค่าเฉพาะหลักสูตรไว้)
      </Typography>
    </Container>
  );
}
