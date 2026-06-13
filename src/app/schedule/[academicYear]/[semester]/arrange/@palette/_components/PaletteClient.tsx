/**
 * Palette Client Component
 *
 * Displays searchable, draggable subject list.
 * Users can search subjects and drag them to the grid.
 */

"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import { useDraggable } from "@dnd-kit/core";

type Subject = {
  RespID: number;
  SubjectCode: string;
  SubjectName: string;
  Credits: number;
  GradeID: string;
  GradeName: string;
  Year: number;
  DefaultRoomID: number | null;
};

type Props = {
  subjects: Subject[];
};

function DraggableSubject({ subject }: { subject: Subject }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `subject-${subject.RespID}`,
    data: subject,
  });

  return (
    <ListItem
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="subject-item"
      data-subject-code={subject.SubjectCode}
      data-resp-id={subject.RespID}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : 1,
        bgcolor: "background.paper",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <ListItemText
        primary={subject.SubjectName}
        secondary={
          <Box component="span" sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
            <Chip label={subject.SubjectCode} size="small" />
            <Chip label={subject.GradeName} size="small" color="primary" />
            <Chip
              label={`${subject.Credits} หน่วยกิต`}
              size="small"
              variant="outlined"
            />
          </Box>
        }
        secondaryTypographyProps={{ component: "div" }}
      />
    </ListItem>
  );
}

export function PaletteClient({ subjects }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter subjects by search query
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.SubjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.SubjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.GradeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Paper sx={{ p: 2 }} data-testid="subject-palette">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">รายวิชาที่สอน</Typography>
        <Chip label={`${subjects.length} วิชา`} size="small" color="primary" variant="outlined" />
      </Box>

      {/* Search Box */}
      <TextField
        fullWidth
        size="small"
        placeholder="ค้นหารายวิชา..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        inputProps={{ "aria-label": "ค้นหารายวิชา" }}
      />

      {/* Subject List */}
      <Box
        sx={{ maxHeight: "calc(72vh - 150px)", overflow: "auto" }}
        aria-live="polite"
      >
        {filteredSubjects.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            {searchQuery ? "ไม่พบรายวิชา" : "ไม่มีรายวิชา"}
          </Typography>
        ) : (
          <List>
            {filteredSubjects.map((subject) => (
              <DraggableSubject key={subject.RespID} subject={subject} />
            ))}
          </List>
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        ลากรายวิชาไปวางในช่วงเวลาที่ต้องการ
      </Typography>
    </Paper>
  );
}
