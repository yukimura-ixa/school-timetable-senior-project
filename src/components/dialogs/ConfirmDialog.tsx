"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * ConfirmDialog - Reusable confirmation dialog component
 *
 * Usage:
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={open}
 *   title="ยืนยันการลบ"
 *   message="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
 *   variant="danger"
 *   confirmText="ลบ"
 *   cancelText="ยกเลิก"
 *   onConfirm={handleDelete}
 *   onCancel={() => setOpen(false)}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "warning",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <DeleteIcon sx={{ fontSize: 48, color: "error.main" }} />;
      case "warning":
        return (
          <WarningAmberIcon sx={{ fontSize: 48, color: "warning.main" }} />
        );
      case "info":
        return <InfoIcon sx={{ fontSize: 48, color: "info.main" }} />;
      default:
        return <InfoIcon sx={{ fontSize: 48, color: "info.main" }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (variant) {
      case "danger":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        {title}
        {!isLoading && (
          <IconButton
            aria-label="close"
            onClick={onCancel}
            size="small"
            sx={{ color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
          }}
        >
          {getIcon()}
          <Typography
            id="confirm-dialog-description"
            variant="body1"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={isLoading}
          fullWidth
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
          disabled={isLoading}
          fullWidth
          autoFocus
        >
          {isLoading ? "กำลังดำเนินการ..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * useConfirmDialog - Hook for managing confirmation dialog state
 *
 * Usage:
 * ```tsx
 * const confirmDelete = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirmDelete({
 *     title: "ยืนยันการลบ",
 *     message: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
 *     variant: "danger",
 *   });
 *
 *   if (confirmed) {
 *     // Perform delete
 *   }
 * };
 * ```
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    props: Omit<ConfirmDialogProps, "open" | "onConfirm" | "onCancel">;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    props: {
      title: "",
      message: "",
    },
    resolve: null,
  });

  const confirm = React.useCallback(
    (
      props: Omit<ConfirmDialogProps, "open" | "onConfirm" | "onCancel">,
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          open: true,
          props,
          resolve,
        });
      });
    },
    [],
  );

  const handleConfirm = React.useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, open: false }));
  }, [dialogState]);

  const handleCancel = React.useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, open: false }));
  }, [dialogState]);

  const dialog = (
    <ConfirmDialog
      {...dialogState.props}
      open={dialogState.open}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}

export default ConfirmDialog;
