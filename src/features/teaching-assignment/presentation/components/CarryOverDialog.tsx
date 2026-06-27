"use client";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { previewCarryOverAction } from "@/features/teaching-assignment/application/actions/teaching-assignment.actions";
import { applySuggestions, type Cell } from "./grade-matrix.logic";
import type { CarryOverSuggestion } from "@/features/teaching-assignment/domain/utils/carry-over";

interface CarryOverDialogProps {
  open: boolean;
  gradeYear: number;
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
  cells: Cell[][];
  onApply: (cells: Cell[][]) => void;
  onClose: () => void;
}

export function CarryOverDialog({
  open,
  gradeYear,
  academicYear,
  semester,
  cells,
  onApply,
  onClose,
}: CarryOverDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mapped, setMapped] = useState<CarryOverSuggestion[]>([]);
  const [exceptions, setExceptions] = useState<{ SubjectCode: string | null | undefined; reason: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    previewCarryOverAction({ gradeYear, academicYear, semester })
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data as { mapped: CarryOverSuggestion[]; exceptions: { SubjectCode: string | null | undefined; reason: string }[] };
          setMapped(data.mapped);
          setExceptions(data.exceptions);
        }
      })
      .finally(() => setLoading(false));
  }, [open, gradeYear, academicYear, semester]);

  const handleApply = () => {
    onApply(applySuggestions(cells, mapped));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>นำเข้าจากภาคเรียนก่อน</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              พบการมอบหมาย {mapped.length} รายการที่สามารถนำเข้าได้
            </Typography>
            {exceptions.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: "warning.main" }}>
                  รายการที่นำเข้าไม่ได้ ({exceptions.length}):
                </Typography>
                <List dense>
                  {exceptions.map((e, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={e.SubjectCode ?? ""}
                        secondary={e.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={loading || mapped.length === 0}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
