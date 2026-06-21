"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { updateConfigStatusAction } from "@/features/config/application/actions/config-lifecycle.actions";
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

type Props = {
  open: boolean;
  configId: string;
  readinessResult: PublishReadinessResult;
  onClose: () => void;
  onStatusChange?: () => void;
};

export function PublishConfirmDialog({
  open,
  configId,
  readinessResult,
  onClose,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrideReason, setOverrideReason] = useState("");

  const isReady = readinessResult.status === "ready";
  const isOverrideValid = overrideReason.trim().length >= 10;

  const handleClose = () => {
    setOverrideReason("");
    onClose();
  };

  const handlePublish = (force = false) => {
    startTransition(async () => {
      try {
        const result = await updateConfigStatusAction({
          configId,
          status: "PUBLISHED",
          ...(force ? { force: true, reason: overrideReason.trim() } : {}),
        });

        if (result.success) {
          enqueueSnackbar("เผยแพร่ตารางสำเร็จ", { variant: "success" });
          onStatusChange?.();
          router.refresh();
          handleClose();
        } else {
          enqueueSnackbar(result.error?.message ?? "เกิดข้อผิดพลาด", {
            variant: "error",
          });
        }
      } catch {
        enqueueSnackbar("เกิดข้อผิดพลาดในการเผยแพร่", { variant: "error" });
      }
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isReady ? "ยืนยันการเผยแพร่" : "เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข"}
      </DialogTitle>
      <DialogContent>
        {isReady ? (
          <Typography>
            ตารางเรียนนี้พร้อมเผยแพร่แล้ว ครูและนักเรียนจะมองเห็น
          </Typography>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              พบปัญหาที่ยังไม่แก้ไข กรุณาตรวจสอบก่อนเผยแพร่
            </Alert>
            <List dense disablePadding sx={{ mb: 2 }}>
              {readinessResult.issues.map((issue, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={`• ${issue}`}
                    slotProps={{
                      primary: { variant: "body2" },
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <TextField
              data-testid="override-reason-input"
              label="เหตุผลในการเผยแพร่"
              placeholder="ระบุเหตุผลที่ต้องการเผยแพร่ (อย่างน้อย 10 ตัวอักษร)"
              fullWidth
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              helperText={
                overrideReason.length > 0 && !isOverrideValid
                  ? `ต้องการอีก ${10 - overrideReason.trim().length} ตัวอักษร`
                  : " "
              }
              error={overrideReason.length > 0 && !isOverrideValid}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          ยกเลิก
        </Button>
        {isReady ? (
          <Button
            data-testid="confirm-publish-btn"
            variant="contained"
            onClick={() => handlePublish(false)}
            disabled={isPending}
          >
            ยืนยัน
          </Button>
        ) : (
          <Button
            data-testid="force-publish-btn"
            variant="contained"
            color="warning"
            onClick={() => handlePublish(true)}
            disabled={!isOverrideValid || isPending}
          >
            บังคับเผยแพร่
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
