"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { formatGradeIdDisplay } from "@/utils/grade-display";

export interface SelectClassRoomModalProps {
  open: boolean;
  year: number;
  availableRooms: string[];
  selected: string[];
  onConfirm: (gradeIds: string[], year: number) => void;
  onClose: () => void;
}

export function SelectClassRoomModal({
  open,
  year,
  availableRooms,
  selected,
  onConfirm,
  onClose,
}: SelectClassRoomModalProps) {
  const [value, setValue] = useState<string[]>(selected);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เลือกชั้นเรียน (ม.{year})</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          เลือกชั้นเรียนของคุณครูที่รับผิดชอบ
        </Typography>
        <ToggleButtonGroup
          value={value}
          onChange={(_event, next: string[]) => setValue(next)}
          aria-label="ชั้นเรียน"
          sx={{ flexWrap: "wrap", gap: 1 }}
        >
          {availableRooms.map((gradeId) => (
            <ToggleButton key={gradeId} value={gradeId} size="small">
              {formatGradeIdDisplay(gradeId)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={() => onConfirm(value, year)}>
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
