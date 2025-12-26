"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, { useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { authClient } from "@/lib/auth-client";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import useSWR from "swr";
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
import SchoolIcon from "@mui/icons-material/School";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import GridOnIcon from "@mui/icons-material/GridOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useTeachers } from "@/hooks";
import { useUIStore } from "@/stores/uiStore";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";
import { getTeacherByIdAction } from "@/features/teacher/application/actions/teacher.actions";

import SelectTeacher from "./component/SelectTeacher";
import {
  ExportTeacherTable,
  type ExportTimeslotData,
} from "@/features/export/teacher-timetable-excel";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";
import {
  createTimeSlotTableData,
  type TimeSlotTableData,
} from "../shared/timeSlot";
import type { ScheduleEntry } from "../shared/timeSlot";
import type { ActionResult } from "@/shared/lib/action-wrapper";
import type { teacher, timeslot } from "@/prisma/generated/client";
import { colors } from "@/shared/design-system";

type Teacher = teacher;

const formatTeacherName = (teacher?: Teacher | null) => {
  if (!teacher) {
    return "";
  }

  const prefix = teacher.Prefix ?? "";
  const firstname = teacher.Firstname ?? "";
  const lastname = teacher.Lastname ?? "";

  return `${prefix}${firstname}${firstname && lastname ? " " : ""}${lastname}`.trim();
};

const TimeSlot = dynamic(() => import("./component/Timeslot"), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
  ),
});

