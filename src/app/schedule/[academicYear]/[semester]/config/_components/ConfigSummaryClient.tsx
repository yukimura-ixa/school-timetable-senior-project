"use client";

import { useState } from "react";
import useSWR from "swr";
import { getBreakGroupsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { ConfigureTimeslotsDialog } from "@/app/dashboard/_components/ConfigureTimeslotsDialog";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import type { ConfigData } from "@/features/config/domain/types/config-data.types";

// ─── types ────────────────────────────────────────────────────────────────────

type SemesterConfigRow = {
  ConfigID: string;
  AcademicYear: number;
  Semester: number;
  Config: unknown;
  status: "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";
};

type ApiResponse = {
  success: boolean;
  data: SemesterConfigRow | null;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const DAY_TH: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
};

const STATUS_LABEL: Record<SemesterConfigRow["status"], string> = {
  DRAFT: "แบบร่าง",
  PUBLISHED: "เผยแพร่แล้ว",
  LOCKED: "ล็อกแล้ว",
  ARCHIVED: "เก็บถาวร",
};

const STATUS_COLOR: Record<
  SemesterConfigRow["status"],
  "default" | "info" | "success" | "warning"
> = {
  DRAFT: "default",
  PUBLISHED: "success",
  LOCKED: "warning",
  ARCHIVED: "default",
};

function fetcher(url: string) {
  return fetch(url, { credentials: "include" }).then((r) => r.json());
}

// ─── component ────────────────────────────────────────────────────────────────

interface Props {
  academicYear: number;
  semester: 1 | 2;
  configId: string;
}

export function ConfigSummaryClient({ academicYear, semester, configId }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/schedule-config/${academicYear}/${semester}`,
    fetcher,
  );

  const semesterEnum = semester === 1 ? "SEMESTER_1" : "SEMESTER_2" as const;
  const { data: breakGroupsData } = useSWR(
    `break-groups/${academicYear}/${semester}`,
    () => getBreakGroupsByTermAction({ AcademicYear: academicYear, Semester: semesterEnum }),
  );
  const breakGroupCount = breakGroupsData?.success ? (breakGroupsData.data?.length ?? 0) : 0;

  if (isLoading) {
    return (
      <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error || !data?.success) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        โหลดข้อมูลการตั้งค่าไม่สำเร็จ กรุณาลองใหม่
      </Alert>
    );
  }

  const row = data.data;

  // ── empty state ──────────────────────────────────────────────────────────
  if (!row) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          ยังไม่มีการตั้งค่าตารางเรียนสำหรับภาคเรียนนี้
        </Alert>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          ตั้งค่าคาบเรียน
        </Button>

        <ConfigureTimeslotsDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            setDialogOpen(false);
            void mutate();
          }}
          academicYear={academicYear}
          semester={semester}
          configId={configId}
          mode="create"
        />
      </Box>
    );
  }

  // ── parse config ─────────────────────────────────────────────────────────
  let parsed: ConfigData | null = null;
  try {
    parsed = parseConfigData(row.Config);
  } catch {
    // Config stored in DB is malformed — treat as empty + allow re-create
  }

  const isDraft = row.status === "DRAFT";

  return (
    <Box sx={{ py: 2 }}>
      {/* Status chip */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Chip
          label={STATUS_LABEL[row.status]}
          color={STATUS_COLOR[row.status]}
          size="small"
          data-testid="config-status-badge"
        />
        {!isDraft && (
          <Typography variant="caption" color="text.secondary">
            การตั้งค่าถูกล็อกแล้ว — แก้ไขได้เฉพาะในสถานะแบบร่าง
          </Typography>
        )}
      </Stack>

      {parsed ? (
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: "40%" }}>
                  คาบเรียนต่อวัน
                </TableCell>
                <TableCell>{parsed.TimeslotPerDay} คาบ</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ความยาวคาบ</TableCell>
                <TableCell>{parsed.Duration} นาที/คาบ</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>เวลาเริ่ม</TableCell>
                <TableCell>{parsed.StartTime} น.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>วันเรียน</TableCell>
                <TableCell>
                  {parsed.Days.map((d) => DAY_TH[d] ?? d).join(", ")}
                </TableCell>
              </TableRow>
              {breakGroupCount > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>กลุ่มพักกลางวัน</TableCell>
                  <TableCell>{breakGroupCount} กลุ่ม</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ข้อมูลการตั้งค่าอยู่ในรูปแบบที่ไม่รู้จัก — กรุณาบันทึกใหม่
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />

      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        disabled={!isDraft}
        onClick={() => setDialogOpen(true)}
      >
        แก้ไขการตั้งค่า
      </Button>

      <ConfigureTimeslotsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          void mutate();
        }}
        academicYear={academicYear}
        semester={semester}
        configId={configId}
        mode={parsed ? "edit" : "create"}
        initialConfig={parsed ?? undefined}
      />
    </Box>
  );
}
