"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Checkbox,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { colors } from "@/shared/design-system";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import DownloadIcon from "@mui/icons-material/Download";

import SummarizeIcon from "@mui/icons-material/Summarize";

import SwapVertIcon from "@mui/icons-material/SwapVert";

import FilterListIcon from "@mui/icons-material/FilterList";

import PrintIcon from "@mui/icons-material/Print";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
import { exportTeacherTable } from "@/features/export/teacher-timetable-excel";

import type { teacher, timeslot } from "@/prisma/generated/client";

import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";

import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { isBreakSlot } from "@/utils/break-utils";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";

type AllTimeslotClientProps = {
  timeslots: timeslot[];

  classSchedules: ClassScheduleWithSummary[];

  teachers: teacher[];

  semester: 1 | 2;

  academicYear: number;

  isAdmin: boolean;

  configManageHref: string;

  slots: SlotConfig[];
};

import { buildTimeSlotData } from "@/features/schedule/all-timeslot-data";
import { AllTimeslotGrid } from "./component/AllTimeslotGrid";
const AllTimeslotClient = ({
  timeslots,

  classSchedules,

  teachers,

  semester,

  academicYear,

  isAdmin,

  configManageHref,
  slots,
}: AllTimeslotClientProps) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });

  const isTablet = useMediaQuery(theme.breakpoints.down("lg"), { noSsr: true });

  useEffect(() => {
    const styleId = "all-timeslot-print-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");

    style.id = styleId;

    style.textContent = `
      @media (max-width: 768px) {
        .MuiContainer-root {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [showFilters, setShowFilters] = useState(false);

  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const exportDisabledTooltip = "การส่งออกสงวนไว้สำหรับผู้ดูแลระบบเท่านั้น";

  const timeSlotData = buildTimeSlotData(timeslots, slots);

  const classData = classSchedules;

  const filteredTeachers =
    selectedTeachers.length > 0
      ? teachers.filter((t) => selectedTeachers.includes(t.TeacherID))
      : teachers;

  const filteredDays =
    selectedDays.length > 0
      ? timeSlotData.DayOfWeek.filter((d) => selectedDays.includes(d.Day))
      : timeSlotData.DayOfWeek;

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!isAdmin) return;

    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportExcel = () => {
    if (!isAdmin) return;

    void exportTeacherTable(
      timeSlotData,

      teachers,

      classData,

      semester.toString(),

      academicYear.toString(),
    );

    handleExportMenuClose();
  };

  const handleExportSummary = () => {
    if (!isAdmin) return;

    void ExportTeacherSummary(
      timeSlotData,

      teachers,

      classData,

      semester.toString(),

      academicYear.toString(),
    );

    handleExportMenuClose();
  };

  const handlePrint = () => {
    handleExportMenuClose();
    window.open(
      `/print/all-timeslot/${academicYear}/${semester}/pdf`,
      "_blank",
      "noopener",
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          sx={{ alignItems: "flex-start" }}
        >
          <AlertTitle>มุมมองอ่านอย่างเดียว</AlertTitle>
          หน้านี้แสดงตารางสอนรวมเพื่อใช้ตรวจสอบและส่งออกเท่านั้น
          การแก้ไขคาบเรียน เวลา หรือครูผู้สอนต้องทำในหน้าจัดตาราง
          {isAdmin ? (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                component={Link}
                href={configManageHref}
              >
                ไปยังหน้าตั้งค่าตาราง
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              หากต้องการปรับตาราง กรุณาติดต่อผู้ดูแลระบบ
            </Typography>
          )}
        </Alert>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FilterListIcon /> ตัวกรอง
              </Typography>

              <Button
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "contained" : "outlined"}
                sx={
                  showFilters
                    ? {
                        bgcolor: colors.emerald.main,
                        "&:hover": { bgcolor: colors.emerald.dark },
                      }
                    : {
                        color: colors.emerald.main,
                        borderColor: colors.emerald.main,
                        "&:hover": { borderColor: colors.emerald.dark },
                      }
                }
              >
                {showFilters ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
              </Button>
            </Stack>

            {showFilters && (
              <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel id="teacher-filter-label">เลือกครู</InputLabel>

                  <Select
                    labelId="teacher-filter-label"
                    multiple
                    value={selectedTeachers}
                    onChange={(e) =>
                      setSelectedTeachers(e.target.value as number[])
                    }
                    input={<OutlinedInput label="เลือกครู" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const teacher = teachers.find(
                            (t) => t.TeacherID === value,
                          );

                          return (
                            <Chip
                              key={value}
                              label={
                                teacher
                                  ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
                                  : value
                              }
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem
                        key={teacher.TeacherID}
                        value={teacher.TeacherID}
                      >
                        <Checkbox
                          checked={selectedTeachers.includes(teacher.TeacherID)}
                        />

                        <ListItemText
                          primary={`${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="day-filter-label">เลือกวัน</InputLabel>

                  <Select
                    labelId="day-filter-label"
                    multiple
                    value={selectedDays}
                    onChange={(e) =>
                      setSelectedDays(e.target.value as string[])
                    }
                    input={<OutlinedInput label="เลือกวัน" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {timeSlotData.DayOfWeek.map((day) => (
                      <MenuItem key={day.Day} value={day.Day}>
                        <Checkbox checked={selectedDays.includes(day.Day)} />

                        <ListItemText primary={day.Day} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}
          </Stack>
        </Paper>

        {!classSchedules.length && (
          <Paper
            sx={{
              p: 3,

              borderStyle: "dashed",

              borderColor: "divider",

              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              ยังไม่มีข้อมูลตารางสอนในภาคเรียนนี้
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {isAdmin
                ? "กรุณาตั้งค่าช่วงเวลาและเพิ่มคาบเรียนจากหน้าจัดตารางก่อน จากนั้นข้อมูลจะถูกแสดงที่นี่โดยอัตโนมัติ"
                : "ผู้ดูแลระบบยังไม่ได้เผยแพร่ตารางสอนสำหรับภาคเรียนนี้"}
            </Typography>

            {isAdmin && (
              <Button
                component={Link}
                href={configManageHref}
                sx={{ mt: 2 }}
                variant="contained"
                size="small"
              >
                เปิดหน้าจัดตาราง
              </Button>
            )}
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack
            direction={isTablet ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isTablet ? "flex-start" : "center"}
            spacing={2}
            className="no-print"
          >
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                sx={{
                  bgcolor: colors.emerald.main,
                  "&:hover": { bgcolor: colors.emerald.dark },
                }}
              >
                ปรับตัวกรอง
              </Button>

              {isAdmin ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<SwapVertIcon />}
                    onClick={handleExportExcel}
                    sx={{
                      color: colors.emerald.main,
                      borderColor: colors.emerald.main,
                      "&:hover": {
                        borderColor: colors.emerald.dark,
                        bgcolor: alpha(colors.emerald.main, 0.04),
                      },
                    }}
                  >
                    ส่งออก Excel
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<SummarizeIcon />}
                    onClick={handleExportSummary}
                    sx={{
                      color: colors.violet.main,
                      borderColor: colors.violet.main,
                      "&:hover": {
                        borderColor: colors.violet.dark,
                        bgcolor: alpha(colors.violet.main, 0.04),
                      },
                    }}
                  >
                    สรุปสำหรับครู
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip title={exportDisabledTooltip}>
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<SwapVertIcon />}
                        disabled
                      >
                        ส่งออก Excel
                      </Button>
                    </span>
                  </Tooltip>

                  <Tooltip title={exportDisabledTooltip}>
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<SummarizeIcon />}
                        disabled
                      >
                        สรุปสำหรับครู
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}

              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                พิมพ์
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip
                title={isAdmin ? "เมนูเพิ่มเติม" : exportDisabledTooltip}
              >
                <span>
                  <IconButton
                    onClick={handleExportMenuOpen}
                    disabled={!isAdmin}
                    aria-label="ตัวเลือกส่งออกเพิ่มเติม"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </span>
              </Tooltip>

              {isAdmin && (
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportMenuClose}
                >
                  <MenuItem onClick={handleExportExcel}>
                    <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                    ส่งออก Excel
                  </MenuItem>

                  <MenuItem onClick={handleExportSummary}>
                    <SummarizeIcon fontSize="small" sx={{ mr: 1 }} />
                    สรุปสำหรับครู
                  </MenuItem>

                  <MenuItem onClick={handlePrint}>
                    <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
                    พิมพ์ PDF
                  </MenuItem>
                </Menu>
              )}
            </Stack>
          </Stack>

          <AllTimeslotGrid
            days={filteredDays}
            columns={timeSlotData.Columns}
            teachers={filteredTeachers}
            classData={classData}
          />
        </Paper>
      </Stack>
    </Container>
  );
};

export default AllTimeslotClient;
