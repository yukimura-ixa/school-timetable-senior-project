"use client";

/**
 * Semester Selector for Navbar
 * Shows currently selected semester and allows changing it
 */

import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { useSemesterStore } from "@/stores/semesterStore";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getSemestersAction } from "@/features/semester/application/actions/semester.actions";

export function SemesterSelector() {
  const router = useRouter();
  const { selectedSemester, academicYear, semester, setSemester } =
    useSemesterStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch available semesters
  const { data: semestersData } = useSWR(
    "semesters-list",
    async () => {
      const result = await getSemestersAction({});
      return result.success ? result.data : [];
    },
    {
      revalidateOnFocus: false,
    },
  );

  const semesters = semestersData || [];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectSemester = (
    configId: string,
    year: number,
    sem: number,
  ) => {
    setSemester(configId, year, sem);
    handleClose();

    // Navigate to dashboard with selected semester
    router.push(`/dashboard/${configId}`);
  };

  const handleManageSemesters = () => {
    handleClose();
    router.push("/dashboard/select-semester");
  };

  if (!selectedSemester) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarIcon />}
        onClick={handleManageSemesters}
        sx={{
          borderColor: "warning.main",
          color: "warning.main",
          "&:hover": {
            borderColor: "warning.dark",
            backgroundColor: "warning.light",
          },
        }}
      >
        เลือกภาคเรียน
      </Button>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarIcon />}
        endIcon={<ArrowDownIcon />}
        onClick={handleClick}
        sx={{
          borderColor: "primary.main",
          color: "text.primary",
          textTransform: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mr: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            ภาคเรียน
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
            {semester}/{academicYear}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 250,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            เลือกภาคเรียน
          </Typography>
        </Box>
        <Divider />

        {semesters.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              ไม่มีภาคเรียน
            </Typography>
          </MenuItem>
        ) : (
          semesters.map((sem) => (
            <MenuItem
              key={sem.configId}
              selected={sem.configId === selectedSemester}
              onClick={() =>
                handleSelectSemester(
                  sem.configId,
                  sem.academicYear,
                  sem.semester,
                )
              }
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box>
                  <Typography variant="body2">
                    ภาคเรียนที่ {sem.semester}/{sem.academicYear}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sem.classCount || 0} ห้อง · {sem.teacherCount || 0} ครู
                  </Typography>
                </Box>
                {sem.configId === selectedSemester && (
                  <Chip label="เลือกอยู่" size="small" color="primary" />
                )}
              </Box>
            </MenuItem>
          ))
        )}

        <Divider />
        <MenuItem onClick={handleManageSemesters}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            จัดการภาคเรียน...
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
