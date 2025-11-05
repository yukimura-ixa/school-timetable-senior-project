 
/**
 * Arrangement Page - Modern MUI v7 Implementation
 * 
 * Comprehensive rebuild with:
 * - MUI v7 components (Grid, Paper, Tabs, etc.)
 * - Tab navigation: Teacher Arrange + Grade Level Views (ม.1-ม.6)
 * - @dnd-kit drag & drop for teacher arrangement
 * - Clean Architecture with Server Actions
 * - Zustand store integration (existing arrangement-ui.store)
 * - Real-time conflict validation
 * 
 * @module ArrangementPage
 */

'use client';

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { enqueueSnackbar } from 'notistack';
import { useSemesterSync } from '@/hooks';
import {
  Box,
  Container,
  Paper,
  Stack,
  Alert,
  AlertTitle,
} from '@mui/material';

// @dnd-kit
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Modern Components
import {
  ArrangementHeader,
  GradeLevelTabs,
  ConflictAlert,
  SearchableSubjectPalette,
  TimetableGrid,
  RoomSelectionDialog,
  ScheduleActionToolbar,
  GradeClassView,
  ScheduleProgressIndicators,
} from './_components';

// Domain Constants
import {
  tabToGradeLevel,
  type ArrangeTab,
} from '@/features/schedule-arrangement/domain/constants/arrangement.constants';

// Server Actions
import { getTeacherScheduleAction, syncTeacherScheduleAction } from '@/features/arrange/application/actions/arrange.actions';
import { getConflictsAction, getClassSchedulesAction } from '@/features/class/application/actions/class.actions';
import { getTeachersAction } from '@/features/teacher/application/actions/teacher.actions';
import { getAvailableRespsAction } from '@/features/assign/application/actions/assign.actions';
import { getTimeslotsByTermAction } from '@/features/timeslot/application/actions/timeslot.actions';
import { getGradeLevelsAction } from '@/features/gradelevel/application/actions/gradelevel.actions';
import { getTimetableConfigAction } from '@/lib/actions/timetable-config.actions';

// Zustand Store
import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';

// Config
import type { TimetableConfig } from '@/lib/timetable-config';
import { DEFAULT_TIMETABLE_CONFIG } from '@/lib/timetable-config';

// Types
import type { SubjectData, TeacherData } from '@/types/schedule.types';
import type { gradelevel, teacher } from '@/prisma/generated';

// Feedback Components
import { TimetableGridSkeleton, NetworkErrorEmptyState } from '@/components/feedback';

/**
 * Main Arrangement Page Component
 */
