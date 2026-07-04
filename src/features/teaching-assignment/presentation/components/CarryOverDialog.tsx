"use client";

import useSWR from "swr";
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
import type {
  CarryOverSuggestion,
  CarryOverException,
} from "@/features/teaching-assignment/domain/utils/carry-over";

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
  const { data, isLoading } = useSWR(
    open ? ["carryover-preview", gradeYear, academicYear, semester] : null,
    async () => {
      const result = await previewCarryOverAction({ gradeYear, academicYear, semester });
      if (!result.success || !result.data) {
        return { mapped: [] as CarryOverSuggestion[], exceptions: [] as CarryOverException[] };
      }
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  const mapped = data?.mapped ?? [];
  const exceptions = data?.exceptions ?? [];

  const handleApply = () => {
    onApply(applySuggestions(cells, mapped));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>นำเข้าจากภาคเรียนก่อน</DialogTitle>
      <DialogContent>
        {isLoading ? (
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
                  {exceptions.map((e) => (
                    <ListItem key={`${e.GradeID}-${e.SubjectCode}-${e.reason}`}>
                      <ListItemText
                        primary={e.SubjectCode}
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
          disabled={isLoading || mapped.length === 0}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
