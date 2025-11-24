"use client";

import * as React from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const STUCK_TIMEOUT_MS = 10_000;
const TELEMETRY_ENDPOINT = "/api/telemetry/loading-stuck";

export default function Loading() {
  const [isStuck, setIsStuck] = React.useState(false);
  const [telemetrySent, setTelemetrySent] = React.useState(false);

  React.useEffect(() => {
    const timerId = window.setTimeout(() => setIsStuck(true), STUCK_TIMEOUT_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  React.useEffect(() => {
    if (!isStuck || telemetrySent) {
      return;
    }

    const payload = {
      event: "loading_stuck_banner_shown" as const,
      occurredAt: new Date().toISOString(),
      path: window.location.pathname,
      search: window.location.search || undefined,
    };
    const body = JSON.stringify(payload);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      navigator.sendBeacon(TELEMETRY_ENDPOINT, body);
    } else {
      void fetch(TELEMETRY_ENDPOINT, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }

    setTelemetrySent(true);
  }, [isStuck, telemetrySent]);

  return (
    <>
      {!isStuck && (
        <Backdrop
          open
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="inherit" thickness={4} size={56} />
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, textAlign: "center" }}
            >
              กำลังโหลดข้อมูล...
              <br />
              ระบบกำลังดึงภาคเรียนล่าสุด โปรดรอสักครู่
            </Typography>
          </Stack>
        </Backdrop>
      )}

      {isStuck && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: (theme) => theme.zIndex.snackbar,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              px: 3,
              py: 2,
              maxWidth: 420,
              pointerEvents: "auto",
              borderRadius: 3,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                การโหลดใช้เวลานานผิดปกติ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ตรวจสอบอินเทอร์เน็ตหรือรีเฟรชหน้าเพื่อพยายามอีกครั้ง
                ระบบยังคงแสดงข้อมูล ล่าสุดที่มีเพื่อให้คุณทำงานต่อได้
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  size="small"
                >
                  รีเฟรชหน้า
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setIsStuck(false);
                  }}
                >
                  รอดูต่อ
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}
    </>
  );
}
