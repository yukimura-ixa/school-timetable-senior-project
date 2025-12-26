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

"use client";

import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { enqueueSnackbar } from "notistack";
import { useSemesterSync } from "@/hooks";
import { Box, Container, Paper, Stack, Alert, AlertTitle } from "@mui/material";
import { authClient } from "@/lib/auth-client";

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
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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
} from "./_components";

// Domain Constants
import {
  tabToGradeLevel,
  ARRANGE_TABS,
  type ArrangeTab,
} from "@/features/schedule-arrangement/domain/constants/arrangement.constants";

// Server Actions
import {
  getTeacherScheduleAction,
  syncTeacherScheduleAction,
} from "@/features/arrange/application/actions/arrange.actions";
import {
  getConflictsAction,
  getClassSchedulesAction,
  createClassScheduleAction,
} from "@/features/class/application/actions/class.actions";
import {
  checkTeacherConflictAction,
  checkRoomConflictAction,
} from "@/features/conflict/application/actions/conflict.actions";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { getAvailableRespsAction } from "@/features/assign/application/actions/assign.actions";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import { getTimetableConfigAction } from "@/lib/actions/timetable-config.actions";
import { getRawLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions";
import {
  getAvailableRoomsAction,
  getOccupiedRoomsAction,
} from "@/features/room/application/actions/room.actions";

// Zustand Store
import { useArrangementUIStore } from "@/features/schedule-arrangement/presentation/stores/arrangement-ui.store";

// Conflict Validation Hook
import { useConflictValidation } from "@/features/schedule-arrangement/presentation/hooks";

// Config (import from constants to avoid bundling Prisma in browser)
import type { TimetableConfig } from "@/lib/timetable-config.constants";
import { DEFAULT_TIMETABLE_CONFIG } from "@/lib/timetable-config.constants";

// Types
import type { SubjectData, TeacherData } from "@/types/schedule.types";
import type { gradelevel, teacher, room } from "@/prisma/generated/client";

// Feedback Components
import {
  TimetableGridSkeleton,
  NetworkErrorEmptyState,
} from "@/components/feedback";

// Client Logger
import { createClientLogger } from "@/lib/client-logger";

const log = createClientLogger("ArrangementPage");

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
  const searchTeacherID = searchParams.get("TeacherID");

  // Use useSemesterSync to extract and sync semester with global store
  // Extract academicYear and semester from route params
  const academicYear = params.academicYear ? parseInt(params.academicYear as string, 10) : null;
  const semester = params.semester ? parseInt(params.semester as string, 10) : null;
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const canFetch = Boolean(session?.user) && !isSessionLoading;

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
    if (!canFetch) {
      return;
    }

    const fetchConfig = async () => {
      const result = await getTimetableConfigAction({
        academicYear: parseInt(academicYear),
        semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (result.success && result.data) {
        setTimetableConfig(result.data);
      }
    };
    void fetchConfig();
  }, [academicYear, semester, canFetch]);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  const [currentTab, setCurrentTab] = useState<ArrangeTab>("teacher");
  const [activeSubject, setActiveSubject] = useState<SubjectData | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedTimeslotForRoom, setSelectedTimeslotForRoom] = useState<
    string | null
  >(null);
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>(
    DEFAULT_TIMETABLE_CONFIG,
  );

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
    setLockData,

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
  // CONFLICT VALIDATION
  // ============================================================================
  const conflictValidation = useConflictValidation();

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
    }),
  );

  // ============================================================================
  // DATA FETCHING - Teachers
  // ============================================================================
  const { data: allTeachers, isLoading: isLoadingTeachers } = useSWR(
    canFetch ? "teachers" : null,
    async () => {
      const result = await getTeachersAction({});
      if (!result || !result.success) return [];
      return result.data || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Grade Levels
  // ============================================================================
  const { data: gradeLevels } = useSWR(
    canFetch ? `gradelevels-${academicYear}-${semester}` : null,
    async () => {
      const result = await getGradeLevelsAction({});
      if (!result || !result.success) return [];
      return result.data || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Teacher Schedule (for Teacher Tab)
  // ============================================================================
  const {
    data: teacherSchedule,
    mutate: mutateTeacherSchedule,
    isLoading: isLoadingSchedule,
  } = useSWR(
    canFetch && currentTeacherID
      ? `teacher-schedule-${currentTeacherID}`
      : null,
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || !result.success) return null;
      return result.data;
    },
  );

  // ============================================================================
  // DATA FETCHING - Available Subjects (for Teacher)
  // ============================================================================
  const { data: availableSubjects } = useSWR<SubjectData[]>(
    canFetch && currentTeacherID
      ? `available-subjects-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async () => {
      if (!currentTeacherID) return [];
      const result = await getAvailableRespsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      });
      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        !result.success
      )
        return [];
      if (!("data" in result)) return [];
      return (result.data as SubjectData[]) || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Timeslots
  // ============================================================================
  const { data: timeslots, isLoading: isLoadingTimeslots } = useSWR(
    canFetch ? `timeslots-${academicYear}-${semester}` : null,
    async () => {
      const result = await getTimeslotsByTermAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (!result || !result.success) return [];
      return result.data || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Conflicts
  // ============================================================================
  const { data: conflicts, mutate: mutateConflicts } = useSWR(
    canFetch && currentTeacherID
      ? `conflicts-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async () => {
      if (!currentTeacherID) return [];
      const result = await getConflictsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      });
      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        !result.success
      )
        return [];
      if (!("data" in result)) return [];
      return (result.data as unknown[]) || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Locked Schedules
  // ============================================================================
  const { data: lockedSchedules } = useSWR(
    canFetch ? `locked-schedules-${academicYear}-${semester}` : null,
    async () => {
      const result = await getRawLockedSchedulesAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (!result || !result.success) return [];
      return result.data || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Room Availability (for Room Dialog)
  // ============================================================================
  const { data: availableRooms } = useSWR(
    canFetch && selectedTimeslotForRoom
      ? `available-rooms-${selectedTimeslotForRoom}`
      : null,
    async () => {
      if (!selectedTimeslotForRoom) return [];
      const result = await getAvailableRoomsAction({
        TimeslotID: selectedTimeslotForRoom,
      });
      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        !result.success
      )
        return [];
      if (!("data" in result)) return [];
      return (result.data as unknown[]) || [];
    },
  );

  const { data: occupiedRoomIDs } = useSWR(
    canFetch && selectedTimeslotForRoom
      ? `occupied-rooms-${selectedTimeslotForRoom}`
      : null,
    async () => {
      if (!selectedTimeslotForRoom) return [];
      const result = await getOccupiedRoomsAction({
        TimeslotID: selectedTimeslotForRoom,
      });
      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        !result.success
      )
        return [];
      if (!("data" in result)) return [];
      return (result.data as number[]) || [];
    },
  );

  // ============================================================================
  // DATA FETCHING - Grade Level Schedules (for Grade Tabs)
  // ============================================================================
  const selectedGradeLevel = useMemo(() => {
    return tabToGradeLevel(currentTab);
  }, [currentTab]);

  const { data: gradeSchedules, isLoading: isLoadingGradeSchedules } = useSWR(
    canFetch && selectedGradeLevel
      ? `grade-schedules-${academicYear}-${semester}-${selectedGradeLevel}`
      : null,
    async () => {
      if (!selectedGradeLevel) return [];
      const result = await getClassSchedulesAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        GradeID: undefined, // Will fetch by Year instead
      });
      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        !result.success
      )
        return [];
      if (!("data" in result)) return [];

      // Filter by grade level Year
      const schedules = (result.data as unknown[]) || [];
      return schedules.filter((s: unknown) => {
        const schedule = s as { gradelevel?: { Year?: number } };
        return schedule.gradelevel?.Year === selectedGradeLevel;
      });
    },
  );

  // ============================================================================
  // COMPUTED DATA - Grade Level Class Data
  // ============================================================================
  const gradeClassData = useMemo(() => {
    if (!gradeLevels || !gradeSchedules || !selectedGradeLevel) return [];

    // Filter classes for selected grade level
    const classes = gradeLevels.filter(
      (g: gradelevel) => g.Year === selectedGradeLevel,
    );

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
    return allTeachers;
  }, [allTeachers]);

  // ============================================================================
  // EFFECTS - Initialize Teacher
  // ============================================================================
  useEffect(() => {
    if (searchTeacherID) {
      setCurrentTeacherID(searchTeacherID);
    }
  }, [searchTeacherID, setCurrentTeacherID]);

  // ============================================================================
  // EFFECTS - Update Lock Data in Store
  // ============================================================================
  useEffect(() => {
    if (lockedSchedules) {
      setLockData(lockedSchedules);
    }
  }, [lockedSchedules, setLockData]);

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
  // COMPUTED - Break Slots
  // Extracts timeslot IDs where Breaktime is not NOT_BREAK
  // These slots are blocked from subject placement during drag-and-drop
  // ============================================================================
  const breakSlotIDs = useMemo(() => {
    if (!timeslots || !Array.isArray(timeslots)) {
      return new Set<string>();
    }

    const breakIDs = new Set<string>();
    for (const slot of timeslots) {
      const ts = slot as { TimeslotID?: string; Breaktime?: string };
      // Block any slot that has a break designation (BREAK_JUNIOR, BREAK_SENIOR, BREAK_BOTH)
      if (ts.Breaktime && ts.Breaktime !== "NOT_BREAK") {
        if (ts.TimeslotID) {
          breakIDs.add(ts.TimeslotID);
        }
      }
    }

    return breakIDs;
  }, [timeslots]);

  // ============================================================================
  // HANDLERS - Tab Change
  // ============================================================================
  const handleTabChange = useCallback((tab: ArrangeTab) => {
    setCurrentTab(tab);
  }, []);

  // ============================================================================
  // HANDLERS - Teacher Change
  // ============================================================================
  const handleTeacherChange = useCallback(
    (teacherID: string) => {
      setCurrentTeacherID(teacherID);
      router.push(
        `/schedule/${semester}-${academicYear}/arrange?TeacherID=${teacherID}`,
      );
    },
    [semester, academicYear, router, setCurrentTeacherID],
  );

  // ============================================================================
  // HANDLERS - Save
  // ============================================================================
  const handleSave = useCallback(async () => {
    if (!currentTeacherID || !teacherSchedule) {
      enqueueSnackbar("กรุณาเลือกครูก่อนบันทึก", { variant: "warning" });
      return;
    }

    setIsSaving(true);

    try {
      const result = await syncTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
        schedules: teacherSchedule,
      });

      if (result.success) {
        enqueueSnackbar("✅ บันทึกตารางสอนสำเร็จ", { variant: "success" });
        setIsDirty(false);
        void mutateTeacherSchedule();
        void mutateConflicts();
      } else {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "ไม่ทราบสาเหตุ";
        enqueueSnackbar(`❌ บันทึกไม่สำเร็จ: ${errorMsg}`, {
          variant: "error",
        });
      }
    } catch (error) {
      log.logError(error, { action: "save" });
      enqueueSnackbar("❌ เกิดข้อผิดพลาดในการบันทึก", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [
    currentTeacherID,
    teacherSchedule,
    setIsSaving,
    setIsDirty,
    mutateTeacherSchedule,
    mutateConflicts,
  ]);

  // ============================================================================
  // HANDLERS - Drag & Drop
  // ============================================================================
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = String(active.id);
      const subjectCode =
        activeId.replace(/^subject-/, "").split("-Grade-")[0] ?? activeId;
      const subject = availableSubjects?.find((s: unknown) => {
        const subj = s as { subjectCode?: string; SubjectCode?: string };
        return (
          subj.subjectCode === subjectCode || subj.SubjectCode === subjectCode
        );
      });
      if (subject) {
        setActiveSubject(subject);
      }
    },
    [availableSubjects],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveSubject(null);
        return;
      }

      const activeId = String(active.id);
      const subjectCode =
        activeId.replace(/^subject-/, "").split("-Grade-")[0] ?? activeId;
      const draggedSubject = availableSubjects?.find((s: unknown) => {
        const subj = s as { subjectCode?: string; SubjectCode?: string };
        return (
          subj.subjectCode === subjectCode || subj.SubjectCode === subjectCode
        );
      });
      if (!draggedSubject) {
        setActiveSubject(null);
        return;
      }
      const timeslotID = over.id as string;

      // Step 1: Validate timeslot is not a break slot
      if (breakSlotIDs.has(timeslotID)) {
        enqueueSnackbar("⏸️ ไม่สามารถจัดวิชาเรียนในคาบพักได้", {
          variant: "warning",
        });
        return;
      }

      // Step 2: Validate timeslot is not locked
      if (conflictValidation.lockedTimeslots.has(timeslotID)) {
        enqueueSnackbar("🔒 ช่วงเวลานี้ถูกล็อคแล้ว ไม่สามารถจัดตารางได้", {
          variant: "warning",
        });
        return;
      }

      // Step 3: Check for general conflicts using validation hook
      const conflictInfo =
        conflictValidation.conflictsByTimeslot.get(timeslotID);
      if (
        conflictInfo &&
        conflictInfo.type !== "none" &&
        conflictInfo.severity === "error"
      ) {
        enqueueSnackbar(`⚠️ ตรวจพบข้อขัดแย้ง: ${conflictInfo.message}`, {
          variant: "error",
        });
        return;
      }

      // Step 4: Check for specific teacher conflict (NEW - Issue #84)
      // Wrapped in async IIFE to avoid breaking useCallback
      void (async () => {
        if (currentTeacherID) {
          try {
            const teacherConflictResult = await checkTeacherConflictAction({
              teacherId: parseInt(currentTeacherID),
              timeslotId: timeslotID,
            });

            if (
              teacherConflictResult.success &&
              teacherConflictResult.data?.hasConflict
            ) {
              const conflict = teacherConflictResult.data;
              enqueueSnackbar(
                `⚠️ ${conflict.teacherName} สอนวิชา "${conflict.subjectName}" ชั้น ${conflict.gradeName} ในช่วงเวลานี้แล้ว`,
                { variant: "error" },
              );
              return;
            }

            // Step 5: If no conflict, open room selection dialog
            setActiveSubject(draggedSubject);
            setSelectedTimeslotForRoom(timeslotID);
            setRoomDialogOpen(true);
          } catch (error) {
            log.logError(error, { action: "teacherConflictCheck" });
            enqueueSnackbar("⚠️ ไม่สามารถตรวจสอบข้อขัดแย้งของครูได้", {
              variant: "warning",
            });
            // Continue to allow placement despite check failure
            setActiveSubject(draggedSubject);
            setSelectedTimeslotForRoom(timeslotID);
            setRoomDialogOpen(true);
          }
        } else {
          // No teacher selected, proceed to room selection
          setActiveSubject(draggedSubject);
          setSelectedTimeslotForRoom(timeslotID);
          setRoomDialogOpen(true);
        }
      })();
    },
    [
      availableSubjects,
      breakSlotIDs,
      conflictValidation.lockedTimeslots,
      conflictValidation.conflictsByTimeslot,
      currentTeacherID,
    ],
  );

  // ============================================================================
  // HANDLERS - Room Selection
  // ============================================================================
  const handleRoomSelect = useCallback(
    async (room: {
      RoomID: number;
      RoomName: string;
      Building: string;
      Floor: string;
    }) => {
      if (!activeSubject || !selectedTimeslotForRoom) {
        enqueueSnackbar("⚠️ ข้อมูลไม่ครบถ้วน", { variant: "warning" });
        setRoomDialogOpen(false);
        return;
      }

      let keepDialogOpen = false;

      try {
        // Extract required fields from activeSubject (from teachers_responsibility via getAvailableRespsAction)
        const subjectData = activeSubject as unknown as {
          subjectCode?: string;
          gradeID?: string;
          itemID?: number;
          SubjectCode?: string;
          GradeID?: string;
          RespID?: number;
        };

        const subjectCode = subjectData.subjectCode ?? subjectData.SubjectCode;
        const gradeID = subjectData.gradeID ?? subjectData.GradeID;
        const respId = subjectData.itemID ?? subjectData.RespID;

        if (!subjectCode || !gradeID || typeof respId !== "number") {
          enqueueSnackbar("⚠️ ข้อมูลรายวิชาไม่ครบถ้วน", { variant: "warning" });
          setRoomDialogOpen(false);
          return;
        }

        // Step 1: Check for room conflicts before creating schedule
        const roomConflictResult = await checkRoomConflictAction({
          roomId: room.RoomID,
          timeslotId: selectedTimeslotForRoom,
        });

        if (roomConflictResult.data?.hasConflict) {
          // Room is occupied - show error and keep dialog open for re-selection
          const conflictData = roomConflictResult.data;
          const message = `⚠️ ห้อง${conflictData.roomName} มี${conflictData.teacherName} สอนวิชา${conflictData.subjectName} ชั้น${conflictData.gradeName} ในช่วงเวลานี้แล้ว`;
          enqueueSnackbar(message, { variant: "error" });
          keepDialogOpen = true;
          return; // Don't close dialog - allow user to select different room
        }

        // Create schedule entry via Server Action (ClassID is auto-generated by database)
        const result = await createClassScheduleAction({
          TimeslotID: selectedTimeslotForRoom,
          SubjectCode: subjectCode,
          GradeID: gradeID,
          RoomID: room.RoomID,
          IsLocked: false,
          ResponsibilityIDs: [respId],
        });

        if (result) {
          // Revalidate caches to reflect new schedule
          await Promise.all([mutateTeacherSchedule(), mutateConflicts()]);

          // Push to history for undo/redo
          pushHistory(scheduledSubjects);

          // Mark as dirty for unsaved changes warning
          setIsDirty(true);

          enqueueSnackbar("✅ จัดตารางสอนสำเร็จ", { variant: "success" });
        }
      } catch (error) {
        log.logError(error, { action: "scheduleCreation" });
        const errorMsg =
          error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
        enqueueSnackbar(`❌ เกิดข้อผิดพลาด: ${errorMsg}`, { variant: "error" });
      } finally {
        // Cleanup dialog state unless we want to allow re-selection (room conflict)
        if (!keepDialogOpen) {
          setRoomDialogOpen(false);
          setSelectedTimeslotForRoom(null);
          setActiveSubject(null);
        }
      }
    },
    [
      activeSubject,
      selectedTimeslotForRoom,
      mutateTeacherSchedule,
      mutateConflicts,
      pushHistory,
      scheduledSubjects,
    ],
  );

  // ============================================================================
  // HANDLERS - Clear All
  // ============================================================================
  const handleClearAll = useCallback(() => {
    void (async () => {
      if (!currentTeacherID || !teacherSchedule) {
        enqueueSnackbar("ไม่พบข้อมูลตารางสอน", { variant: "warning" });
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
          enqueueSnackbar("✅ ล้างตารางทั้งหมดสำเร็จ", { variant: "success" });
        } else {
          enqueueSnackbar("❌ เกิดข้อผิดพลาดในการล้างตาราง", {
            variant: "error",
          });
        }
      } catch (error) {
        log.logError(error, { action: "clearAll" });
        enqueueSnackbar("❌ เกิดข้อผิดพลาดในการล้างตาราง", {
          variant: "error",
        });
      }
    })();
  }, [
    currentTeacherID,
    teacherSchedule,
    academicYear,
    semester,
    scheduledSubjects,
    pushHistory,
    mutateTeacherSchedule,
    mutateConflicts,
  ]);

  // ============================================================================
  // HANDLERS - Clear Day (Phase 2)
  // ============================================================================
  const handleClearDay = useCallback(
    (day: number) => {
      void (async () => {
        if (
          !currentTeacherID ||
          !teacherSchedule ||
          !Array.isArray(teacherSchedule) ||
          !timeslots
        ) {
          enqueueSnackbar("ไม่พบข้อมูลตารางสอน", { variant: "warning" });
          return;
        }

        try {
          // Push history before modification
          pushHistory(scheduledSubjects);

          // Map day number to enum (1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI)
          const dayMap = ["MON", "TUE", "WED", "THU", "FRI"];
          const dayOfWeek = dayMap[day - 1];

          if (!dayOfWeek) {
            enqueueSnackbar("วันที่เลือกไม่ถูกต้อง", { variant: "error" });
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
              }),
          );

          // Filter out schedules for this day
          const remainingSchedules = teacherSchedule.filter((schedule) => {
            const sched = schedule as { TimeslotID?: string };
            return !dayTimeslotIDs.has(sched.TimeslotID || "");
          });

          // Sync updated schedule
          const scheduleData = remainingSchedules.map((s) => {
            const sched = s as {
              ClassID: string;
              TimeslotID: string;
              SubjectCode: string;
              GradeID: string;
              RoomID?: number;
              RespID?: number;
            };
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
            enqueueSnackbar(`✅ ล้างตารางวัน${dayMap[day - 1]}สำเร็จ`, {
              variant: "success",
            });
          } else {
            enqueueSnackbar("❌ เกิดข้อผิดพลาดในการล้างตาราง", {
              variant: "error",
            });
          }
        } catch (error) {
          log.logError(error, { action: "clearDay" });
          enqueueSnackbar("❌ เกิดข้อผิดพลาดในการล้างตาราง", {
            variant: "error",
          });
        }
      })();
    },
    [
      currentTeacherID,
      teacherSchedule,
      timeslots,
      academicYear,
      semester,
      scheduledSubjects,
      pushHistory,
      mutateTeacherSchedule,
      mutateConflicts,
    ],
  );

  // ============================================================================
  // HANDLERS - Copy Day (Phase 2)
  // ============================================================================
  const handleCopyDay = useCallback(
    (sourceDay: number, targetDay: number) => {
      void (async () => {
        if (
          !currentTeacherID ||
          !teacherSchedule ||
          !Array.isArray(teacherSchedule) ||
          !timeslots
        ) {
          enqueueSnackbar("ไม่พบข้อมูลตารางสอน", { variant: "warning" });
          return;
        }

        if (sourceDay === targetDay) {
          enqueueSnackbar("ไม่สามารถคัดลอกไปยังวันเดียวกันได้", {
            variant: "warning",
          });
          return;
        }

        try {
          // Push history before modification
          pushHistory(scheduledSubjects);

          // Map day number to enum
          const dayMap = ["MON", "TUE", "WED", "THU", "FRI"];
          const sourceDayOfWeek = dayMap[sourceDay - 1];
          const targetDayOfWeek = dayMap[targetDay - 1];

          if (!sourceDayOfWeek || !targetDayOfWeek) {
            enqueueSnackbar("วันที่เลือกไม่ถูกต้อง", { variant: "error" });
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
            const targetID = targetSlot
              ? (targetSlot as { TimeslotID?: string }).TimeslotID
              : null;
            if (sourceID && targetID) {
              timeslotMap.set(sourceID, targetID);
            }
          });

          // Get target day timeslot IDs for clearing
          const targetTimeslotIDs = new Set(
            sortedTarget.map(
              (ts) => (ts as { TimeslotID?: string }).TimeslotID,
            ),
          );

          // Remove existing schedules from target day
          const nonTargetSchedules = teacherSchedule.filter((schedule) => {
            const sched = schedule as { TimeslotID?: string };
            return !targetTimeslotIDs.has(sched.TimeslotID || "");
          });

          // Copy schedules from source day to target day
          const copiedSchedules = teacherSchedule
            .filter((schedule) => {
              const sched = schedule as { TimeslotID?: string };
              return timeslotMap.has(sched.TimeslotID || "");
            })
            .map((schedule) => {
              const sched = schedule as {
                ClassID: string;
                TimeslotID: string;
                SubjectCode: string;
                GradeID: string;
                RoomID?: number;
                RespID?: number;
              };
              const newTimeslotID =
                timeslotMap.get(sched.TimeslotID) || sched.TimeslotID;
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
              const sched = s as {
                ClassID: string;
                TimeslotID: string;
                SubjectCode: string;
                GradeID: string;
                RoomID?: number;
                RespID?: number;
              };
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
            enqueueSnackbar(
              `✅ คัดลอกตารางจาก${dayMap[sourceDay - 1]}ไป${dayMap[targetDay - 1]}สำเร็จ`,
              { variant: "success" },
            );
          } else {
            enqueueSnackbar("❌ เกิดข้อผิดพลาดในการคัดลอกตาราง", {
              variant: "error",
            });
          }
        } catch (error) {
          log.logError(error, { action: "copyDay" });
          enqueueSnackbar("❌ เกิดข้อผิดพลาดในการคัดลอกตาราง", {
            variant: "error",
          });
        }
      })();
    },
    [
      currentTeacherID,
      teacherSchedule,
      timeslots,
      academicYear,
      semester,
      scheduledSubjects,
      pushHistory,
      mutateTeacherSchedule,
      mutateConflicts,
    ],
  );

  // ============================================================================
  // HANDLERS - Undo (Phase 2)
  // ============================================================================
  const handleUndo = useCallback(() => {
    void (async () => {
      if (!canUndo()) {
        enqueueSnackbar("ไม่มีประวัติที่จะย้อนกลับ", { variant: "info" });
        return;
      }

      try {
        undo();
        await mutateTeacherSchedule();
        await mutateConflicts();
        setIsDirty(true);
        enqueueSnackbar("↩️ ย้อนกลับสำเร็จ", { variant: "success" });
      } catch (error) {
        log.logError(error, { action: "undo" });
        enqueueSnackbar("❌ เกิดข้อผิดพลาดในการย้อนกลับ", { variant: "error" });
      }
    })();
  }, [canUndo, undo, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Redo (Phase 2)
  // ============================================================================
  const handleRedo = useCallback(() => {
    void (async () => {
      if (!canRedo()) {
        enqueueSnackbar("ไม่มีประวัติที่จะทำซ้ำ", { variant: "info" });
        return;
      }

      try {
        redo();
        await mutateTeacherSchedule();
        await mutateConflicts();
        setIsDirty(true);
        enqueueSnackbar("↪️ ทำซ้ำสำเร็จ", { variant: "success" });
      } catch (error) {
        log.logError(error, { action: "redo" });
        enqueueSnackbar("❌ เกิดข้อผิดพลาดในการทำซ้ำ", { variant: "error" });
      }
    })();
  }, [canRedo, redo, mutateTeacherSchedule, mutateConflicts]);

  // ============================================================================
  // HANDLERS - Auto Arrange (Phase 2)
  // ============================================================================
  const handleAutoArrange = useCallback(() => {
    // TODO: Implement auto arrange algorithm or show "coming soon" dialog
    // This would require complex constraint satisfaction logic
    enqueueSnackbar("🚧 ฟีเจอร์จัดตารางอัตโนมัติกำลังพัฒนา", {
      variant: "info",
    });
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
    canFetch && allTeachers && timeslots
      ? `all-teacher-schedules-${academicYear}-${semester}`
      : null,
    async () => {
      if (!allTeachers || !timeslots) return [];

      // Fetch schedules for all teachers
      const schedulePromises = (allTeachers as unknown[]).map(async (t) => {
        const teacher = t as {
          TeacherID?: number;
          Firstname?: string;
          Lastname?: string;
        };
        const teacherId = teacher.TeacherID;
        if (!teacherId) return null;

        try {
          const result = await getTeacherScheduleAction({
            TeacherID: teacherId,
          });
          if (!result || !result.success || !result.data) return null;

          return {
            teacherId,
            teacherName: `${teacher.Firstname || ""} ${teacher.Lastname || ""}`,
            schedule: Array.isArray(result.data) ? result.data : [],
          };
        } catch (error) {
          log.logError(error, { action: "fetchTeacherSchedule", teacherId });
          return null;
        }
      });

      const results = await Promise.all(schedulePromises);
      return results.filter(Boolean);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
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
        const conflictSlots =
          currentTeacherID && parseInt(currentTeacherID) === data.teacherId
            ? conflicts?.length || 0
            : 0; // We don't have conflict data for non-selected teachers yet

        return {
          id: String(data.teacherId),
          name: data.teacherName || "",
          total: totalSlots,
          completed: completedSlots,
          conflicts: conflictSlots,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    allTeacherSchedules,
    timeslots,
    allTeachers,
    currentTeacherID,
    conflicts,
  ]);

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
          gradeConflictMap.set(
            gradeId,
            (gradeConflictMap.get(gradeId) || 0) + 1,
          );
        }
      });
    }

    // Calculate expected periods per class (from config)
    const periodsPerWeek = timetableConfig.totalPeriodsPerWeek || 35;

    // Map to ProgressItem format
    return Array.from(gradeScheduleMap.entries()).map(
      ([gradeId, completed]) => {
        const grade = (gradeLevels as unknown[]).find((g) => {
          const level = g as { GradeID?: string };
          return level.GradeID === gradeId;
        });
        const gradeData = grade as { Year?: number; Number?: number };

        return {
          id: gradeId,
          name: `ม.${gradeData.Year || "?"}/${gradeData.Number || "?"}`,
          total: periodsPerWeek,
          completed,
          conflicts: gradeConflictMap.get(gradeId) || 0,
        };
      },
    );
  }, [teacherSchedule, gradeLevels, conflicts, timetableConfig]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  // Include session loading to prevent showing error state while auth is initializing
  const isLoading = isSessionLoading || isLoadingTeachers || isLoadingTimeslots;

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
          {currentTab === "teacher" && conflicts && conflicts.length > 0 && (
            <ConflictAlert
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              conflicts={conflicts as any}
              onClose={() => void mutateConflicts()}
            />
          )}

          {/* Teacher Tab Content */}
          {currentTab === "teacher" && (
            <>
              {!currentTeacherID ? (
                <Alert severity="info">
                  <AlertTitle>กรุณาเลือกครูผู้สอน</AlertTitle>
                  เลือกครูจากรายการด้านบนเพื่อเริ่มจัดตารางสอน
                </Alert>
              ) : (
                <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
                  {/* Subject Palette - Phase 2 Enhanced */}
                  <Box
                    sx={{ width: { xs: "100%", lg: 300 }, flexShrink: 0 }}
                    data-testid="subject-palette"
                  >
                    <SearchableSubjectPalette
                      respData={availableSubjects || []}
                      dropOutOfZone={() => {
                        // Handle subject dropped outside grid - no action needed
                      }}
                      clickOrDragToSelectSubject={(subject) => {
                        setActiveSubject(subject);
                      }}
                      storeSelectedSubject={activeSubject || null}
                      teacher={
                        teacherData ||
                        ({
                          // Default empty teacher if null
                          TeacherID: 0,
                          Prefix: "",
                          Firstname: "",
                          Lastname: "",
                          Department: "",
                          Email: "",
                          Role: "teacher",
                        } as teacher)
                      }
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

                      {/* Timetable Grid */}

                      {isLoadingSchedule ? (
                        <TimetableGridSkeleton />
                      ) : (
                        <TimetableGrid
                          timeslots={timeslots || []}
                          periodsPerDay={timetableConfig.periodsPerDay}
                          breakSlots={timetableConfig.breakSlots}
                          getConflicts={(timeslotID) => {
                            // Use conflict validation hook for real-time checks

                            const conflictInfo =
                              conflictValidation.conflictsByTimeslot.get(
                                timeslotID,
                              );

                            if (conflictInfo && conflictInfo.type !== "none") {
                              return {
                                hasConflict: true,

                                message: conflictInfo.message,

                                severity: conflictInfo.severity,
                              };
                            }

                            // Fallback to API conflicts if hook doesn't have info

                            const apiConflict = conflicts?.find(
                              (c: unknown) => {
                                const conflictData = c as {
                                  TimeslotID?: string;

                                  message?: string;
                                };

                                return conflictData.TimeslotID === timeslotID;
                              },
                            );

                            const conflictData = apiConflict as
                              | { message?: string }
                              | undefined;

                            return {
                              hasConflict: !!apiConflict,

                              message: conflictData?.message,

                              severity: apiConflict
                                ? ("error" as const)
                                : undefined,
                            };
                          }}
                          lockedTimeslots={conflictValidation.lockedTimeslots}
                          selectedTimeslotID={selectedTimeslotForRoom}
                        />
                      )}
                    </Stack>
                  </Box>{" "}
                </Stack>
              )}
            </>
          )}

          {/* Progress Tab Content */}
          {currentTab === ARRANGE_TABS.PROGRESS && (
            <Box sx={{ py: 2 }}>
              <ScheduleProgressIndicators
                overallProgress={overallProgress}
                teacherProgress={teacherProgressData}
                classProgress={classProgressData}
              />
            </Box>
          )}

          {/* Grade Level Tab Content */}
          {currentTab !== ARRANGE_TABS.TEACHER &&
            currentTab !== ARRANGE_TABS.PROGRESS && (
              <GradeClassView
                gradeLevel={selectedGradeLevel || 1}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                classes={gradeClassData as any}
                isLoading={isLoadingGradeSchedules}
              />
            )}
        </Stack>

        {/* Room Selection Dialog */}
        <RoomSelectionDialog
          open={roomDialogOpen}
          rooms={(availableRooms as unknown as room[]) || []}
          subjectName={activeSubject?.subjectName || ""}
          timeslotLabel={selectedTimeslotForRoom || ""}
          onSelect={handleRoomSelect}
          onCancel={() => {
            setRoomDialogOpen(false);
            setSelectedTimeslotForRoom(null);
          }}
          occupiedRoomIDs={occupiedRoomIDs || []}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeSubject && (
            <Paper
              elevation={8}
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                minWidth: 200,
                cursor: "grabbing",
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
