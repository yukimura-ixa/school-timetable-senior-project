"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { authClient } from "@/lib/auth-client";

/**
 * ProfilePage - Client Component
 *
 * User profile management page with three sections:
 * 1. Profile Information - Name editing
 * 2. Password - Change password with current password verification
 * 3. Email - Change email with verification flow
 */
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  if (sessionLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!session?.user) {
    router.push("/signin");
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.back()} aria-label="กลับ">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={600}>
            โปรไฟล์ของฉัน
          </Typography>
        </Box>

        {/* Profile Information Section */}
        <ProfileSection
          currentName={session.user.name || ""}
          currentImage={session.user.image || ""}
          onSuccess={(msg) => showSnackbar(msg, "success")}
          onError={(msg) => showSnackbar(msg, "error")}
        />

        {/* Password Section */}
        <PasswordSection
          onSuccess={(msg) => showSnackbar(msg, "success")}
          onError={(msg) => showSnackbar(msg, "error")}
        />

        {/* Email Section */}
        <EmailSection
          currentEmail={session.user.email || ""}
          onSuccess={(msg) => showSnackbar(msg, "success")}
          onError={(msg) => showSnackbar(msg, "error")}
        />
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// ============================================================================
// Profile Information Section
// ============================================================================

interface ProfileSectionProps {
  currentName: string;
  currentImage: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function ProfileSection({
  currentName,
  currentImage,
  onSuccess,
  onError,
}: ProfileSectionProps) {
  const [name, setName] = useState(currentName);
  const [image, setImage] = useState(currentImage);
  const [saving, setSaving] = useState(false);

  // Check if user has a Google OAuth avatar (typically from googleusercontent.com or lh3.google.com)
  const isGoogleAvatar =
    currentImage?.includes("googleusercontent.com") ||
    currentImage?.includes("lh3.google.com");

  const handleSave = async () => {
    if (!name.trim()) {
      onError("กรุณากรอกชื่อ");
      return;
    }

    setSaving(true);
    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
      });

