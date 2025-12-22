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
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

export function SemesterSelector() {
  const router = useRouter();
  const { selectedSemester, academicYear, semester, setSemester } =
    useSemesterStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch available semesters
  const { data: semestersData } = useSWR<SemesterDTO[]>(
    "semesters-list",
    async () => {
      const result = await getSemestersAction({});
      return result.success ? (result.data ?? []) : [];
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
    router.push("/dashboard");
  };

  if (!selectedSemester) {
    return (
      <Button
        variant="contained"
        size="small"
        startIcon={<CalendarIcon />}
        onClick={handleManageSemesters}
        sx={{
          borderRadius: "999px",
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
          boxShadow: "0 4px 14px 0 rgba(217, 119, 6, 0.39)",
          textTransform: "none",
          fontWeight: 700,
          px: 2,
          "&:hover": {
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            boxShadow: "0 6px 20px rgba(217, 119, 6, 0.23)",
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
        variant="text"
        size="small"
        startIcon={
          <CalendarIcon sx={{ fontSize: 20, color: "primary.main" }} />
        }
        endIcon={
          <ArrowDownIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        }
        onClick={handleClick}
        sx={{
          bgcolor: "white/40",
          backdropFilter: "blur(8px)",
          border: "1px solid",
          borderColor: "white/60",
          borderRadius: "999px",
          px: 2,
          py: 0.75,
          color: "text.primary",
          textTransform: "none",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.05)",
          "&:hover": {
            bgcolor: "white/60",
            borderColor: "primary.light",
            boxShadow: "0 4px 12px -2px rgba(0,0,0,0.1)",
          },
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mr: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              lineHeight: 1,
              fontWeight: 700,
              fontSize: "10px",
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            ภาคเรียน
          </Typography>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.2,
              fontWeight: 800,
              color: "slate.900",
            }}
          >
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
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 280,
              borderRadius: "16px",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, color: "text.secondary", fontSize: "11px" }}
          >
            เลือกภาคเรียน
          </Typography>
        </Box>
        <Divider sx={{ opacity: 0.5 }} />

        <Box sx={{ maxHeight: 320, overflowY: "auto", py: 0.5 }}>
          {semesters.length === 0 ? (
            <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีข้อมูลภาคเรียน
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
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: "10px",
                  py: 1.25,
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    "&:hover": { bgcolor: "primary.lighter" },
                  },
                }}
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
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          sem.configId === selectedSemester ? 700 : 500,
                        color:
                          sem.configId === selectedSemester
                            ? "primary.main"
                            : "text.primary",
                      }}
                    >
                      ภาคเรียนที่ {sem.semester}/{sem.academicYear}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      <Chip
                        label={`${sem.classCount || 0} ห้อง`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "10px",
                          bgcolor: "slate.100",
                          color: "slate.600",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`${sem.teacherCount || 0} ครู`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "10px",
                          bgcolor: "slate.100",
                          color: "slate.600",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  {sem.configId === selectedSemester && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "full",
                        bgcolor: "primary.main",
                        boxShadow: "0 0 0 4px rgba(25, 118, 210, 0.1)",
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))
          )}
        </Box>

        <Divider sx={{ opacity: 0.5 }} />
        <MenuItem
          onClick={handleManageSemesters}
          sx={{
            py: 1.5,
            justifyContent: "center",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              fontWeight: 800,
              fontSize: "13px",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            จัดการภาคเรียนทั้งหมด
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
