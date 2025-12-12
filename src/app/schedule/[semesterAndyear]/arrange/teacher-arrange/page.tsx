/**
 * TeacherArrangePage - Refactored Version
 *
 * Week 5.3 Refactoring:
 * - Replaced 34+ useState with Zustand store
 * - Migrated from react-beautiful-dnd to @dnd-kit
 * - Extracted business logic to pure functions
 * - Improved performance with memoization
 * - Better TypeScript types
 *
 * Week 8 Migration:
 * - Migrated from API routes to Server Actions
 * - Using Clean Architecture actions for all data operations
 * - Removed deprecated api/fetcher imports
 *
 * Original: 760 lines, 34+ useState
 * Refactored: ~400-500 lines, centralized state
 */

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useMemo, useRef } from "react";
import useSWR from "swr";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import SaveIcon from "@mui/icons-material/Save";
import { useSemesterSync } from "@/hooks";

// MUI Components
import PrimaryButton from "@/components/mui/PrimaryButton";

// Feedback Components
import {
  TimetableGridSkeleton,
  EmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";

// Client Logger
import { createClientLogger } from "@/lib/client-logger";

const log = createClientLogger("TeacherArrangePage");

// Server Actions (Clean Architecture)
import {
  getTeacherScheduleAction,
  syncTeacherScheduleAction,
} from "@/features/arrange/application/actions/arrange.actions";
import { getConflictsAction } from "@/features/class/application/actions/class.actions";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { getAvailableRespsAction } from "@/features/assign/application/actions/assign.actions";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import type { ActionResult } from "@/shared/lib/action-wrapper";
import type { TeacherScheduleWithRelations } from "@/features/arrange/infrastructure/repositories/arrange.repository";

// Zustand Store (Context7-Powered - Phase 4 Migration)
import { useShallow } from "zustand/react/shallow";
import {
  useTeacherArrangeStore,
  useTeacherArrangeActions,
  useSelectedSubject,
  useSubjectData,
  useScheduledSubjects,
  useTimeslotData,
  useModalState,
  useErrorState,
  useSaveState,
  useCurrentTeacher,
} from "@/features/schedule-arrangement/presentation/stores/teacher-arrange.store";
import type {
  SubjectData,
  SubjectPayload,
  TimeSlotCssClassNameCallback,
  DisplayErrorChangeSubjectCallback,
  RemoveSubjectCallback,
  DayOfWeekDisplay,
  SubjectCategory,
  TimeslotData,
} from "@/types/schedule.types";
import type {
  timeslot,
  class_schedule,
  subject,
  room,
  teacher,
  day_of_week,
} from "@/prisma/generated/client";

// @dnd-kit
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// Local Components (to be refactored separately)
import TimeSlot from "../component/TimeSlot";
import PageHeader from "../component/PageHeader";
// Phase 2: Replace SubjectDragBox with enhanced SearchableSubjectPalette
import { SearchableSubjectPalette } from "../_components/SearchableSubjectPalette";
import { ScheduleActionToolbar } from "../_components/ScheduleActionToolbar";
import SelectSubjectToTimeslotModal from "../component/SelectRoomToTimeslotModal";
import SelectTeacher from "../component/SelectTeacher";

// Models
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";

// ============================================================================
// TYPE DEFINITIONS - Properly typed interfaces for schedule arrangement
// ============================================================================

/**
 * Class schedule with full relations (subject, room) for display
 */
type ClassScheduleWithRelations = class_schedule & {
  subject: subject;
  room: room | null;
};

/**
 * Enriched class schedule with computed display fields
 */
type EnrichedClassSchedule = ClassScheduleWithRelations & {
  SubjectName: string;
  RoomName: string;
};

/**
 * SWR Data Types (Issue #40)
 * Types for useSWR hooks to replace useSWR<any>
 */
type ConflictData = ClassScheduleWithRelations[];
type TeacherInfo = teacher;
// Use shared TimeslotData interface (includes optional subject)

/**
 * Enriched timeslot with optional subject data
 */
type EnrichedTimeslot = timeslot & {
  subject: SubjectData | null;
};



/**
 * Main Teacher Arrange Page Component (Refactored)
 */
export default function TeacherArrangePageRefactored() {
  // ============================================================================
  // ROUTING & PARAMS
  // ============================================================================
  const params = useParams();
  const searchParams = useSearchParams();
  const searchTeacherID = searchParams.get("TeacherID");

  // Use useSemesterSync to extract and sync semester with global store
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );

  // ============================================================================
  // ZUSTAND STORE - Context7-Powered (Phase 4 Migration)
  // Using optimized selectors to prevent unnecessary re-renders
  // ============================================================================

  // Stable actions reference (never causes re-renders)
  const actions = useTeacherArrangeActions();

  // Granular selectors (only re-render when specific state changes)
  const { id: currentTeacherID, data: teacherData } = useCurrentTeacher();
  const storeSelectedSubject = useSelectedSubject();
  const subjectData = useSubjectData();
  const scheduledSubjects = useScheduledSubjects();
  const timeSlotData = useTimeslotData();
  const { isOpen: isActiveModal, payload: subjectPayload } = useModalState();
  const {
    errorMessages: showErrorMsgByTimeslotID,
    lockMessages: showLockDataMsgByTimeslotID,
  } = useErrorState();
  const isSaving = useSaveState();

  // Internal state (not exposed via selectors - use direct store access)
  // CRITICAL: Must use useShallow to prevent infinite re-renders (Issue #121)
  const {
    yearSelected,
    changeTimeSlotSubject,
    destinationSubject,
    timeslotIDtoChange,
    isClickToChangeSubject,
  } = useTeacherArrangeStore(
    useShallow((state) => ({
      yearSelected: state.yearSelected,
      changeTimeSlotSubject: state.changeTimeSlotSubject,
      destinationSubject: state.destinationSubject,
      timeslotIDtoChange: state.timeslotIDtoChange,
      isClickToChangeSubject: state.isClickToChangeSubject,
    })),
  );

  // ============================================================================
  // DATA FETCHING (Server Actions - Clean Architecture)
  // ============================================================================

  // Use SWR with Server Actions for client-side data fetching
  const checkConflictData = useSWR<ConflictData | null>(
    currentTeacherID
      ? `conflicts-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async (): Promise<ConflictData | null> => {
      if (!currentTeacherID) return null;
      const result = (await getConflictsAction({
        AcademicYear: parseInt(academicYear ?? "0"),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      })) as ActionResult<ConflictData>;
      if (!result.success || !result.data) {
        return null;
      }
      return result.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduplication to prevent rapid refetches
      shouldRetryOnError: false,
    },
  );

  const fetchAllClassData = useSWR<TeacherScheduleWithRelations[] | null>(
    currentTeacherID
      ? `teacher-schedule-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async (): Promise<TeacherScheduleWithRelations[] | null> => {
      if (!currentTeacherID) return null;
      const result = await getTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result.success) return null;
      // Type narrowing: after checking success, data is guaranteed to be TeacherScheduleWithRelations[]
      // TypeScript doesn't narrow discriminated unions properly in this context, so we use type assertion
      return result.data as unknown as TeacherScheduleWithRelations[];
    },
    { revalidateOnFocus: false, revalidateOnMount: true },
  );

  const fetchTeacher = useSWR<teacher | null>(
    currentTeacherID ? `teacher-${currentTeacherID}` : null,
    async (): Promise<teacher | null> => {
      if (!currentTeacherID) return null;
      const result = (await getTeachersAction({})) as ActionResult<teacher[]>;

      if (!result.success || !result.data) return null;

      const foundTeacher = result.data.find(
        (t) => t.TeacherID === parseInt(currentTeacherID),
      );

      // Use nullish coalescing for cleaner null handling
      return foundTeacher ?? null;
    },
    { revalidateOnFocus: false },
  );

  const fetchResp = useSWR<SubjectData[]>(
    currentTeacherID
      ? `available-resp-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async (): Promise<SubjectData[]> => {
      if (!currentTeacherID) return [];
      const result = (await getAvailableRespsAction({
        AcademicYear: parseInt(academicYear ?? "0"),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      })) as ActionResult<SubjectData[]>;
      if (!result.success || !result.data) return [];
      return result.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduplication to prevent rapid refetches
      shouldRetryOnError: false,
    },
  );

  const fetchTimeSlot = useSWR<TimeslotData[] | null>(
    currentTeacherID ? `timeslots-${academicYear}-${semester}` : null,
    async (): Promise<TimeslotData[] | null> => {
      if (!currentTeacherID) return null;
      const result = await getTimeslotsByTermAction({
        AcademicYear: parseInt(academicYear ?? "0"),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (!result || typeof result !== "object" || !("success" in result)) {
        return null;
      }
      return result.success && "data" in result
        ? (result.data as unknown as TimeslotData[])
        : null;
    },
    { revalidateOnFocus: false },
  );

  // ============================================================================
  // @DND-KIT SENSORS CONFIGURATION
  // ============================================================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement before drag starts (prevent accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ============================================================================
  // EFFECTS - Initialize and cleanup
  // ============================================================================

  // Track previous teacher ID to prevent cleanup loop on every change
  const prevTeacherIDRef = useRef<string | null>(null);

  // Reset state when teacher changes (guarded to prevent cascading renders)
  useEffect(() => {
    // Only reset if teacher actually changed (not on initial mount or same teacher)
    if (
      prevTeacherIDRef.current !== null &&
      prevTeacherIDRef.current !== searchTeacherID
    ) {
      actions.resetOnTeacherChange();
    }
    prevTeacherIDRef.current = searchTeacherID;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTeacherID]);

  // Initialize teacher ID from search params
  useEffect(() => {
    if (searchTeacherID) {
      actions.setCurrentTeacherID(searchTeacherID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTeacherID]);

  // Fetch and set subject data
  useEffect(() => {
    if (
      fetchResp.data &&
      fetchResp.data.length > 0 &&
      !!currentTeacherID &&
      !fetchResp.isValidating
    ) {
      // Directly set subject data (already in correct format)
      actions.setSubjectData(fetchResp.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResp.data, fetchResp.isValidating]);

  // Fetch and set teacher data
  useEffect(() => {
    if (!fetchTeacher.isValidating && fetchTeacher.data && !!currentTeacherID) {
      actions.setTeacherData(fetchTeacher.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTeacher.isValidating, fetchTeacher.data]);

  // Fetch and set timeslot data
  useEffect(() => {
    if (
      !fetchTimeSlot.isValidating &&
      fetchTimeSlot.data &&
      !!currentTeacherID
    ) {
      fetchTimeslotData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTimeSlot.isValidating, fetchTimeSlot.data]);

  // Fetch and set class data
  useEffect(() => {
    if (
      !fetchAllClassData.isValidating &&
      fetchAllClassData.data &&
      !!currentTeacherID
    ) {
      fetchClassData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllClassData.isValidating, fetchAllClassData.data]);

  // Handle subject selection for conflict display
  // CRITICAL: Logic inlined to prevent circular callback dependencies (Issue #121)
  // Previously: onSelectSubject callback → depends on timeSlotData → recreates on every change → infinite loop
  useEffect(() => {
    if (checkConflictData.isValidating) return;

    const isSelectedToAdd = storeSelectedSubject != null;
    const isSelectedToChange = changeTimeSlotSubject != null;

    // Helper: Clear scheduled conflict markers from timeslots
    const clearScheduledData = () => {
      const currentTimeSlotData =
        useTeacherArrangeStore.getState().timeSlotData;
      actions.setTimeSlotData({
        ...currentTimeSlotData,
        AllData: currentTimeSlotData.AllData.map((item) =>
          item.subject?.scheduled ? { ...item, subject: null } : item,
        ),
      });
    };

    // No subject selected - clear conflict markers
    if (!isSelectedToAdd && !isSelectedToChange) {
      clearScheduledData();
      return;
    }

    // Determine which grade's conflicts to display
    const selectedGradeID = !isSelectedToChange
      ? storeSelectedSubject!.gradeID
      : changeTimeSlotSubject.gradeID;

    if (!checkConflictData.data) return;

    // Type for scheduled slots with enriched data
    type ScheduledSlot = class_schedule & {
      subject: subject;
      room: room | null;
      Scheduled?: boolean;
      SubjectName?: string;
      RoomName?: string;
    };

    // Find all scheduled classes for the selected grade (conflicts)
    const scheduledGradeIDTimeslot: ScheduledSlot[] = checkConflictData.data
      .filter((item) => item.GradeID === selectedGradeID)
      .map((slot) => ({
        ...slot,
        Scheduled: true,
        SubjectName: slot.subject.SubjectName,
        RoomName: slot.room?.RoomName || "ไม่มีห้องเรียน",
      }));

    if (scheduledGradeIDTimeslot.length > 0) {
      // Display conflicts as scheduled subjects in timeslots
      clearScheduledData();
      const currentTimeSlotData =
        useTeacherArrangeStore.getState().timeSlotData;
      actions.setTimeSlotData({
        ...currentTimeSlotData,
        AllData: currentTimeSlotData.AllData.map((item) => {
          // If timeslot already has a subject, keep it
          if (item.subject) {
            return item;
          }

          // Find scheduled slot for this timeslot (conflict display)
          const matchedSlot = scheduledGradeIDTimeslot.find(
            (slot: ScheduledSlot) => slot.TimeslotID === item.TimeslotID,
          );

          // Add scheduled slot as subject if found, otherwise keep null
          if (matchedSlot) {
            const subjectData: SubjectData = {
              itemID: matchedSlot.ClassID,
              subjectCode: matchedSlot.SubjectCode,
              subjectName:
                matchedSlot.SubjectName || matchedSlot.subject.SubjectName,
              gradeID: matchedSlot.GradeID,
              teacherID:
                typeof currentTeacherID === "string"
                  ? parseInt(currentTeacherID)
                  : currentTeacherID || 0,
              category: matchedSlot.subject.Category as SubjectCategory,
              credit:
                typeof matchedSlot.subject.Credit === "string"
                  ? 0
                  : matchedSlot.subject.Credit || 0,
              teachHour:
                typeof matchedSlot.subject.Credit === "string"
                  ? 0
                  : matchedSlot.subject.Credit || 0,
              roomID: matchedSlot.RoomID,
              roomName:
                matchedSlot.RoomName ||
                matchedSlot.room?.RoomName ||
                "ไม่มีห้องเรียน",
              room: matchedSlot.room ?? null,
              classID: matchedSlot.ClassID,
              scheduled: matchedSlot.Scheduled ?? true,
            };
            return { ...item, subject: subjectData };
          }
          return item;
        }),
      });
    } else {
      clearScheduledData();
    }
  }, [
    storeSelectedSubject,
    changeTimeSlotSubject,
    checkConflictData.isValidating,
    checkConflictData.data,
    // Removed: timeSlotData (causes infinite loop - read from store.getState() instead)
    currentTeacherID,
    // Removed: actions (Zustand actions are stable - never include in deps)
  ]);

  // Handle destination subject change (swap subjects)
  useEffect(() => {
    if (timeslotIDtoChange.destination !== "") {
      changeSubjectSlot();
      actions.setTimeslotIDtoChange({ source: "", destination: "" });
      actions.setChangeTimeSlotSubject(null);
      actions.setDestinationSubject(null);
      actions.setYearSelected(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeslotIDtoChange.destination]);

  // ============================================================================
  // DATA PROCESSING FUNCTIONS
  // ============================================================================

  /**
   * Fetch and initialize timeslot data
   * IMPROVED: Uses null consistently for empty subject state
   */
  const fetchTimeslotData = useCallback(() => {
    if (!fetchTimeSlot.data) return;

    const data = fetchTimeSlot.data;

    // Extract unique days of week with their display colors
    const dayofweek: DayOfWeekDisplay[] = data
      .map((day: timeslot) => day.DayOfWeek)
      .filter(
        (item: string, index: number, arr: string[]) =>
          arr.indexOf(item) === index,
      )
      .map((item: string) => ({
        day_of_week: item as day_of_week,
        textColor: dayOfWeekTextColor[item] ?? "#000000",
        bgColor: dayOfWeekColor[item] ?? "#FFFFFF",
      }));

    // Get slot amounts (use Monday as reference since all days have same slots)
    const slotAmount = data
      .filter((item: timeslot) => item.DayOfWeek === "MON")
      .map((_: timeslot, index: number) => index + 1);

    // Extract break times
    const breakTime = data
      .filter(
        (item: timeslot) =>
          (item.Breaktime === "BREAK_BOTH" ||
            item.Breaktime === "BREAK_JUNIOR" ||
            item.Breaktime === "BREAK_SENIOR") &&
          item.DayOfWeek === "MON",
      )
      .map((item: timeslot) => ({
        timeslotID: item.TimeslotID,
        breaktime: item.Breaktime,
        slotNumber: parseInt(item.TimeslotID.substring(10)),
      }));

    // IMPROVED: AllData uses null for empty slots (consistent with type checking throughout)
    actions.setTimeSlotData({
      AllData: data.map(
        (slot: timeslot): EnrichedTimeslot => ({
          ...slot,
          subject: null, // null = empty slot (not {} which is ambiguous)
        }),
      ),
      SlotAmount: slotAmount,
      DayOfWeek: dayofweek,
      BreakSlot: breakTime,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTimeSlot.data]);

  const fetchClassData = useCallback(() => {
    if (!fetchAllClassData.data || !timeSlotData.AllData.length) return;

    type ClassScheduleWithRelations = class_schedule & {
      subject: subject;
      room: room | null;
    };

    // fetchAllClassData.data is the array extracted by the SWR fetcher
    const puredata: ClassScheduleWithRelations[] = Array.isArray(
      fetchAllClassData.data,
    )
      ? fetchAllClassData.data
      : [];

    const data = puredata.map((item: ClassScheduleWithRelations) => ({
      ...item,
      SubjectName: item.subject.SubjectName,
      RoomName: item.room?.RoomName || "ไม่มีห้องเรียน",
    }));

    const filterLock = data.filter(
      (
        item: ClassScheduleWithRelations & {
          SubjectName: string;
          RoomName: string;
        },
      ) => item.IsLocked,
    );
    const filterNotLock = data.filter(
      (
        item: ClassScheduleWithRelations & {
          SubjectName: string;
          RoomName: string;
        },
      ) => !item.IsLocked,
    );

    // Process locked timeslots (combine multiple grade IDs for same timeslot)
    type LockedScheduleItem = Omit<ClassScheduleWithRelations, "GradeID"> & {
      SubjectName: string;
      RoomName: string;
      GradeID: string | string[]; // Can be array when multiple grades share same timeslot
    };
    const resFilterLock: LockedScheduleItem[] = [];
    const keepId: string[] = [];

    for (let i = 0; i < filterLock.length; i++) {
      const currentItem = filterLock[i];
      if (!currentItem) continue; // Guard against undefined

      if (keepId.length === 0 || !keepId.includes(currentItem.TimeslotID)) {
        keepId.push(currentItem.TimeslotID);
        const gradeID = currentItem.GradeID;
        resFilterLock.push({
          ...currentItem,
          GradeID: Array.isArray(gradeID) ? gradeID : [gradeID], // Convert single GradeID to array
        } as LockedScheduleItem);
      } else {
        const tID = currentItem.TimeslotID;
        resFilterLock.forEach((item, index) => {
          if (item.TimeslotID === tID) {
            resFilterLock[index] = {
              ...item,
              GradeID: [
                ...(Array.isArray(item.GradeID)
                  ? item.GradeID
                  : [item.GradeID]),
                currentItem.GradeID,
              ], // Properly typed as string[]
            };
          }
        });
      }
    }

    const concatClassData = [...filterNotLock, ...resFilterLock];

    // Map enriched class_schedule to SubjectData format for store compatibility
    // SubjectData has both PascalCase and camelCase fields for backward compatibility
    const mappedScheduledSubjects: SubjectData[] = concatClassData.map(
      (item) => ({
        itemID: item.ClassID,
        subjectCode: item.SubjectCode,
        subjectName: item.SubjectName,
        gradeID: Array.isArray(item.GradeID)
          ? (item.GradeID[0] ?? "")
          : item.GradeID,
        teacherID:
          typeof currentTeacherID === "string"
            ? parseInt(currentTeacherID)
            : currentTeacherID || 0,
        category: item.subject?.Category as SubjectCategory,
        credit:
          typeof item.subject?.Credit === "string"
            ? 0
            : item.subject?.Credit || 0,
        teachHour:
          typeof item.subject?.Credit === "string"
            ? 0
            : item.subject?.Credit || 0,
        roomID: item.RoomID,
        roomName: item.RoomName,
        room: item.room,
        classID: item.ClassID,
        scheduled: true,
      }),
    );

    const mappedLockData: class_schedule[] = resFilterLock.map((item) => ({
      ClassID: item.ClassID,
      TimeslotID: item.TimeslotID,
      SubjectCode: item.SubjectCode,
      RoomID: item.RoomID,
      GradeID: Array.isArray(item.GradeID)
        ? (item.GradeID[0] ?? "")
        : item.GradeID, // Take first grade, fallback to empty
      IsLocked: item.IsLocked,
    }));

    actions.setScheduledSubjects(mappedScheduledSubjects);
    actions.setLockData(mappedLockData);

    // Map subjects into timeslots
    actions.setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((data): EnrichedTimeslot => {
        const matchedSubject = concatClassData.find(
          (item) => item.TimeslotID === data.TimeslotID,
        );

        // Enrich timeslot with subject data if matched, otherwise null
        // Convert matched subject to SubjectData format
        if (matchedSubject) {
          const subjectData: SubjectData = {
            itemID: matchedSubject.ClassID,
            subjectCode: matchedSubject.SubjectCode,
            subjectName: matchedSubject.SubjectName,
            gradeID: Array.isArray(matchedSubject.GradeID)
              ? (matchedSubject.GradeID[0] ?? "")
              : matchedSubject.GradeID,
            teacherID:
              typeof currentTeacherID === "string"
                ? parseInt(currentTeacherID)
                : currentTeacherID || 0,
            category: matchedSubject.subject?.Category as SubjectCategory,
            credit:
              typeof matchedSubject.subject?.Credit === "string"
                ? 0
                : matchedSubject.subject?.Credit || 0,
            teachHour:
              typeof matchedSubject.subject?.Credit === "string"
                ? 0
                : matchedSubject.subject?.Credit || 0,
            roomID: matchedSubject.RoomID,
            roomName: matchedSubject.RoomName,
            room: matchedSubject.room,
            classID: matchedSubject.ClassID,
            scheduled: true,
          };
          return { ...data, subject: subjectData };
        }
        return { ...data, subject: null };
      }),
    });
  }, [fetchAllClassData.data, timeSlotData, actions]);

  // ============================================================================
  // SAVE OPERATION
  // ============================================================================

  const postData = useCallback(async () => {
    actions.setIsSaving(true);
    const savingSnackbar = enqueueSnackbar("กำลังบันทึกข้อมูล...", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await syncTeacherScheduleAction({
        TeacherID: parseInt(searchTeacherID || "0"),
        AcademicYear: parseInt(academicYear || "0"),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        Schedule: timeSlotData.AllData,
      });

      closeSnackbar(savingSnackbar);

      if (result.success) {
        enqueueSnackbar("บันทึกข้อมูลสำเร็จ", { variant: "success" });
        fetchAllClassData.mutate();
      } else {
        enqueueSnackbar(
          result.error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          { variant: "error" },
        );
      }
    } catch (error) {
      log.logError(error, { action: "save" });
      closeSnackbar(savingSnackbar);
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกข้อมูล", { variant: "error" });
    } finally {
      actions.setIsSaving(false);
    }
  }, [
    searchTeacherID,
    academicYear,
    semester,
    timeSlotData,
    actions,
    fetchAllClassData,
  ]);

  // ============================================================================
  // SUBJECT OPERATIONS
  // ============================================================================

  const addSubjectToSlot = useCallback(
    (subject: SubjectData, timeSlotID: string) => {
      const mapTimeSlot = {
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item) =>
          item.TimeslotID === timeSlotID
            ? { ...item, subject: { ...subject } }
            : item,
        ),
      };

      actions.setTimeSlotData(mapTimeSlot);
      actions.setSubjectData(
        subjectData.filter(
          (item: SubjectData) => item.itemID !== subject.itemID,
        ),
      );
      actions.clearSelectedSubject();
      actions.setYearSelected(null);
      actions.closeModal();
    },
    [timeSlotData, subjectData, actions],
  );

  const returnSubject = useCallback(
    (subject: SubjectData) => {
      const cleanSubject = { ...subject };
      delete cleanSubject.roomName;
      delete cleanSubject.room;
      delete cleanSubject.classID;

      actions.setSubjectData([
        ...subjectData,
        { ...cleanSubject, itemID: subjectData.length + 1 },
      ]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subjectData],
  );

  const removeSubjectFromSlot = useCallback(
    (subject: SubjectData, timeSlotID: string) => {
      returnSubject(subject);

      actions.setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item) =>
          item.TimeslotID === timeSlotID ? { ...item, subject: null } : item,
        ),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeSlotData, returnSubject],
  );

  const cancelAddRoom = useCallback(
    (subject: SubjectData | null, timeSlotID: string) => {
      if (subject) {
        removeSubjectFromSlot(subject, timeSlotID);
      }
      actions.clearSelectedSubject();
      actions.setYearSelected(null);
      actions.closeModal();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [removeSubjectFromSlot],
  );

  // ============================================================================
  // CONFLICT DISPLAY LOGIC
  // ============================================================================
  // NOTE: clearScheduledData and onSelectSubject logic moved inline to useEffect
  // to prevent circular callback dependencies (see useEffect around line 394)

  // ============================================================================
  // @DND-KIT EVENT HANDLERS (Replaces react-beautiful-dnd)
  // ============================================================================

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const dragData = active.data.current;

      if (dragData?.type === "subject") {
        // Dragging from subject box
        const index = dragData.index;
        if (storeSelectedSubject == null) {
          const sel = subjectData[index];
          if (sel) clickOrDragToSelectSubject(sel);
        }
      } else if (dragData?.type === "timeslot") {
        // Dragging from timeslot (to swap)
        const timeslotID = dragData.timeslotID;
        const getSubjectFromTimeslot = timeSlotData.AllData.find(
          (item) => item.TimeslotID === timeslotID,
        );

        if (getSubjectFromTimeslot && changeTimeSlotSubject == null) {
          // Phase 2: Use new signature (sourceID, destID)
          clickOrDragToChangeTimeSlot(timeslotID, timeslotID);
        }
      }
    },
    [storeSelectedSubject, subjectData, changeTimeSlotSubject, timeSlotData],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        // Dropped outside droppable zone - cancel selection after delay
        setTimeout(() => {
          if (changeTimeSlotSubject == null) {
            if (storeSelectedSubject) {
              clickOrDragToSelectSubject(storeSelectedSubject);
            }
          } else {
            // Phase 2: Cancel change by calling with same source (deselect)
            if (timeslotIDtoChange.source) {
              clickOrDragToChangeTimeSlot(
                timeslotIDtoChange.source,
                timeslotIDtoChange.source,
              );
            }
          }
        }, 500);
        return;
      }

      type SubjectDragData = { type: "subject"; index: number };
      type TimeslotDragData = { type: "timeslot"; timeslotID: string };
      const isSubjectDragData = (x: unknown): x is SubjectDragData =>
        !!x &&
        (x as any).type === "subject" &&
        typeof (x as any).index === "number";
      const isTimeslotDragData = (x: unknown): x is TimeslotDragData =>
        !!x &&
        (x as any).type === "timeslot" &&
        typeof (x as any).timeslotID === "string";

      const sourceDataUnknown = active.data.current as unknown;
      const targetDataUnknown = over.data.current as unknown;

      if (
        isSubjectDragData(sourceDataUnknown) &&
        isTimeslotDragData(targetDataUnknown)
      ) {
        // Adding subject to timeslot - Phase 2: Pass SubjectPayload
        const payload: SubjectPayload = {
          timeslotID: targetDataUnknown.timeslotID,
          selectedSubject: storeSelectedSubject!,
        };
        addRoomModal(payload);
        {
          const s = subjectData[sourceDataUnknown.index];
          if (s && s !== null) clickOrDragToSelectSubject(s);
        }
      } else if (
        isTimeslotDragData(sourceDataUnknown) &&
        isTimeslotDragData(targetDataUnknown)
      ) {
        // Swapping subjects between timeslots - Phase 2: Use new signature
        const sourceID = sourceDataUnknown.timeslotID;
        const destID = targetDataUnknown.timeslotID;
        clickOrDragToChangeTimeSlot(sourceID, destID);
      }
    },
    [
      changeTimeSlotSubject,
      storeSelectedSubject,
      subjectData,
      timeSlotData,
      timeslotIDtoChange,
    ],
  );

  // ============================================================================
  // SUBJECT SELECTION HANDLERS
  // ============================================================================

  const clickOrDragToSelectSubject = useCallback(
    (subject: SubjectData) => {
      // Clear scheduled conflict markers (inlined to avoid callback dependency)
      actions.setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item) =>
          item.subject?.scheduled ? { ...item, subject: null } : item,
        ),
      });

      const checkDuplicateSubject =
        subject === storeSelectedSubject ? null : subject;

      if (storeSelectedSubject == null || checkDuplicateSubject) {
        const year = subject.gradelevel?.year;
        actions.setYearSelected(
          subject === storeSelectedSubject ? null : year || null,
        );
      }

      actions.setSelectedSubject(checkDuplicateSubject);
      actions.setChangeTimeSlotSubject(null);
      actions.setTimeslotIDtoChange({ source: "", destination: "" });
    },
    [storeSelectedSubject, timeSlotData, actions],
  );

  /**
   * Phase 2: Updated to match AddRoomModalCallback signature
   * Accepts SubjectPayload instead of just timeslotID
   */
  const addRoomModal = useCallback(
    (payload: SubjectPayload) => {
      if (storeSelectedSubject == null) return;

      actions.setSubjectPayload(payload);
      addSubjectToSlot(storeSelectedSubject, payload.timeslotID);
      actions.setScheduledSubjects([
        ...scheduledSubjects,
        storeSelectedSubject,
      ]);
      actions.openModal(payload);
    },
    [storeSelectedSubject, scheduledSubjects, addSubjectToSlot, actions],
  );

  /**
   * Phase 2: Updated to match ClickOrDragToChangeCallback signature
   * Now accepts (sourceID: string, destID: string) instead of (subject, timeslotID, isClick)
   */
  const clickOrDragToChangeTimeSlot = useCallback(
    (sourceID: string, destID: string) => {
      // Find the source subject from the timeslot
      const sourceSlot = timeSlotData.AllData.find(
        (item) => item.TimeslotID === sourceID,
      );

      if (!sourceSlot?.subject) {
        log.warn("No subject found in source timeslot", { sourceID });
        return;
      }

      const subject = sourceSlot.subject;
      const isClickToChange = sourceID === destID; // Click if same slot
      const checkDuplicateSubject = subject === changeTimeSlotSubject;

      if (changeTimeSlotSubject == null || checkDuplicateSubject) {
        // First selection or deselection
        const year = subject.gradelevel?.year;
        actions.setIsClickToChangeSubject(
          checkDuplicateSubject ? false : isClickToChange,
        );
        actions.setChangeTimeSlotSubject(
          checkDuplicateSubject ? null : subject,
        );
        actions.setTimeslotIDtoChange(
          checkDuplicateSubject
            ? { source: "", destination: "" }
            : { source: sourceID, destination: "" },
        );
        actions.setYearSelected(checkDuplicateSubject ? null : year || null);
      } else if (timeslotIDtoChange.source !== "" && destID !== sourceID) {
        // Second selection - swap operation
        const destSlot = timeSlotData.AllData.find(
          (item) => item.TimeslotID === destID,
        );
        actions.setTimeslotIDtoChange({
          source: timeslotIDtoChange.source,
          destination: destID,
        });
        actions.setDestinationSubject(destSlot?.subject || null);
        actions.setIsClickToChangeSubject(false);
      }

      actions.setSelectedSubject(null);
    },
    [changeTimeSlotSubject, timeslotIDtoChange, timeSlotData, actions],
  );

  const changeSubjectSlot = useCallback(() => {
    const sourceSubj = changeTimeSlotSubject;
    const destinationSubj = destinationSubject;
    const sourceTimeslotID = timeslotIDtoChange.source;
    const destinationTimeslotID = timeslotIDtoChange.destination;

    actions.setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item) =>
        item.TimeslotID === sourceTimeslotID
          ? { ...item, subject: destinationSubj }
          : item.TimeslotID === destinationTimeslotID
            ? { ...item, subject: sourceSubj }
            : item,
      ),
    });
  }, [
    changeTimeSlotSubject,
    destinationSubject,
    timeslotIDtoChange,
    timeSlotData,
    actions,
  ]);

  // ============================================================================
  // VALIDATION & STYLING HELPERS
  // ============================================================================

  const checkBreakTime = useCallback(
    (breakTimeState: string | null): boolean => {
      const isSelectedToAdd = storeSelectedSubject != null;
      const isSelectedToChange = changeTimeSlotSubject != null;

      if (!yearSelected) return false;

      const result =
        ((isSelectedToAdd || isSelectedToChange) &&
          breakTimeState === "BREAK_JUNIOR" &&
          [1, 2, 3].includes(yearSelected)) ||
        (breakTimeState === "BREAK_SENIOR" && [4, 5, 6].includes(yearSelected));

      return breakTimeState === "BREAK_BOTH" ? true : result;
    },
    [storeSelectedSubject, changeTimeSlotSubject, yearSelected],
  );

  const checkBreakTimeOutOfRange = useCallback(
    (breakTimeState: string, year: number): boolean => {
      if (timeslotIDtoChange.source !== "") {
        const getBreaktime = timeSlotData.AllData.find(
          (item) => item.TimeslotID === timeslotIDtoChange.source,
        )?.Breaktime;

        if (getBreaktime === "BREAK_JUNIOR") {
          return [4, 5, 6].includes(year) ? false : true;
        } else if (getBreaktime === "BREAK_SENIOR") {
          return [1, 2, 3].includes(year) ? false : true;
        } else {
          return checkBreakTime(breakTimeState);
        }
      }
      return false;
    },
    [timeslotIDtoChange, timeSlotData, checkBreakTime],
  );

  const checkRelatedYearDuringDragging = useCallback(
    (year: number): boolean => {
      if (timeslotIDtoChange.source !== "" && yearSelected) {
        const getBreaktime = timeSlotData.AllData.find(
          (item) => item.TimeslotID === timeslotIDtoChange.source,
        )?.Breaktime;

        const findYearRange = [1, 2, 3].includes(yearSelected)
          ? [1, 2, 3]
          : [4, 5, 6];

        return getBreaktime !== "NOT_BREAK"
          ? !findYearRange.includes(year)
          : false;
      }
      return false;
    },
    [timeslotIDtoChange, yearSelected, timeSlotData],
  );

  const timeSlotCssClassName = useCallback(
    (breakTimeState: string, subjectInSlot: SubjectData): string => {
      const isSubjectInSlot = Boolean(
        (subjectInSlot as Partial<SubjectData>).gradeID,
      );
      const isSelectedToAdd = storeSelectedSubject != null;
      const isSelectedToChange = changeTimeSlotSubject != null;

      const disabledSlot = `grid flex justify-center h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200 ${subjectInSlot.scheduled ? "opacity-35" : "opacity-100"}`;

      const enabledSlot = `grid items-center justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white ${
        isSelectedToAdd && !isSubjectInSlot
          ? "border-emerald-300 cursor-pointer border-dashed"
          : isSubjectInSlot &&
              displayErrorChangeSubject(
                breakTimeState,
                subjectInSlot.gradelevel?.year || 0,
              )
            ? "border-red-300"
            : isSelectedToChange
              ? "border-blue-300 border-dashed"
              : isSubjectInSlot
                ? "border-red-300"
                : "border-dashed"
      } duration-200`;

      return subjectInSlot.scheduled
        ? disabledSlot
        : typeof subjectInSlot.gradeID !== "string" && isSubjectInSlot
          ? disabledSlot
          : checkBreakTime(breakTimeState) && !isSubjectInSlot
            ? disabledSlot
            : enabledSlot;
    },
    [storeSelectedSubject, changeTimeSlotSubject, checkBreakTime],
  );

  const displayErrorChangeSubject = useCallback(
    (Breaktime: string, Year: number): boolean => {
      return checkBreakTime(Breaktime) || Breaktime === "NOT_BREAK"
        ? checkBreakTimeOutOfRange(Breaktime, Year)
        : false;
    },
    [checkBreakTime, checkBreakTimeOutOfRange],
  );

  // ============================================================================
  // HELPER FUNCTIONS - Subject State Checking
  // ============================================================================
  // PHASE 2: CALLBACK ADAPTERS - Match expected callback signatures
  // ============================================================================

  /**
   * Adapter for TimeSlotCssClassNameCallback
   * Expected: (subject: SubjectData | null, isBreakTime: boolean, isLocked: boolean) => string
   * Original: (breakTimeState: string, subjectInSlot: SubjectData) => string
   */
  const timeSlotCssClassNameCallback =
    useCallback<TimeSlotCssClassNameCallback>(
      (
        subject: SubjectData | null,
        isBreakTime: boolean,
        _isLocked: boolean,
      ) => {
        const breakTimeState = isBreakTime ? "BREAK_BOTH" : "NOT_BREAK";
        const subjectOrEmpty = subject || ({} as SubjectData);
        return timeSlotCssClassName(breakTimeState, subjectOrEmpty);
      },
      [timeSlotCssClassName],
    );

  /**
   * Adapter for DisplayErrorChangeSubjectCallback
   * Expected: (error: string) => void
   * Original: (Breaktime: string, Year: number) => boolean (wrong function!)
   */
  const displayErrorChangeSubjectCallback =
    useCallback<DisplayErrorChangeSubjectCallback>(
      (error: string) => {
        // Display error message using setShowErrorMsg
        if (timeslotIDtoChange.source) {
          actions.setShowErrorMsg(timeslotIDtoChange.source, true);
          log.error("Schedule change error", { error });

          // Auto-hide error after 5 seconds
          setTimeout(() => {
            actions.setShowErrorMsg(timeslotIDtoChange.source, false);
          }, 5000);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [timeslotIDtoChange],
    );

  /**
   * Adapter for RemoveSubjectCallback
   * Expected: (timeslotID: string) => void
   * Original: (subject: SubjectData, timeSlotID: string) => void
   */
  const removeSubjectFromSlotCallback = useCallback<RemoveSubjectCallback>(
    (timeslotID: string) => {
      // Find subject by timeslotID
      const slot = timeSlotData.AllData.find(
        (item) => item.TimeslotID === timeslotID,
      );
      if (slot?.subject) {
        removeSubjectFromSlot(slot.subject, timeslotID);
      }
    },
    [timeSlotData, removeSubjectFromSlot],
  );

  // ============================================================================
  // SELECTION STATE CALLBACKS
  // ============================================================================

  const isSelectedToAdd = useCallback((): boolean => {
    return storeSelectedSubject != null;
  }, [storeSelectedSubject]);

  const isSelectedToChange = useCallback((): boolean => {
    return changeTimeSlotSubject != null;
  }, [changeTimeSlotSubject]);

  /**
   * Phase 2: Updated to work with new clickOrDragToChangeTimeSlot signature
   */
  const dropOutOfZone = useCallback(
    (subject: SubjectData) => {
      setTimeout(() => {
        if (changeTimeSlotSubject == null) {
          clickOrDragToSelectSubject(subject);
        } else {
          // Cancel change operation by calling with same source/dest
          if (timeslotIDtoChange.source) {
            clickOrDragToChangeTimeSlot(
              timeslotIDtoChange.source,
              timeslotIDtoChange.source,
            );
          }
        }
      }, 500);
    },
    [
      changeTimeSlotSubject,
      timeslotIDtoChange,
      clickOrDragToSelectSubject,
      clickOrDragToChangeTimeSlot,
    ],
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  const isLoading = useMemo(() => {
    return (
      fetchTeacher.isValidating ||
      fetchResp.isValidating ||
      fetchTimeSlot.isValidating ||
      fetchAllClassData.isValidating
    );
  }, [
    fetchTeacher.isValidating,
    fetchResp.isValidating,
    fetchTimeSlot.isValidating,
    fetchAllClassData.isValidating,
  ]);

  const hasError = useMemo(() => {
    return Boolean(
      fetchTeacher.error ||
        fetchResp.error ||
        fetchTimeSlot.error ||
        fetchAllClassData.error,
    );
  }, [
    fetchTeacher.error,
    fetchResp.error,
    fetchTimeSlot.error,
    fetchAllClassData.error,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="p-6">
        <TimetableGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <NetworkErrorEmptyState
        onRetry={() => {
          void fetchTeacher.mutate();
          void fetchResp.mutate();
          void fetchTimeSlot.mutate();
          void fetchAllClassData.mutate();
        }}
      />
    );
  }

  if (!currentTeacherID) {
    return (
      <div className="p-6">
        <SelectTeacher
          setTeacherID={actions.setCurrentTeacherID}
          currentTeacher={fetchTeacher.data}
        />
        <div className="mt-8">
          <EmptyState
            icon="👨‍🏫"
            title="เลือกครูเพื่อเริ่มจัดตาราง"
            description="กรุณาเลือกครูจากรายการด้านบนเพื่อดูและจัดตารางสอน"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Room Selection Modal */}
      {isActiveModal && (
        <SelectSubjectToTimeslotModal
          addSubjectToSlot={addSubjectToSlot}
          cancelAddRoom={cancelAddRoom}
          payload={subjectPayload!}
        />
      )}

      {/* Page Header */}
      {!!currentTeacherID && teacherData && (
        <PageHeader teacherData={teacherData} />
      )}

      {/* Teacher Selection */}
      <SelectTeacher
        setTeacherID={actions.setCurrentTeacherID}
        currentTeacher={fetchTeacher.data}
      />

      {/* Main Content - Drag & Drop Context */}
      {currentTeacherID && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Phase 2: Enhanced Searchable Subject Palette */}
          {/* Issue #120: Gate rendering on data presence to prevent race condition */}
          {subjectData.length > 0 && teacherData && (
            <div data-testid="subject-palette" data-loading="false">
              <SearchableSubjectPalette
                respData={subjectData}
                dropOutOfZone={dropOutOfZone}
                clickOrDragToSelectSubject={clickOrDragToSelectSubject}
                storeSelectedSubject={storeSelectedSubject ?? {}}
                teacher={teacherData}
                data-testid="subject-list"
              />
            </div>
          )}

          {/* Phase 2: Action Toolbar */}
          <ScheduleActionToolbar
            onClearDay={(day) => {
              enqueueSnackbar(`ฟีเจอร์ล้างวันที่ ${day} กำลังพัฒนา`, {
                variant: "info",
              });
            }}
            onClearAll={() => {
              enqueueSnackbar("ฟีเจอร์ล้างทั้งหมดกำลังพัฒนา", {
                variant: "info",
              });
            }}
            onCopyDay={(src, tgt) => {
              enqueueSnackbar(
                `ฟีเจอร์คัดลอกจากวันที่ ${src} ไปวันที่ ${tgt} กำลังพัฒนา`,
                { variant: "info" },
              );
            }}
            onUndo={() => {
              enqueueSnackbar("ฟีเจอร์ย้อนกลับกำลังพัฒนา", { variant: "info" });
            }}
            onAutoArrange={() => {
              enqueueSnackbar("ฟีเจอร์จัดอัตโนมัติกำลังพัฒนา", {
                variant: "info",
              });
            }}
            canUndo={false}
            hasChanges={false}
            totalSlots={timeSlotData?.AllData?.length || 0}
            filledSlots={
              timeSlotData?.AllData?.filter((slot) => Boolean(slot.subject))
                .length || 0
            }
          />

          {/* Save Button */}
          <div className="w-full flex justify-end items-center mt-3 gap-3">
            <PrimaryButton
              handleClick={() => void postData()}
              title={"บันทึกข้อมูล"}
              color={"success"}
              Icon={<SaveIcon />}
              reverseIcon={false}
              isDisabled={isSaving}
              data-testid="save-button"
            />
          </div>

          {/* Timetable Grid - Phase 2: Using callback adapters */}
          <TimeSlot
            timeSlotData={timeSlotData}
            checkBreakTime={checkBreakTime}
            isSelectedToAdd={isSelectedToAdd}
            isSelectedToChange={isSelectedToChange}
            checkRelatedYearDuringDragging={checkRelatedYearDuringDragging}
            timeSlotCssClassName={timeSlotCssClassNameCallback}
            storeSelectedSubject={storeSelectedSubject}
            addRoomModal={addRoomModal}
            changeTimeSlotSubject={changeTimeSlotSubject}
            clickOrDragToChangeTimeSlot={clickOrDragToChangeTimeSlot}
            isClickToChangeSubject={isClickToChangeSubject}
            timeslotIDtoChange={timeslotIDtoChange}
            dropOutOfZone={dropOutOfZone}
            displayErrorChangeSubject={displayErrorChangeSubjectCallback}
            showErrorMsgByTimeslotID={
              showErrorMsgByTimeslotID &&
              typeof showErrorMsgByTimeslotID === "object"
                ? Object.keys(showErrorMsgByTimeslotID).find(
                    (key) => showErrorMsgByTimeslotID[key],
                  ) || ""
                : ""
            }
            removeSubjectFromSlot={removeSubjectFromSlotCallback}
            showLockDataMsgByTimeslotID={
              showLockDataMsgByTimeslotID &&
              typeof showLockDataMsgByTimeslotID === "object"
                ? Object.keys(showLockDataMsgByTimeslotID).find(
                    (key) => showLockDataMsgByTimeslotID[key],
                  ) || ""
                : ""
            }
            data-testid="timeslot-grid"
            setShowErrorMsgByTimeslotID={actions.setShowErrorMsg}
            setShowLockDataMsgByTimeslotID={actions.setShowLockDataMsg}
          />
        </DndContext>
      )}
    </>
  );
}
