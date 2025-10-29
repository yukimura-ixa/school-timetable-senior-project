"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Alert, Button, Container, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bypassEnabled, setBypassEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/dev-bypass-enabled")
      .then((res) => res.json())
      .then((data) => setBypassEnabled(Boolean(data?.enabled)))
      .catch(() => setBypassEnabled(false));
  }, []);

  const validate = () => {
    let ok = true;
    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      ok = false;
    } else if (!email.includes("@")) {
      setEmailError("อีเมลไม่ถูกต้อง");
      ok = false;
    } else setEmailError(null);

    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      ok = false;
    } else setPasswordError(null);

    return ok;
  };

  const handleEmailPassSignIn = async () => {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Use redirect: false to capture auth errors and show feedback
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res) {
        setFormError("ไม่สามารถเข้าสู่ระบบได้ ขัดข้องทางเครือข่าย");
      } else if (res.error) {
        // NextAuth v5 returns error string keys; display a friendly message
        setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (res.ok) {
        // Manual navigation not needed if middleware handles redirect; fallback:
        window.location.href = "/dashboard/select-semester";
      }
    } catch (e) {
      setFormError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => signIn("google", { callbackUrl: "/dashboard/select-semester" });
  const handleDevBypass = () => signIn("dev-bypass", { callbackUrl: "/dashboard/select-semester" });

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ width: "100%" }}>
        <Paper
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: (theme) =>
              `linear-gradient(180deg, ${theme.palette.primary.light}22 0%, ${theme.palette.primary.main}22 100%)`,
          }}
          elevation={0}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            School Timetable Management System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน (มัธยม)
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h5" fontWeight={600}>
                เข้าสู่ระบบ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน
              </Typography>
            </div>

            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validate()}
              error={Boolean(emailError)}
              helperText={emailError ?? ""}
              fullWidth
            />

            <TextField
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validate()}
              error={Boolean(passwordError)}
              helperText={passwordError ?? ""}
              fullWidth
            />

            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={handleEmailPassSignIn}
              disabled={submitting}
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            <Divider>หรือ</Divider>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                fullWidth
              >
                เข้าสู่ระบบด้วย Google
              </Button>
              {bypassEnabled && (
                <Button variant="outlined" onClick={handleDevBypass} fullWidth>
                  Dev Bypass (Testing)
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
