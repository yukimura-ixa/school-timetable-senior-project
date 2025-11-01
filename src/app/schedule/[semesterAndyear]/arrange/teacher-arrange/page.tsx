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
import { useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import SaveIcon from "@mui/icons-material/Save";

// MUI Components
import PrimaryButton from "@/components/mui/PrimaryButton";

// Feedback Components
import {
  TimetableGridSkeleton,
  EmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";

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
} from "@/types/schedule.types";
import type {
  timeslot,
  class_schedule,
  subject,
  room,
  teacher,
} from "@/prisma/generated";

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
type ResponsibilityData = SubjectData[];
type TimeslotData = timeslot[];

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

  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
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
  const { errorMessages: showErrorMsgByTimeslotID, lockMessages: showLockDataMsgByTimeslotID } = useErrorState();
  const isSaving = useSaveState();

  // Internal state (not exposed via selectors - use direct store access)
  const {
    yearSelected,
    changeTimeSlotSubject,
    destinationSubject,
    timeslotIDtoChange,
    isClickToChangeSubject,
  } = useTeacherArrangeStore((state) => ({
    yearSelected: state.yearSelected,
    changeTimeSlotSubject: state.changeTimeSlotSubject,
    destinationSubject: state.destinationSubject,
    timeslotIDtoChange: state.timeslotIDtoChange,
    isClickToChangeSubject: state.isClickToChangeSubject,
  }));

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
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      })) as ActionResult<ConflictData>;
      if (!result.success || !result.data) {
        return null;
      }
      return result.data;
    },
    { revalidateOnFocus: false },
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
      const result = (await getTeachersAction()) as ActionResult<teacher[]>;
      
      if (!result.success || !result.data) return null;
      
      const foundTeacher = result.data.find(
        (t) => t.TeacherID === parseInt(currentTeacherID),
      );
      
      // Use nullish coalescing for cleaner null handling
      return foundTeacher ?? null;
    },
    { revalidateOnFocus: false },
  );

  const fetchResp = useSWR<ResponsibilityData | null>(
    currentTeacherID
      ? `available-resp-${academicYear}-${semester}-${currentTeacherID}`
      : null,
    async (): Promise<ResponsibilityData | null> => {
      if (!currentTeacherID) return null;
      const result = (await getAvailableRespsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      })) as ActionResult<ResponsibilityData>;
      if (!result.success || !result.data) return null;
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  const fetchTimeSlot = useSWR<TimeslotData | null>(
    () => (currentTeacherID ? `timeslots-${academicYear}-${semester}` : null),
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTimeslotsByTermAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (!result || typeof result !== "object" || !("success" in result)) {
        return null;
      }
      return result.success && "data" in result ? result.data : null;
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

  // Reset state when teacher changes
  useEffect(() => {
    return () => {
      actions.resetOnTeacherChange();
    };
  }, [searchTeacherID, actions]);

  // Initialize teacher ID from search params
  useEffect(() => {
    if (searchTeacherID) {
      actions.setCurrentTeacherID(searchTeacherID);
    }
  }, [searchTeacherID, actions]);

  // Fetch and set subject data
  useEffect(() => {
    if (fetchResp.data && !!currentTeacherID && !fetchResp.isValidating) {
      const data = fetchResp.data.map((data: SubjectData) => ({
        ...data,
        room: {},
      }));
      actions.setSubjectData(data);
    }
  }, [
    fetchResp.data,
    fetchResp.isValidating,
    currentTeacherID,
    actions,
  ]);

  // Fetch and set teacher data
  useEffect(() => {
    if (!fetchTeacher.isValidating && fetchTeacher.data && !!currentTeacherID) {
      actions.setTeacherData(fetchTeacher.data);
    }
  }, [
    fetchTeacher.isValidating,
    fetchTeacher.data,
    currentTeacherID,
    actions,
  ]);

  // Fetch and set timeslot data
  useEffect(() => {
    if (
      !fetchTimeSlot.isValidating &&
      fetchTimeSlot.data &&
      !!currentTeacherID
    ) {
      fetchTimeslotData();
    }
  }, [fetchTimeSlot.isValidating, fetchTimeSlot.data, currentTeacherID]);

  // Fetch and set class data
  useEffect(() => {
    if (
      !fetchAllClassData.isValidating &&
      fetchAllClassData.data &&
      !!currentTeacherID
    ) {
      fetchClassData();
    }
  }, [
    fetchAllClassData.isValidating,
    fetchAllClassData.data,
    currentTeacherID,
  ]);

  // Handle subject selection for conflict display
  useEffect(() => {
    if (!checkConflictData.isValidating) {
      onSelectSubject();
    }
  }, [
    storeSelectedSubject,
    changeTimeSlotSubject,
    checkConflictData.isValidating,
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
  }, [timeslotIDtoChange.destination, actions]);

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
    const dayofweek = data
      .map((day: timeslot) => day.DayOfWeek)
      .filter(
        (item: string, index: number, arr: string[]) =>
          arr.indexOf(item) === index,
      )
      .map(
        (item: string): {
          day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI";
          textColor: string;
          bgColor: string;
        } => ({
          day_of_week: item as "MON" | "TUE" | "WED" | "THU" | "FRI",
          textColor: dayOfWeekTextColor[item],
          bgColor: dayOfWeekColor[item],
        }),
      );

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
      AllData: data.map((slot: timeslot): EnrichedTimeslot => ({ 
        ...slot, 
        subject: null // null = empty slot (not {} which is ambiguous)
      })),
      SlotAmount: slotAmount,
      DayOfWeek: dayofweek,
      BreakSlot: breakTime,
    });
  }, [fetchTimeSlot.data, actions]);

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
    type LockedScheduleItem = ClassScheduleWithRelations & {
      SubjectName: string;
      RoomName: string;
      GradeID: string | string[]; // Can be array when multiple grades share same timeslot
    };
    const resFilterLock: LockedScheduleItem[] = [];
    const keepId: string[] = [];

    for (let i = 0; i < filterLock.length; i++) {
      if (keepId.length === 0 || !keepId.includes(filterLock[i].TimeslotID)) {
        keepId.push(filterLock[i].TimeslotID);
        resFilterLock.push({
          ...filterLock[i],
          GradeID: [filterLock[i].GradeID], // Convert single GradeID to array
        });
      } else {
        const tID = filterLock[i].TimeslotID;
        resFilterLock.forEach((item, index) => {
          if (item.TimeslotID === tID) {
            resFilterLock[index] = {
              ...item,
              GradeID: [
                ...(Array.isArray(item.GradeID)
                  ? item.GradeID
                  : [item.GradeID]),
                filterLock[i].GradeID,
              ], // Properly typed as string[]
            };
          }
        });
      }
    }

    const concatClassData = filterNotLock.concat(resFilterLock);
    
    // Map enriched class_schedule to SubjectData format for store compatibility
    // SubjectData has both PascalCase and camelCase fields for backward compatibility
    const mappedScheduledSubjects: SubjectData[] = concatClassData.map(item => ({
      itemID: parseInt(item.ClassID),
      SubjectCode: item.SubjectCode,
      SubjectName: item.SubjectName,
      subjectCode: item.SubjectCode, // Duplicate for compatibility
      subjectName: item.SubjectName, // Duplicate for compatibility
      RoomName: item.RoomName,
      RoomID: item.RoomID,
      GradeID: Array.isArray(item.GradeID) ? item.GradeID[0] : item.GradeID, // Take first grade if array
      gradeID: Array.isArray(item.GradeID) ? item.GradeID[0] : item.GradeID, // Duplicate for compatibility
      ClassID: item.ClassID,
      subject: item.subject,
      room: item.room,
      Scheduled: true,
    }));
    
    const mappedLockData: class_schedule[] = resFilterLock.map(item => ({
      ClassID: item.ClassID,
      TimeslotID: item.TimeslotID,
      SubjectCode: item.SubjectCode,
      RoomID: item.RoomID,
      GradeID: Array.isArray(item.GradeID) ? item.GradeID[0] : item.GradeID, // Take first grade
      IsLocked: item.IsLocked,
    }));
    
    actions.setScheduledSubjects(mappedScheduledSubjects);
    actions.setLockData(mappedLockData);

    // Map subjects into timeslots
    actions.setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((data): EnrichedTimeslot => {
        const matchedSubject = concatClassData.find(
          (item: EnrichedClassSchedule) => item.TimeslotID === data.TimeslotID,
        );

        // Enrich timeslot with subject data if matched, otherwise null
        return matchedSubject
          ? { ...data, subject: matchedSubject }
          : { ...data, subject: null };
      }),
    });
  }, [
    fetchAllClassData.data,
    timeSlotData,
    actions,
  ]);

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
        AcademicYear: parseInt(academicYear),
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
      console.error(error);
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
        AllData: timeSlotData.AllData.map(
          (item: timeslot & { subject?: SubjectData }) =>
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
    [
      timeSlotData,
      subjectData,
      actions,
    ],
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
    [subjectData, actions],
  );

  const removeSubjectFromSlot = useCallback(
    (subject: SubjectData, timeSlotID: string) => {
      returnSubject(subject);

      actions.setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map(
          (item: timeslot & { subject?: SubjectData }) =>
            item.TimeslotID === timeSlotID ? { ...item, subject: null } : item,
        ),
      });
    },
    [timeSlotData, returnSubject, actions],
  );

  const cancelAddRoom = useCallback(
    (subject: SubjectData, timeSlotID: string) => {
      removeSubjectFromSlot(subject, timeSlotID);
      actions.clearSelectedSubject();
      actions.setYearSelected(null);
      actions.closeModal();
    },
    [removeSubjectFromSlot, actions],
  );

  // ============================================================================
  // CONFLICT DISPLAY LOGIC
  // ============================================================================

  const clearScheduledData = useCallback(() => {
    actions.setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map(
        (
          item: timeslot & { subject?: SubjectData & { scheduled?: boolean } },
        ) => (item.subject?.scheduled ? { ...item, subject: null } : item),
      ),
    });
  }, [timeSlotData, actions]);

  const onSelectSubject = useCallback(() => {
    const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
    const isSelectedToChange = Object.keys(changeTimeSlotSubject).length !== 0;

    if (!isSelectedToAdd && !isSelectedToChange) {
      clearScheduledData();
      return;
    }

    const selectedGradeID = !isSelectedToChange
      ? storeSelectedSubject.gradeID
      : changeTimeSlotSubject.gradeID;

    if (!checkConflictData.data) return;

    type ScheduledSlot = class_schedule & {
      subject: subject;
      room: room;
      Scheduled?: boolean;
      SubjectName?: string;
      RoomName?: string;
    };

    const scheduledGradeIDTimeslot: ScheduledSlot[] = checkConflictData.data
      .filter((item: class_schedule) => item.GradeID === selectedGradeID)
      .map((slot: class_schedule & { subject: subject; room: room }) => ({
        ...slot,
        Scheduled: true,
        SubjectName: slot.subject.SubjectName,
        RoomName: slot.room.RoomName,
      }));

    if (scheduledGradeIDTimeslot.length > 0) {
      clearScheduledData();
      actions.setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map(
          (item: EnrichedTimeslot): EnrichedTimeslot => {
            // If timeslot already has a subject, keep it
            if (item.subject && Object.keys(item.subject).length !== 0) {
              return item;
            }

            // Find scheduled slot for this timeslot (conflict display)
            const matchedSlot = scheduledGradeIDTimeslot.find(
              (slot: ScheduledSlot) => slot.TimeslotID === item.TimeslotID,
            );

            // Add scheduled slot as subject if found, otherwise keep null
            return matchedSlot
              ? { ...item, subject: matchedSlot }
              : item;
          },
        ),
      });
    } else {
      clearScheduledData();
    }
  }, [
    storeSelectedSubject,
    changeTimeSlotSubject,
    checkConflictData.data,
    timeSlotData,
    clearScheduledData,
    actions,
  ]);

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
        if (Object.keys(storeSelectedSubject).length === 0) {
          clickOrDragToSelectSubject(subjectData[index]);
        }
      } else if (dragData?.type === "timeslot") {
        // Dragging from timeslot (to swap)
        const timeslotID = dragData.timeslotID;
        const getSubjectFromTimeslot = timeSlotData.AllData.find(
          (item: timeslot & { subject?: SubjectData }) =>
            item.TimeslotID === timeslotID,
        );

        if (
          getSubjectFromTimeslot &&
          Object.keys(changeTimeSlotSubject).length === 0
        ) {
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
          if (Object.keys(changeTimeSlotSubject).length === 0) {
            clickOrDragToSelectSubject(storeSelectedSubject);
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

      const sourceData = active.data.current;
      const targetData = over.data.current;

      if (sourceData?.type === "subject" && targetData?.type === "timeslot") {
        // Adding subject to timeslot - Phase 2: Pass SubjectPayload
        const payload: SubjectPayload = {
          timeslotID: targetData.timeslotID,
          selectedSubject: storeSelectedSubject,
        };
        addRoomModal(payload);
        clickOrDragToSelectSubject(subjectData[sourceData.index]);
      } else if (
        sourceData?.type === "timeslot" &&
        targetData?.type === "timeslot"
      ) {
        // Swapping subjects between timeslots - Phase 2: Use new signature
        const sourceID = sourceData.timeslotID;
        const destID = targetData.timeslotID;
        clickOrDragToChangeTimeSlot(sourceID, destID);
      }
    },
    [changeTimeSlotSubject, storeSelectedSubject, subjectData, timeSlotData, timeslotIDtoChange],
  );

  // ============================================================================
  // SUBJECT SELECTION HANDLERS
  // ============================================================================

  const clickOrDragToSelectSubject = useCallback(
    (subject: SubjectData) => {
      clearScheduledData();

      const checkDuplicateSubject =
        subject === storeSelectedSubject ? null : subject;

      if (
        Object.keys(storeSelectedSubject).length === 0 ||
        checkDuplicateSubject
      ) {
        const year = subject.gradelevel?.year;
        actions.setYearSelected(subject === storeSelectedSubject ? null : year || null);
      }

      actions.setSelectedSubject(checkDuplicateSubject);
      actions.setChangeTimeSlotSubject(null);
      actions.setTimeslotIDtoChange({ source: "", destination: "" });
    },
    [
      storeSelectedSubject,
      clearScheduledData,
      actions,
    ],
  );

  /**
   * Phase 2: Updated to match AddRoomModalCallback signature
   * Accepts SubjectPayload instead of just timeslotID
   */
  const addRoomModal = useCallback(
    (payload: SubjectPayload) => {
      if (Object.keys(storeSelectedSubject).length === 0) return;

      actions.setSubjectPayload(payload);
      addSubjectToSlot(storeSelectedSubject, payload.timeslotID);
      actions.setScheduledSubjects([...scheduledSubjects, storeSelectedSubject]);
      actions.openModal(payload);
    },
    [
      storeSelectedSubject,
      scheduledSubjects,
      addSubjectToSlot,
      actions,
    ],
  );

  /**
   * Phase 2: Updated to match ClickOrDragToChangeCallback signature
   * Now accepts (sourceID: string, destID: string) instead of (subject, timeslotID, isClick)
   */
  const clickOrDragToChangeTimeSlot = useCallback(
    (sourceID: string, destID: string) => {
      // Find the source subject from the timeslot
      const sourceSlot = timeSlotData.AllData.find(
        (item: timeslot & { subject?: SubjectData }) =>
          item.TimeslotID === sourceID,
      );

      if (!sourceSlot?.subject) {
        console.warn("No subject found in source timeslot", sourceID);
        return;
      }

      const subject = sourceSlot.subject;
      const isClickToChange = sourceID === destID; // Click if same slot
      const checkDuplicateSubject = subject === changeTimeSlotSubject;

      if (
        Object.keys(changeTimeSlotSubject).length === 0 ||
        checkDuplicateSubject
      ) {
        // First selection or deselection
        const year = subject.gradelevel?.year;
        actions.setIsClickToChangeSubject(
          checkDuplicateSubject ? false : isClickToChange,
        );
        actions.setChangeTimeSlotSubject(checkDuplicateSubject ? null : subject);
        actions.setTimeslotIDtoChange(
          checkDuplicateSubject
            ? { source: "", destination: "" }
            : { source: sourceID, destination: "" },
        );
        actions.setYearSelected(checkDuplicateSubject ? null : year || null);
      } else if (timeslotIDtoChange.source !== "" && destID !== sourceID) {
        // Second selection - swap operation
        const destSlot = timeSlotData.AllData.find(
          (item: timeslot & { subject?: SubjectData }) =>
            item.TimeslotID === destID,
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
    [
      changeTimeSlotSubject,
      timeslotIDtoChange,
      timeSlotData,
      actions,
    ],
  );

  const changeSubjectSlot = useCallback(() => {
    const sourceSubj = changeTimeSlotSubject;
    const destinationSubj = destinationSubject;
    const sourceTimeslotID = timeslotIDtoChange.source;
    const destinationTimeslotID = timeslotIDtoChange.destination;

    actions.setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map(
        (item: timeslot & { subject?: SubjectData }) =>
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
    (breakTimeState: string): boolean => {
      const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
      const isSelectedToChange =
        Object.keys(changeTimeSlotSubject).length !== 0;

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
          (item: timeslot & { subject?: SubjectData }) =>
            item.TimeslotID === timeslotIDtoChange.source,
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
          (item: timeslot & { subject?: SubjectData }) =>
            item.TimeslotID === timeslotIDtoChange.source,
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
      const isSubjectInSlot = Object.keys(subjectInSlot).length !== 0;
      const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
      const isSelectedToChange =
        Object.keys(changeTimeSlotSubject).length !== 0;

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
  const timeSlotCssClassNameCallback = useCallback<TimeSlotCssClassNameCallback>(
    (subject: SubjectData | null, isBreakTime: boolean, _isLocked: boolean) => {
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
  const displayErrorChangeSubjectCallback = useCallback<DisplayErrorChangeSubjectCallback>(
    (error: string) => {
      // Display error message using setShowErrorMsg
      if (timeslotIDtoChange.source) {
        actions.setShowErrorMsg(timeslotIDtoChange.source, true);
        console.error("Schedule change error:", error);

        // Auto-hide error after 5 seconds
        setTimeout(() => {
          actions.setShowErrorMsg(timeslotIDtoChange.source, false);
        }, 5000);
      }
    },
    [timeslotIDtoChange, actions],
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
        (item: timeslot & { subject?: SubjectData }) =>
          item.TimeslotID === timeslotID,
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
    return Object.keys(storeSelectedSubject).length !== 0;
  }, [storeSelectedSubject]);

  const isSelectedToChange = useCallback((): boolean => {
    return Object.keys(changeTimeSlotSubject).length !== 0;
  }, [changeTimeSlotSubject]);

  /**
   * Phase 2: Updated to work with new clickOrDragToChangeTimeSlot signature
   */
  const dropOutOfZone = useCallback(
    (subject: SubjectData) => {
      setTimeout(() => {
        if (Object.keys(changeTimeSlotSubject).length === 0) {
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
    return (
      fetchTeacher.error ||
      fetchResp.error ||
      fetchTimeSlot.error ||
      fetchAllClassData.error
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
          fetchTeacher.mutate();
          fetchResp.mutate();
          fetchTimeSlot.mutate();
          fetchAllClassData.mutate();
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
          payload={subjectPayload}
        />
      )}

      {/* Page Header */}
      {!!currentTeacherID && <PageHeader teacherData={teacherData} />}

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
          <SearchableSubjectPalette
            respData={subjectData}
            dropOutOfZone={dropOutOfZone}
            clickOrDragToSelectSubject={clickOrDragToSelectSubject}
            storeSelectedSubject={storeSelectedSubject}
            teacher={teacherData}
          />

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
              timeSlotData?.AllData?.filter(
                (slot: timeslot & { subject?: SubjectData }) => !!slot.subject,
              ).length || 0
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
              Object.keys(showErrorMsgByTimeslotID).find(
                (key) => showErrorMsgByTimeslotID[key],
              ) || ""
            }
            removeSubjectFromSlot={removeSubjectFromSlotCallback}
            showLockDataMsgByTimeslotID={
              Object.keys(showLockDataMsgByTimeslotID).find(
                (key) => showLockDataMsgByTimeslotID[key],
              ) || ""
            }
            setShowErrorMsgByTimeslotID={actions.setShowErrorMsg}
            setShowLockDataMsgByTimeslotID={actions.setShowLockDataMsg}
          />
        </DndContext>
      )}
    </>
  );
}
