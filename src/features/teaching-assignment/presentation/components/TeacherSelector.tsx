"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import type { semester } from "@/prisma/generated/client";
import { getTeachersWithWorkload } from "../../application/actions/teaching-assignment.actions";
import {
  getWorkloadColor,
  type WorkloadStatus,
} from "../../domain/types/teaching-assignment.types";

interface TeacherOption {
  id: number;
  name: string;
  currentHours: number;
  status: WorkloadStatus;
}

interface TeacherSelectorProps {
  subjectCode: string;
  gradeId: string; // Not used yet but kept for future features
  semester: semester;
  academicYear: number;
  defaultHours: number;
  onAssign: (subjectCode: string, teacherId: number, hours: number) => void;
}

/**
 * Teacher Selector Component
 * Autocomplete with workload indicators for teacher selection
 */
export function TeacherSelector({
  subjectCode,
  gradeId: _gradeId, // Prefix with underscore to mark as intentionally unused
  semester,
  academicYear,
  defaultHours,
  onAssign,
}: TeacherSelectorProps) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(
    null,
  );
  const [hours, setHours] = useState<number>(defaultHours);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch teachers with workload on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);

      try {
        const result = await getTeachersWithWorkload({
          semester,
          academicYear,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error?.message ?? "Failed to fetch teachers");
        }

        // Map server action response to component state
        const teachersWithWorkload: TeacherOption[] = result.data.map(
          (teacher) => ({
            id: teacher.TeacherID,
            name: teacher.TeacherName,
            currentHours: teacher.currentWorkload.totalHours,
            status: teacher.currentWorkload.status,
          }),
        );

        setTeachers(teachersWithWorkload);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTeachers();
  }, [semester, academicYear]);

  const handleAssign = () => {
    if (!selectedTeacher) return;
    onAssign(subjectCode, selectedTeacher.id, hours);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <Autocomplete
        size="small"
        sx={{ minWidth: 250 }}
        options={teachers}
        getOptionLabel={(option) => option.name}
        value={selectedTeacher}
        onChange={(_, newValue) => setSelectedTeacher(newValue)}
        loading={isLoading}
        renderOption={(props, option) => (
          <li {...props}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{option.name}</span>
              <Chip
                size="small"
                label={`${option.currentHours}h`}
                sx={{
                  bgcolor: getWorkloadColor(option.status),
                  color: "white",
                  ml: 1,
                }}
              />
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="เลือกครู"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <TextField
        size="small"
        type="number"
        label="ชม./สัปดาห์"
        value={hours}
        onChange={(e) => setHours(Number(e.target.value))}
        sx={{ width: 120 }}
        inputProps={{ min: 1, max: 20 }}
      />

      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAssign}
        disabled={!selectedTeacher}
      >
        มอบหมาย
      </Button>
    </Box>
  );
}
