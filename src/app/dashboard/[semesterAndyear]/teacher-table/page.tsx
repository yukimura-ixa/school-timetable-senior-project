"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import useSWR from "swr";
import { useReactToPrint } from "react-to-print";
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
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SchoolIcon from "@mui/icons-material/School";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import GridOnIcon from "@mui/icons-material/GridOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useSemesterSync, useTeachers } from "@/hooks";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";
import { getTeacherByIdAction } from "@/features/teacher/application/actions/teacher.actions";

import TimeSlot from "./component/Timeslot";
import SelectTeacher from "./component/SelectTeacher";
import {
  generateTeacherBatchPDF,
  type BatchPDFOptions,
} from "../shared/batchPdfGenerator";
import { PDFCustomizationDialog } from "../shared/PDFCustomizationDialog";
import {
  ExportTeacherTable,
  type ExportTimeslotData,
  type ClassScheduleWithSummary,
} from "../all-timeslot/functions/ExportTeacherTable";
import {
  createTimeSlotTableData,
  type TimeSlotTableData,
} from "../shared/timeSlot";
import type { ScheduleEntry } from "../shared/timeSlot";
import type { ActionResult } from "@/shared/lib/action-wrapper";

interface Teacher {
  Prefix?: string;
  Firstname?: string;
  Lastname?: string;
}

const formatTeacherName = (teacher?: Teacher) => {
  if (!teacher) {
    return "";
  }

  const prefix = teacher.Prefix ?? "";
  const firstname = teacher.Firstname ?? "";
  const lastname = teacher.Lastname ?? "";

  return `${prefix}${firstname}${firstname && lastname ? " " : ""}${lastname}`.trim();
};

