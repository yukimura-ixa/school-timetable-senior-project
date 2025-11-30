"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

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
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/dashboard/select-semester",
      });

      if (error) {
        setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
      // Let better-auth handle redirect via callbackURL (preserves session cookies)
    } catch (e) {
      setFormError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/select-semester",
    });
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{ width: "100%" }}
      >
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="จำฉันไว้ในระบบ"
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

            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
              data-testid="google-signin-button"
            >
              เข้าสู่ระบบด้วย Google
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
