"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState, useEffect } from "react";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
// Removed react-to-print - using server-side PDF generation
import {
  Container,
  Paper,
  Box,
  Button,
  Alert,
  AlertTitle,
  Skeleton,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ClassIcon from "@mui/icons-material/Class";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import GridOnIcon from "@mui/icons-material/GridOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useGradeLevels } from "@/hooks";
import { useUIStore } from "@/stores/uiStore";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";

import TimeSlot from "./component/Timeslot";
import SelectClassRoom from "./component/SelectClassroom";
import {
  ExportStudentTable,
  type TimeslotData as ExportTimeslotData,
  type ClassScheduleWithSummary,
} from "./function/ExportStudentTable";
import {
  createTimeSlotTableData,
  type TimeSlotTableData,
} from "../shared/timeSlot";
import type { ScheduleEntry } from "../shared/timeSlot";
import type { ActionResult } from "@/shared/lib/action-wrapper";
import type { timeslot } from "@/prisma/generated/client";
import { NoTimetableEmptyState } from "@/components/feedback";
import { colors } from "@/shared/design-system";

const getGradeLabel = (gradeId: string | null) => {
  if (!gradeId) {
    return "";
  }

  const canonicalMatch = /^M(\d+)-(\d+)$/.exec(gradeId);
  if (canonicalMatch) {
    return `ม.${canonicalMatch[1]}/${canonicalMatch[2]}`;
  }

  const legacyMatch = /^ม\.(\d+)\/(\d+)$/.exec(gradeId);
  if (legacyMatch) {
    return `ม.${legacyMatch[1]}/${legacyMatch[2]}`;
  }

  return gradeId;
};

function StudentTablePage() {
  const params = useParams();
  // Extract academicYear and semester from route params
  const academicYear = params.academicYear
    ? parseInt(params.academicYear as string, 10)
    : null;
  const semester = params.semester
    ? parseInt(params.semester as string, 10)
    : null;
  const { data: session, isPending } = authClient.useSession();
  const isSessionLoading = isPending;
  const canFetch = Boolean(session?.user) && !isSessionLoading;
  const userRole = normalizeAppRole(session?.user?.role);
  const isAdmin = isAdminRole(userRole);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  // Hydration-safe state from shared Zustand store
  const { isHydrated } = useUIStore();

  // Bulk operation state
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [showBulkFilters, setShowBulkFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  type TimeslotKey = readonly ["timeslots-by-term", string, string];
  type ClassScheduleKey = readonly [
    "class-schedules-grade",
    string,
    string,
    string,
  ];

  const timeslotKey: TimeslotKey | null =
    canFetch && semester && academicYear
      ? ["timeslots-by-term", String(academicYear), String(semester)]
      : null;

  const classScheduleKey: ClassScheduleKey | null =
    canFetch && selectedGradeId && semester && academicYear
      ? [
          "class-schedules-grade",
          selectedGradeId,
          String(academicYear),
          String(semester),
        ]
      : null;

  const {
    data: timeslotResponse,
    isLoading: isTimeslotLoading,
    isValidating: isTimeslotValidating,
  } = useSWR<ActionResult<timeslot[]>, Error, TimeslotKey | null>(
    timeslotKey,
    async (key) => {
      if (!key) {
        throw new Error("Missing timeslot key");
      }
      const [, year, sem] = key;
      return await getTimeslotsByTermAction({
        AcademicYear: parseInt(year, 10),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
      });
    },
    { revalidateOnFocus: false },
  );

  const {
    data: classDataResponse,
    isLoading: isClassLoading,
    isValidating: isClassValidating,
  } = useSWR<ActionResult<ScheduleEntry[]>, Error, ClassScheduleKey | null>(
    classScheduleKey,
    async (key): Promise<ActionResult<ScheduleEntry[]>> => {
      if (!key) {
        throw new Error("Missing class schedule key");
      }
      const [, gradeId, year, sem] = key;
      return (await getClassSchedulesAction({
        GradeID: gradeId,
        AcademicYear: parseInt(year, 10),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
      })) as ActionResult<ScheduleEntry[]>;
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const gradeLevelData = useGradeLevels();

  const timeslotResult = timeslotResponse;
  const timeslots =
    timeslotResult && timeslotResult.success && "data" in timeslotResult
      ? timeslotResult.data
      : undefined;
  const hasTimeslotError = Boolean(timeslotResult && !timeslotResult.success);
  const hasClassError = Boolean(
    classDataResponse && !classDataResponse.success,
  );

  const classData = useMemo((): ScheduleEntry[] => {
    if (
      !classDataResponse ||
      !classDataResponse.success ||
      !classDataResponse.data
    ) {
      return [];
    }
    return classDataResponse.data;
  }, [classDataResponse]);

  const timeSlotData: TimeSlotTableData = useMemo(() => {
    return createTimeSlotTableData(timeslots, classData);
  }, [timeslots, classData]);

  const hasTimeslots = Array.isArray(timeslots) && timeslots.length > 0;

  const showLoadingOverlay =
    isSessionLoading ||
    gradeLevelData.isLoading ||
    isTimeslotLoading ||
    isTimeslotValidating ||
    (selectedGradeId ? isClassLoading || isClassValidating : false);

  const showNoTimeslots =
    !showLoadingOverlay && timeslotResult?.success && !hasTimeslots;

  const errors: string[] = [];
  if (!isSessionLoading && hasTimeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (hasClassError) {
    errors.push("ไม่สามารถโหลดตารางเรียนของชั้นเรียนที่เลือกได้");
  }

  const ref = useRef<HTMLDivElement>(null);
  const [isPDFExport] = useState(false);

  // Server-side PDF export handler (admin only)
  const handleExportPDF = async () => {
    if (!selectedGradeId || !semester || !academicYear) return;

    try {
      // Get selected grade info
      const selectedGrade = gradeLevelData.data?.find(
        (g) => g.GradeID === selectedGradeId,
      );
      if (!selectedGrade) {
        throw new Error("Selected grade not found");
      }

      // Transform timeSlotData to required format
      const timeslots = timeSlotData.AllData.map((slot) => ({
        timeslotId: slot.TimeslotID,
        dayOfWeek: slot.DayOfWeek,
        startTime: slot.StartTime,
        endTime: slot.EndTime,
        breaktime: slot.Breaktime,
      }));

      // Calculate totals from classData
      const totalCredits = classData.reduce((sum, cls) => {
        const credits = cls.subject?.Credit ?? 0;
        return sum + credits;
      }, 0);

      const totalHours = classData.reduce((sum, cls) => {
        const hours = cls.subject?.TotalHours ?? 0;
        return sum + hours;
      }, 0);

      // Build request payload
      const payload = {
        gradeId: selectedGradeId,
        gradeName: selectedGrade.GradeID,
        semester: semester.toString(),
        academicYear: academicYear.toString(),
        timeslots,
        scheduleEntries: classData.map((entry) => ({
          timeslotId: entry.TimeslotID,
          subjectCode: entry.subject?.SubjectCode ?? "",
          subjectName: entry.subject?.SubjectName ?? "",
          teacherName:
            entry.teacher?.Prefix ||
            entry.teacher?.Firstname ||
            entry.teacher?.Lastname
              ? `${entry.teacher?.Prefix ?? ""} ${entry.teacher?.Firstname ?? ""} ${entry.teacher?.Lastname ?? ""}`.trim()
              : undefined,
          roomName: entry.room?.RoomName ?? "",
        })),
        totalCredits,
        totalHours,
      };

      // Call PDF API
      const response = await fetch("/api/export/student-timetable/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-${selectedGradeId}-${semester}-${academicYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก PDF กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Add print styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
        .printable-table {
          display: block !important;
        }
        .page-break {
          page-break-after: always;
        }
        @page {
          size: landscape;
          margin: 1cm;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
      @media (max-width: 768px) {
        .printable-table {
          padding: 8px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Bulk export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleBulkExportExcel = () => {
    if (
      selectedGradeIds.length === 0 ||
      !gradeLevelData.data ||
      !semester ||
      !academicYear
    )
      return;

    const selectedGrades = gradeLevelData.data.filter((g) =>
      selectedGradeIds.includes(g.GradeID),
    );

    // Export for selected grades
    ExportStudentTable(
      timeSlotData as unknown as ExportTimeslotData,
      selectedGrades,
      classData as unknown as ClassScheduleWithSummary[],
      String(semester),
      String(academicYear),
    );
    handleExportMenuClose();
  };

  const handleBulkPrint = () => {
    handleExportMenuClose();
    window.print();
  };

  const handleSelectGrade = (gradeId: string | null) => {
    setSelectedGradeId(gradeId);
  };

  const selectedGradeInfo = selectedGradeId
    ? gradeLevelData.data.filter((item) => item.GradeID === selectedGradeId)
    : [];

  const disableExport =
    isClassLoading ||
    isClassValidating ||
    !selectedGradeId ||
    hasClassError ||
    hasTimeslotError;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Selector Section */}
        {showLoadingOverlay ? (
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 1 }}
          />
        ) : (
          <SelectClassRoom
            setGradeID={handleSelectGrade}
            currentGrade={selectedGradeId}
            gradeLevels={gradeLevelData.data}
            isLoading={gradeLevelData.isLoading}
            error={gradeLevelData.error as Error | undefined}
          />
        )}

        {/* Bulk Export Filter Section - Admin only (guests hidden) */}
        {isHydrated && isAdmin && (
          <Paper elevation={1} sx={{ p: 2 }} className="no-print">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: showBulkFilters ? 2 : 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FilterListIcon />
                การส่งออกแบบกลุ่ม
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={
                  showBulkFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setShowBulkFilters(!showBulkFilters)}
              >
                {showBulkFilters ? "ซ่อน" : "แสดง"}ตัวกรอง
              </Button>
            </Box>

            <Collapse in={showBulkFilters}>
              <Stack
                spacing={2}
                direction={isMobile ? "column" : "row"}
                sx={{ mt: 2 }}
              >
                {/* Grade Multi-Select */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>เลือกห้องเรียน</InputLabel>
                  <Select
                    multiple
                    value={selectedGradeIds}
                    onChange={(e) =>
                      setSelectedGradeIds(e.target.value as string[])
                    }
                    input={<OutlinedInput label="เลือกห้องเรียน" />}
                    data-testid="class-multi-select"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((id) => (
                          <Chip
                            key={id}
                            label={getGradeLabel(id)}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    disabled={gradeLevelData.isLoading || !gradeLevelData.data}
                  >
                    {gradeLevelData.data?.map((grade) => (
                      <MenuItem key={grade.GradeID} value={grade.GradeID}>
                        <Checkbox
                          checked={selectedGradeIds.includes(grade.GradeID)}
                        />
                        <ListItemText primary={getGradeLabel(grade.GradeID)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Action Buttons */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "flex-start" }}
                >
                  {selectedGradeIds.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedGradeIds([])}
                    >
                      ล้างตัวกรอง
                    </Button>
                  )}
                  <Tooltip title="ส่งออกห้องเรียนที่เลือก">
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        selectedGradeIds.length === 0 || hasTimeslotError
                      }
                      onClick={handleBulkExportExcel}
                      startIcon={<GridOnIcon />}
                    >
                      {isMobile ? "Excel" : "ส่งออก Excel"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="พิมพ์ห้องเรียนที่เลือก">
                    <IconButton
                      color="primary"
                      disabled={
                        selectedGradeIds.length === 0 || hasTimeslotError
                      }
                      onClick={handleBulkPrint}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ตัวเลือกเพิ่มเติม">
                    <IconButton
                      onClick={handleExportMenuOpen}
                      disabled={selectedGradeIds.length === 0}
                      data-testid="student-export-menu-button"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Export Options Menu */}
              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={handleExportMenuClose}
                data-testid="student-export-menu"
              >
                <MenuItem
                  onClick={handleBulkExportExcel}
                  data-testid="export-excel-option"
                >
                  <GridOnIcon sx={{ mr: 1 }} />
                  ส่งออก Excel
                </MenuItem>
                <MenuItem
                  onClick={handleBulkPrint}
                  data-testid="export-print-option"
                >
                  <PrintIcon sx={{ mr: 1 }} />
                  พิมพ์ทั้งหมด
                </MenuItem>
              </Menu>

              {/* Selection Summary */}
              {selectedGradeIds.length > 0 && (
                <Box
                  sx={{ mt: 2, p: 1, bgcolor: "action.hover", borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    เลือกแล้ว {selectedGradeIds.length} ห้องเรียน
                  </Typography>
                </Box>
              )}
            </Collapse>
          </Paper>
        )}

        {/* Error Display */}
        {errors.length > 0 && (
          <Stack spacing={2}>
            {errors.map((message) => (
              <Alert key={message} severity="error">
                <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                {message}
              </Alert>
            ))}
          </Stack>
        )}

        {/* Empty State - No Timeslots Configured */}
        {showNoTimeslots && <NoTimetableEmptyState />}

        {/* Empty State - No Class Selected */}
        {!showLoadingOverlay &&
          !selectedGradeId &&
          errors.length === 0 &&
          hasTimeslots && (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px solid",
                borderColor: alpha(colors.slate[300], 0.5),
                borderRadius: 3,
              }}
            >
              <ClassIcon
                sx={{ fontSize: 64, color: colors.slate[400], mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                กรุณาเลือกห้องเรียน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เลือกห้องเรียนจากรายการด้านบนเพื่อดูตารางเรียน
              </Typography>
            </Paper>
          )}

        {/* Timetable Content */}
        {selectedGradeId &&
          !hasClassError &&
          !hasTimeslotError &&
          hasTimeslots && (
            <Stack spacing={2}>
              {/* Class Info & Export Actions */}
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ตารางเรียน: {getGradeLabel(selectedGradeId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ภาคเรียนที่ {semester}/{academicYear}
                    </Typography>
                  </Box>
                  {isHydrated && isAdmin && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        disabled={disableExport}
                        onClick={() =>
                          ExportStudentTable(
                            timeSlotData as unknown as ExportTimeslotData,
                            selectedGradeInfo,
                            classData as unknown as ClassScheduleWithSummary[],
                            String(semester),
                            String(academicYear),
                          )
                        }
                        sx={{
                          bgcolor: colors.emerald.main,
                          "&:hover": {
                            bgcolor: colors.emerald.dark,
                          },
                        }}
                      >
                        นำออก Excel
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        disabled={disableExport}
                        onClick={handleExportPDF}
                        sx={{
                          color: colors.emerald.main,
                          borderColor: colors.emerald.main,
                          "&:hover": {
                            borderColor: colors.emerald.dark,
                            bgcolor: alpha(colors.emerald.main, 0.04),
                          },
                        }}
                      >
                        นำออก PDF
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Paper>

              {/* Timetable */}
              {showLoadingOverlay ? (
                <Skeleton
                  variant="rectangular"
                  height={400}
                  sx={{ borderRadius: 1 }}
                />
              ) : (
                <Paper elevation={1} sx={{ p: 2, overflow: "auto" }}>
                  <TimeSlot
                    searchGradeID={selectedGradeId}
                    timeSlotData={timeSlotData}
                  />
                </Paper>
              )}

              {/* Hidden PDF Export */}
              <div
                ref={ref}
                className="printFont mt-5 flex flex-col items-center justify-center p-10"
                style={{ display: isPDFExport ? "flex" : "none" }}
              >
                <div className="printFont mb-8 flex gap-10">
                  <p>ตารางเรียน {getGradeLabel(selectedGradeId)}</p>
                  <p>ภาคเรียนที่ {`${semester}/${academicYear}`}</p>
                </div>
                <TimeSlot
                  searchGradeID={selectedGradeId}
                  timeSlotData={timeSlotData}
                />
                <div className="mt-8 flex gap-2">
                  <p>ลงชื่อ..............................รองผอ.วิชาการ</p>
                  <p>ลงชื่อ..............................ผู้อำนวยการ</p>
                </div>
              </div>
            </Stack>
          )}
      </Stack>
    </Container>
  );
}

export default StudentTablePage;
