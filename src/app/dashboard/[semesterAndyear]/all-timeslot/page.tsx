"use client";
import { useTeachers, useSemesterSync } from "@/hooks";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getSummaryAction } from "@/features/class/application/actions/class.actions";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import type { timeslot } from "@/prisma/generated";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import TableResult from "./component/TableResult";
import { ExportTeacherTable } from "./functions/ExportTeacherTable";
import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
import type { ActionResult } from "@/shared/lib/action-wrapper";
import {
  Container,
  Paper,
  Button,
  Stack,
  Skeleton,
  Box,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  Menu,
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

interface TimeSlotData {
  AllData: (timeslot & { subject: Record<string, never> })[];
  SlotAmount: number[];
  DayOfWeek: { Day: string; TextColor: string; BgColor: string }[];
  StartTime?: { Hours: number; Minutes: number };
  Duration?: number;
  BreakSlot?: { TimeslotID: string; Breaktime: string; SlotNumber: number }[];
}

const AllTimeslot = () => {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const allTeacher = useTeachers();

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .printable-table, .printable-table * {
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
  
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotData>({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
  });
  const [classData, setClassData] = useState<ClassScheduleWithSummary[]>([]);
  
  // Filter states
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const fetchTimeSlot = useSWR(
    semester && academicYear
      ? ['timeslots-by-term', academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getTimeslotsByTermAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    { revalidateOnFocus: false },
  );
  const fetchAllClassData = useSWR(
    semester && academicYear
      ? ['class-summary', academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getSummaryAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    { revalidateOnFocus: false },
  );
  function fetchTimeslotData() {
    const result = fetchTimeSlot.data;
    if (!fetchTimeSlot.isValidating && result?.success && result.data) {
      const data: timeslot[] = result.data;
      const dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index,
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
        }))
        .filter((item): item is { Day: string; TextColor: string; BgColor: string } => 
          item.Day !== undefined && item.TextColor !== undefined && item.BgColor !== undefined
        ); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      const slotAmount = data
        .filter((item) => item.DayOfWeek === "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      const breakTime = data
        .filter(
          (item) =>
            (item.Breaktime === "BREAK_BOTH" ||
              item.Breaktime === "BREAK_JUNIOR" ||
              item.Breaktime === "BREAK_SENIOR") &&
            item.DayOfWeek === "MON", //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      const firstSlot = data[0];
      const startTime = firstSlot ? {
        Hours: new Date(firstSlot.StartTime).getHours() - 7, //พอแปลงมันเอาเวลาของ indo เลย -7 กลับไป
        Minutes: new Date(firstSlot.StartTime).getMinutes(),
      } : { Hours: 8, Minutes: 0 };
      const duration = firstSlot ? getMinutes(
        new Date(firstSlot.EndTime).getTime() -
          new Date(firstSlot.StartTime).getTime(),
      ) : 50; //เอาเวลาจบลบเริ่มจะได้ duration
      setTimeSlotData({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
        StartTime: startTime,
        Duration: duration,
        BreakSlot: breakTime,
      });
    }
  }
  const getMinutes = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes;
  };
  function fetchClassData() {
    const result = fetchAllClassData.data as ActionResult<ClassScheduleWithSummary[]> | undefined;
    if (!fetchAllClassData.isValidating && result?.success && result.data) {
      setClassData(result.data);
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
    if (!fetchAllClassData.isLoading) {
      fetchClassData();
    }
  }, [fetchTimeSlot.isLoading, fetchAllClassData.data]);

  // Filter logic
  const filteredTeachers = selectedTeachers.length > 0
    ? allTeacher.data.filter(t => selectedTeachers.includes(t.TeacherID))
    : allTeacher.data;

  const filteredDays = selectedDays.length > 0
    ? timeSlotData.DayOfWeek.filter(d => selectedDays.includes(d.Day))
    : timeSlotData.DayOfWeek;

  // Export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportExcel = () => {
    ExportTeacherTable(timeSlotData, filteredTeachers, classData, semester, academicYear);
    handleExportMenuClose();
  };

  const handleExportSummary = () => {
    ExportTeacherSummary(timeSlotData, allTeacher, classData, semester, academicYear);
    handleExportMenuClose();
  };

  const handlePrint = () => {
    window.print();
    handleExportMenuClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Filter Section */}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  <InputLabel id="teacher-filter-label">กรองตามครู</InputLabel>
                  <Select
                    labelId="teacher-filter-label"
                    multiple
                    value={selectedTeachers}
                    onChange={(e) => setSelectedTeachers(e.target.value as number[])}
                    input={<OutlinedInput label="กรองตามครู" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const teacher = allTeacher.data.find(t => t.TeacherID === value);
                          return (
                            <Chip
                              key={value}
                              label={teacher ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}` : value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {allTeacher.data.map((teacher) => (
                      <MenuItem key={teacher.TeacherID} value={teacher.TeacherID}>
                        <Checkbox checked={selectedTeachers.includes(teacher.TeacherID)} />
                        <ListItemText primary={`${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel id="day-filter-label">กรองตามวัน</InputLabel>
                  <Select
                    labelId="day-filter-label"
                    multiple
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(e.target.value as string[])}
                    input={<OutlinedInput label="กรองตามวัน" />}
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

                {(selectedTeachers.length > 0 || selectedDays.length > 0) && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setSelectedTeachers([]);
                      setSelectedDays([]);
                    }}
                  >
                    ล้างตัวกรอง
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            position: "relative",
            height: { xs: 500, sm: 550, md: 650 },
            overflow: "hidden",
            p: { xs: 1, sm: 2 },
          }}
          className="printable-table"
        >
          {fetchTimeSlot.isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="rectangular" height={450} />
            </Stack>
          ) : (
            <Box sx={{ display: "flex", height: "100%" }}>
              <TeacherList teachers={filteredTeachers} />
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  cursor: "move",
                  overflowX: "auto",
                  overflowY: "hidden",
                }}
              >
                <table>
                  <TableHead
                    days={filteredDays}
                    slotAmount={timeSlotData.SlotAmount}
                  />
                  <TableBody
                    teachers={filteredTeachers}
                    classData={classData}
                    slotAmount={timeSlotData.SlotAmount}
                    days={filteredDays}
                  />
                </table>
              </Box>
              <TableResult teachers={filteredTeachers} classData={classData} />
            </Box>
          )}
        </Paper>

        <Stack direction="row" justifyContent="space-between" alignItems="center" className="no-print">
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SummarizeIcon />}
              onClick={handleExportSummary}
              disabled={fetchAllClassData.isLoading}
            >
              {isMobile ? "สรุป" : "นำสรุปข้อมูลออกเป็น Excel"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              disabled={fetchAllClassData.isLoading}
            >
              {isMobile ? "ตาราง" : "นำตารางสอนครูทั้งหมดออกเป็น Excel"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              พิมพ์
            </Button>
            <IconButton
              onClick={handleExportMenuOpen}
              color="primary"
              aria-label="export options"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={handleExportExcel}>
                <GridOnIcon sx={{ mr: 1 }} />
                <Typography>Export Excel (XLSX)</Typography>
              </MenuItem>
              <MenuItem onClick={handlePrint}>
                <PrintIcon sx={{ mr: 1 }} />
                <Typography>Print</Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                alert("PDF export coming soon!");
                handleExportMenuClose();
              }}>
                <PictureAsPdfIcon sx={{ mr: 1 }} />
                <Typography>Export PDF (Coming Soon)</Typography>
              </MenuItem>
            </Menu>
          </Stack>

          {!isMobile && (
            <Tooltip title="กด Left Shift + เลื่อน Scroll เพื่อเลื่อนดูแนวนอน (สำหรับคอม)">
              <Stack direction="row" spacing={1} alignItems="center">
                <Paper
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Left Shift
                  </Typography>
                </Paper>
                <Typography variant="body2" color="text.secondary">
                  +
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Scroll
                  </Typography>
                  <SwapVertIcon fontSize="small" color="action" />
                </Paper>
                <Typography variant="body2" color="text.secondary">
                  = เลื่อนแนวนอน
                </Typography>
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default AllTimeslot;
