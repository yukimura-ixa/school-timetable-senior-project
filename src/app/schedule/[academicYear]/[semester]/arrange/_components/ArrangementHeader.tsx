/**
 * Presentation Layer: Arrangement Header Component
 *
 * MUI v7 header for schedule arrangement page with teacher selection,
 * save actions, and status display.
 *
 * @module ArrangementHeader
 */

"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Paper,
  Avatar,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  Save as SaveIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import type { teacher } from "@/prisma/generated/client";

interface ArrangementHeaderProps {
  /** Current selected teacher data */
  teacherData: teacher | null;

  /** List of available teachers */
  availableTeachers: teacher[];

  /** Handler for teacher selection */
  onTeacherChange: (teacherID: string) => void;

  /** Handler for save action */
  onSave: () => void;

  /** Save button disabled state */
  isSaving?: boolean;

  /** Dirty state indicator */
  isDirty?: boolean;

  /** Current semester and year */
  semester: string;
  academicYear: string;
}

/**
 * Header component for arrange page
 */
export function ArrangementHeader({
  teacherData,
  availableTeachers,
  onTeacherChange,
  onSave,
  isSaving = false,
  isDirty = false,
  semester,
  academicYear,
}: ArrangementHeaderProps) {
  const getTeacherFullName = (teacher: teacher) => {
    if (!teacher || !teacher.TeacherID) return "";
    return `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`;
  };

  const currentTeacherName = teacherData ? getTeacherFullName(teacherData) : "";

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Stack spacing={3}>
        {/* Title Row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              จัดตารางสอน
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                ภาคเรียนที่ {semester} / ปีการศึกษา {academicYear}
              </Typography>
              {isDirty && (
                <Chip
                  label="มีการแก้ไข"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          {/* Save Button */}
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={!isDirty || isSaving}
            size="large"
            data-testid="save-button"
          >
            {isSaving ? "กำลังบันทึก..." : "บันทึกตารางสอน"}
          </Button>
        </Stack>

        {/* Teacher Selection Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Autocomplete
            id="teacher-autocomplete"
            options={availableTeachers}
            getOptionLabel={(option) => getTeacherFullName(option)}
            value={teacherData}
            onChange={(_, newValue) => {
              if (newValue) {
                onTeacherChange(newValue.TeacherID.toString());
              } else {
                onTeacherChange("");
              }
            }}
            isOptionEqualToValue={(option, value) =>
              option.TeacherID === value?.TeacherID
            }
            data-testid="teacher-autocomplete"
            renderOption={(props, option) => (
              <li {...props} key={option.TeacherID}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>{getTeacherFullName(option)}</Typography>
                  <Chip
                    label={option.Department}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Stack>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="เลือกครูผู้สอน"
                data-testid="teacher-select"
                inputProps={{
                  ...params.inputProps,
                  "data-testid": "teacher-select-input",
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          bgcolor: "primary.main",
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ minWidth: 300, flex: 1 }}
          />

          {/* Current Teacher Info */}
          {teacherData && teacherData.TeacherID && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                flex: 1,
                bgcolor: "primary.50",
                border: "2px solid",
                borderColor: "primary.main",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {currentTeacherName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teacherData.Department} • {teacherData.Email}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