function TeacherTablePage() {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );
  const { data: session } = useSession();
  const userRole = normalizeAppRole(session?.user?.role);
  const isAdmin = isAdminRole(userRole);
  const isTeacher = userRole === "teacher";
  const currentTeacherId =
    isTeacher && session?.user?.id ? parseInt(session.user.id) : null;

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    currentTeacherId,
  );

  // Effect to enforce teacher selection for non-admins
  useEffect(() => {
    if (isTeacher && currentTeacherId) {
      setSelectedTeacherId(currentTeacherId);
    }
  }, [isTeacher, currentTeacherId]);

  // Bulk operation state
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [showBulkFilters, setShowBulkFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  // PDF customization dialog state
  const [showPdfCustomization, setShowPdfCustomization] = useState(false);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get all teachers for bulk operations
  const allTeachers = useTeachers();

  const {
    data: timeslotResponse,
    isLoading: isTimeslotLoading,
    isValidating: isTimeslotValidating,
  } = useSWR(
    semester && academicYear
      ? ["timeslots-by-term", academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getTimeslotsByTermAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
      });
    },
    { revalidateOnFocus: false },
  );

  const {
    data: classDataResponse,
    isLoading: isClassLoading,
    isValidating: isClassValidating,
  } = useSWR(
    selectedTeacherId && semester && academicYear
      ? ["class-schedules-teacher", selectedTeacherId, academicYear, semester]
      : null,
    async ([, teacherId, year, sem]) => {
      return await getClassSchedulesAction({
        TeacherID: teacherId,
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
      });
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
  } = useSWR(
    selectedTeacherId ? ["teacher-by-id", selectedTeacherId] : null,
    async ([, teacherId]) => {
      return await getTeacherByIdAction({ TeacherID: teacherId });
    },
    {
      revalidateOnFocus: false,
    },
  );

  const hasTimeslotError =
    !timeslotResponse ||
    ("success" in (timeslotResponse as object) &&
      !(timeslotResponse as ActionResult<unknown>).success);
  const hasClassError =
    classDataResponse &&
    "success" in (classDataResponse as object) &&
    !(classDataResponse as ActionResult<unknown>).success;
  const hasTeacherError =
    teacherResponse &&
    "success" in (teacherResponse as object) &&
    !(teacherResponse as ActionResult<unknown>).success;

  const classData = useMemo((): ScheduleEntry[] => {
    const response = classDataResponse as
      | ActionResult<ScheduleEntry[]>
      | undefined;
    if (!response || !response.success || !response.data) {
      return [];
    }
    return response.data;
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
    isTimeslotLoading ||
    isTimeslotValidating ||
    (selectedTeacherId
      ? isClassLoading ||
        isClassValidating ||
        isTeacherLoading ||
        isTeacherValidating
      : false);

  const errors: string[] = [];
  if (hasTimeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (hasClassError && selectedTeacherId) {
    errors.push("ไม่สามารถโหลดตารางสอนของครูที่เลือกได้");
  }
  if (hasTeacherError && selectedTeacherId) {
    errors.push("ไม่สามารถโหลดข้อมูลครูที่เลือกได้");
  }

  const ref = useRef<HTMLDivElement>(null);
  const [isPDFExport, setIsPDFExport] = useState(false);

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

  const generatePDF = useReactToPrint({
    contentRef: ref,
    documentTitle: `ตารางสอน${teacherName ? teacherName : ""} ${semester}-${academicYear}`,
  });

  const handleExportPDF = () => {
    setIsPDFExport(true);
    setTimeout(() => {
      generatePDF();
      setIsPDFExport(false);
    }, 1);
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
    if (selectedTeacherIds.length === 0 || !allTeachers.data) return;

    const selectedTeachers = allTeachers.data.filter((t) =>
      selectedTeacherIds.includes(t.TeacherID),
    );

    // Note: This requires fetching class data for all selected teachers
    // For now, we'll use the export function from all-timeslot page
    ExportTeacherTable(
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

  // Open PDF customization dialog
  const handleOpenPdfCustomization = () => {
    if (selectedTeacherIds.length === 0) return;
    handleExportMenuClose();
    setShowPdfCustomization(true);
  };

  // Generate PDF with custom options
  const handleBulkPDFGeneration = async (
    customOptions?: Partial<BatchPDFOptions>,
  ) => {
    if (selectedTeacherIds.length === 0 || !allTeachers.data) return;

    // Get selected teachers
    const selectedTeachers = allTeachers.data.filter((t) =>
      selectedTeacherIds.includes(t.TeacherID),
    );

    // For simplification, we'll use a single element approach
    // In production, you'd need to fetch data for each teacher and render separate tables
    const elements: HTMLElement[] = [];
    const names: string[] = [];

    for (const teacher of selectedTeachers) {
      const teacherName = formatTeacherName(teacher);
      names.push(teacherName);

      // Create a temporary div with the timetable
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "1200px";
      tempDiv.innerHTML = `
        <div style="padding: 20px; background: white;">
          <h2>ตารางสอน: ${teacherName}</h2>
          <p>ภาคเรียนที่ ${semester}/${academicYear}</p>
          <div id="temp-table-${teacher.TeacherID}"></div>
        </div>
      `;
      document.body.appendChild(tempDiv);
      elements.push(tempDiv);
    }

    try {
      await generateTeacherBatchPDF(
        elements,
        names,
        semester,
        academicYear,
        customOptions,
      );
    } finally {
      // Clean up temporary elements
      elements.forEach((el) => el.remove());
    }
  };

  const handleSelectTeacher = (teacherId: number | null) => {
    setSelectedTeacherId(teacherId);
  };

  const disableExport = Boolean(
    isClassLoading ||
      isClassValidating ||
      isTeacherLoading ||
      isTeacherValidating ||
      !selectedTeacherId ||
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

        {/* Bulk Export Filter Section - Admin only */}
        {isAdmin && (
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
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        selectedTeacherIds.length === 0 || hasTimeslotError
                      }
                      onClick={handleBulkExportExcel}
                      startIcon={<GridOnIcon />}
                    >
                      {isMobile ? "Excel" : "ส่งออก Excel"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="พิมพ์ครูที่เลือก">
                    <IconButton
                      color="primary"
                      disabled={
                        selectedTeacherIds.length === 0 || hasTimeslotError
                      }
                      onClick={handleBulkPrint}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ตัวเลือกเพิ่มเติม">
                    <IconButton
                      onClick={handleExportMenuOpen}
                      disabled={selectedTeacherIds.length === 0}
                      data-testid="teacher-export-menu-button"
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
                <MenuItem
                  onClick={handleOpenPdfCustomization}
                  data-testid="export-custom-pdf-option"
                >
                  <PictureAsPdfIcon sx={{ mr: 1 }} />
                  สร้าง PDF (กำหนดค่าเอง)
                </MenuItem>
              </Menu>

              {/* PDF Customization Dialog */}
              <PDFCustomizationDialog
                open={showPdfCustomization}
                onClose={() => setShowPdfCustomization(false)}
                onExport={(options) => void handleBulkPDFGeneration(options)}
                title="กำหนดค่าการส่งออก PDF ตารางสอนครู"
                maxTablesPerPage={4}
              />

              {/* Selection Summary */}
              {selectedTeacherIds.length > 0 && (
                <Box
                  sx={{ mt: 2, p: 1, bgcolor: "action.hover", borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    เลือกแล้ว {selectedTeacherIds.length} ครู
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

        {/* Empty State - No Teacher Selected */}
        {!showLoadingOverlay && !selectedTeacherId && errors.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "action.hover",
              borderRadius: 2,
            }}
          >
            <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              กรุณาเลือกครู
            </Typography>
            <Typography variant="body2" color="text.secondary">
              เลือกครูจากรายการด้านบนเพื่อดูตารางสอน
            </Typography>
          </Paper>
        )}

        {/* Timetable Content */}
        {selectedTeacherId &&
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
                        color="success"
                        startIcon={<DownloadIcon />}
                        disabled={disableExport}
                        onClick={() => {
                          if (
                            teacherResponse &&
                            "success" in teacherResponse &&
                            teacherResponse.success &&
                            teacherResponse.data
                          ) {
                            ExportTeacherTable(
                              timeSlotData as ExportTimeslotData,
                              [teacherResponse.data],
                              classData as ClassScheduleWithSummary[],
                              semester,
                              academicYear,
                            );
                          }
                        }}
                      >
                        นำออก Excel
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<PictureAsPdfIcon />}
                        disabled={disableExport}
                        onClick={handleExportPDF}
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
                  <TimeSlot timeSlotData={timeSlotData} />
                </Paper>
              )}

              {/* Hidden PDF Export */}
              <div
                ref={ref}
                className="printFont mt-5 flex flex-col items-center justify-center p-10"
                style={{ display: isPDFExport ? "flex" : "none" }}
              >
                <div className="mb-8 flex gap-10">
                  <p>ตารางสอน {teacherName}</p>
                  <p>ภาคเรียนที่ {`${semester}/${academicYear}`}</p>
                </div>
                <TimeSlot timeSlotData={timeSlotData} />
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

export default TeacherTablePage;
