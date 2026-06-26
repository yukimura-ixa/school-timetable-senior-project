/**
 * Inherited fundamentals (CORE) section of the assignment editor.
 *
 * CORE subjects are inherited by reference from the program's grade template
 * (grade_fundamental), shared across every program of that grade. They are not
 * part of the owned catalog/basket flow. Each row is read-only identity with
 * per-program controls that write a program_fundamental_override immediately:
 * exclude the subject, override its credits, or clear back to the template.
 */

import { useState } from "react";
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useSnackbar } from "notistack";
import {
  setFundamentalOverrideAction,
  clearFundamentalOverrideAction,
} from "@/features/program/application/actions/program.actions";
import type { InheritedFundamental } from "@/features/program/presentation/hooks/useProgramSubjects";
import { moeArea as areaOf } from "@/features/program/domain/moe-learning-area";

const INHERIT = "#475569"; // slate — the shared "reference / linked to template" tone

const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
const clampCredit = (n: number) => Math.max(0, Math.min(9, Math.round(n * 2) / 2));

function CreditStepper({
  value,
  color,
  disabled,
  onMinus,
  onPlus,
}: {
  value: number;
  color: string;
  disabled?: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const btn = { borderRadius: 0, width: 26, height: 26, color } as const;
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
        <RemoveIcon sx={{ fontSize: 15 }} />
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          width: 34,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
        }}
      >
        {fmt(value)}
      </Typography>
      <IconButton size="small" onClick={onPlus} disabled={disabled} sx={btn} aria-label="เพิ่มหน่วยกิต">
        <AddIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Box>
  );
}

export function InheritedFundamentalsSection({
  programId,
  year,
  accent,
  inherited,
  onChanged,
}: {
  programId: number;
  year?: number;
  accent: string;
  inherited: InheritedFundamental[];
  onChanged: () => Promise<unknown>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [editing, setEditing] = useState<Set<string>>(new Set());

  if (inherited.length === 0) return null;

  const run = async (code: string, action: () => Promise<unknown>, ok: string) => {
    setSavingCode(code);
    // try/catch without finally: catch swallows the error, so the reset below
    // runs on every path while staying React Compiler friendly (no finalizer).
    try {
      await action();
      await onChanged();
      enqueueSnackbar(ok, { variant: "success" });
    } catch {
      enqueueSnackbar("บันทึกไม่สำเร็จ", { variant: "error" });
    }
    setSavingCode(null);
  };

  const exclude = (code: string) =>
    run(
      code,
      () => setFundamentalOverrideAction({ ProgramID: programId, SubjectCode: code, Excluded: true }),
      "ยกเว้นวิชานี้แล้ว",
    );

  const restore = (code: string) => {
    setEditing((p) => {
      const n = new Set(p);
      n.delete(code);
      return n;
    });
    return run(
      code,
      () => clearFundamentalOverrideAction({ ProgramID: programId, SubjectCode: code }),
      "คืนค่าตามเทมเพลตแล้ว",
    );
  };

  const overrideCredit = (code: string, value: number) =>
    run(
      code,
      () =>
        setFundamentalOverrideAction({
          ProgramID: programId,
          SubjectCode: code,
          Excluded: false,
          MinCredits: clampCredit(value),
        }),
      "ปรับหน่วยกิตแล้ว",
    );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", borderLeft: `3px solid ${INHERIT}` }}>
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: "center",
          p: 2,
          bgcolor: alpha(INHERIT, 0.06),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: alpha(INHERIT, 0.3),
            color: INHERIT,
          }}
        >
          <LinkIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            สืบทอดจากเทมเพลตชั้น{year != null ? ` ม.${year}` : ""}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            ใช้ร่วมกับทุกหลักสูตรชั้นนี้ · ปรับเฉพาะที่นี่ได้
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: INHERIT, fontWeight: 700, flexShrink: 0 }}>
          {inherited.length} วิชา
        </Typography>
      </Stack>

      {inherited.map((row) => {
        const area = areaOf(row.SubjectCode);
        const busy = savingCode === row.SubjectCode;
        const showStepper = row.overridden || editing.has(row.SubjectCode);
        return (
          <Stack
            key={row.SubjectCode}
            data-testid={`inherited-row-${row.SubjectCode}`}
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              px: 2,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 30,
                borderRadius: 1,
                flexShrink: 0,
                bgcolor: area.color,
                opacity: row.excluded ? 0.3 : 1,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                width: 64,
                flexShrink: 0,
                color: row.excluded ? "text.disabled" : "text.secondary",
              }}
            >
              {row.SubjectCode}
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                flex: 1,
                minWidth: 0,
                fontWeight: 500,
                color: row.excluded ? "text.disabled" : "text.primary",
                textDecoration: row.excluded ? "line-through" : "none",
              }}
            >
              {row.subject.SubjectName}
            </Typography>

            {row.excluded ? (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexShrink: 0 }}>
                <Chip size="small" label="ยกเว้นแล้ว" sx={{ bgcolor: "action.selected", color: "text.disabled", fontWeight: 600 }} />
                <Button size="small" disabled={busy} onClick={() => void restore(row.SubjectCode)} sx={{ color: "text.secondary", minWidth: 0 }}>
                  คืนค่า
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexShrink: 0 }}>
                {showStepper ? (
                  <>
                    <CreditStepper
                      value={row.MinCredits}
                      color={accent}
                      disabled={busy}
                      onMinus={() => void overrideCredit(row.SubjectCode, row.MinCredits - 0.5)}
                      onPlus={() => void overrideCredit(row.SubjectCode, row.MinCredits + 0.5)}
                    />
                    {row.overridden && (
                      <Chip size="small" label="ปรับแล้ว" sx={{ bgcolor: alpha(accent, 0.14), color: accent, fontWeight: 700 }} />
                    )}
                    {row.overridden && (
                      <Button size="small" disabled={busy} onClick={() => void restore(row.SubjectCode)} sx={{ color: "text.secondary", minWidth: 0 }}>
                        ล้างค่า
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      data-testid={`inherited-credit-${row.SubjectCode}`}
                      sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums", mr: 0.5 }}
                    >
                      {fmt(row.MinCredits)} นก.
                    </Typography>
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() =>
                        setEditing((p) => new Set(p).add(row.SubjectCode))
                      }
                      sx={{ color: "text.secondary", minWidth: 0 }}
                    >
                      ปรับหน่วยกิต
                    </Button>
                  </>
                )}
                <Button size="small" disabled={busy} onClick={() => void exclude(row.SubjectCode)} sx={{ color: "text.secondary", minWidth: 0, "&:hover": { color: "error.main" } }}>
                  ยกเว้น
                </Button>
              </Stack>
            )}
          </Stack>
        );
      })}

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", px: 2, py: 1.25, bgcolor: alpha(INHERIT, 0.03) }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          ℹ️ การยกเว้น/ปรับหน่วยกิตที่นี่มีผล
          <Box component="span" sx={{ color: INHERIT, fontWeight: 700 }}>
            {" "}เฉพาะหลักสูตรนี้
          </Box>{" "}
          (หลักสูตรอื่นของชั้นไม่เปลี่ยน) · บันทึกทันที
        </Typography>
      </Stack>
    </Paper>
  );
}
