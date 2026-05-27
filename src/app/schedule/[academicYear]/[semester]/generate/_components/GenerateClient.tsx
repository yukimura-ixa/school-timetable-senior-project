"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type Failure = {
  respId: number;
  subjectCode: string;
  gradeId: string;
  reason: string;
};

type PerTeacher = {
  teacherId: number;
  placed: number;
  failed: number;
  totalToPlace: number;
};

type Stats = {
  totalSubjectsToPlace: number;
  successfullyPlaced: number;
  failed: number;
  durationMs: number;
  qualityScore: number;
};

type GenerateResult = {
  success: boolean;
  failures: Failure[];
  perTeacher: PerTeacher[];
  stats: Stats;
  message?: string;
};

type Props = {
  academicYear: string;
  semester: string;
  reviewHref: string;
};

export function GenerateClient({ academicYear, semester, reviewHref }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/schedule/auto-arrange-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear, semester }),
      });
      const data = (await res.json()) as GenerateResult;
      if (!res.ok || !data.success) {
        setError(data.message ?? "สร้างตารางไม่สำเร็จ");
        // Partial results may still be present; show what we have.
        if (data.stats) setResult(data);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const stats = result?.stats;
  const completion =
    stats && stats.totalSubjectsToPlace > 0
      ? Math.round((stats.successfullyPlaced / stats.totalSubjectsToPlace) * 100)
      : 0;

  return (
    <Box sx={{ py: 2 }}>
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          สร้างตารางสอนอัตโนมัติทั้งโรงเรียน
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ระบบจะจัดคาบของครูทุกคนตามภาระงานสอน
          โดยหลีกเลี่ยงการชนกันของครู ห้อง และระดับชั้น
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AutoFixHighIcon />
            )
          }
          disabled={loading}
          onClick={() => setConfirmOpen(true)}
        >
          {loading ? "กำลังสร้าง..." : "สร้างตารางอัตโนมัติทั้งโรงเรียน"}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "space-between", flexWrap: "wrap", mb: 2 }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                จัดสำเร็จ
              </Typography>
              <Typography variant="h5">
                {stats.successfullyPlaced}/{stats.totalSubjectsToPlace} คาบ
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                ไม่สำเร็จ
              </Typography>
              <Typography
                variant="h5"
                color={stats.failed > 0 ? "error" : "text.primary"}
              >
                {stats.failed} คาบ
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                คุณภาพ
              </Typography>
              <Typography variant="h5">{stats.qualityScore}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                เวลาที่ใช้
              </Typography>
              <Typography variant="h5">{stats.durationMs} ms</Typography>
            </Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={completion}
            color={stats.failed > 0 ? "warning" : "success"}
            sx={{ height: 8, borderRadius: 4 }}
          />

          {result && result.failures.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                คาบที่จัดไม่สำเร็จ ({result.failures.length}) —
                จัดด้วยตนเองในขั้นตอนถัดไป
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>วิชา</TableCell>
                    <TableCell>ระดับชั้น</TableCell>
                    <TableCell>เหตุผล</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.failures.map((f) => (
                    <TableRow key={`${f.respId}-${f.subjectCode}-${f.gradeId}`}>
                      <TableCell>{f.subjectCode}</TableCell>
                      <TableCell>{f.gradeId}</TableCell>
                      <TableCell>{f.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              component={Link}
              href={reviewHref}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              ไปขั้นตอนตรวจและปรับ
            </Button>
          </Box>
        </Paper>
      )}

      {result && result.perTeacher.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            ผลรายครู
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>รหัสครู</TableCell>
                <TableCell align="right">จัดสำเร็จ</TableCell>
                <TableCell align="right">ทั้งหมด</TableCell>
                <TableCell align="right">สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.perTeacher.map((t) => (
                <TableRow key={t.teacherId}>
                  <TableCell>{t.teacherId}</TableCell>
                  <TableCell align="right">{t.placed}</TableCell>
                  <TableCell align="right">{t.totalToPlace}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={t.failed === 0 ? "ครบ" : `ขาด ${t.failed}`}
                      color={t.failed === 0 ? "success" : "warning"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>ยืนยันการสร้างตารางอัตโนมัติ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ระบบจะจัดคาบเรียนของครูทุกคนสำหรับภาคเรียนนี้
            คาบที่ล็อกไว้และคาบที่จัดแล้วจะไม่ถูกแก้ไข
            คุณสามารถปรับแก้ด้วยตนเองได้ในขั้นตอนถัดไป
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>ยกเลิก</Button>
          <Button onClick={run} variant="contained" autoFocus>
            สร้างตาราง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