export default function ArrangementPage() {
  // ============================================================================
  // ROUTING & PARAMS
  // ============================================================================
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTeacherID = searchParams.get('TeacherID');
  
  // Use useSemesterSync to extract and sync semester with global store
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  
  if (!semester || !academicYear) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>ข้อผิดพลาด</AlertTitle>
          รูปแบบข้อมูลภาคเรียนและปีการศึกษาไม่ถูกต้อง
        </Alert>
      </Container>
    );
  }

  // ============================================================================
  // TIMETABLE CONFIG
  // ============================================================================
  useEffect(() => {
    const fetchConfig = async () => {
      const result = await getTimetableConfigAction(
        parseInt(academicYear),
        `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2'
      );
      if (result.success && result.data) {
        setTimetableConfig(result.data);
      }
    };
    void fetchConfig();
  }, [academicYear, semester]);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  const [currentTab, setCurrentTab] = useState<ArrangeTab>('teacher');
  const [activeSubject, setActiveSubject] = useState<SubjectData | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedTimeslotForRoom, setSelectedTimeslotForRoom] = useState<string | null>(null);
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>(DEFAULT_TIMETABLE_CONFIG);

  // ============================================================================
  // ZUSTAND STORE
  // ============================================================================
  const {
    // Teacher state
    currentTeacherID,
    teacherData,
    setCurrentTeacherID,
    setTeacherData,
    
    // Data state
    scheduledSubjects,
    
    // Save state
    isSaving,
    setIsSaving,
    
    // History actions
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Reset
    resetOnTeacherChange,
  } = useArrangementUIStore();
  
  // Local dirty state (store doesn't have isDirty yet)
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // @DND-KIT SENSORS
  // ============================================================================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============================================================================
  // DATA FETCHING - Teachers
  // ============================================================================
  const { data: allTeachers, isLoading: isLoadingTeachers } = useSWR(
    'teachers',
    async () => {
      const result = await getTeachersAction();
      if (!result || !result.success) return [];
      return result.data || [];
    }
  );

  // ============================================================================
  // DATA FETCHING - Grade Levels
  // ============================================================================
  const { data: gradeLevels } = useSWR(
    `gradelevels-${academicYear}-${semester}`,
    async () => {
      const result = await getGradeLevelsAction();
      if (!result || !result.success) return [];
      return result.data || [];
    }
  );

  // ============================================================================
  // DATA FETCHING - Teacher Schedule (for Teacher Tab)
  // ============================================================================
  const { data: teacherSchedule, mutate: mutateTeacherSchedule, isLoading: isLoadingSchedule } = useSWR(
    currentTeacherID ? `teacher-schedule-${currentTeacherID}` : null,
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || !result.success) return null;
      return result.data;
    }
  );

  // ============================================================================
  // DATA FETCHING - Available Subjects (for Teacher)
  // ============================================================================
  const { data: availableSubjects } = useSWR(
    currentTeacherID ? `available-subjects-${academicYear}-${semester}-${currentTeacherID}` : null,
    async () => {
      if (!currentTeacherID) return [];
      const result = await getAvailableRespsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || typeof result !== 'object' || !('success' in result) || !result.success) return [];
      if (!('data' in result)) return [];
      return (result.data as SubjectData[]) || [];
    }
  );

  // ============================================================================
  // DATA FETCHING - Timeslots
  // ============================================================================
  const { data: timeslots, isLoading: isLoadingTimeslots } = useSWR(
    `timeslots-${academicYear}-${semester}`,
    async () => {
      const result = await getTimeslotsByTermAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
      if (!result || !result.success) return [];
      return result.data || [];
    }
  );

  // ============================================================================
  // DATA FETCHING - Conflicts
  // ============================================================================
  const { data: conflicts, mutate: mutateConflicts } = useSWR(
    currentTeacherID ? `conflicts-${academicYear}-${semester}-${currentTeacherID}` : null,
    async () => {
      if (!currentTeacherID) return [];
      const result = await getConflictsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || typeof result !== 'object' || !('success' in result) || !result.success) return [];
      if (!('data' in result)) return [];
      return (result.data as unknown[]) || [];
    }
  );

  // ============================================================================
  // DATA FETCHING - Grade Level Schedules (for Grade Tabs)
  // ============================================================================
  const selectedGradeLevel = useMemo(() => {
    return tabToGradeLevel(currentTab);
  }, [currentTab]);

  const { data: gradeSchedules, isLoading: isLoadingGradeSchedules } = useSWR(
    selectedGradeLevel ? `grade-schedules-${academicYear}-${semester}-${selectedGradeLevel}` : null,
    async () => {
      if (!selectedGradeLevel) return [];
      const result = await getClassSchedulesAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',
        GradeID: undefined, // Will fetch by Year instead
      });
      if (!result || typeof result !== 'object' || !('success' in result) || !result.success) return [];
      if (!('data' in result)) return [];
      
      // Filter by grade level Year
      const schedules = (result.data as unknown[]) || [];
      return schedules.filter((s: unknown) => {
        const schedule = s as { gradelevel?: { Year?: number } };
        return schedule.gradelevel?.Year === selectedGradeLevel;
      });
    }
  );

  // ============================================================================
  // COMPUTED DATA - Grade Level Class Data
  // ============================================================================
  const gradeClassData = useMemo(() => {
    if (!gradeLevels || !gradeSchedules || !selectedGradeLevel) return [];
    
    // Filter classes for selected grade level
    const classes = gradeLevels.filter((g: gradelevel) => g.Year === selectedGradeLevel);
    
    // Group schedules by class
    return classes.map((cls: gradelevel) => {
      const classSchedules = gradeSchedules.filter((s: unknown) => {
        const schedule = s as { GradeID?: string };
        return schedule.GradeID === cls.GradeID;
      });
      
      // Calculate expected periods from config
      const totalPeriods = timetableConfig.totalPeriodsPerWeek;
      const assignedPeriods = classSchedules.length;
      
      return {
        class: cls,
        schedules: classSchedules,
        totalPeriods,
        assignedPeriods,
      };
    });
  }, [gradeLevels, gradeSchedules, selectedGradeLevel]);

  // ============================================================================
  // COMPUTED DATA - Grade Counts for Tabs
  // ============================================================================
  const gradeCounts = useMemo(() => {
    if (!gradeLevels) return {};
    
    const counts: Record<number, number> = {};
    gradeLevels.forEach((g: gradelevel) => {
      counts[g.Year] = (counts[g.Year] || 0) + 1;
    });
    
    return counts;
  }, [gradeLevels]);

  // ============================================================================
  // COMPUTED DATA - Teachers (Prisma type)
  // ============================================================================
  const transformedTeachers = useMemo(() => {
    if (!allTeachers) return [];
    // ArrangementHeader now expects Prisma's teacher type directly
    return allTeachers as teacher[];
  }, [allTeachers]);

  // ============================================================================
  // EFFECTS - Initialize Teacher
  // ============================================================================
  useEffect(() => {
    if (searchTeacherID) {
      setCurrentTeacherID(searchTeacherID);
    }
  }, [searchTeacherID, setCurrentTeacherID]);

  useEffect(() => {
    if (currentTeacherID && allTeachers) {
      const teacher = allTeachers.find((t: unknown) => {
        const teacherData = t as { TeacherID?: number };
        return teacherData.TeacherID === parseInt(currentTeacherID);
      });
      if (teacher) {
        // Transform PascalCase to camelCase for store
        const rawTeacher = teacher as { 
          TeacherID: number; 
          Prefix: string; 
          Firstname: string; 
          Lastname: string; 
          Department: string; 
          Email: string; 
          Role: string; 
        };
        // Store now expects Prisma's teacher type directly
        setTeacherData(rawTeacher);
      }
    }
  }, [currentTeacherID, allTeachers, setTeacherData]);

  // ============================================================================
  // EFFECTS - Reset on Teacher Change
  // ============================================================================
  useEffect(() => {
    return () => {
      resetOnTeacherChange();
    };
  }, [currentTeacherID, resetOnTeacherChange]);

  // ============================================================================
  // HANDLERS - Tab Change
  // ============================================================================
  const handleTabChange = useCallback((tab: ArrangeTab) => {
    setCurrentTab(tab);
  }, []);

  // ============================================================================
  // HANDLERS - Teacher Change
  // ============================================================================
  const handleTeacherChange = useCallback((teacherID: string) => {
    setCurrentTeacherID(teacherID);
    router.push(`/schedule/${semester}-${academicYear}/arrange?TeacherID=${teacherID}`);
  }, [semester, academicYear, router, setCurrentTeacherID]);

  // ============================================================================
  // HANDLERS - Save
  // ============================================================================
  const handleSave = useCallback(async () => {
    if (!currentTeacherID || !teacherSchedule) {
      enqueueSnackbar('กรุณาเลือกครูก่อนบันทึก', { variant: 'warning' });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await syncTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
        schedules: teacherSchedule,
      });

      if (result.success) {
        enqueueSnackbar('✅ บันทึกตารางสอนสำเร็จ', { variant: 'success' });
        setIsDirty(false);
        void mutateTeacherSchedule();
        void mutateConflicts();
      } else {
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'ไม่ทราบสาเหตุ';
        enqueueSnackbar(`❌ บันทึกไม่สำเร็จ: ${errorMsg}`, { variant: 'error' });
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar('❌ เกิดข้อผิดพลาดในการบันทึก', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [currentTeacherID, teacherSchedule, setIsSaving, setIsDirty, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Drag & Drop
  // ============================================================================
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const subject = availableSubjects?.find((s: unknown) => {
      const subj = s as { SubjectCode?: string };
      return subj.SubjectCode === active.id;
    });
    if (subject) {
      setActiveSubject(subject);
    }
  }, [availableSubjects]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over } = event;
    setActiveSubject(null);

    if (!over) return;

    // const subjectCode = active.id as string;
    const timeslotID = over.id as string;

    // TODO: Implement subject placement logic
    // This would involve:
    // 1. Validate timeslot is not locked
    // 2. Check for conflicts
    // 3. Open room selection dialog
    // 4. Update teacher schedule
    // 5. Mark as dirty

    setSelectedTimeslotForRoom(timeslotID);
    setRoomDialogOpen(true);
  }, []);

  // ============================================================================
  // HANDLERS - Room Selection
  // ============================================================================
  const handleRoomSelect = useCallback((_room: { RoomID: number; RoomName: string; Building: string; Floor: string }) => {
    // TODO: Implement room selection logic
    // Would update teacher schedule with selected room
    setRoomDialogOpen(false);
    setSelectedTimeslotForRoom(null);
    setIsDirty(true);
  }, []);

  // ============================================================================
  // HANDLERS - Clear All
  // ============================================================================
  const handleClearAll = useCallback(() => {
    void (async () => {
      if (!currentTeacherID || !teacherSchedule) {
        enqueueSnackbar('ไม่พบข้อมูลตารางสอน', { variant: 'warning' });
        return;
      }

      try {
        // Push history before modification
        pushHistory(scheduledSubjects);

        // Clear all schedules
        const result = await syncTeacherScheduleAction({
          TeacherID: parseInt(currentTeacherID),
          AcademicYear: parseInt(academicYear),
          Semester: semester,
          Schedule: [],
        });

        if (result.success) {
          await mutateTeacherSchedule();
          await mutateConflicts();
          setIsDirty(false);
          enqueueSnackbar('✅ ล้างตารางทั้งหมดสำเร็จ', { variant: 'success' });
        } else {
          enqueueSnackbar('❌ เกิดข้อผิดพลาดในการล้างตาราง', { variant: 'error' });
        }
      } catch (error) {
        console.error('Clear all error:', error);
        enqueueSnackbar('❌ เกิดข้อผิดพลาดในการล้างตาราง', { variant: 'error' });
      }
    })();
  }, [currentTeacherID, teacherSchedule, academicYear, semester, scheduledSubjects, pushHistory, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Clear Day (Phase 2)
  // ============================================================================
  const handleClearDay = useCallback((day: number) => {
    void (async () => {
      if (!currentTeacherID || !teacherSchedule || !Array.isArray(teacherSchedule) || !timeslots) {
        enqueueSnackbar('ไม่พบข้อมูลตารางสอน', { variant: 'warning' });
        return;
      }

      try {
        // Push history before modification
        pushHistory(scheduledSubjects);

        // Map day number to enum (1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI)
        const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
        const dayOfWeek = dayMap[day - 1];
        
        if (!dayOfWeek) {
          enqueueSnackbar('วันที่เลือกไม่ถูกต้อง', { variant: 'error' });
          return;
        }

        // Get timeslot IDs for this day
        const dayTimeslotIDs = new Set(
          timeslots
            .filter((ts) => {
              const slot = ts as { DayOfWeek?: string };
              return slot.DayOfWeek === dayOfWeek;
            })
            .map((ts) => {
              const slot = ts as { TimeslotID?: string };
              return slot.TimeslotID;
            })
        );

        // Filter out schedules for this day
        const remainingSchedules = teacherSchedule.filter((schedule) => {
          const sched = schedule as { TimeslotID?: string };
          return !dayTimeslotIDs.has(sched.TimeslotID || '');
        });

        // Sync updated schedule
        const scheduleData = remainingSchedules.map((s) => {
          const sched = s as { ClassID: string; TimeslotID: string; SubjectCode: string; GradeID: string; RoomID?: number; RespID?: number };
          return {
            ClassID: sched.ClassID,
            TimeslotID: sched.TimeslotID,
            SubjectCode: sched.SubjectCode,
            GradeID: sched.GradeID,
            RoomID: sched.RoomID || null,
            RespID: sched.RespID || null,
          };
        });

        const result = await syncTeacherScheduleAction({
          TeacherID: parseInt(currentTeacherID),
          AcademicYear: parseInt(academicYear),
          Semester: semester,
          Schedule: scheduleData,
        });

        if (result.success) {
          await mutateTeacherSchedule();
          await mutateConflicts();
          setIsDirty(false);
          enqueueSnackbar(`✅ ล้างตารางวัน${dayMap[day - 1]}สำเร็จ`, { variant: 'success' });
        } else {
          enqueueSnackbar('❌ เกิดข้อผิดพลาดในการล้างตาราง', { variant: 'error' });
        }
      } catch (error) {
        console.error('Clear day error:', error);
        enqueueSnackbar('❌ เกิดข้อผิดพลาดในการล้างตาราง', { variant: 'error' });
      }
    })();
  }, [currentTeacherID, teacherSchedule, timeslots, academicYear, semester, scheduledSubjects, pushHistory, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Copy Day (Phase 2)
  // ============================================================================
  const handleCopyDay = useCallback((sourceDay: number, targetDay: number) => {
    void (async () => {
      if (!currentTeacherID || !teacherSchedule || !Array.isArray(teacherSchedule) || !timeslots) {
        enqueueSnackbar('ไม่พบข้อมูลตารางสอน', { variant: 'warning' });
        return;
      }

      if (sourceDay === targetDay) {
        enqueueSnackbar('ไม่สามารถคัดลอกไปยังวันเดียวกันได้', { variant: 'warning' });
        return;
      }

      try {
        // Push history before modification
        pushHistory(scheduledSubjects);

        // Map day number to enum
        const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
        const sourceDayOfWeek = dayMap[sourceDay - 1];
        const targetDayOfWeek = dayMap[targetDay - 1];
        
        if (!sourceDayOfWeek || !targetDayOfWeek) {
          enqueueSnackbar('วันที่เลือกไม่ถูกต้อง', { variant: 'error' });
          return;
        }

        // Build timeslot mapping (source period -> target period)
        const sourceTimeslots = timeslots.filter((ts) => {
          const slot = ts as { DayOfWeek?: string };
          return slot.DayOfWeek === sourceDayOfWeek;
        });
        
        const targetTimeslots = timeslots.filter((ts) => {
          const slot = ts as { DayOfWeek?: string };
          return slot.DayOfWeek === targetDayOfWeek;
        });

        // Sort by StartTime to align periods
        const sortedSource = [...sourceTimeslots].sort((a, b) => {
          const timeA = (a as { StartTime?: Date }).StartTime || new Date();
          const timeB = (b as { StartTime?: Date }).StartTime || new Date();
          return timeA.getTime() - timeB.getTime();
        });

        const sortedTarget = [...targetTimeslots].sort((a, b) => {
          const timeA = (a as { StartTime?: Date }).StartTime || new Date();
          const timeB = (b as { StartTime?: Date }).StartTime || new Date();
          return timeA.getTime() - timeB.getTime();
        });

        // Create timeslot ID mapping
        const timeslotMap = new Map<string, string>();
        sortedSource.forEach((sourceSlot, idx) => {
          const sourceID = (sourceSlot as { TimeslotID?: string }).TimeslotID;
          const targetSlot = sortedTarget[idx];
          const targetID = targetSlot ? (targetSlot as { TimeslotID?: string }).TimeslotID : null;
          if (sourceID && targetID) {
            timeslotMap.set(sourceID, targetID);
          }
        });

        // Get target day timeslot IDs for clearing
        const targetTimeslotIDs = new Set(sortedTarget.map((ts) => (ts as { TimeslotID?: string }).TimeslotID));

        // Remove existing schedules from target day
        const nonTargetSchedules = teacherSchedule.filter((schedule) => {
          const sched = schedule as { TimeslotID?: string };
          return !targetTimeslotIDs.has(sched.TimeslotID || '');
        });

        // Copy schedules from source day to target day
        const copiedSchedules = teacherSchedule
          .filter((schedule) => {
            const sched = schedule as { TimeslotID?: string };
            return timeslotMap.has(sched.TimeslotID || '');
          })
          .map((schedule) => {
            const sched = schedule as { ClassID: string; TimeslotID: string; SubjectCode: string; GradeID: string; RoomID?: number; RespID?: number };
            const newTimeslotID = timeslotMap.get(sched.TimeslotID) || sched.TimeslotID;
            const newClassID = `${sched.GradeID}-${newTimeslotID}`;
            
            return {
              ClassID: newClassID,
              TimeslotID: newTimeslotID,
              SubjectCode: sched.SubjectCode,
              GradeID: sched.GradeID,
              RoomID: sched.RoomID || null,
              RespID: sched.RespID || null,
            };
          });

        // Combine non-target schedules with copied schedules
        const newScheduleData = [
          ...nonTargetSchedules.map((s) => {
            const sched = s as { ClassID: string; TimeslotID: string; SubjectCode: string; GradeID: string; RoomID?: number; RespID?: number };
            return {
              ClassID: sched.ClassID,
              TimeslotID: sched.TimeslotID,
              SubjectCode: sched.SubjectCode,
              GradeID: sched.GradeID,
              RoomID: sched.RoomID || null,
              RespID: sched.RespID || null,
            };
          }),
          ...copiedSchedules,
        ];

        // Sync updated schedule
        const result = await syncTeacherScheduleAction({
          TeacherID: parseInt(currentTeacherID),
          AcademicYear: parseInt(academicYear),
          Semester: semester,
          Schedule: newScheduleData,
        });

        if (result.success) {
          await mutateTeacherSchedule();
          await mutateConflicts();
          setIsDirty(false);
          enqueueSnackbar(`✅ คัดลอกตารางจาก${dayMap[sourceDay - 1]}ไป${dayMap[targetDay - 1]}สำเร็จ`, { variant: 'success' });
        } else {
          enqueueSnackbar('❌ เกิดข้อผิดพลาดในการคัดลอกตาราง', { variant: 'error' });
        }
      } catch (error) {
        console.error('Copy day error:', error);
        enqueueSnackbar('❌ เกิดข้อผิดพลาดในการคัดลอกตาราง', { variant: 'error' });
      }
    })();
  }, [currentTeacherID, teacherSchedule, timeslots, academicYear, semester, scheduledSubjects, pushHistory, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Undo (Phase 2)
  // ============================================================================
  const handleUndo = useCallback(() => {
    void (async () => {
      if (!canUndo()) {
        enqueueSnackbar('ไม่มีประวัติที่จะย้อนกลับ', { variant: 'info' });
        return;
      }

      try {
        undo();
        await mutateTeacherSchedule();
        await mutateConflicts();
        setIsDirty(true);
        enqueueSnackbar('↩️ ย้อนกลับสำเร็จ', { variant: 'success' });
      } catch (error) {
        console.error('Undo error:', error);
        enqueueSnackbar('❌ เกิดข้อผิดพลาดในการย้อนกลับ', { variant: 'error' });
      }
    })();
  }, [canUndo, undo, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Redo (Phase 2)
  // ============================================================================
  const handleRedo = useCallback(() => {
    void (async () => {
      if (!canRedo()) {
        enqueueSnackbar('ไม่มีประวัติที่จะทำซ้ำ', { variant: 'info' });
        return;
      }

      try {
        redo();
        await mutateTeacherSchedule();
        await mutateConflicts();
        setIsDirty(true);
        enqueueSnackbar('↪️ ทำซ้ำสำเร็จ', { variant: 'success' });
      } catch (error) {
        console.error('Redo error:', error);
        enqueueSnackbar('❌ เกิดข้อผิดพลาดในการทำซ้ำ', { variant: 'error' });
      }
    })();
  }, [canRedo, redo, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Auto Arrange (Phase 2)
  // ============================================================================
  const handleAutoArrange = useCallback(() => {
    // TODO: Implement auto arrange algorithm or show "coming soon" dialog
    // This would require complex constraint satisfaction logic
    enqueueSnackbar('🚧 ฟีเจอร์จัดตารางอัตโนมัติกำลังพัฒนา', { variant: 'info' });
  }, []);

  // ============================================================================
  // COMPUTED - Break Slots (TODO: Get from config)
  // ============================================================================

  // ============================================================================
  // COMPUTED - Locked Timeslots
  // ============================================================================
  const lockedTimeslots = useMemo(() => {
    // TODO: Get from lock data
    return new Set<string>();
  }, []);

  // ============================================================================
  // COMPUTED - Progress Data (Phase 2)
  // ============================================================================
  const overallProgress = useMemo(() => {
    if (!timeslots || !teacherSchedule || !Array.isArray(teacherSchedule)) {
      return {
        totalSlots: 0,
        filledSlots: 0,
        conflictSlots: 0,
      };
    }

    return {
      totalSlots: timeslots.length,
      filledSlots: teacherSchedule.length,
      conflictSlots: conflicts?.length || 0,
    };
  }, [timeslots, teacherSchedule, conflicts]);

  // Multi-teacher progress calculation - fetch all teachers' schedules
  const { data: allTeacherSchedules } = useSWR(
    allTeachers && timeslots ? `all-teacher-schedules-${academicYear}-${semester}` : null,
    async () => {
      if (!allTeachers || !timeslots) return [];

      // Fetch schedules for all teachers
      const schedulePromises = (allTeachers as unknown[]).map(async (t) => {
        const teacher = t as { TeacherID?: number; Firstname?: string; Lastname?: string };
        const teacherId = teacher.TeacherID;
        if (!teacherId) return null;

        try {
          const result = await getTeacherScheduleAction({ TeacherID: teacherId });
          if (!result || !result.success || !result.data) return null;

          return {
            teacherId,
            teacherName: `${teacher.Firstname || ''} ${teacher.Lastname || ''}`,
            schedule: Array.isArray(result.data) ? result.data : [],
          };
        } catch (error) {
          console.error(`Error fetching schedule for teacher ${teacherId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(schedulePromises);
      return results.filter(Boolean);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const teacherProgressData = useMemo(() => {
    if (!allTeacherSchedules || !timeslots || !allTeachers) {
      return [];
    }

    const totalSlots = timeslots.length;

    // Map all teachers to progress items
    return (allTeacherSchedules as unknown[])
      .map((item) => {
        const data = item as { 
          teacherId?: number; 
          teacherName?: string; 
          schedule?: unknown[]; 
        };
        if (!data.teacherId) return null;

        const completedSlots = data.schedule?.length || 0;
        
        // Get conflicts for this teacher (if they match current teacher)
        const conflictSlots = currentTeacherID && parseInt(currentTeacherID) === data.teacherId
          ? (conflicts?.length || 0)
          : 0; // We don't have conflict data for non-selected teachers yet

        return {
          id: String(data.teacherId),
          name: data.teacherName || '',
          total: totalSlots,
          completed: completedSlots,
          conflicts: conflictSlots,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [allTeacherSchedules, timeslots, allTeachers, currentTeacherID, conflicts]);

  const classProgressData = useMemo(() => {
    if (!teacherSchedule || !Array.isArray(teacherSchedule) || !gradeLevels) {
      return [];
    }

    // Group schedules by GradeID
    const gradeScheduleMap = new Map<string, number>();
    teacherSchedule.forEach((schedule) => {
      const sched = schedule as { GradeID?: string };
      const gradeId = sched.GradeID;
      if (gradeId) {
        gradeScheduleMap.set(gradeId, (gradeScheduleMap.get(gradeId) || 0) + 1);
      }
    });

    // Get conflicts by class
    const gradeConflictMap = new Map<string, number>();
    if (conflicts && Array.isArray(conflicts)) {
      conflicts.forEach((conflict) => {
        const conf = conflict as { GradeID?: string };
        const gradeId = conf.GradeID;
        if (gradeId) {
          gradeConflictMap.set(gradeId, (gradeConflictMap.get(gradeId) || 0) + 1);
        }
      });
    }

    // Calculate expected periods per class (from config)
    const periodsPerWeek = timetableConfig.totalPeriodsPerWeek || 35;

    // Map to ProgressItem format
    return Array.from(gradeScheduleMap.entries()).map(([gradeId, completed]) => {
      const grade = (gradeLevels as unknown[]).find((g) => {
        const level = g as { GradeID?: string };
        return level.GradeID === gradeId;
      });
      const gradeData = grade as { Year?: number; Number?: number };

      return {
        id: gradeId,
        name: `ม.${gradeData.Year || '?'}/${gradeData.Number || '?'}`,
        total: periodsPerWeek,
        completed,
        conflicts: gradeConflictMap.get(gradeId) || 0,
      };
    });
  }, [teacherSchedule, gradeLevels, conflicts, timetableConfig]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  const isLoading = isLoadingTeachers || isLoadingTimeslots;

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <TimetableGridSkeleton />
      </Container>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (!allTeachers || !timeslots) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <NetworkErrorEmptyState />
      </Container>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <ArrangementHeader
            teacherData={teacherData}
            availableTeachers={transformedTeachers}
            onTeacherChange={handleTeacherChange}
            onSave={() => void handleSave()}
            isSaving={isSaving}
            isDirty={isDirty}
            semester={semester}
            academicYear={academicYear}
          />

          {/* Tabs */}
          <GradeLevelTabs
            currentTab={currentTab}
            onTabChange={handleTabChange}
            gradeCounts={gradeCounts}
          />

          {/* Conflicts Alert */}
          {currentTab === 'teacher' && conflicts && conflicts.length > 0 && (
            <ConflictAlert
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              conflicts={conflicts as any}
              onClose={() => void mutateConflicts()}
            />
          )}

          {/* Teacher Tab Content */}
          {currentTab === 'teacher' && (
            <>
              {!currentTeacherID ? (
                <Alert severity="info">
                  <AlertTitle>กรุณาเลือกครูผู้สอน</AlertTitle>
                  เลือกครูจากรายการด้านบนเพื่อเริ่มจัดตารางสอน
                </Alert>
              ) : (
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                  {/* Subject Palette - Phase 2 Enhanced */}
                  <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
                    <SearchableSubjectPalette
                      respData={availableSubjects || []}
                      dropOutOfZone={() => {
                        // Handle subject dropped outside grid - no action needed
                      }}
                      clickOrDragToSelectSubject={(subject) => {
                        setActiveSubject(subject);
                      }}
                      storeSelectedSubject={activeSubject || {}}
                      teacher={teacherData || {
                        // Default empty teacher if null
                        TeacherID: 0,
                        Prefix: '',
                        Firstname: '',
                        Lastname: '',
                        Department: '',
                        Email: '',
                        Role: 'teacher',
                      } as teacher}
                    />
                  </Box>

                  {/* Main Content */}
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      {/* Action Toolbar - Phase 2 Enhanced */}
                      <ScheduleActionToolbar
                        onClearDay={handleClearDay}
                        onClearAll={handleClearAll}
                        onCopyDay={handleCopyDay}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onAutoArrange={handleAutoArrange}
                        canUndo={canUndo()}
                        canRedo={canRedo()}
                        hasChanges={isDirty}
                        totalSlots={timeslots?.length || 0}
                        filledSlots={scheduledSubjects.length}
                      />

                      {/* Progress Indicators - Phase 2 Enhanced */}
                      <ScheduleProgressIndicators
                        overallProgress={overallProgress}
                        teacherProgress={teacherProgressData}
                        classProgress={classProgressData}
                      />

                      {/* Timetable Grid */}
                      {isLoadingSchedule ? (
                        <TimetableGridSkeleton />
                      ) : (
                        <TimetableGrid
                          timeslots={timeslots || []}
                          periodsPerDay={timetableConfig.periodsPerDay}
                          breakSlots={timetableConfig.breakSlots}
                          getConflicts={(timeslotID) => {
                            const conflict = conflicts?.find((c: unknown) => {
                              const conflictData = c as { TimeslotID?: string; message?: string };
                              return conflictData.TimeslotID === timeslotID;
                            });
                            const conflictData = conflict as { message?: string } | undefined;
                            return {
                              hasConflict: !!conflict,
                              message: conflictData?.message,
                            };
                          }}
                          lockedTimeslots={lockedTimeslots}
                          selectedTimeslotID={selectedTimeslotForRoom}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </>
          )}

          {/* Grade Level Tab Content */}
          {currentTab !== 'teacher' && (
            <GradeClassView
              gradeLevel={selectedGradeLevel || 7}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              classes={gradeClassData as any}
              isLoading={isLoadingGradeSchedules}
            />
          )}
        </Stack>

        {/* Room Selection Dialog */}
        <RoomSelectionDialog
          open={roomDialogOpen}
          rooms={[]} // TODO: Fetch available rooms
          subjectName={activeSubject?.subjectName || ''}
          timeslotLabel={selectedTimeslotForRoom || ''}
          onSelect={handleRoomSelect}
          onCancel={() => {
            setRoomDialogOpen(false);
            setSelectedTimeslotForRoom(null);
          }}
          occupiedRoomIDs={[]}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeSubject && (
            <Paper
              elevation={8}
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                minWidth: 200,
                cursor: 'grabbing',
              }}
            >
              {activeSubject.subjectName}
            </Paper>
          )}
        </DragOverlay>
      </Container>
    </DndContext>
  );
}
