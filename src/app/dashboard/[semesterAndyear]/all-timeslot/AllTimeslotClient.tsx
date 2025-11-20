"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import TableResult from "./component/TableResult";
import { ExportTeacherTable } from "./functions/ExportTeacherTable";
import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import type { teacher, timeslot } from @/prisma/generated/client";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";

type AllTimeslotClientProps = {
  timeslots: timeslot[];
  classSchedules: ClassScheduleWithSummary[];
  teachers: teacher[];
  semester: 1 | 2;
  academicYear: number;
  isAdmin: boolean;
};

type TimeSlotData = {
  AllData: (timeslot & { subject: Record<string, never> })[];
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
      SlotNumber: parseInt(item.TimeslotID.substring(10)),
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
    AllData: data.map((item) => ({ ...item, subject: {} })),
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
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportExcel = () => {
    ExportTeacherTable(
      timeSlotData,
      teachers,
      classData,
      semester.toString(),
      academicYear.toString(),
    );
    handleExportMenuClose();
  };

  const handleExportSummary = () => {
    ExportTeacherSummary(
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
                      <MenuItem key={teacher.TeacherID} value={teacher.TeacherID}>
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
                    onChange={(e) => setSelectedDays(e.target.value as string[])}
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

        <Paper sx={{ p: 2 }}>
          <Stack
            direction={isTablet ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isTablet ? "flex-start" : "center"}
            spacing={2}
            className="no-print"
          >
            {isAdmin && (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  ตัวกรอง
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SwapVertIcon />}
                  onClick={handleExportExcel}
                >
                  Excel (ทั้งหมด)
                </Button>
                <Tooltip title="สรุปจำนวนชั่วโมงสอนครู">
                  <Button
                    variant="outlined"
                    startIcon={<SummarizeIcon />}
                    onClick={handleExportSummary}
                  >
                    สรุปชั่วโมงสอน
                  </Button>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  พิมพ์
                </Button>
              </Stack>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={handleExportMenuOpen}>
                <MoreVertIcon />
              </IconButton>
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
                  สรุปชั่วโมงสอน
                </MenuItem>
                <MenuItem onClick={handlePrint}>
                  <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
                  พิมพ์ PDF
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>

          <Box
            mt={3}
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
            className="printable-table"
          >
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-slate-50 min-w-[220px] text-left">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GridOnIcon fontSize="small" />
                      <span>ตารางสอน</span>
                    </Stack>
                  </th>
                  <th colSpan={timeSlotData.SlotAmount.length * filteredDays.length}>
                    <TableHead
                      days={filteredDays}
                      slotAmount={timeSlotData.SlotAmount}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-top">
                    <TeacherList teachers={filteredTeachers} />
                  </td>
                  <td className="align-top">
                    <TableBody
                      teachers={filteredTeachers}
                      slotAmount={timeSlotData.SlotAmount}
                      classData={classData}
                      days={filteredDays}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>

          <Box mt={3}>
            <TableResult teachers={filteredTeachers} classData={classData} />
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
};

export default AllTimeslotClient;
