"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createClientLogger } from "@/lib/client-logger";
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

const log = createClientLogger("SignInForm");

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
    log.debug("Email/password signin initiated");
    setFormError(null);
    if (!validate()) {
      log.debug("Validation failed");
      return;
    }

    log.debug("Submitting authentication request");
    setSubmitting(true);
    try {
      await authClient.signIn.email(
        {
          email,
          password,
          rememberMe,
        },
        {
          onSuccess: async () => {
            log.info("Authentication successful, verifying session and role...");
            
            // Wait for session to be established and verify admin role
            let attempts = 0;
            const maxAttempts = 10;
            while (attempts < maxAttempts) {
              try {
                const session = await authClient.getSession();
                if (session?.data?.user) {
                  const userRole = session.data.user.role;
                  
                  // Admin-only: block non-admin login
                  if (userRole !== "admin") {
                    log.warn("Non-admin user attempted login", { role: userRole });
                    // Sign out the non-admin user
                    await authClient.signOut();
                    setFormError("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าสู่ระบบได้");
                    setSubmitting(false);
                    return;
                  }
                  
                  log.info("Admin session verified, navigating to dashboard");
                  window.location.href = "/dashboard";
                  return;
                }
              } catch {
                // Session not ready yet
              }
              attempts++;
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
            
            // Fallback: navigate anyway after timeout
            log.warn("Session verification timed out, navigating anyway");
            window.location.href = "/dashboard";
          },
          onError: (ctx) => {
            log.error("Authentication failed", { error: ctx.error.message });
            setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            setSubmitting(false);
          },
        },
      );
    } catch (err) {
      log.logError(err, { action: "signin" });
      setFormError("เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Better Auth handles Google OAuth flow and redirect
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
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