      if (result.error) {
        onError(result.error.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
      } else {
        onSuccess("อัปเดตโปรไฟล์สำเร็จ");
      }
    } catch {
      onError("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = name !== currentName || image !== currentImage;

  // Display avatar URL - use current image or the edited value
  const displayAvatar = image || currentImage;

  return (
    <Card>
      <CardHeader
        avatar={<PersonIcon color="primary" />}
        title={
          <Typography variant="h6" fontWeight={600}>
            ข้อมูลส่วนตัว
          </Typography>
        }
        subheader="แก้ไขชื่อและรูปโปรไฟล์"
      />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {/* Avatar Display */}
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={displayAvatar}
              alt={name || "User"}
              sx={{
                width: 80,
                height: 80,
                fontSize: 32,
                bgcolor: displayAvatar ? undefined : "primary.main",
              }}
            >
              {!displayAvatar && <PersonIcon sx={{ fontSize: 40 }} />}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                รูปโปรไฟล์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isGoogleAvatar
                  ? "ใช้รูปจาก Google Account"
                  : displayAvatar
                    ? "ใช้รูปจาก URL ที่กำหนด"
                    : "ไม่มีรูปโปรไฟล์ (ใช้ไอคอนแทน)"}
              </Typography>
            </Box>
          </Box>

          <TextField
            label="ชื่อ-นามสกุล"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="เช่น นายสมชาย ใจดี"
            helperText="ชื่อที่จะแสดงในระบบ"
          />
          <TextField
            label="URL รูปโปรไฟล์"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            fullWidth
            placeholder="https://example.com/avatar.jpg"
            helperText={
              isGoogleAvatar
                ? "รูปปัจจุบันมาจาก Google - สามารถเปลี่ยนเป็น URL อื่นได้"
                : "ใส่ URL ของรูปภาพ (ไม่บังคับ)"
            }
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Password Section
// ============================================================================

interface PasswordSectionProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function PasswordSection({ onSuccess, onError }: PasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      onError("กรุณากรอกรหัสผ่านปัจจุบัน");
      return;
    }
    if (!newPassword) {
      onError("กรุณากรอกรหัสผ่านใหม่");
      return;
    }
    if (newPassword.length < 8) {
      onError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      onError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (currentPassword === newPassword) {
      onError("รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน");
      return;
    }

    setSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });

      if (result.error) {
        // Handle specific error messages
        if (result.error.message?.includes("incorrect")) {
          onError("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        } else {
          onError(result.error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
        }
      } else {
        onSuccess("เปลี่ยนรหัสผ่านสำเร็จ");
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevokeOtherSessions(false);
      }
    } catch {
      onError("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = currentPassword && newPassword && confirmPassword;

  return (
    <Card>
      <CardHeader
        avatar={<LockIcon color="warning" />}
        title={
          <Typography variant="h6" fontWeight={600}>
            เปลี่ยนรหัสผ่าน
          </Typography>
        }
        subheader="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
      />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          <TextField
            label="รหัสผ่านปัจจุบัน"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    aria-label={
                      showCurrentPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                    }
                  >
                    {showCurrentPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="รหัสผ่านใหม่"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            helperText={
              newPassword && newPassword.length < 8
                ? "รหัสผ่านสั้นเกินไป (ต้องมีอย่างน้อย 8 ตัวอักษร)"
                : ""
            }
            error={Boolean(newPassword && newPassword.length < 8)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    aria-label={
                      showNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                    }
                  >
                    {showNewPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            helperText={
              confirmPassword && confirmPassword !== newPassword
                ? "รหัสผ่านไม่ตรงกัน"
                : ""
            }
            error={Boolean(confirmPassword && confirmPassword !== newPassword)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={revokeOtherSessions}
                onChange={(e) => setRevokeOtherSessions(e.target.checked)}
              />
            }
            label="ออกจากระบบในอุปกรณ์อื่นทั้งหมด"
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="warning"
              startIcon={saving ? <CircularProgress size={20} /> : <LockIcon />}
              onClick={handleChangePassword}
              disabled={saving || !canSubmit}
            >
              {saving ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Email Section
// ============================================================================

interface EmailSectionProps {
  currentEmail: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function EmailSection({ currentEmail, onSuccess, onError }: EmailSectionProps) {
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail) {
      onError("กรุณากรอกอีเมลใหม่");
      return;
    }
    if (!newEmail.includes("@")) {
      onError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    if (newEmail === currentEmail) {
      onError("อีเมลใหม่ต้องไม่เหมือนกับอีเมลปัจจุบัน");
      return;
    }

    setSaving(true);
    try {
      const result = await authClient.changeEmail({
        newEmail,
        callbackURL: "/dashboard/profile",
      });

      if (result.error) {
        onError(result.error.message || "ไม่สามารถเปลี่ยนอีเมลได้");
      } else {
        onSuccess("ส่งลิงก์ยืนยันไปยังอีเมลใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ");
        setNewEmail("");
      }
    } catch {
      onError("เกิดข้อผิดพลาดในการเปลี่ยนอีเมล");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<EmailIcon color="info" />}
        title={
          <Typography variant="h6" fontWeight={600}>
            เปลี่ยนอีเมล
          </Typography>
        }
        subheader="จะส่งลิงก์ยืนยันไปยังอีเมลใหม่"
      />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          <TextField
            label="อีเมลปัจจุบัน"
            value={currentEmail}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            label="อีเมลใหม่"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            fullWidth
            placeholder="example@email.com"
            helperText="ระบบจะส่งลิงก์ยืนยันไปยังอีเมลใหม่นี้"
          />
          <Alert severity="info" variant="outlined">
            การเปลี่ยนอีเมลจะต้องยืนยันผ่านลิงก์ที่ส่งไปยังอีเมลใหม่
            อีเมลจะเปลี่ยนหลังจากยืนยันสำเร็จเท่านั้น
          </Alert>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="info"
              startIcon={
                saving ? <CircularProgress size={20} /> : <EmailIcon />
              }
              onClick={handleChangeEmail}
              disabled={saving || !newEmail}
            >
              {saving ? "กำลังส่ง..." : "ส่งลิงก์ยืนยัน"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
