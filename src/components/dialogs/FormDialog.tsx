"use client";

/**
 * FormDialog - Canonical form dialog component
 *
 * Design System: docs/ux/form-dialogs-spec.md
 *
 * Features:
 * - MUI Dialog primitives with proper accessibility (aria-labelledby, aria-describedby)
 * - Size variants: sm (400px), md (600px), lg (900px)
 * - Mobile-first: fullscreen on xs breakpoint by default
 * - Dirty state protection with ConfirmDiscardDialog
 * - Proper onClose handling for backdropClick/escapeKeyDown
 * - Loading state support
 * - Focus trap (handled by MUI Dialog)
 *
 * Usage:
 * ```tsx
 * <form action={createTeacherAction}>
 *   <FormDialog open={open} onClose={handleClose} title="เพิ่มครู" size="md">
 *     <input name="firstname" required />
 *     <FormDialogActions>
 *       <Button type="button" onClick={onClose}>ยกเลิก</Button>
 *       <SubmitButton>เพิ่ม</SubmitButton>
 *     </FormDialogActions>
 *   </FormDialog>
 * </form>
 * ```
 */

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ConfirmDiscardDialog } from "./ConfirmDiscardDialog";

// Size mappings
const SIZE_MAP = {
  sm: "xs" as const, // 400px
  md: "sm" as const, // 600px
  lg: "md" as const, // 900px
} as const;

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Dialog title (Thai or English) */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Dialog size: sm (~400px), md (~600px), lg (~900px) */
  size?: "sm" | "md" | "lg";
  /** Become fullscreen on mobile (default: true) */
  fullScreenOnMobile?: boolean;
  /** Whether form is in a loading state (disables close) */
  loading?: boolean;
  /** Whether form has unsaved changes (triggers discard confirmation) */
  dirty?: boolean;
  /** Disable backdrop close when dirty (default: true) */
  disableBackdropCloseWhenDirty?: boolean;
  /** Dialog content (form fields) */
  children: React.ReactNode;
  /** Custom CSS class for the dialog paper */
  className?: string;
}

export function FormDialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  fullScreenOnMobile = true,
  loading = false,
  dirty = false,
  disableBackdropCloseWhenDirty = true,
  children,
  className,
}: FormDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Generate unique IDs for accessibility
  const titleId = React.useId();
  const descriptionId = React.useId();

  const handleClose = useCallback(
    (event: object, reason?: "backdropClick" | "escapeKeyDown") => {
      // Don't allow closing while loading
      if (loading) return;

      // If dirty and closing via backdrop/escape, show confirmation
      if (dirty && disableBackdropCloseWhenDirty) {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          setShowDiscardConfirm(true);
          return;
        }
      }

      onClose();
    },
    [loading, dirty, disableBackdropCloseWhenDirty, onClose],
  );

  const handleCloseButtonClick = useCallback(() => {
    if (loading) return;

    if (dirty) {
      setShowDiscardConfirm(true);
      return;
    }

    onClose();
  }, [loading, dirty, onClose]);

  const handleDiscardConfirm = useCallback(() => {
    setShowDiscardConfirm(false);
    onClose();
  }, [onClose]);

  const handleDiscardCancel = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={SIZE_MAP[size]}
        fullWidth
        fullScreen={fullScreenOnMobile && isMobile}
        scroll="paper"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        slotProps={{
          paper: {
            className: `rounded-xl ${className || ""}`,
          },
        }}
      >
        <DialogTitle
          id={titleId}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: description ? 0 : 2,
          }}
        >
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseButtonClick}
            disabled={loading}
            size="small"
            sx={{ color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {description && (
          <Typography
            id={descriptionId}
            variant="body2"
            color="text.secondary"
            sx={{ px: 3, pb: 2 }}
          >
            {description}
          </Typography>
        )}

        <DialogContent dividers>{children}</DialogContent>
      </Dialog>

      <ConfirmDiscardDialog
        open={showDiscardConfirm}
        onDiscard={handleDiscardConfirm}
        onCancel={handleDiscardCancel}
      />
    </>
  );
}

/**
 * FormDialogActions - Wrapper for dialog action buttons
 *
 * Provides consistent button layout: Cancel (left) → Primary (right)
 */
export function FormDialogActions({ children }: { children: React.ReactNode }) {
  return (
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{children}</DialogActions>
  );
}

export default FormDialog;
