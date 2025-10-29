/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  SubjectPalette,
  TimetableGrid,
  RoomSelectionDialog,
  ActionToolbar,
  GradeClassView,
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
import type { SubjectData } from '@/types';
import type { gradelevel } from '@/prisma/generated';

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
  
  const [semester, academicYear] = (params.semesterAndyear as string).split('-');

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
        setTeacherData(teacher);
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
    // TODO: Implement clear all logic
    setIsDirty(true);
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
            availableTeachers={allTeachers || []}
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
                  {/* Subject Palette */}
                  <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
                    <SubjectPalette
                      subjects={availableSubjects || []}
                      scheduledSubjects={scheduledSubjects}
                      onSubjectClick={() => {/* TODO: Handle subject click */}}
                      selectedSubject={activeSubject}
                    />
                  </Box>

                  {/* Main Content */}
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      {/* Action Toolbar */}
                      <ActionToolbar
                        scheduledCount={scheduledSubjects.length}
                        canUndo={false}
                        canRedo={false}
                        hasSchedules={scheduledSubjects.length > 0}
                        onClearAll={handleClearAll}
                        onUndo={() => {/* TODO: Implement undo */}}
                        onRedo={() => {/* TODO: Implement redo */}}
                        onCopyDay={() => {/* TODO: Implement copy day */}}
                        onRefresh={() => {
                          void mutateTeacherSchedule();
                          void mutateConflicts();
                        }}
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
          subjectName={activeSubject?.SubjectName || ''}
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
              {activeSubject.SubjectName}
            </Paper>
          )}
        </DragOverlay>
      </Container>
    </DndContext>
  );
}
