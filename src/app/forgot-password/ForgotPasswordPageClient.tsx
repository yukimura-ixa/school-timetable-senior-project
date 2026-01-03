"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailLockIcon from "@mui/icons-material/MailLock";
import { colors, gradients, glowEffectSx } from "@/shared/design-system";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email || !email.includes("@")) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (cooldown > 0) return;

    setSubmitting(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "";

      const { error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo,
      });

      if (authError) {
        setError("ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้");
      } else {
        setSuccess(true);
        setCooldown(60);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: `
          radial-gradient(circle at 20% 20%, ${alpha(colors.blue.main, 0.08)} 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${alpha(colors.violet.main, 0.06)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(colors.emerald.main, 0.04)} 0%, transparent 50%),
          linear-gradient(180deg, ${colors.slate[50]} 0%, ${colors.slate[100]} 100%)
        `,
        py: 6,
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha("#fff", 0.95)} 0%, ${alpha(colors.slate[50], 0.98)} 100%)`,
            border: `1px solid ${alpha(colors.blue.main, 0.15)}`,
            boxShadow: `0 20px 60px ${alpha(colors.slate[900], 0.12)}`,
            p: { xs: 3, md: 4 },
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              ...glowEffectSx(gradients.blue, "topRight", 140),
              opacity: 0.12,
            }}
          />

          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: gradients.blue,
                  color: "white",
                  boxShadow: `0 10px 30px ${alpha(colors.blue.main, 0.3)}`,
                }}
              >
                <MailLockIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ลืมรหัสผ่าน?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
                </Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว หากไม่พบให้ตรวจสอบโฟลเดอร์สแปม
              </Alert>
            )}

            <TextField
              label="อีเมลสำหรับรับลิงก์รีเซ็ตรหัสผ่าน"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={submitting}
              helperText={cooldown ? `ส่งใหม่ได้อีก ${cooldown} วินาที` : ""}
            />

            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Link href="/signin" style={{ textDecoration: "none" }}>
                <Button startIcon={<ArrowBackIcon />} variant="text">
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting || cooldown > 0}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                  background: gradients.blue,
                  boxShadow: `0 12px 30px ${alpha(colors.blue.main, 0.35)}`,
                  "&:hover": {
                    background: gradients.blue,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {success ? "ส่งอีกครั้ง" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
