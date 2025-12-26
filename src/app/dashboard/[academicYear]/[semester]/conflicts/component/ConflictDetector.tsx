"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useParams } from "next/navigation";
import { getConflictsAction } from "@/features/conflict/application/actions/conflict.actions";
import type { ConflictSummary } from "@/features/conflict/infrastructure/repositories/conflict.repository";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`conflict-tabpanel-${index}`}
      aria-labelledby={`conflict-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const DAY_NAMES: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
};

export default function ConflictDetector() {
  const theme = useTheme();
  const params = useParams();
  // Extract academicYear and semester from route params
  const academicYear = params.academicYear
    ? parseInt(params.academicYear as string, 10)
    : null;
  const semester = params.semester
    ? parseInt(params.semester as string, 10)
    : null;
  const [tabValue, setTabValue] = React.useState(0);

  // Fetch conflicts
  const {
    data: conflictsResponse,
    error,
    isLoading,
  } = useSWR(
    semester && academicYear ? ["conflicts", academicYear, semester] : null,
    async ([, year, sem]) => {
      return await getConflictsAction({
        AcademicYear: year,
        Semester: `SEMESTER_${sem}` as
          | "SEMESTER_1"
          | "SEMESTER_2"
          | "SEMESTER_3",
      });
    },
  );

  const conflicts: ConflictSummary | null = useMemo(() => {
    if (
      conflictsResponse &&
      "success" in conflictsResponse &&
      conflictsResponse.success &&
      conflictsResponse.data
    ) {
      return conflictsResponse.data;
    }
    return null;
  }, [conflictsResponse]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !conflicts) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          ไม่สามารถโหลดข้อมูล Conflict ได้
        </Alert>
      </Box>
    );
  }

  const hasConflicts = conflicts.totalConflicts > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Summary Header */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: "blur(12px)",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.1),
          boxShadow: theme.shadows[2],
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="text.primary"
              >
                ตรวจสอบ Conflict ตารางสอน
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
              </Typography>
            </Box>
            <Chip
              icon={hasConflicts ? <ErrorIcon /> : <CheckCircleIcon />}
              label={
                hasConflicts
                  ? `พบ ${conflicts.totalConflicts} Conflict`
                  : "ไม่พบ Conflict"
              }
              color={hasConflicts ? "error" : "success"}
              variant="filled"
              sx={{
                height: 40,
                px: 1,
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: `0 4px 12px ${alpha(hasConflicts ? theme.palette.error.main : theme.palette.success.main, 0.2)}`,
              }}
            />
          </Stack>

          {/* Conflict Summary Chips */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
          >
            {[
              {
                label: "ครูซ้ำ",
                value: conflicts.teacherConflicts.length,
                color: "error",
              },
              {
                label: "ห้องซ้ำ",
                value: conflicts.roomConflicts.length,
                color: "error",
              },
              {
                label: "ชั้นซ้ำ",
                value: conflicts.classConflicts.length,
                color: "error",
              },
              {
                label: "ไม่ได้กำหนด",
                value: conflicts.unassignedSchedules.length,
                color: "warning",
              },
            ].map((stat) => (
              <Chip
                key={stat.label}
                label={`${stat.label}: ${stat.value}`}
                size="small"
                variant={stat.value > 0 ? "filled" : "outlined"}
                color={
                  stat.value > 0
                    ? (stat.color as "error" | "warning")
                    : "default"
                }
                sx={{
                  fontWeight: "bold",
                  ...(stat.value > 0
                    ? {
                        bgcolor: alpha(
                          theme.palette[stat.color as "error" | "warning"].main,
                          0.1,
                        ),
                        color: `${stat.color}.main`,
                        borderColor: alpha(
                          theme.palette[stat.color as "error" | "warning"].main,
                          0.2,
                        ),
                      }
                    : {
                        opacity: 0.5,
                      }),
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* No Conflicts Success State */}
      {!hasConflicts && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon fontSize="large" />}
          sx={{
            borderRadius: 3,
            py: 3,
            bgcolor: alpha(theme.palette.success.main, 0.05),
            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          }}
        >
          <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            ตารางสอนไม่มี Conflict
          </AlertTitle>
          <Typography variant="body2">
            ตารางสอนของท่านตรวจสอบแล้วไม่มีปัญหาใดๆ
            สามารถใช้งานหรือเปิดเผยแพร่ได้ทันที
          </Typography>
        </Alert>
      )}

      {/* Conflict Details UI */}
      {hasConflicts && (
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(12px)",
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: alpha(theme.palette.background.default, 0.3),
              "& .MuiTab-root": { py: 2, fontWeight: "bold" },
            }}
          >
            <Tab label={`ครูซ้ำ (${conflicts.teacherConflicts.length})`} />
            <Tab label={`ห้องซ้ำ (${conflicts.roomConflicts.length})`} />
            <Tab label={`ชั้นซ้ำ (${conflicts.classConflicts.length})`} />
            <Tab
              label={`ไม่ได้กำหนด (${conflicts.unassignedSchedules.length})`}
            />
          </Tabs>

          {/* Teacher Conflicts Tab */}
          <TabPanel value={tabValue} index={0}>
            {conflicts.teacherConflicts.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                ไม่พบ Conflict ของครู
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ bgcolor: "transparent", borderRadius: 2 }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        ครูผู้ช่วย
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        วัน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        คาบ
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        รายละเอียดความขัดแย้ง
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.teacherConflicts.map((conflict, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {conflict.teacherName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={DAY_NAMES[conflict.day] || conflict.day}
                            size="small"
                            sx={{
                              fontWeight: "medium",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            คาบที่ {conflict.periodStart}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Box
                                key={i}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.03,
                                  ),
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="error.dark"
                                >
                                  {c.gradeName} - {c.subjectName} (
                                  {c.subjectCode})
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ห้องสอน: {c.roomName}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Room Conflicts Tab */}
          <TabPanel value={tabValue} index={1}>
            {conflicts.roomConflicts.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                ไม่พบ Conflict ของห้องเรียน
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ bgcolor: "transparent", borderRadius: 2 }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        ห้องเรียน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        วัน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        คาบ
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        รายละเอียดความขัดแย้ง
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.roomConflicts.map((conflict, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {conflict.roomName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={DAY_NAMES[conflict.day] || conflict.day}
                            size="small"
                            sx={{
                              fontWeight: "medium",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            คาบที่ {conflict.periodStart}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Box
                                key={i}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.03,
                                  ),
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="error.dark"
                                >
                                  {c.gradeName} - {c.subjectName} (
                                  {c.subjectCode})
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ครูผู้สอน: {c.teacherName}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Class Conflicts Tab */}
          <TabPanel value={tabValue} index={2}>
            {conflicts.classConflicts.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                ไม่พบ Conflict ของชั้นเรียน
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ bgcolor: "transparent", borderRadius: 2 }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        ชั้นเรียน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        วัน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        คาบ
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        รายละเอียดความขัดแย้ง
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.classConflicts.map((conflict, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {conflict.gradeName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={DAY_NAMES[conflict.day] || conflict.day}
                            size="small"
                            sx={{
                              fontWeight: "medium",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            คาบที่ {conflict.periodStart}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Box
                                key={i}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.03,
                                  ),
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="error.dark"
                                >
                                  {c.subjectName} ({c.subjectCode})
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ครู: {c.teacherName} | ห้อง: {c.roomName}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Unassigned Schedules Tab */}
          <TabPanel value={tabValue} index={3}>
            {conflicts.unassignedSchedules.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                ไม่พบตารางที่ไม่ได้กำหนดครูหรือห้อง
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ bgcolor: "transparent", borderRadius: 2 }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        ชั้นเรียน
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        วิชา
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        วัน/คาบ
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                      >
                        สิ่งที่ขาดหาย
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.unassignedSchedules.map((schedule, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {schedule.gradeName}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {schedule.subjectName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({schedule.subjectCode})
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight="medium">
                              {DAY_NAMES[schedule.day] || schedule.day}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              คาบที่ {schedule.periodStart}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              schedule.missingResource === "BOTH"
                                ? "ขาดทั้งครู และ ห้อง"
                                : schedule.missingResource === "TEACHER"
                                  ? "ยังไม่ได้กำหนดครู"
                                  : "ยังไม่ได้กำหนดห้องสอน"
                            }
                            color="warning"
                            size="small"
                            variant="filled"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: "warning.dark",
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      )}
    </Box>
  );
}
