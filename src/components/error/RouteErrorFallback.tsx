"use client";

import { useRouter } from "next/navigation";
import { Button, Stack, Typography, Alert, Collapse } from "@mui/material";
import { useState } from "react";

interface RouteErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string; // e.g. "ครู", "วิชา", "ห้องเรียน"
}

function classifyError(error: Error): {
  isRetryable: boolean;
  thaiMessage: string;
} {
  const msg = error.message.toLowerCase();

  if (
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("network") ||
    msg.includes("503") ||
    msg.includes("econnrefused")
  ) {
    return {
      isRetryable: true,
      thaiMessage: "เกิดปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
    };
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return { isRetryable: false, thaiMessage: "ไม่พบข้อมูลที่ต้องการ" };
  }
  if (
    msg.includes("unauthorized") ||
    msg.includes("unauthenticated") ||
    msg.includes("403") ||
    msg.includes("401")
  ) {
    return {
      isRetryable: false,
      thaiMessage: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบใหม่",
    };
  }
  if (
    msg.includes("constraint") ||
    msg.includes("foreign key") ||
    msg.includes("unique")
  ) {
    return {
      isRetryable: false,
      thaiMessage: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    };
  }
  return { isRetryable: true, thaiMessage: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(
    /postgres|prisma|database|connection|password|secret|dsn|url/gi,
    "[redacted]",
  );
}

export default function RouteErrorFallback({
  error,
  reset,
  context,
}: RouteErrorFallbackProps) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);
  const { isRetryable, thaiMessage } = classifyError(error);
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{ p: 4, minHeight: "50vh" }}
    >
      <Typography variant="h5" color="error">
        ⚠️ เกิดข้อผิดพลาด
      </Typography>

      <Typography variant="body1" color="text.secondary" textAlign="center">
        {context ? `ไม่สามารถโหลดข้อมูล${context}ได้` : thaiMessage}
      </Typography>

      <Stack direction="row" spacing={2}>
        {isRetryable && (
          <Button variant="contained" onClick={reset}>
            ลองใหม่
          </Button>
        )}
        <Button variant="outlined" onClick={() => router.back()}>
          กลับหน้าก่อนหน้า
        </Button>
        <Button variant="text" onClick={() => router.push("/")}>
          กลับหน้าหลัก
        </Button>
      </Stack>

      <Button
        size="small"
        onClick={() => setShowDetail(!showDetail)}
        sx={{ mt: 2 }}
      >
        {showDetail ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
      </Button>
      <Collapse in={showDetail}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontSize: 12 }}
          >
            {sanitizeErrorMessage(error.message)}
          </Typography>
          {isDev && error.stack && (
            <Typography
              variant="caption"
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                mt: 1,
                fontSize: 10,
                color: "text.disabled",
              }}
            >
              {error.stack}
            </Typography>
          )}
        </Alert>
      </Collapse>
    </Stack>
  );
}