function TeacherTablePage() {
  const params = useParams();
  // Extract academicYear and semester from route params
  const academicYear = params.academicYear ? parseInt(params.academicYear as string, 10) : null;
  const semester = params.semester ? parseInt(params.semester as string, 10) : null;
  const { data: session, isPending } = authClient.useSession();
  const isSessionLoading = isPending;
  const canFetch = Boolean(session?.user) && !isSessionLoading;
  const userRole = normalizeAppRole(session?.user?.role);
  const isAdmin = isAdminRole(userRole);
  const isTeacher = userRole === "teacher";
  const currentTeacherId =
    isTeacher && session?.user?.id ? parseInt(session.user.id) : null;

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null,
  );
  const effectiveTeacherId =
    isTeacher && currentTeacherId ? currentTeacherId : selectedTeacherId;

  // Bulk operation state
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [showBulkFilters, setShowBulkFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  // Hydration-safe state from shared Zustand store
  const { isHydrated } = useUIStore();

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  type TimeslotKey = readonly ["timeslots-by-term", string, string];
  type ClassScheduleKey = readonly [
    "class-schedules-teacher",
    number,
    string,
    string,
  ];
  type TeacherKey = readonly ["teacher-by-id", number];

  const timeslotKey: TimeslotKey | null =
    canFetch && semester && academicYear
      ? ["timeslots-by-term", String(academicYear), String(semester)]
      : null;

  const classScheduleKey: ClassScheduleKey | null =
    canFetch && effectiveTeacherId != null && semester && academicYear
      ? [
          "class-schedules-teacher",
          effectiveTeacherId,
          String(academicYear),
          String(semester),
        ]
      : null;

  const teacherKey: TeacherKey | null =
    canFetch && effectiveTeacherId != null
      ? ["teacher-by-id", effectiveTeacherId]
      : null;

  // Get all teachers for bulk operations
  const allTeachers = useTeachers();
  const isTeacherListLoading =
    allTeachers.isLoading || allTeachers.isValidating;

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
      const [, teacherId, year, sem] = key;
      return (await getClassSchedulesAction({
        TeacherID: teacherId,
        AcademicYear: parseInt(year, 10),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
      })) as ActionResult<ScheduleEntry[]>;
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const {
    data: teacherResponse,
    isLoading: isTeacherLoading,
    isValidating: isTeacherValidating,
  } = useSWR<ActionResult<Teacher | null>, Error, TeacherKey | null>(
    teacherKey,
    async (key) => {
      if (!key) {
        throw new Error("Missing teacher key");
      }
      const [, teacherId] = key;
      return await getTeacherByIdAction({ TeacherID: teacherId });
    },
    {
      revalidateOnFocus: false,
    },
  );

  const hasTimeslotError = Boolean(
    timeslotResponse && !timeslotResponse.success,
  );
  const hasClassError = Boolean(
    classDataResponse && !classDataResponse.success,
  );
  const hasTeacherError = Boolean(teacherResponse && !teacherResponse.success);

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
    const response = timeslotResponse;
    const timeslots =
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success &&
      "data" in response &&
      response.data
        ? response.data
        : undefined;
    return createTimeSlotTableData(timeslots, classData);
  }, [timeslotResponse, classData]);

  const showLoadingOverlay =
    isSessionLoading ||
    isTimeslotLoading ||
    isTimeslotValidating ||
    (effectiveTeacherId
      ? isClassLoading ||
        isClassValidating ||
        isTeacherLoading ||
        isTeacherValidating
      : false);

  const errors: string[] = [];
  if (!isSessionLoading && hasTimeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (hasClassError && effectiveTeacherId) {
    errors.push("ไม่สามารถโหลดตารางสอนของครูที่เลือกได้");
  }
  if (hasTeacherError && effectiveTeacherId) {
    errors.push("ไม่สามารถโหลดข้อมูลครูที่เลือกได้");
  }

  const teacherName = useMemo(() => {
    if (
      teacherResponse &&
      "success" in teacherResponse &&
      teacherResponse.success &&
      teacherResponse.data
    ) {
      return formatTeacherName(teacherResponse.data);
    }
    return "";
  }, [teacherResponse]);

  // Ref for capturing timetable for PDF export
  const timetableRef = useRef<HTMLDivElement>(null);

  // Client-side PDF export using html2canvas + jspdf
  const handleExportPDF = async () => {
    if (
      !timetableRef.current ||
      !effectiveTeacherId ||
      !semester ||
      !academicYear
    )
      return;

    try {
      // Show loading state (optional: could add state for this)
      const element = timetableRef.current;

      // Capture the timetable element as canvas
      // Note: html2canvas doesn't support CSS lab() colors, so we use onclone to convert them
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Clone callback to fix unsupported CSS colors before capture
        onclone: (clonedDoc) => {
          // Replace lab() colors with fallback colors in the cloned document
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            const computedStyle = window.getComputedStyle(el);
            const bgColor = computedStyle.backgroundColor;
            const color = computedStyle.color;
            const borderColor = computedStyle.borderColor;

            // If any color contains 'lab(' or 'oklch(', replace with fallback
            const htmlEl = el as HTMLElement;
            if (bgColor.includes("lab(") || bgColor.includes("oklch(")) {
              htmlEl.style.backgroundColor = "#f5f5f5";
            }
            if (color.includes("lab(") || color.includes("oklch(")) {
              htmlEl.style.color = "#000000";
            }
            if (
              borderColor.includes("lab(") ||
              borderColor.includes("oklch(")
            ) {
              htmlEl.style.borderColor = "#cccccc";
            }
          });
        },
      });

      // Calculate PDF dimensions (A4 landscape)
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title header
      pdf.setFontSize(16);
      pdf.text(`ตารางสอน: ${teacherName}`, 15, 15);
      pdf.setFontSize(12);
      pdf.text(`ภาคเรียนที่ ${semester}/${academicYear}`, 15, 22);

      // Add the captured image
      const imgData = canvas.toDataURL("image/png");
      const yOffset = 30; // Space for header
      const maxHeight = 180; // Max height for content on A4 landscape
      const scaledHeight = Math.min(imgHeight, maxHeight);
      const scaledWidth = (scaledHeight * imgWidth) / imgHeight;

      pdf.addImage(
        imgData,
        "PNG",
        10,
        yOffset,
        scaledWidth > 277 ? 277 : scaledWidth,
        scaledHeight,
      );

      // Add footer with generation date
      pdf.setFontSize(10);
      const now = new Date();
      pdf.text(
        `สร้างเมื่อ: ${now.toLocaleDateString("th-TH")} ${now.toLocaleTimeString("th-TH")}`,
        15,
        200,
      );

      // Download the PDF
      pdf.save(
        `teacher-${effectiveTeacherId}-${semester}-${academicYear}.pdf`,
      );
    } catch (error) {
      console.error("PDF export error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก PDF กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Bulk export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleBulkExportExcel = () => {
    if (selectedTeacherIds.length === 0 || !allTeachers.data) return;

    const selectedTeachers = allTeachers.data.filter((t) =>
      selectedTeacherIds.includes(t.TeacherID),
    );

    // Note: This requires fetching class data for all selected teachers
    // For now, we'll use the export function from all-timeslot page
    void ExportTeacherTable(
      timeSlotData as ExportTimeslotData,
      selectedTeachers,
      classData as ClassScheduleWithSummary[],
      semester,
      academicYear,
    );
    handleExportMenuClose();
  };

  const handleBulkPrint = () => {
    handleExportMenuClose();
    window.print();
  };

  const handleSelectTeacher = (teacherId: number | null) => {
    setSelectedTeacherId(teacherId);
  };

  const disableExport = Boolean(
    isClassLoading ||
    isClassValidating ||
    isTeacherLoading ||
    isTeacherValidating ||
    !effectiveTeacherId ||
    hasClassError ||
    hasTimeslotError ||
    hasTeacherError,
  );

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
          <SelectTeacher
            setTeacherID={handleSelectTeacher}
            currentTeacher={
              teacherResponse &&
              "success" in teacherResponse &&
              teacherResponse.success
                ? teacherResponse.data
                : null
            }
            disabled={!isAdmin}
          />
        )}

        {/* Bulk Export Filter Section - Admin only, hydration-safe */}
        {isHydrated &&
          isAdmin &&
          (isSessionLoading || isTeacherListLoading ? (
            <Paper
              elevation={1}
              sx={{ p: 2 }}
              className="no-print"
              data-testid="bulk-export-skeleton"
            >
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton
                variant="rectangular"
                height={48}
                sx={{ mt: 1, borderRadius: 1 }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" width={120} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
              </Stack>
            </Paper>
          ) : (
            <Paper
              elevation={1}
              sx={{ p: 2 }}
              className="no-print"
              data-testid="bulk-export-section"
            >
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
                  {/* Teacher Multi-Select */}
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>เลือกครู</InputLabel>
                    <Select
                      multiple
                      value={selectedTeacherIds}
                      onChange={(e) =>
                        setSelectedTeacherIds(e.target.value as number[])
                      }
                      input={<OutlinedInput label="เลือกครู" />}
                      data-testid="teacher-multi-select"
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((id) => {
                            const teacher = allTeachers.data?.find(
                              (t) => t.TeacherID === id,
                            );
                            const name = teacher
                              ? formatTeacherName(teacher)
                              : `ครู ${id}`;
                            return <Chip key={id} label={name} size="small" />;
                          })}
                        </Box>
                      )}
                      disabled={allTeachers.isLoading || !allTeachers.data}
                    >
                      {allTeachers.data?.map((teacher) => (
                        <MenuItem
                          key={teacher.TeacherID}
                          value={teacher.TeacherID}
                        >
                          <Checkbox
                            checked={selectedTeacherIds.includes(
                              teacher.TeacherID,
                            )}
                          />
                          <ListItemText primary={formatTeacherName(teacher)} />
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
                    {selectedTeacherIds.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedTeacherIds([])}
                      >
                        ล้างตัวกรอง
                      </Button>
                    )}
                    <Tooltip title="ส่งออกครูที่เลือก">
                      <span>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={
                            selectedTeacherIds.length === 0 || hasTimeslotError
                          }
                          onClick={handleBulkExportExcel}
                          startIcon={<GridOnIcon />}
                          data-testid="bulk-export-excel-button"
                        >
                          {isMobile ? "Excel" : "ส่งออก Excel"}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title="พิมพ์ครูที่เลือก">
                      <span>
                        <IconButton
                          color="primary"
                          disabled={
                            selectedTeacherIds.length === 0 || hasTimeslotError
                          }
                          onClick={handleBulkPrint}
                          data-testid="bulk-export-print-button"
                        >
                          <PrintIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="ตัวเลือกเพิ่มเติม">
                      <span>
                        <IconButton
                          onClick={handleExportMenuOpen}
                          disabled={selectedTeacherIds.length === 0}
                          data-testid="teacher-export-menu-button"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>

                {/* Export Options Menu */}
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportMenuClose}
                  data-testid="teacher-export-menu"
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
                {selectedTeacherIds.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      เลือกแล้ว {selectedTeacherIds.length} ครู
                    </Typography>
                  </Box>
                )}
              </Collapse>
            </Paper>
          ))}

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

        {/* Empty State - No Teacher Selected */}
        {!showLoadingOverlay && !effectiveTeacherId && errors.length === 0 && (
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
            <SchoolIcon
              sx={{ fontSize: 64, color: colors.slate[400], mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              กรุณาเลือกครู
            </Typography>
            <Typography variant="body2" color="text.secondary">
              เลือกครูจากรายการด้านบนเพื่อดูตารางสอน
            </Typography>
          </Paper>
        )}

        {/* Timetable Content */}
        {effectiveTeacherId &&
          teacherResponse &&
          !hasClassError &&
          !hasTimeslotError &&
          !hasTeacherError && (
            <Stack spacing={2}>
              {/* Teacher Info & Export Actions */}
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
                      ตารางสอน{teacherName && `: ${teacherName}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ภาคเรียนที่ {semester}/{academicYear}
                    </Typography>
                  </Box>
                  {isAdmin && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        disabled={disableExport}
                        data-testid="teacher-export-excel-button"
                        onClick={() => {
                          if (
                            teacherResponse &&
                            "success" in teacherResponse &&
                            teacherResponse.success &&
                            teacherResponse.data
                          ) {
              void ExportTeacherTable(
                timeSlotData as ExportTimeslotData,
                              [teacherResponse.data],
                              classData as ClassScheduleWithSummary[],
                              semester,
                              academicYear,
                            );
                          }
                        }}
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
                        data-testid="teacher-export-pdf-button"
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
                <Paper
                  elevation={1}
                  sx={{ p: 2, overflow: "auto" }}
                  ref={timetableRef}
                >
                  <TimeSlot timeSlotData={timeSlotData} />
                </Paper>
              )}
            </Stack>
          )}
      </Stack>
    </Container>
  );
}

export default TeacherTablePage;
