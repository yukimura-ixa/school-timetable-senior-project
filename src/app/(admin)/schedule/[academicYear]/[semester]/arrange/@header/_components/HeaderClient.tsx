/**
 * Header Client Component
 *
 * Receives server-fetched data and handles client-side interactions:
 * - Teacher selection (Autocomplete)
 * - Tab navigation
 * - Action buttons (Save, Undo, Redo)
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Autocomplete,
  TextField,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
} from "@mui/material";
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from "@mui/icons-material";

type Teacher = {
  TeacherID: number;
  Prefix: string;
  Firstname: string;
  Lastname: string;
  Department: string | null;
  Role: string;
};

type GradeLevel = {
  GradeID: string;
  Year: number;
  Number: number;
  GradeName: string;
};

type Props = {
  teachers: Teacher[];
  gradeLevels: GradeLevel[];
  gradeCounts: Record<number, number>;
  selectedTeacher?: string;
  currentTab: string;
  academicYear: string;
  semester: string;
};

export function HeaderClient({
  teachers,
  gradeLevels: _gradeLevels,
  gradeCounts,
  selectedTeacher,
  currentTab,
  academicYear,
  semester,
}: Props) {
  const router = useRouter();

  // Find selected teacher object
  const teacherObj = teachers.find(
    (t) => t.TeacherID === Number(selectedTeacher),
  );

  const handleTeacherChange = (
    _: React.SyntheticEvent,
    value: Teacher | null,
  ) => {
    if (value) {
      router.push(
        `/schedule/${academicYear}/${semester}/arrange?teacher=${value.TeacherID}&tab=${currentTab}`,
      );
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: string) => {
    const queryParams = new URLSearchParams();
    if (selectedTeacher) queryParams.set("teacher", selectedTeacher);
    queryParams.set("tab", newTab);
    router.push(
      `/schedule/${academicYear}/${semester}/arrange?${queryParams.toString()}`,
    );
  };

  return (
    <Stack spacing={2}>
      {/* Teacher Selector */}
      <Box>
        <Autocomplete
          value={teacherObj || null}
          onChange={handleTeacherChange}
          options={teachers}
          getOptionLabel={(teacher) =>
            `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} (${teacher.Department || "ไม่ระบุ"})`
          }
          renderInput={(params) => (
            <TextField {...params} label="เลือกครู" placeholder="ค้นหาครู..." />
          )}
          sx={{ width: "100%", maxWidth: 400 }}
        />
      </Box>

      {/* Tabs + Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Grade Level Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="ครู" value="teacher" />
          <Tab label={`ม.1 (${gradeCounts[1] || 0})`} value="grade1" />
          <Tab label={`ม.2 (${gradeCounts[2] || 0})`} value="grade2" />
          <Tab label={`ม.3 (${gradeCounts[3] || 0})`} value="grade3" />
          <Tab label={`ม.4 (${gradeCounts[4] || 0})`} value="grade4" />
          <Tab label={`ม.5 (${gradeCounts[5] || 0})`} value="grade5" />
          <Tab label={`ม.6 (${gradeCounts[6] || 0})`} value="grade6" />
        </Tabs>

        {/* Action Buttons */}
        <ButtonGroup variant="contained">
          <Button startIcon={<UndoIcon />} disabled>
            Undo
          </Button>
          <Button startIcon={<RedoIcon />} disabled>
            Redo
          </Button>
          <Button startIcon={<SaveIcon />} color="primary">
            Save
          </Button>
        </ButtonGroup>
      </Box>
    </Stack>
  );
}
