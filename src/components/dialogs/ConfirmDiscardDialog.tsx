"use client";

/**
 * ConfirmDiscardDialog - Confirmation dialog for unsaved changes
 *
 * Used by FormDialog when user attempts to close with dirty state.
 *
 * Usage:
 * ```tsx
 * <ConfirmDiscardDialog
 *   open={showConfirm}
 *   onDiscard={() => closeForm()}
 *   onCancel={() => setShowConfirm(false)}
 * />
 * ```
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export interface ConfirmDiscardDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when user confirms discard */
  onDiscard: () => void;
  /** Called when user cancels (keeps editing) */
  onCancel: () => void;
}

export function ConfirmDiscardDialog({
  open,
  onDiscard,
  onCancel,
}: ConfirmDiscardDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="discard-dialog-title"
      aria-describedby="discard-dialog-description"
    >
      <DialogTitle
        id="discard-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningAmberIcon color="warning" />
        ยกเลิกการแก้ไข?
      </DialogTitle>

      <DialogContent>
        <Typography id="discard-dialog-description" variant="body2">
          คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          หากออกจากหน้านี้ข้อมูลที่แก้ไขจะสูญหาย
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          แก้ไขต่อ
        </Button>
        <Button onClick={onDiscard} variant="contained" color="warning">
          ยกเลิกการแก้ไข
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDiscardDialog;
