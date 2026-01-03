"use client";

import React, { useState } from "react";
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
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { colors, gradients, glowEffectSx } from "@/shared/design-system";
import { authClient } from "@/lib/auth-client";

type Props = {
  token?: string;
  error?: string;
};

export default function ResetPasswordPageClient({ token, error }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(error ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    if (!token) {
      setFormError("ลิงก์ไม่ถูกต้องหรือหมดอายุ");
      return false;
    }
    if (!newPassword || newPassword.length < 8) {
      setFormError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setFormError("รหัสผ่านไม่ตรงกัน");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword,
        token: token!,
      });

      if (authError) {
        setFormError(authError.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
      } else {
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
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
                {done ? <CheckCircleIcon /> : <LockResetIcon />}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  รีเซ็ตรหัสผ่าน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กำหนดรหัสผ่านใหม่เพื่อเข้าใช้งานระบบ
                </Typography>
              </Box>
            </Stack>

            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            {done ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                รีเซ็ตรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
              </Alert>
            ) : (
              <>
                <TextField
                  label="รหัสผ่านใหม่"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  autoComplete="new-password"
                />
                <TextField
                  label="ยืนยันรหัสผ่านใหม่"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  autoComplete="new-password"
                />
              </>
            )}

            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Link href="/signin" style={{ textDecoration: "none" }}>
                <Button startIcon={<ArrowBackIcon />} variant="text">
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>

              {!done && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
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
                  ตั้งรหัสผ่านใหม่
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
