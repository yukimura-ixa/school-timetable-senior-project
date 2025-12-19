"use client";

import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import type { semester, gradelevel } from "@/prisma/generated/client";
import { getBangkokThaiBuddhistYear } from "@/utils/datetime";

interface AssignmentFiltersProps {
  gradeId: string;
  semester: semester;
  academicYear: number;
  onGradeChange: (gradeId: string) => void;
  onSemesterChange: (semester: semester) => void;
  onYearChange: (year: number) => void;
}

/**
 * Assignment Filters Component
 * Grade, Semester, and Academic Year selectors
 */
export function AssignmentFilters({
  gradeId,
  semester,
  academicYear,
  onGradeChange,
  onSemesterChange,
  onYearChange,
}: AssignmentFiltersProps) {
  const [gradeLevels, setGradeLevels] = useState<gradelevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch grade levels on mount
  useEffect(() => {
    const fetchGradeLevels = () => {
      try {
        // FIXED: Updated mock data to match actual seed.ts format (ม.X/Y)
        // Seed creates: ม.1/1, ม.1/2, ม.1/3, ม.2/1, ม.2/2, ม.2/3, etc.
        const mockGrades: gradelevel[] = [
          {
            GradeID: "ม.1/1",
            Year: 1,
            Number: 1,
            StudentCount: 31,
            ProgramID: null,
          },
          {
            GradeID: "ม.2/1",
            Year: 2,
            Number: 1,
            StudentCount: 31,
            ProgramID: null,
          },
          {
            GradeID: "ม.3/1",
            Year: 3,
            Number: 1,
            StudentCount: 31,
            ProgramID: null,
          },
          {
            GradeID: "ม.4/1",
            Year: 4,
            Number: 1,
            StudentCount: 29,
            ProgramID: null,
          },
          {
            GradeID: "ม.5/1",
            Year: 5,
            Number: 1,
            StudentCount: 29,
            ProgramID: null,
          },
          {
            GradeID: "ม.6/1",
            Year: 6,
            Number: 1,
            StudentCount: 29,
            ProgramID: null,
          },
        ];
        setGradeLevels(mockGrades);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch grade levels:", error);
        setIsLoading(false);
      }
    };

    void fetchGradeLevels();
  }, []);

  const handleGradeChange = (event: SelectChangeEvent) => {
    onGradeChange(event.target.value);
  };

  const handleSemesterChange = (event: SelectChangeEvent) => {
    onSemesterChange(event.target.value as semester);
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    onYearChange(Number(event.target.value));
  };

  // Generate year options (current year ± 2)
  const currentYear = getBangkokThaiBuddhistYear(); // Thai Buddhist year
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Grade Level Selector */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="grade-select-label">ระดับชั้น</InputLabel>
            <Select
              labelId="grade-select-label"
              id="grade-select"
              value={gradeId}
              label="ระดับชั้น"
              onChange={handleGradeChange}
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>เลือกระดับชั้น</em>
              </MenuItem>
              {gradeLevels.map((grade) => (
                <MenuItem key={grade.GradeID} value={grade.GradeID}>
                  ม.{grade.Number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Semester Selector */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="semester-select-label">ภาคเรียน</InputLabel>
            <Select
              labelId="semester-select-label"
              id="semester-select"
              value={semester}
              label="ภาคเรียน"
              onChange={handleSemesterChange}
            >
              <MenuItem value="SEMESTER_1">ภาคเรียนที่ 1</MenuItem>
              <MenuItem value="SEMESTER_2">ภาคเรียนที่ 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Academic Year Selector */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="year-select-label">ปีการศึกษา</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={String(academicYear)}
              label="ปีการศึกษา"
              onChange={handleYearChange}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={String(year)}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}

