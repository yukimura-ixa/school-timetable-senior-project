"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";

/**
 * SignInForm - Client Component
 *
 * Interactive signin form with email/password and Google OAuth authentication.
 * Manages form state, validation, and authentication flow.
 * Marked as "use client" to enable React hooks and browser APIs.
 */
export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      } else if (data) {
        // Success - better-auth handles redirect via callbackURL
        window.location.href = "/dashboard/select-semester";
      }
    } catch (e) {
      setFormError("เกิดข้อผิดพลาด");
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
    <Paper sx={{ flex: 1, p: 4 }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ระบบจัดตารางเรียนตารางสอนสำหรับแรกเรียน
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
  );
}
