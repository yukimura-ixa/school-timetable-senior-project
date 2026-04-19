"use client";

/**
 * ConfigStatusBadge Component
 * Display config status with appropriate colors and actions
 */

import React, { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Edit as DraftIcon,
  Publish as PublishIcon,
  Lock as LockIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { updateConfigStatusAction } from "@/features/config/application/actions/config-lifecycle.actions";

type ConfigStatus = "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";

type Props = {
  configId: string;
  currentStatus: ConfigStatus;
  completeness: number;
  onStatusChange?: () => void;
  readOnly?: boolean;
};

const STATUS_CONFIG = {
  DRAFT: { color: "default" as const, label: "แบบร่าง", icon: DraftIcon },
  PUBLISHED: { color: "success" as const, label: "เผยแพร่", icon: PublishIcon },
  LOCKED: { color: "warning" as const, label: "ล็อก", icon: LockIcon },
  ARCHIVED: { color: "error" as const, label: "เก็บถาวร", icon: ArchiveIcon },
};

export function ConfigStatusBadge({
  configId,
  currentStatus,
  completeness,
  onStatusChange,
  readOnly = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    newStatus: ConfigStatus | null;
  }>({ open: false, newStatus: null });

  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (newStatus: ConfigStatus) => {
    setConfirmDialog({ open: true, newStatus });
    handleCloseMenu();
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.newStatus) return;

    try {
      const result = await updateConfigStatusAction({
        configId,
        status: confirmDialog.newStatus,
      });

      if (result.success) {
        enqueueSnackbar(
          `เปลี่ยนสถานะเป็น ${STATUS_CONFIG[confirmDialog.newStatus].label} สำเร็จ`,
          {
            variant: "success",
          },
        );
        onStatusChange?.();
      } else {
        enqueueSnackbar(result.error?.message || "เกิดข้อผิดพลาด", { variant: "error" });
      }
    } catch (_error) {
      enqueueSnackbar("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ", { variant: "error" });
    }

    setConfirmDialog({ open: false, newStatus: null });
  };

  // Determine available transitions
  const availableTransitions: ConfigStatus[] = [];
  if (currentStatus === "DRAFT") {
    if (completeness >= 30) availableTransitions.push("PUBLISHED");
  } else if (currentStatus === "PUBLISHED") {
    availableTransitions.push("DRAFT", "LOCKED");
  } else if (currentStatus === "LOCKED") {
    availableTransitions.push("PUBLISHED", "ARCHIVED");
  } else if (currentStatus === "ARCHIVED") {
    availableTransitions.push("LOCKED");
  }

  return (
    <>
      <Box
        data-testid="config-status-badge"
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
      >
        <Chip
          icon={<StatusIcon />}
          label={config.label}
          color={config.color}
          size="small"
        />

        {!readOnly && availableTransitions.length > 0 && (
          <IconButton size="small" onClick={handleOpenMenu}>
            <MoreIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Status change menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem disabled sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
          เปลี่ยนสถานะ
        </MenuItem>
        <Divider />
        {availableTransitions.map((status) => {
          const transConfig = STATUS_CONFIG[status];
          const TransIcon = transConfig.icon;
          return (
            <MenuItem key={status} onClick={() => handleStatusClick(status)}>
              <ListItemIcon>
                <TransIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{transConfig.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, newStatus: null })}
      >
        <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
        <DialogContent>
          {confirmDialog.newStatus && (
            <Typography>
              ต้องการเปลี่ยนสถานะจาก <strong>{config.label}</strong> เป็น{" "}
              <strong>{STATUS_CONFIG[confirmDialog.newStatus].label}</strong>{" "}
              ใช่หรือไม่?
            </Typography>
          )}

          {confirmDialog.newStatus === "PUBLISHED" && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
              ⚠️ การเผยแพร่จะทำให้ตารางนี้ปรากฏต่อครูและนักเรียน
            </Typography>
          )}

          {confirmDialog.newStatus === "LOCKED" && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
              🔒 การล็อกจะทำให้ไม่สามารถแก้ไขได้ จนกว่าจะปลดล็อก
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, newStatus: null })}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmStatusChange} variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
