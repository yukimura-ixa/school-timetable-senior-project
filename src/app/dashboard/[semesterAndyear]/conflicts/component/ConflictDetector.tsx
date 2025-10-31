'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
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
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { useSemesterSync } from '@/hooks';
import { getConflictsAction } from '@/features/conflict/application/actions/conflict.actions';
import type { ConflictSummary } from '@/features/conflict/infrastructure/repositories/conflict.repository';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DAY_NAMES: Record<string, string> = {
  MON: 'จันทร์',
  TUE: 'อังคาร',
  WED: 'พุธ',
  THU: 'พฤหัสบดี',
  FRI: 'ศุกร์',
  SAT: 'เสาร์',
  SUN: 'อาทิตย์',
};

export default function ConflictDetector() {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const [tabValue, setTabValue] = React.useState(0);

  // Fetch conflicts
  const { data: conflictsResponse, error, isLoading } = useSWR(
    semester && academicYear ? ['conflicts', academicYear, semester] : null,
    async ([, year, sem]) => {
      return await getConflictsAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2' | 'SEMESTER_3',
      });
    }
  );

  const conflicts: ConflictSummary | null = useMemo(() => {
    if (
      conflictsResponse &&
      'success' in conflictsResponse &&
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !conflicts) {
    return (
      <Alert severity="error">
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        ไม่สามารถโหลดข้อมูล Conflict ได้
      </Alert>
    );
  }

  const hasConflicts = conflicts.totalConflicts > 0;

  return (
    <Box>
      {/* Summary Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" gutterBottom>
                ตรวจสอบ Conflict ตารางสอน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
              </Typography>
            </Box>
            {hasConflicts ? (
              <Chip
                icon={<ErrorIcon />}
                label={`พบ ${conflicts.totalConflicts} Conflict`}
                color="error"
                size="medium"
              />
            ) : (
              <Chip
                icon={<CheckCircleIcon />}
                label="ไม่พบ Conflict"
                color="success"
                size="medium"
              />
            )}
          </Stack>

          {/* Conflict Summary */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Chip
              label={`ครูซ้ำ: ${conflicts.teacherConflicts.length}`}
              color={conflicts.teacherConflicts.length > 0 ? 'error' : 'default'}
            />
            <Chip
              label={`ห้องซ้ำ: ${conflicts.roomConflicts.length}`}
              color={conflicts.roomConflicts.length > 0 ? 'error' : 'default'}
            />
            <Chip
              label={`ชั้นซ้ำ: ${conflicts.classConflicts.length}`}
              color={conflicts.classConflicts.length > 0 ? 'error' : 'default'}
            />
            <Chip
              label={`ไม่ได้กำหนด: ${conflicts.unassignedSchedules.length}`}
              color={conflicts.unassignedSchedules.length > 0 ? 'warning' : 'default'}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* No Conflicts */}
      {!hasConflicts && (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          <AlertTitle>ตารางสอนไม่มี Conflict</AlertTitle>
          ตารางสอนของท่านไม่มีปัญหาใดๆ สามารถใช้งานได้ทันที
        </Alert>
      )}

      {/* Conflict Details */}
      {hasConflicts && (
        <Card>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`ครูซ้ำ (${conflicts.teacherConflicts.length})`} />
            <Tab label={`ห้องซ้ำ (${conflicts.roomConflicts.length})`} />
            <Tab label={`ชั้นซ้ำ (${conflicts.classConflicts.length})`} />
            <Tab label={`ไม่ได้กำหนด (${conflicts.unassignedSchedules.length})`} />
          </Tabs>

          {/* Teacher Conflicts */}
          <TabPanel value={tabValue} index={0}>
            {conflicts.teacherConflicts.length === 0 ? (
              <Alert severity="info">ไม่พบ Conflict ของครู</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ครู</TableCell>
                      <TableCell>วัน</TableCell>
                      <TableCell>คาบ</TableCell>
                      <TableCell>Conflict</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.teacherConflicts.map((conflict, index) => (
                      <TableRow key={index}>
                        <TableCell>{conflict.teacherName}</TableCell>
                        <TableCell>{DAY_NAMES[conflict.day] || conflict.day}</TableCell>
                        <TableCell>{conflict.periodStart}</TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Alert key={i} severity="error" variant="outlined">
                                <Typography variant="body2">
                                  <strong>{c.gradeName}</strong> - {c.subjectName} ({c.subjectCode})
                                  <br />
                                  ห้อง: {c.roomName}
                                </Typography>
                              </Alert>
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

          {/* Room Conflicts */}
          <TabPanel value={tabValue} index={1}>
            {conflicts.roomConflicts.length === 0 ? (
              <Alert severity="info">ไม่พบ Conflict ของห้องเรียน</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ห้อง</TableCell>
                      <TableCell>วัน</TableCell>
                      <TableCell>คาบ</TableCell>
                      <TableCell>Conflict</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.roomConflicts.map((conflict, index) => (
                      <TableRow key={index}>
                        <TableCell>{conflict.roomName}</TableCell>
                        <TableCell>{DAY_NAMES[conflict.day] || conflict.day}</TableCell>
                        <TableCell>{conflict.periodStart}</TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Alert key={i} severity="error" variant="outlined">
                                <Typography variant="body2">
                                  <strong>{c.gradeName}</strong> - {c.subjectName} ({c.subjectCode})
                                  <br />
                                  ครู: {c.teacherName}
                                </Typography>
                              </Alert>
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

          {/* Class Conflicts */}
          <TabPanel value={tabValue} index={2}>
            {conflicts.classConflicts.length === 0 ? (
              <Alert severity="info">ไม่พบ Conflict ของชั้นเรียน</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ชั้น</TableCell>
                      <TableCell>วัน</TableCell>
                      <TableCell>คาบ</TableCell>
                      <TableCell>Conflict</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.classConflicts.map((conflict, index) => (
                      <TableRow key={index}>
                        <TableCell>{conflict.gradeName}</TableCell>
                        <TableCell>{DAY_NAMES[conflict.day] || conflict.day}</TableCell>
                        <TableCell>{conflict.periodStart}</TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {conflict.conflicts.map((c, i) => (
                              <Alert key={i} severity="error" variant="outlined">
                                <Typography variant="body2">
                                  {c.subjectName} ({c.subjectCode})
                                  <br />
                                  ครู: {c.teacherName} | ห้อง: {c.roomName}
                                </Typography>
                              </Alert>
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

          {/* Unassigned Schedules */}
          <TabPanel value={tabValue} index={3}>
            {conflicts.unassignedSchedules.length === 0 ? (
              <Alert severity="info">ไม่พบตารางที่ไม่ได้กำหนดครูหรือห้อง</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ชั้น</TableCell>
                      <TableCell>วิชา</TableCell>
                      <TableCell>วัน</TableCell>
                      <TableCell>คาบ</TableCell>
                      <TableCell>ขาด</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflicts.unassignedSchedules.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell>{schedule.gradeName}</TableCell>
                        <TableCell>
                          {schedule.subjectName} ({schedule.subjectCode})
                        </TableCell>
                        <TableCell>{DAY_NAMES[schedule.day] || schedule.day}</TableCell>
                        <TableCell>{schedule.periodStart}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              schedule.missingResource === 'BOTH'
                                ? 'ครู และ ห้อง'
                                : schedule.missingResource === 'TEACHER'
                                ? 'ครู'
                                : 'ห้อง'
                            }
                            color="warning"
                            size="small"
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
