"use client";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import ConflictSuggestionList from "./ConflictSuggestionList";
import type {
  ConflictResult,
  ResolutionSuggestion,
  ScheduleArrangementInput,
} from "../../domain/models/conflict.model";

export interface ConflictDetailsModalProps {
  open: boolean;
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  suggestions: ResolutionSuggestion[];
  isLoadingSuggestions: boolean;
  onApply: (s: ResolutionSuggestion) => void | Promise<void>;
  onClose: () => void;
}

export default function ConflictDetailsModal({
  open,
  conflict,
  attempt,
  suggestions,
  isLoadingSuggestions,
  onApply,
  onClose,
}: ConflictDetailsModalProps) {
  const cs = conflict.conflictingSchedule;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          "data-testid": "conflict-modal",
        } as React.ComponentProps<"div">,
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={conflict.conflictType} color="error" size="small" />
          <Typography variant="subtitle1">{conflict.message}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {cs && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ชนกับ:
            </Typography>
            <Stack spacing={0.5}>
              {cs.subjectCode && (
                <Typography variant="body2">
                  วิชา: {cs.subjectCode}
                  {cs.subjectName ? ` (${cs.subjectName})` : ""}
                </Typography>
              )}
              {cs.teacherName && (
                <Typography variant="body2">ครู: {cs.teacherName}</Typography>
              )}
              {cs.roomName && (
                <Typography variant="body2">ห้อง: {cs.roomName}</Typography>
              )}
              {cs.gradeId && (
                <Typography variant="body2">ชั้น: {cs.gradeId}</Typography>
              )}
              {cs.timeslotId && (
                <Typography variant="body2">คาบ: {cs.timeslotId}</Typography>
              )}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            ข้อเสนอแนะ:
          </Typography>
          <ConflictSuggestionList
            suggestions={suggestions}
            isLoading={isLoadingSuggestions}
            onApply={onApply}
          />
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          คาบที่พยายามจัด: {attempt.timeslotId}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}
