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
      setEmailError("เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธญเธตเน€เธกเธฅ");
      ok = false;
    } else if (!email.includes("@")) {
      setEmailError("เธญเธตเน€เธกเธฅเนเธกเนเธ–เธนเธเธ•เนเธญเธ");
      ok = false;
    } else setEmailError(null);

    if (!password) {
      setPasswordError("เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ");
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
        setFormError("เธญเธตเน€เธกเธฅเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ");
      } else if (data) {
        // Success - better-auth handles redirect via callbackURL
        window.location.href = "/dashboard/select-semester";
      }
    } catch (e) {
      setFormError("เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเน€เธเธฃเธทเธญเธเนเธฒเธข");
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
            เธฃเธฐเธเธเธเธฑเธ”เธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธชเธณเธซเธฃเธฑเธเนเธฃเธเน€เธฃเธตเธขเธ (เธกเธฑเธเธขเธก)
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h5" fontWeight={600}>
                เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เธฃเธฐเธเธเธเธฑเธ”เธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธชเธณเธซเธฃเธฑเธเนเธฃเธเน€เธฃเธตเธขเธ
              </Typography>
            </div>

            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="เธญเธตเน€เธกเธฅ"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validate()}
              error={Boolean(emailError)}
              helperText={emailError ?? ""}
              fullWidth
            />

            <TextField
              label="เธฃเธซเธฑเธชเธเนเธฒเธ"
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
              label="เธเธณเธเธฑเธเนเธงเนเนเธเธฃเธฐเธเธ"
            />

            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={handleEmailPassSignIn}
              disabled={submitting}
            >
              {submitting ? "เธเธณเธฅเธฑเธเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ..." : "เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ"}
            </Button>

            <Divider>เธซเธฃเธทเธญ</Divider>

            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
              data-testid="google-signin-button"
            >
              เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธ”เนเธงเธข Google
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
