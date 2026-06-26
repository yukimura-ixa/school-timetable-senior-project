"use client";

import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { subjectCreditToNumber } from "../../domain/utils/subject-credit";

export interface SubjectOption {
  SubjectCode: string;
  SubjectName: string;
  Credit: string;
}

export interface AddSubjectModalProps {
  open: boolean;
  roomLabel: string;
  availableSubjects: SubjectOption[];
  existingSubjects: SubjectOption[];
  onConfirm: (subjects: SubjectOption[]) => void;
  onClose: () => void;
}

function teachHours(credit: string): number {
  return subjectCreditToNumber(credit) * 2;
}

export function AddSubjectModal({
  open,
  roomLabel,
  availableSubjects,
  existingSubjects,
  onConfirm,
  onClose,
}: AddSubjectModalProps) {
  const [chosen, setChosen] = useState<SubjectOption[]>(existingSubjects);

  const remaining = availableSubjects.filter(
    (s) => !chosen.some((c) => c.SubjectCode === s.SubjectCode),
  );

  const addSubject = (subject: SubjectOption | null) => {
    if (!subject) return;
    setChosen((prev) =>
      prev.some((c) => c.SubjectCode === subject.SubjectCode)
        ? prev
        : [...prev, subject],
    );
  };

  const removeSubject = (code: string) =>
    setChosen((prev) => prev.filter((c) => c.SubjectCode !== code));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เลือกวิชาที่รับผิดชอบ ({roomLabel})</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {chosen.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ยังไม่มีวิชา
            </Typography>
          ) : (
            chosen.map((s) => (
              <Box
                key={s.SubjectCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2">
                  {s.SubjectCode} - {s.SubjectName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {teachHours(s.Credit)} คาบ
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`ลบ ${s.SubjectCode}`}
                    onClick={() => removeSubject(s.SubjectCode)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
          <Autocomplete
            options={remaining}
            getOptionLabel={(o) => `${o.SubjectCode} - ${o.SubjectName}`}
            value={null}
            onChange={(_event, picked) => addSubject(picked)}
            renderInput={(params) => (
              <TextField {...params} label="เพิ่มวิชา" placeholder="เลือกวิชา" />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={() => onConfirm(chosen)}>
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
