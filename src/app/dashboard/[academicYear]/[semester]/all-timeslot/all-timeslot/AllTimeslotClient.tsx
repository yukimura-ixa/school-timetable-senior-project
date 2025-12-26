"use client";

import { useEffect, useMemo, useState } from "react";

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
import type { TimeslotWithSubject } from "../../shared/timeSlot";

import PrintIcon from "@mui/icons-material/Print";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import GridOnIcon from "@mui/icons-material/GridOn";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import TableHead from "./component/TableHead";

import TableBody from "./component/TableBody";

import TeacherList from "./component/TeacherList";

import TableResult from "./component/TableResult";

import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
import { ExportTeacherTable } from "@/features/export/teacher-timetable-excel";

import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";

import { dayOfWeekColor } from "@/models/dayofweek-color";

import { dayOfWeekThai } from "@/models/dayofweek-thai";

import type { teacher, timeslot } from "@/prisma/generated/client";

import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";

import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

type AllTimeslotClientProps = {
  timeslots: timeslot[];

  classSchedules: ClassScheduleWithSummary[];

  teachers: teacher[];

  semester: 1 | 2;

  academicYear: number;

  isAdmin: boolean;

  configManageHref: string;
};

type TimeSlotData = {
  AllData: TimeslotWithSubject[];

  SlotAmount: number[];

  DayOfWeek: { Day: string; TextColor: string; BgColor: string }[];

  StartTime?: { Hours: number; Minutes: number };

  Duration?: number;

  BreakSlot?: { TimeslotID: string; Breaktime: string; SlotNumber: number }[];
};

const getMinutes = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);

  const minutes = Math.floor(seconds / 60);

  return minutes;
};

const buildTimeSlotData = (data: timeslot[]): TimeSlotData => {
  if (!data.length) {
    return { AllData: [], SlotAmount: [], DayOfWeek: [] };
  }

  const dayofweek = data

    .map((day) => day.DayOfWeek)

    .filter(
      (item, index) => data.map((day) => day.DayOfWeek).indexOf(item) === index,
    )

    .map((item) => ({
      Day: dayOfWeekThai[item],

      TextColor: dayOfWeekTextColor[item],

      BgColor: dayOfWeekColor[item],
    }))

    .filter(
      (item): item is { Day: string; TextColor: string; BgColor: string } =>
        item.Day !== undefined &&
        item.TextColor !== undefined &&
        item.BgColor !== undefined,
    );

  const slotAmount = data

    .filter((item) => item.DayOfWeek === "MON")

    .map((_, index) => index + 1);

  const breakTime = data

    .filter(
      (item) =>
        (item.Breaktime === "BREAK_BOTH" ||
          item.Breaktime === "BREAK_JUNIOR" ||
          item.Breaktime === "BREAK_SENIOR") &&
        item.DayOfWeek === "MON",
    )

    .map((item) => ({
      TimeslotID: item.TimeslotID,

      Breaktime: item.Breaktime,

      SlotNumber: extractPeriodFromTimeslotId(item.TimeslotID),
    }));

  const firstSlot = data[0];

  const startTime = firstSlot
    ? {
        Hours: new Date(firstSlot.StartTime).getHours() - 7,

        Minutes: new Date(firstSlot.StartTime).getMinutes(),
      }
    : { Hours: 8, Minutes: 0 };

  const duration = firstSlot
    ? getMinutes(
        new Date(firstSlot.EndTime).getTime() -
          new Date(firstSlot.StartTime).getTime(),
      )
    : 50;

  return {
    AllData: data.map((item) => ({ ...item, subject: null })),

    SlotAmount: slotAmount,

    DayOfWeek: dayofweek,

    StartTime: startTime,

    Duration: duration,

    BreakSlot: breakTime,
  };
};

const AllTimeslotClient = ({
  timeslots,

  classSchedules,

  teachers,

  semester,

  academicYear,

  isAdmin,

  configManageHref,
}: AllTimeslotClientProps) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    const styleId = "all-timeslot-print-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");

    style.id = styleId;

    style.textContent = `

      @media print {

        body * {

          visibility: hidden;

        }

        .printable-table,

        .printable-table * {

          visibility: visible;

        }

        .printable-table {

          position: absolute;

          left: 0;

          top: 0;

          width: 100%;

        }

        .no-print {

          display: none !important;

        }

        @page {

          size: landscape;

          margin: 1cm;

        }

      }

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

  const timeSlotData = useMemo(
    () => buildTimeSlotData(timeslots),

    [timeslots],
  );

  const classData = useMemo(() => classSchedules, [classSchedules]);

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

    void ExportTeacherTable(
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
    window.print();

    handleExportMenuClose();
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

          <Box
            mt={3}
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.1),
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.4),
              backdropFilter: "blur(12px)",
              p: 2,
              boxShadow: theme.shadows[1],
            }}
            className="printable-table"
          >
            <Stack>
              {/* Header Row */}
              <Stack direction="row" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 260,
                    mr: 1,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.action.selected, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GridOnIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      ตารางสรุปภาครวม
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ flex: 1, overflowX: "hidden" }}>
                  <TableHead
                    days={filteredDays}
                    slotAmount={timeSlotData.SlotAmount}
                  />
                </Box>
              </Stack>

              {/* Body Content */}
              <Stack direction="row">
                <TeacherList teachers={filteredTeachers} />
                <Box sx={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
                  <TableBody
                    teachers={filteredTeachers}
                    slotAmount={timeSlotData.SlotAmount}
                    classData={classData}
                    days={filteredDays}
                  />
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Box mt={4}>
            <TableResult teachers={filteredTeachers} classData={classData} />
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
};

export default AllTimeslotClient;
