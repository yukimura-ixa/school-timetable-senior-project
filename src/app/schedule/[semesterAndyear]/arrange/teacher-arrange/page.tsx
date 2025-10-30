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
import { TimetableGridSkeleton, EmptyState, NetworkErrorEmptyState } from "@/components/feedback";

// Server Actions (Clean Architecture)
import { getTeacherScheduleAction, syncTeacherScheduleAction } from "@/features/arrange/application/actions/arrange.actions";
import { getConflictsAction } from "@/features/class/application/actions/class.actions";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { getAvailableRespsAction } from "@/features/assign/application/actions/assign.actions";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";

// Zustand Store
import { useArrangementUIStore } from "@/features/schedule-arrangement/presentation/stores/arrangement-ui.store";
import type { SubjectData } from "@/types";
import type { timeslot, class_schedule, subject, room } from "@/prisma/generated";

// Custom Hooks
import {
  useArrangeSchedule,
  useScheduleFilters,
  useConflictValidation,
} from "@/features/schedule-arrangement/presentation/hooks";

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
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";

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
  
  const [semester, academicYear] = (params.semesterAndyear as string).split("-");

  // ============================================================================
  // ZUSTAND STORE - Centralized State Management
  // ============================================================================
  const {
    // Teacher state
    currentTeacherID,
    teacherData,
    setCurrentTeacherID,
    setTeacherData,
    
    // Subject selection state
    selectedSubject: storeSelectedSubject,
    yearSelected,
    setSelectedSubject: setStoreSelectedSubject,
    setYearSelected,
    clearSelectedSubject,
    
    // Subject change state
    changeTimeSlotSubject,
    destinationSubject,
    timeslotIDtoChange,
    isCilckToChangeSubject,
    setChangeTimeSlotSubject,
    setDestinationSubject,
    setTimeslotIDtoChange,
    setIsCilckToChangeSubject,
    clearChangeSubjectState,
    
    // Data state
    subjectData,
    scheduledSubjects,
    setSubjectData,
    setScheduledSubjects,
    addSubjectToData,
    removeSubjectFromData,
    
    // Timeslot state
    timeSlotData,
    lockData,
    setTimeSlotData,
    setLockData,
    updateTimeslotSubject,
    
    // Modal state
    isActiveModal,
    subjectPayload,
    openModal,
    closeModal,
    setSubjectPayload,
    
    // Error display state
    showErrorMsgByTimeslotID,
    showLockDataMsgByTimeslotID,
    setShowErrorMsg,
    setShowLockDataMsg,
    clearErrorMessages,
    
    // Save state
    isSaving,
    setIsSaving,
    
    // Reset
    resetOnTeacherChange,
  } = useArrangementUIStore();

  // ============================================================================
  // CUSTOM HOOKS - Extracted Business Logic
  // ============================================================================
  
  const scheduleOps = useArrangeSchedule();
  const filters = useScheduleFilters();
  const validation = useConflictValidation();

  // ============================================================================
  // DATA FETCHING (Server Actions - Clean Architecture)
  // ============================================================================
  
  // Use SWR with Server Actions for client-side data fetching
  const checkConflictData = useSWR<any>(
    () =>
      currentTeacherID
        ? `conflicts-${academicYear}-${semester}-${currentTeacherID}`
        : null,
    async () => {
      if (!currentTeacherID) return null;
      const result = await getConflictsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || typeof result !== 'object' || !('success' in result)) {
        return null;
      }
      return (result.success && 'data' in result) ? result.data : null;
    },
    { revalidateOnFocus: false }
  );

  const fetchAllClassData = useSWR<any>(
    () =>
      currentTeacherID
        ? `teacher-schedule-${academicYear}-${semester}-${currentTeacherID}`
        : null,
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTeacherScheduleAction({
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || typeof result !== 'object' || !('success' in result)) {
        return null;
      }
      return (result.success && 'data' in result) ? result.data : null;
    },
    { revalidateOnFocus: false, revalidateOnMount: true }
  );

  const fetchTeacher = useSWR<any>(
    () => (currentTeacherID ? `teacher-${currentTeacherID}` : null),
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTeachersAction();
      if (!result || typeof result !== 'object' || !('success' in result)) {
        return null;
      }
      if (result.success && 'data' in result) {
        const teachers = result.data as Array<{ TeacherID: number; [key: string]: unknown }>;
        const teacher = teachers.find(
          (t) => t.TeacherID === parseInt(currentTeacherID)
        );
        return teacher || null;
      }
      return null;
    },
    { revalidateOnFocus: false }
  );

  const fetchResp = useSWR<any>(
    () =>
      currentTeacherID
        ? `available-resp-${academicYear}-${semester}-${currentTeacherID}`
        : null,
    async () => {
      if (!currentTeacherID) return null;
      const result = await getAvailableRespsAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherID: parseInt(currentTeacherID),
      });
      if (!result || typeof result !== 'object' || !('success' in result)) {
        return null;
      }
      return (result.success && 'data' in result) ? result.data : null;
    },
    { revalidateOnFocus: false }
  );

  const fetchTimeSlot = useSWR<any>(
    () => (currentTeacherID ? `timeslots-${academicYear}-${semester}` : null),
    async () => {
      if (!currentTeacherID) return null;
      const result = await getTimeslotsByTermAction({
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });
      if (!result || typeof result !== 'object' || !('success' in result)) {
        return null;
      }
      return (result.success && 'data' in result) ? result.data : null;
    },
    { revalidateOnFocus: false }
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
    })
  );

  // ============================================================================
  // EFFECTS - Initialize and cleanup
  // ============================================================================
  
  // Reset state when teacher changes
  useEffect(() => {
    return () => {
      resetOnTeacherChange();
    };
  }, [searchTeacherID, resetOnTeacherChange]);
  
  // Initialize teacher ID from search params
  useEffect(() => {
    if (searchTeacherID) {
      setCurrentTeacherID(searchTeacherID);
    }
  }, [searchTeacherID, setCurrentTeacherID]);

  // Fetch and set subject data
  useEffect(() => {
    if (fetchResp.data && !!currentTeacherID && !fetchResp.isValidating) {
      const data = fetchResp.data.map((data: SubjectData) => ({ ...data, room: {} }));
      setSubjectData(data);
    }
  }, [fetchResp.data, fetchResp.isValidating, currentTeacherID, setSubjectData]);

  // Fetch and set teacher data
  useEffect(() => {
    if (!fetchTeacher.isValidating && fetchTeacher.data && !!currentTeacherID) {
      setTeacherData(fetchTeacher.data);
    }
  }, [fetchTeacher.isValidating, fetchTeacher.data, currentTeacherID, setTeacherData]);

  // Fetch and set timeslot data
  useEffect(() => {
    if (!fetchTimeSlot.isValidating && fetchTimeSlot.data && !!currentTeacherID) {
      fetchTimeslotData();
    }
  }, [fetchTimeSlot.isValidating, fetchTimeSlot.data, currentTeacherID]);

  // Fetch and set class data
  useEffect(() => {
    if (!fetchAllClassData.isValidating && fetchAllClassData.data && !!currentTeacherID) {
      fetchClassData();
    }
  }, [fetchAllClassData.isValidating, fetchAllClassData.data, currentTeacherID]);

  // Handle subject selection for conflict display
  useEffect(() => {
    if (!checkConflictData.isValidating) {
      onSelectSubject();
    }
  }, [storeSelectedSubject, changeTimeSlotSubject, checkConflictData.isValidating]);

  // Handle destination subject change (swap subjects)
  useEffect(() => {
    if (timeslotIDtoChange.destination !== "") {
      changeSubjectSlot();
      setTimeslotIDtoChange({ source: "", destination: "" });
      setChangeTimeSlotSubject({});
      setDestinationSubject({});
      setYearSelected(null);
    }
  }, [timeslotIDtoChange.destination]);

  // ============================================================================
  // DATA PROCESSING FUNCTIONS
  // ============================================================================

  const fetchTimeslotData = useCallback(() => {
    if (!fetchTimeSlot.data) return;
    
    const data = fetchTimeSlot.data;
    
    // Extract unique days of week with their display colors
    type DayDisplay = { Day: string; TextColor: string; BgColor: string };
    const dayofweek: DayDisplay[] = data
      .map((day: timeslot) => day.DayOfWeek)
      .filter((item: string, index: number, arr: string[]) => arr.indexOf(item) === index)
      .map((item: string) => ({
        Day: dayOfWeekThai[item],
        TextColor: dayOfWeekTextColor[item],
        BgColor: dayOfWeekColor[item],
      }));
    
    // Get slot amounts (use Monday as reference since all days have same slots)
    const slotAmount = data
      .filter((item: timeslot) => item.DayOfWeek === "MON")
      .map((_: timeslot, index: number) => index + 1);
    
    // Extract break times
    type BreakSlot = { TimeslotID: string; Breaktime: string; SlotNumber: number };
    const breakTime: BreakSlot[] = data
      .filter(
        (item: timeslot) =>
          (item.Breaktime === "BREAK_BOTH" ||
            item.Breaktime === "BREAK_JUNIOR" ||
            item.Breaktime === "BREAK_SENIOR") &&
          item.DayOfWeek === "MON"
      )
      .map((item: timeslot) => ({
        TimeslotID: item.TimeslotID,
        Breaktime: item.Breaktime,
        SlotNumber: parseInt(item.TimeslotID.substring(10)),
      }));
    
    setTimeSlotData({
      AllData: data.map((data: timeslot) => ({ ...data, subject: {} })),
      SlotAmount: slotAmount,
      DayOfWeek: dayofweek,
      BreakSlot: breakTime,
    });
  }, [fetchTimeSlot.data, setTimeSlotData]);

  const fetchClassData = useCallback(() => {
    if (!fetchAllClassData.data || !timeSlotData.AllData.length) return;
    
    type ClassScheduleWithRelations = class_schedule & {
      subject: subject;
      room: room | null;
    };
    
    // fetchAllClassData.data is the array extracted by the SWR fetcher
    const puredata: ClassScheduleWithRelations[] = Array.isArray(fetchAllClassData.data) 
      ? fetchAllClassData.data 
      : [];
    
    const data = puredata.map((item: ClassScheduleWithRelations) => ({
      ...item,
      SubjectName: item.subject.SubjectName,
      RoomName: item.room?.RoomName || "ไม่มีห้องเรียน",
    }));
    
    const filterLock = data.filter((item: ClassScheduleWithRelations & { SubjectName: string; RoomName: string }) => item.IsLocked);
    const filterNotLock = data.filter((item: ClassScheduleWithRelations & { SubjectName: string; RoomName: string }) => !item.IsLocked);
    
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
          GradeID: [filterLock[i].GradeID],
        });
      } else {
        const tID = filterLock[i].TimeslotID;
        resFilterLock.forEach((item, index) => {
          if (item.TimeslotID === tID) {
            resFilterLock[index] = {
              ...item,
              GradeID: [...item.GradeID, filterLock[i].GradeID],
            };
          }
        });
      }
    }
    
    const concatClassData = filterNotLock.concat(resFilterLock);
    setScheduledSubjects(concatClassData);
    setLockData(resFilterLock);
    
    // Map subjects into timeslots
    type EnrichedClassSchedule = ClassScheduleWithRelations & { SubjectName: string; RoomName: string };
    setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((data: timeslot & { subject?: EnrichedClassSchedule }) => {
        const matchedSubject = concatClassData.find(
          (item: EnrichedClassSchedule) => item.TimeslotID === data.TimeslotID
        );
        
        return matchedSubject
          ? { ...data, subject: matchedSubject }
          : data;
      }),
    });
  }, [fetchAllClassData.data, timeSlotData, setScheduledSubjects, setLockData, setTimeSlotData]);

  // ============================================================================
  // SAVE OPERATION
  // ============================================================================

  const postData = useCallback(async () => {
    setIsSaving(true);
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
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error(error);
      closeSnackbar(savingSnackbar);
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกข้อมูล", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [searchTeacherID, academicYear, semester, timeSlotData, setIsSaving, fetchAllClassData]);

  // ============================================================================
  // SUBJECT OPERATIONS
  // ============================================================================

  const addSubjectToSlot = useCallback((subject: SubjectData, timeSlotID: string) => {
    const mapTimeSlot = {
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item: timeslot & { subject?: SubjectData }) =>
        item.TimeslotID === timeSlotID
          ? { ...item, subject: { ...subject } }
          : item
      ),
    };
    
    setTimeSlotData(mapTimeSlot);
    setSubjectData(subjectData.filter((item: SubjectData) => item.itemID !== subject.itemID));
    clearSelectedSubject();
    setYearSelected(null);
    closeModal();
  }, [timeSlotData, subjectData, setTimeSlotData, setSubjectData, clearSelectedSubject, setYearSelected, closeModal]);

  const cancelAddRoom = useCallback((subject: SubjectData, timeSlotID: string) => {
    removeSubjectFromSlot(subject, timeSlotID);
    clearSelectedSubject();
    setYearSelected(null);
    closeModal();
  }, [clearSelectedSubject, setYearSelected, closeModal]);

  const removeSubjectFromSlot = useCallback((subject: SubjectData, timeSlotID: string) => {
    returnSubject(subject);
    
    setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item: timeslot & { subject?: SubjectData }) =>
        item.TimeslotID === timeSlotID ? { ...item, subject: {} } : item
      ),
    });
  }, [timeSlotData, setTimeSlotData]);

  const returnSubject = useCallback((subject: SubjectData) => {
    const cleanSubject = { ...subject };
    delete cleanSubject.RoomName;
    delete cleanSubject.room;
    delete cleanSubject.ClassID;
    
    setSubjectData([
      ...subjectData,
      { ...cleanSubject, itemID: subjectData.length + 1 },
    ]);
  }, [subjectData, setSubjectData]);

  // ============================================================================
  // CONFLICT DISPLAY LOGIC
  // ============================================================================

  const clearScheduledData = useCallback(() => {
    setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item: timeslot & { subject?: SubjectData & { Scheduled?: boolean } }) =>
        item.subject?.Scheduled ? { ...item, subject: {} } : item
      ),
    });
  }, [timeSlotData, setTimeSlotData]);

  const onSelectSubject = useCallback(() => {
    const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
    const isSelectedToChange = Object.keys(changeTimeSlotSubject).length !== 0;
    
    if (!isSelectedToAdd && !isSelectedToChange) {
      clearScheduledData();
      return;
    }
    
    const selectedGradeID = !isSelectedToChange
      ? storeSelectedSubject.GradeID
      : changeTimeSlotSubject.GradeID;
    
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
      setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item: timeslot & { subject?: SubjectData | ScheduledSlot }) => {
          if (Object.keys(item.subject || {}).length !== 0) return item;
          
          const matchedSlot = scheduledGradeIDTimeslot.find(
            (slot: ScheduledSlot) => slot.TimeslotID === item.TimeslotID
          );
          
          return matchedSlot ? { ...item, subject: matchedSlot } : item;
        }),
      });
    } else {
      clearScheduledData();
    }
  }, [storeSelectedSubject, changeTimeSlotSubject, checkConflictData.data, timeSlotData, clearScheduledData, setTimeSlotData]);

  // ============================================================================
  // @DND-KIT EVENT HANDLERS (Replaces react-beautiful-dnd)
  // ============================================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
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
        (item: timeslot & { subject?: SubjectData }) => item.TimeslotID === timeslotID
      );
      
      if (getSubjectFromTimeslot && Object.keys(changeTimeSlotSubject).length === 0) {
        clickOrDragToChangeTimeSlot(
          getSubjectFromTimeslot.subject,
          timeslotID,
          false
        );
      }
    }
  }, [storeSelectedSubject, subjectData, changeTimeSlotSubject, timeSlotData]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      // Dropped outside droppable zone - cancel selection after delay
      setTimeout(() => {
        if (Object.keys(changeTimeSlotSubject).length === 0) {
          clickOrDragToSelectSubject(storeSelectedSubject);
        } else {
          clickOrDragToChangeTimeSlot(changeTimeSlotSubject, "", false);
        }
      }, 500);
      return;
    }
    
    const sourceData = active.data.current;
    const targetData = over.data.current;
    
    if (sourceData?.type === "subject" && targetData?.type === "timeslot") {
      // Adding subject to timeslot
      addRoomModal(targetData.timeslotID);
      clickOrDragToSelectSubject(subjectData[sourceData.index]);
    } else if (sourceData?.type === "timeslot" && targetData?.type === "timeslot") {
      // Swapping subjects between timeslots
      const desti_tID = targetData.timeslotID;
      const getSubjectFromTimeslot = timeSlotData.AllData.find(
        (item: timeslot & { subject?: SubjectData }) => item.TimeslotID === desti_tID
      );
      
      if (getSubjectFromTimeslot) {
        clickOrDragToChangeTimeSlot(
          getSubjectFromTimeslot.subject,
          desti_tID,
          false
        );
      }
    }
  }, [changeTimeSlotSubject, storeSelectedSubject, subjectData, timeSlotData]);

  // ============================================================================
  // SUBJECT SELECTION HANDLERS
  // ============================================================================

  const clickOrDragToSelectSubject = useCallback((subject: SubjectData) => {
    clearScheduledData();
    
    const checkDuplicateSubject = subject === storeSelectedSubject ? {} : subject;
    
    if (Object.keys(storeSelectedSubject).length === 0 || checkDuplicateSubject) {
      const year = subject.gradelevel?.Year;
      setYearSelected(subject === storeSelectedSubject ? null : year || null);
    }
    
    setStoreSelectedSubject(checkDuplicateSubject);
    setChangeTimeSlotSubject({});
    setTimeslotIDtoChange({ source: "", destination: "" });
  }, [storeSelectedSubject, clearScheduledData, setYearSelected, setStoreSelectedSubject, setChangeTimeSlotSubject, setTimeslotIDtoChange]);

  const addRoomModal = useCallback((timeslotID: string) => {
    if (Object.keys(storeSelectedSubject).length === 0) return;
    
    const payload = {
      timeslotID: timeslotID,
      selectedSubject: storeSelectedSubject,
    };
    
    setSubjectPayload(payload);
    addSubjectToSlot(storeSelectedSubject, timeslotID);
    setScheduledSubjects([...scheduledSubjects, storeSelectedSubject]);
    openModal(payload); // openModal requires payload parameter
  }, [storeSelectedSubject, scheduledSubjects, setSubjectPayload, addSubjectToSlot, setScheduledSubjects, openModal]);

  const clickOrDragToChangeTimeSlot = useCallback((
    subject: SubjectData,
    timeslotID: string,
    isClickToChange: boolean
  ) => {
    const checkDuplicateSubject = subject === changeTimeSlotSubject;
    
    if (Object.keys(changeTimeSlotSubject).length === 0 || checkDuplicateSubject) {
      const year = subject.gradelevel?.Year;
      setIsCilckToChangeSubject(checkDuplicateSubject ? false : isClickToChange);
      setChangeTimeSlotSubject(checkDuplicateSubject ? {} : subject);
      setTimeslotIDtoChange(
        checkDuplicateSubject
          ? { source: "", destination: "" }
          : { ...timeslotIDtoChange, source: timeslotID }
      );
      setYearSelected(checkDuplicateSubject ? null : year || null);
    } else if (timeslotIDtoChange.source !== "") {
      setTimeslotIDtoChange({
        ...timeslotIDtoChange,
        destination: timeslotID,
      });
      setDestinationSubject(subject);
      setIsCilckToChangeSubject(false);
    }
    
    setStoreSelectedSubject({});
  }, [changeTimeSlotSubject, timeslotIDtoChange, setIsCilckToChangeSubject, setChangeTimeSlotSubject, setTimeslotIDtoChange, setYearSelected, setDestinationSubject, setStoreSelectedSubject]);

  const changeSubjectSlot = useCallback(() => {
    const sourceSubj = changeTimeSlotSubject;
    const destinationSubj = destinationSubject;
    const sourceTimeslotID = timeslotIDtoChange.source;
    const destinationTimeslotID = timeslotIDtoChange.destination;
    
    setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item: timeslot & { subject?: SubjectData }) =>
        item.TimeslotID === sourceTimeslotID
          ? { ...item, subject: destinationSubj }
          : item.TimeslotID === destinationTimeslotID
            ? { ...item, subject: sourceSubj }
            : item
      ),
    });
  }, [changeTimeSlotSubject, destinationSubject, timeslotIDtoChange, timeSlotData, setTimeSlotData]);

  // ============================================================================
  // VALIDATION & STYLING HELPERS
  // ============================================================================

  const checkBreakTime = useCallback((breakTimeState: string): boolean => {
    const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
    const isSelectedToChange = Object.keys(changeTimeSlotSubject).length !== 0;
    
    if (!yearSelected) return false;
    
    const result =
      ((isSelectedToAdd || isSelectedToChange) &&
        breakTimeState === "BREAK_JUNIOR" &&
        [1, 2, 3].includes(yearSelected)) ||
      (breakTimeState === "BREAK_SENIOR" && [4, 5, 6].includes(yearSelected));
    
    return breakTimeState === "BREAK_BOTH" ? true : result;
  }, [storeSelectedSubject, changeTimeSlotSubject, yearSelected]);

  const checkBreakTimeOutOfRange = useCallback((
    breakTimeState: string,
    year: number
  ): boolean => {
    if (timeslotIDtoChange.source !== "") {
      const getBreaktime = timeSlotData.AllData.find(
        (item: timeslot & { subject?: SubjectData }) => item.TimeslotID === timeslotIDtoChange.source
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
  }, [timeslotIDtoChange, timeSlotData, checkBreakTime]);

  const checkRelatedYearDuringDragging = useCallback((year: number): boolean => {
    if (timeslotIDtoChange.source !== "" && yearSelected) {
      const getBreaktime = timeSlotData.AllData.find(
        (item: timeslot & { subject?: SubjectData }) => item.TimeslotID === timeslotIDtoChange.source
      )?.Breaktime;
      
      const findYearRange = [1, 2, 3].includes(yearSelected)
        ? [1, 2, 3]
        : [4, 5, 6];
      
      return getBreaktime !== "NOT_BREAK" ? !findYearRange.includes(year) : false;
    }
    return false;
  }, [timeslotIDtoChange, yearSelected, timeSlotData]);

  const timeSlotCssClassName = useCallback((
    breakTimeState: string,
    subjectInSlot: SubjectData
  ): string => {
    const isSubjectInSlot = Object.keys(subjectInSlot).length !== 0;
    const isSelectedToAdd = Object.keys(storeSelectedSubject).length !== 0;
    const isSelectedToChange = Object.keys(changeTimeSlotSubject).length !== 0;
    
    const disabledSlot = `grid flex justify-center h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200 ${subjectInSlot.Scheduled ? "opacity-35" : "opacity-100"}`;
    
    const enabledSlot = `grid items-center justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white ${
      isSelectedToAdd && !isSubjectInSlot
        ? "border-emerald-300 cursor-pointer border-dashed"
        : isSubjectInSlot && displayErrorChangeSubject(breakTimeState, subjectInSlot.gradelevel?.Year || 0)
          ? "border-red-300"
          : isSelectedToChange
            ? "border-blue-300 border-dashed"
            : isSubjectInSlot
              ? "border-red-300"
              : "border-dashed"
    } duration-200`;
    
    return subjectInSlot.Scheduled
      ? disabledSlot
      : typeof subjectInSlot.GradeID !== "string" && isSubjectInSlot
        ? disabledSlot
        : checkBreakTime(breakTimeState) && !isSubjectInSlot
          ? disabledSlot
          : enabledSlot;
  }, [storeSelectedSubject, changeTimeSlotSubject, checkBreakTime]);

  const displayErrorChangeSubject = useCallback((
    Breaktime: string,
    Year: number
  ): boolean => {
    return checkBreakTime(Breaktime) || Breaktime === "NOT_BREAK"
      ? checkBreakTimeOutOfRange(Breaktime, Year)
      : false;
  }, [checkBreakTime, checkBreakTimeOutOfRange]);

  const isSelectedToAdd = useCallback((): boolean => {
    return Object.keys(storeSelectedSubject).length !== 0;
  }, [storeSelectedSubject]);

  const isSelectedToChange = useCallback((): boolean => {
    return Object.keys(changeTimeSlotSubject).length !== 0;
  }, [changeTimeSlotSubject]);

  const dropOutOfZone = useCallback((subject: SubjectData) => {
    setTimeout(() => {
      if (Object.keys(changeTimeSlotSubject).length === 0) {
        clickOrDragToSelectSubject(subject);
      } else {
        clickOrDragToChangeTimeSlot(subject, "", false);
      }
    }, 500);
  }, [changeTimeSlotSubject, clickOrDragToSelectSubject, clickOrDragToChangeTimeSlot]);

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
          setTeacherID={setCurrentTeacherID}
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
        setTeacherID={setCurrentTeacherID}
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
              enqueueSnackbar(`ฟีเจอร์ล้างวันที่ ${day} กำลังพัฒนา`, { variant: 'info' });
            }}
            onClearAll={() => {
              enqueueSnackbar('ฟีเจอร์ล้างทั้งหมดกำลังพัฒนา', { variant: 'info' });
            }}
            onCopyDay={(src, tgt) => {
              enqueueSnackbar(`ฟีเจอร์คัดลอกจากวันที่ ${src} ไปวันที่ ${tgt} กำลังพัฒนา`, { variant: 'info' });
            }}
            onUndo={() => {
              enqueueSnackbar('ฟีเจอร์ย้อนกลับกำลังพัฒนา', { variant: 'info' });
            }}
            onAutoArrange={() => {
              enqueueSnackbar('ฟีเจอร์จัดอัตโนมัติกำลังพัฒนา', { variant: 'info' });
            }}
            canUndo={false}
            hasChanges={false}
            totalSlots={timeSlotData?.AllData?.length || 0}
            filledSlots={timeSlotData?.AllData?.filter((slot: timeslot & { subject?: SubjectData }) => !!slot.subject).length || 0}
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

          {/* Timetable Grid */}
          <TimeSlot
            timeSlotData={timeSlotData}
            checkBreakTime={checkBreakTime}
            isSelectedToAdd={isSelectedToAdd}
            isSelectedToChange={isSelectedToChange}
            checkRelatedYearDuringDragging={checkRelatedYearDuringDragging}
            timeSlotCssClassName={timeSlotCssClassName}
            storeSelectedSubject={storeSelectedSubject}
            addRoomModal={addRoomModal}
            changeTimeSlotSubject={changeTimeSlotSubject}
            clickOrDragToChangeTimeSlot={clickOrDragToChangeTimeSlot}
            isCilckToChangeSubject={isCilckToChangeSubject}
            timeslotIDtoChange={timeslotIDtoChange}
            dropOutOfZone={dropOutOfZone}
            displayErrorChangeSubject={displayErrorChangeSubject}
            showErrorMsgByTimeslotID={Object.keys(showErrorMsgByTimeslotID).find(key => showErrorMsgByTimeslotID[key]) || ""}
            removeSubjectFromSlot={removeSubjectFromSlot}
            showLockDataMsgByTimeslotID={Object.keys(showLockDataMsgByTimeslotID).find(key => showLockDataMsgByTimeslotID[key]) || ""}
            setShowErrorMsgByTimeslotID={setShowErrorMsg}
            setShowLockDataMsgByTimeslotID={setShowLockDataMsg}
          />
        </DndContext>
      )}
    </>
  );
}
