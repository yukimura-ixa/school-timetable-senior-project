"use client";

/**
 * SignInForm - Premium glassmorphism sign-in form
 *
 * Features:
 * - Glassmorphism card with subtle glow
 * - Modern input styling with floating labels
 * - Gradient buttons with hover animations
 * - Google OAuth integration
 */

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createClientLogger } from "@/lib/client-logger";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  colors,
  gradients,
  animations,
  iconBoxSx,
  glowEffectSx,
} from "@/shared/design-system";

const log = createClientLogger("SignInForm");

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
            log.info(
              "Authentication successful, verifying session and role...",
            );

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
                    log.warn("Non-admin user attempted login", {
                      role: userRole,
                    });
                    await authClient.signOut();
                    setFormError(
                      "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าสู่ระบบได้",
                    );
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
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleEmailPassSignIn();
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          overflow: "hidden",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(colors.slate[800], 0.95)} 0%, ${alpha(colors.slate[900], 0.98)} 100%)`
              : `linear-gradient(135deg, ${alpha("#fff", 0.95)} 0%, ${alpha(colors.slate[50], 0.98)} 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(colors.blue.main, 0.15)}`,
          boxShadow: `0 20px 60px ${alpha(colors.slate[900], 0.15)}`,
          p: 4,
        }}
      >
        {/* Decorative glow */}
        <Box
          sx={{
            ...glowEffectSx(gradients.blue, "topRight", 150),
            opacity: 0.15,
          }}
        />

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Header */}
            <Stack spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  ...iconBoxSx(gradients.blue, colors.blue.main, "large"),
                  animation: animations.scaleIn,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 28, color: "white" }} />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    letterSpacing: "-0.02em",
                  }}
                >
                  เข้าสู่ระบบ
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  ระบบจัดตารางเรียนสำหรับผู้ดูแล
                </Typography>
              </Box>
            </Stack>

            {/* Error Alert */}
            {formError && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(colors.red.main, 0.1),
                  border: `1px solid ${alpha(colors.red.main, 0.2)}`,
                }}
              >
                {formError}
              </Alert>
            )}

            {/* Email Field */}
            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validate()}
              error={Boolean(emailError)}
              helperText={emailError ?? ""}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 0 0 3px ${alpha(colors.blue.main, 0.1)}`,
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(colors.blue.main, 0.15)}`,
                  },
                },
              }}
            />

            {/* Password Field */}
            <TextField
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validate()}
              error={Boolean(passwordError)}
              helperText={passwordError ?? ""}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 0 0 3px ${alpha(colors.blue.main, 0.1)}`,
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(colors.blue.main, 0.15)}`,
                  },
                },
              }}
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: colors.blue.main,
                    "&.Mui-checked": {
                      color: colors.blue.main,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  จำฉันไว้ในระบบ
                </Typography>
              }
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background: gradients.blue,
                boxShadow: `0 8px 24px ${alpha(colors.blue.main, 0.35)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: gradients.blue,
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px ${alpha(colors.blue.main, 0.45)}`,
                },
                "&:disabled": {
                  background: alpha(colors.slate[500], 0.3),
                },
              }}
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            {/* Divider */}
            <Divider sx={{ color: "text.secondary" }}>
              <Typography variant="caption" color="text.secondary">
                หรือ
              </Typography>
            </Divider>

            {/* Google Button */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
              data-testid="google-signin-button"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                borderColor: alpha(colors.slate[400], 0.3),
                color: "text.primary",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: colors.blue.main,
                  bgcolor: alpha(colors.blue.main, 0.05),
                  transform: "translateY(-1px)",
                },
              }}
            >
              เข้าสู่ระบบด้วย Google
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
