"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import BrushIcon from "@mui/icons-material/Brush";
import { TeacherPicker, type TeacherPickerOption } from "./TeacherPicker";

interface TeacherBrushProps {
  teachers: TeacherPickerOption[];
  brushTeacher: TeacherPickerOption | null;
  onBrushTeacherChange: (teacher: TeacherPickerOption | null) => void;
  brushActive: boolean;
  onToggle: () => void;
}

export function TeacherBrush({
  teachers,
  brushTeacher,
  onBrushTeacherChange,
  brushActive,
  onToggle,
}: TeacherBrushProps) {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
      <IconButton
        aria-label="brush"
        color={brushActive ? "primary" : "default"}
        onClick={onToggle}
        size="small"
      >
        <BrushIcon />
      </IconButton>
      <Box sx={{ minWidth: 220 }}>
        <TeacherPicker
          teachers={teachers}
          value={brushTeacher}
          onChange={onBrushTeacherChange}
          disabled={false}
        />
      </Box>
    </Box>
  );
}
