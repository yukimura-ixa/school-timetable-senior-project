/**
 * @vitest-environment happy-dom
 */

/**
 * Teacher Arrange Store Unit Tests
 *
 * Comprehensive test suite for the Context7-powered Zustand store.
 * Tests all actions, selectors, history operations, and persistence.
 *
 * Pattern: Vitest + @testing-library/react hooks
 * Related: teacher-arrange.store.ts, Phase 4.1
 */

import { renderHook, act } from "@testing-library/react";
import {
  useTeacherArrangeStore,
  useTeacherArrangeActions,
  useSelectedSubject,
  useDraggedSubject,
  useYearSelected,
  useSubjectData,
  useScheduledSubjects,
  useTimeslotData,
  useModalState,
  useErrorState,
  useSaveState,
  useFilters,
  useHistoryControls,
  useCurrentTeacher,
} from "@/features/schedule-arrangement/presentation/stores/teacher-arrange.store";
import type {
  SubjectData,
  TimeslotData,
  SubjectPayload,
  DayOfWeekDisplay,
  BreakSlotData,
} from "@/types/schedule.types";
import type { teacher } from "@/prisma/generated/client";

// ============================================================================
// Mock Data
// ============================================================================

const mockTeacher: teacher = {
  teacher_id: "TCH001",
  t_name: "John Doe",
  t_surname: "Teacher",
  email: "john@example.com",
  google_id: "google123",
  created_at: new Date(),
  updated_at: new Date(),
};

const mockSubject1: SubjectData = {
  subjectCode: "TH101",
  subjectNameTH: "ภาษาไทย",
  subjectNameEN: "Thai Language",
  semester: "1",
  year: "2567",
  gradelevel: {
    id: 1,
    grade_level: "ม.1",
    year: 1,
    class_section: "A",
    updated_at: new Date(),
    created_at: new Date(),
  },
  teacher: mockTeacher,
  room: {
    room_id: 1,
    name: "R101",
    campus: "Main",
    created_at: new Date(),
    updated_at: new Date(),
  },
  class_schedule_id: 1,
  class_schedule: null,
  semester_id: 1,
  teacher_id: "TCH001",
  room_id: 1,
  gradelevel_id: 1,
  credits: 1.0,
  subject_type: "core",
  color: "#FF5733",
  hours_per_week: 2,
  updated_at: new Date(),
  created_at: new Date(),
};

const mockSubject2: SubjectData = {
  ...mockSubject1,
  subjectCode: "MA101",
  subjectNameTH: "คณิตศาสตร์",
  subjectNameEN: "Mathematics",
  class_schedule_id: 2,
  color: "#33FF57",
};

const mockTimeslot1: TimeslotData = {
  TimeslotID: "slot1",
  Day: "จันทร์",
  Slot: 1,
  subject: mockSubject1,
  isBreak: false,
  roomID: 1,
};

const mockTimeslot2: TimeslotData = {
  TimeslotID: "slot2",
  Day: "จันทร์",
  Slot: 2,
  subject: null,
  isBreak: false,
  roomID: 1,
};

const mockPayload: SubjectPayload = {
  timeslotID: "slot1",
  semester_id: 1,
  currentSubjectCode: "TH101",
};

// ============================================================================
// Helper Functions
// ============================================================================

const resetStore = () => {
  const { result } = renderHook(() => useTeacherArrangeStore());
  act(() => {
    result.current.resetAllState();
  });
};

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  resetStore();
});

afterEach(() => {
  localStorage.clear();
});

// ============================================================================
// Teacher Actions Tests
// ============================================================================

describe("Teacher Actions", () => {
  it("should set current teacher ID", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: teacherResult } = renderHook(() => useCurrentTeacher());

    act(() => {
      result.current.setCurrentTeacherID("TCH001");
    });

    expect(teacherResult.current.id).toBe("TCH001");
  });

  it("should set teacher data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: teacherResult } = renderHook(() => useCurrentTeacher());

    act(() => {
      result.current.setTeacherData(mockTeacher);
    });

    expect(teacherResult.current.data).toEqual(mockTeacher);
  });

  it("should clear teacher data by setting null", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: teacherResult } = renderHook(() => useCurrentTeacher());

    act(() => {
      result.current.setTeacherData(mockTeacher);
    });

    expect(teacherResult.current.data).toEqual(mockTeacher);

    act(() => {
      result.current.setTeacherData(null);
    });

    expect(teacherResult.current.data).toBeNull();
  });
});

// ============================================================================
// Subject Selection Actions Tests
// ============================================================================

describe("Subject Selection Actions", () => {
  it("should set selected subject and auto-set year", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: subjectResult } = renderHook(() => useSelectedSubject());
    const { result: yearResult } = renderHook(() => useYearSelected());

    act(() => {
      result.current.setSelectedSubject(mockSubject1);
    });

    expect(subjectResult.current).toEqual(mockSubject1);
    expect(yearResult.current).toBe(1);
  });

  it("should set dragged subject", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: draggedResult } = renderHook(() => useDraggedSubject());

    act(() => {
      result.current.setDraggedSubject(mockSubject1);
    });

    expect(draggedResult.current).toEqual(mockSubject1);
  });

  it("should set year selected manually", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: yearResult } = renderHook(() => useYearSelected());

    act(() => {
      result.current.setYearSelected(3);
    });

    expect(yearResult.current).toBe(3);
  });

  it("should clear all selection state", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: subjectResult } = renderHook(() => useSelectedSubject());
    const { result: draggedResult } = renderHook(() => useDraggedSubject());
    const { result: yearResult } = renderHook(() => useYearSelected());

    // Set all selection state
    act(() => {
      result.current.setSelectedSubject(mockSubject1);
      result.current.setDraggedSubject(mockSubject2);
    });

    expect(subjectResult.current).toEqual(mockSubject1);
    expect(draggedResult.current).toEqual(mockSubject2);
    expect(yearResult.current).toBe(1);

    // Clear all
    act(() => {
      result.current.clearSelectedSubject();
    });

    expect(subjectResult.current).toBeNull();
    expect(draggedResult.current).toBeNull();
    expect(yearResult.current).toBeNull();
  });
});

// ============================================================================
// Subject Change Actions Tests
// ============================================================================

describe("Subject Change Actions", () => {
  it("should set change timeslot subject", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    act(() => {
      actions.current.setChangeTimeSlotSubject(mockSubject1);
    });

    expect(result.current.changeTimeSlotSubject).toEqual(mockSubject1);
  });

  it("should set destination subject", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    act(() => {
      actions.current.setDestinationSubject(mockSubject2);
    });

    expect(result.current.destinationSubject).toEqual(mockSubject2);
  });

  it("should set timeslot ID to change", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    const change = { source: "slot1", destination: "slot2" };

    act(() => {
      actions.current.setTimeslotIDtoChange(change);
    });

    expect(result.current.timeslotIDtoChange).toEqual(change);
  });

  it("should set click to change subject flag", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    act(() => {
      actions.current.setIsClickToChangeSubject(true);
    });

    expect(result.current.isClickToChangeSubject).toBe(true);

    act(() => {
      actions.current.setIsClickToChangeSubject(false);
    });

    expect(result.current.isClickToChangeSubject).toBe(false);
  });

  it("should clear all change subject state", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    // Set all change state
    act(() => {
      actions.current.setChangeTimeSlotSubject(mockSubject1);
      actions.current.setDestinationSubject(mockSubject2);
      actions.current.setTimeslotIDtoChange({
        source: "slot1",
        destination: "slot2",
      });
      actions.current.setIsClickToChangeSubject(true);
    });

    expect(result.current.changeTimeSlotSubject).toEqual(mockSubject1);
    expect(result.current.destinationSubject).toEqual(mockSubject2);

    // Clear all
    act(() => {
      actions.current.clearChangeSubjectState();
    });

    expect(result.current.changeTimeSlotSubject).toBeNull();
    expect(result.current.destinationSubject).toBeNull();
    expect(result.current.timeslotIDtoChange).toEqual({
      source: "",
      destination: "",
    });
    expect(result.current.isClickToChangeSubject).toBe(false);
  });
});

// ============================================================================
// Subject Data Actions Tests
// ============================================================================

describe("Subject Data Actions", () => {
  it("should set subject data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: dataResult } = renderHook(() => useSubjectData());

    const subjects = [mockSubject1, mockSubject2];

    act(() => {
      result.current.setSubjectData(subjects);
    });

    expect(dataResult.current).toEqual(subjects);
  });

  it("should set scheduled subjects", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    const subjects = [mockSubject1];

    act(() => {
      result.current.setScheduledSubjects(subjects);
    });

    expect(scheduledResult.current).toEqual(subjects);
  });

  it("should add subject to data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: dataResult } = renderHook(() => useSubjectData());

    act(() => {
      result.current.setSubjectData([mockSubject1]);
    });

    act(() => {
      result.current.addSubjectToData(mockSubject2);
    });

    expect(dataResult.current).toHaveLength(2);
    expect(dataResult.current[1]).toEqual(mockSubject2);
  });

  it("should remove subject from data by code", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: dataResult } = renderHook(() => useSubjectData());

    act(() => {
      result.current.setSubjectData([mockSubject1, mockSubject2]);
    });

    expect(dataResult.current).toHaveLength(2);

    act(() => {
      result.current.removeSubjectFromData("TH101");
    });

    expect(dataResult.current).toHaveLength(1);
    expect(dataResult.current[0].subjectCode).toBe("MA101");
  });

  it("should update subject in data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: dataResult } = renderHook(() => useSubjectData());

    act(() => {
      result.current.setSubjectData([mockSubject1, mockSubject2]);
    });

    act(() => {
      result.current.updateSubjectInData("TH101", {
        subjectNameTH: "ภาษาไทยใหม่",
        color: "#000000",
      });
    });

    const updated = dataResult.current.find((s) => s.subjectCode === "TH101");
    expect(updated?.subjectNameTH).toBe("ภาษาไทยใหม่");
    expect(updated?.color).toBe("#000000");
    // Other fields should remain unchanged
    expect(updated?.subjectNameEN).toBe("Thai Language");
  });
});

// ============================================================================
// Timeslot Actions Tests
// ============================================================================

describe("Timeslot Actions", () => {
  it("should set timeslot data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: timeslotResult } = renderHook(() => useTimeslotData());

    const data = {
      AllData: [mockTimeslot1, mockTimeslot2],
      SlotAmount: [1, 2, 3, 4],
      DayOfWeek: ["จันทร์", "อังคาร"] as DayOfWeekDisplay[],
      BreakSlot: [] as BreakSlotData[],
    };

    act(() => {
      result.current.setTimeSlotData(data);
    });

    expect(timeslotResult.current.AllData).toEqual(data.AllData);
    expect(timeslotResult.current.SlotAmount).toEqual(data.SlotAmount);
    expect(timeslotResult.current.DayOfWeek).toEqual(data.DayOfWeek);
  });

  it("should update partial timeslot data", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: timeslotResult } = renderHook(() => useTimeslotData());

    // Set initial data
    act(() => {
      result.current.setTimeSlotData({
        AllData: [mockTimeslot1],
        SlotAmount: [1, 2],
      });
    });

    // Update only AllData
    act(() => {
      result.current.setTimeSlotData({
        AllData: [mockTimeslot1, mockTimeslot2],
      });
    });

    expect(timeslotResult.current.AllData).toHaveLength(2);
    expect(timeslotResult.current.SlotAmount).toEqual([1, 2]); // Unchanged
  });

  it("should update single timeslot subject", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: timeslotResult } = renderHook(() => useTimeslotData());

    act(() => {
      result.current.setTimeSlotData({
        AllData: [mockTimeslot1, mockTimeslot2],
      });
    });

    act(() => {
      result.current.updateTimeslotSubject("slot2", mockSubject2);
    });

    const updated = timeslotResult.current.AllData.find(
      (s) => s.TimeslotID === "slot2",
    );
    expect(updated?.subject).toEqual(mockSubject2);

    // slot1 should be unchanged
    const unchanged = timeslotResult.current.AllData.find(
      (s) => s.TimeslotID === "slot1",
    );
    expect(unchanged?.subject).toEqual(mockSubject1);
  });

  it("should swap timeslots correctly", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: timeslotResult } = renderHook(() => useTimeslotData());

    act(() => {
      result.current.setTimeSlotData({
        AllData: [mockTimeslot1, mockTimeslot2],
      });
    });

    act(() => {
      result.current.swapTimeslots("slot1", "slot2");
    });

    const slot1 = timeslotResult.current.AllData.find(
      (s) => s.TimeslotID === "slot1",
    );
    const slot2 = timeslotResult.current.AllData.find(
      (s) => s.TimeslotID === "slot2",
    );

    expect(slot1?.subject).toBeNull(); // Originally slot2's subject
    expect(slot2?.subject).toEqual(mockSubject1); // Originally slot1's subject
  });

  it("should handle swap with non-existent timeslots gracefully", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: timeslotResult } = renderHook(() => useTimeslotData());

    act(() => {
      result.current.setTimeSlotData({
        AllData: [mockTimeslot1],
      });
    });

    // Swap with non-existent slot should not crash
    act(() => {
      result.current.swapTimeslots("slot1", "nonexistent");
    });

    // Data should be unchanged
    expect(timeslotResult.current.AllData[0].subject).toEqual(mockSubject1);
  });
});

// ============================================================================
// Modal Actions Tests
// ============================================================================

describe("Modal Actions", () => {
  it("should open modal with payload", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: modalResult } = renderHook(() => useModalState());

    act(() => {
      result.current.openModal(mockPayload);
    });

    expect(modalResult.current.isOpen).toBe(true);
    expect(modalResult.current.payload).toEqual(mockPayload);
  });

  it("should close modal and clear payload", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: modalResult } = renderHook(() => useModalState());

    act(() => {
      result.current.openModal(mockPayload);
    });

    expect(modalResult.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(modalResult.current.isOpen).toBe(false);
    expect(modalResult.current.payload).toBeNull();
  });

  it("should set subject payload independently", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: modalResult } = renderHook(() => useModalState());

    act(() => {
      result.current.setSubjectPayload(mockPayload);
    });

    expect(modalResult.current.payload).toEqual(mockPayload);
    expect(modalResult.current.isOpen).toBe(false); // Should not auto-open
  });
});

// ============================================================================
// Error Display Actions Tests
// ============================================================================

describe("Error Display Actions", () => {
  it("should set error message for timeslot", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: errorResult } = renderHook(() => useErrorState());

    act(() => {
      result.current.setShowErrorMsg("slot1", true);
    });

    expect(errorResult.current.errorMessages["slot1"]).toBe(true);
  });

  it("should set lock message for timeslot", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: errorResult } = renderHook(() => useErrorState());

    act(() => {
      result.current.setShowLockDataMsg("slot2", true);
    });

    expect(errorResult.current.lockMessages["slot2"]).toBe(true);
  });

  it("should clear all error messages", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: errorResult } = renderHook(() => useErrorState());

    act(() => {
      result.current.setShowErrorMsg("slot1", true);
      result.current.setShowLockDataMsg("slot2", true);
    });

    expect(errorResult.current.errorMessages["slot1"]).toBe(true);
    expect(errorResult.current.lockMessages["slot2"]).toBe(true);

    act(() => {
      result.current.clearErrorMessages();
    });

    expect(errorResult.current.errorMessages).toEqual({});
    expect(errorResult.current.lockMessages).toEqual({});
  });

  it("should use clearAllErrors alias", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: errorResult } = renderHook(() => useErrorState());

    act(() => {
      result.current.setShowErrorMsg("slot1", true);
      result.current.setShowLockDataMsg("slot2", true);
    });

    act(() => {
      result.current.clearAllErrors();
    });

    expect(errorResult.current.errorMessages).toEqual({});
    expect(errorResult.current.lockMessages).toEqual({});
  });
});

// ============================================================================
// Save State Actions Tests
// ============================================================================

describe("Save State Actions", () => {
  it("should set saving state", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: saveResult } = renderHook(() => useSaveState());

    act(() => {
      result.current.setIsSaving(true);
    });

    expect(saveResult.current).toBe(true);

    act(() => {
      result.current.setIsSaving(false);
    });

    expect(saveResult.current).toBe(false);
  });
});

// ============================================================================
// Filter Actions Tests
// ============================================================================

describe("Filter Actions", () => {
  it("should set filters", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: filterResult } = renderHook(() => useFilters());

    act(() => {
      result.current.setFilters({ academicYear: 2567, semester: "1" });
    });

    expect(filterResult.current.academicYear).toBe(2567);
    expect(filterResult.current.semester).toBe("1");
  });

  it("should update filters partially", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: filterResult } = renderHook(() => useFilters());

    act(() => {
      result.current.setFilters({ academicYear: 2567 });
    });

    act(() => {
      result.current.setFilters({ semester: "2" });
    });

    expect(filterResult.current.academicYear).toBe(2567);
    expect(filterResult.current.semester).toBe("2");
  });

  it("should reset filters to defaults", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: filterResult } = renderHook(() => useFilters());

    act(() => {
      result.current.setFilters({
        academicYear: 2567,
        semester: "1",
        gradeLevel: "ม.1",
      });
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(filterResult.current.academicYear).toBeNull();
    expect(filterResult.current.semester).toBeNull();
    expect(filterResult.current.gradeLevel).toBeNull();
  });
});

// ============================================================================
// History Actions Tests (Undo/Redo)
// ============================================================================

describe("History Actions", () => {
  it("should push history state", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: historyResult } = renderHook(() => useHistoryControls());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    act(() => {
      result.current.pushHistory([mockSubject1]);
    });

    expect(scheduledResult.current).toEqual([mockSubject1]);
    expect(historyResult.current.canUndo).toBe(true);
    expect(historyResult.current.canRedo).toBe(false);
  });

  it("should handle undo operation", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: historyResult } = renderHook(() => useHistoryControls());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    act(() => {
      result.current.pushHistory([mockSubject1]);
      result.current.pushHistory([mockSubject1, mockSubject2]);
    });

    expect(scheduledResult.current).toHaveLength(2);
    expect(historyResult.current.canUndo).toBe(true);

    act(() => {
      historyResult.current.undo();
    });

    expect(scheduledResult.current).toHaveLength(1);
    expect(historyResult.current.canRedo).toBe(true);
  });

  it("should handle redo operation", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: historyResult } = renderHook(() => useHistoryControls());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    act(() => {
      result.current.pushHistory([mockSubject1]);
      result.current.pushHistory([mockSubject1, mockSubject2]);
    });

    act(() => {
      historyResult.current.undo();
    });

    expect(scheduledResult.current).toHaveLength(1);

    act(() => {
      historyResult.current.redo();
    });

    expect(scheduledResult.current).toHaveLength(2);
    expect(historyResult.current.canUndo).toBe(true);
  });

  it("should clear future on new push", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: historyResult } = renderHook(() => useHistoryControls());

    act(() => {
      result.current.pushHistory([mockSubject1]);
      result.current.pushHistory([mockSubject1, mockSubject2]);
    });

    act(() => {
      historyResult.current.undo();
    });

    expect(historyResult.current.canRedo).toBe(true);

    // New push should clear future
    act(() => {
      result.current.pushHistory([mockSubject1]);
    });

    expect(historyResult.current.canRedo).toBe(false);
  });

  it("should handle undo when no history", () => {
    const { result } = renderHook(() => useHistoryControls());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    expect(result.current.canUndo).toBe(false);

    // Should not crash
    act(() => {
      result.current.undo();
    });

    expect(scheduledResult.current).toEqual([]);
  });

  it("should handle redo when no future", () => {
    const { result } = renderHook(() => useHistoryControls());
    const { result: scheduledResult } = renderHook(() =>
      useScheduledSubjects(),
    );

    expect(result.current.canRedo).toBe(false);

    // Should not crash
    act(() => {
      result.current.redo();
    });

    expect(scheduledResult.current).toEqual([]);
  });

  it("should clear history", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());
    const { result: historyResult } = renderHook(() => useHistoryControls());

    act(() => {
      result.current.pushHistory([mockSubject1]);
      result.current.pushHistory([mockSubject1, mockSubject2]);
    });

    expect(historyResult.current.canUndo).toBe(true);

    act(() => {
      result.current.clearHistory();
    });

    expect(historyResult.current.canUndo).toBe(false);
    expect(historyResult.current.canRedo).toBe(false);
  });
});

// ============================================================================
// Persistence Tests (localStorage)
// ============================================================================

describe("Filter Persistence", () => {
  it("should persist filters to localStorage", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());

    act(() => {
      result.current.setFilters({ academicYear: 2567, semester: "1" });
    });

    // Check localStorage
    const stored = localStorage.getItem("teacher-arrange-filters");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.filters.academicYear).toBe(2567);
    expect(parsed.state.filters.semester).toBe("1");
  });

  it("should hydrate filters from localStorage", async () => {
    // Manually set localStorage BEFORE triggering rehydration
    const mockState = {
      state: {
        filters: {
          academicYear: 2567,
          semester: "2",
          gradeLevel: "ม.2",
        },
      },
      version: 1,
    };
    localStorage.setItem("teacher-arrange-filters", JSON.stringify(mockState));

    // Manually trigger rehydration (simulates page refresh with existing localStorage)
    await act(async () => {
      await useTeacherArrangeStore.persist.rehydrate();
    });

    // Create hook instance
    const { result } = renderHook(() => useFilters());

    // Filters should be hydrated from localStorage
    expect(result.current.academicYear).toBe(2567);
    expect(result.current.semester).toBe("2");
    expect(result.current.gradeLevel).toBe("ม.2");
  });

  it("should not persist non-filter state", () => {
    const { result } = renderHook(() => useTeacherArrangeActions());

    act(() => {
      result.current.setSelectedSubject(mockSubject1);
      result.current.setFilters({ academicYear: 2567 });
    });

    const stored = localStorage.getItem("teacher-arrange-filters");
    const parsed = JSON.parse(stored!);

    // Only filters should be in localStorage
    expect(parsed.state.filters).toBeDefined();
    expect(parsed.state.selectedSubject).toBeUndefined();
  });
});

// ============================================================================
// Reset Actions Tests
// ============================================================================

describe("Reset Actions", () => {
  it("should reset all state", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    // Set various state
    act(() => {
      actions.current.setCurrentTeacherID("TCH001");
      actions.current.setSelectedSubject(mockSubject1);
      actions.current.setSubjectData([mockSubject1, mockSubject2]);
      actions.current.setFilters({ academicYear: 2567 });
    });

    // Reset all
    act(() => {
      actions.current.resetAllState();
    });

    expect(result.current.currentTeacherID).toBeNull();
    expect(result.current.selectedSubject).toBeNull();
    expect(result.current.subjectData).toEqual([]);
    expect(result.current.filters.academicYear).toBeNull();
  });

  it("should reset on teacher change but keep teacher context", () => {
    const { result } = renderHook(() => useTeacherArrangeStore());
    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    // Set state
    act(() => {
      actions.current.setCurrentTeacherID("TCH001");
      actions.current.setTeacherData(mockTeacher);
      actions.current.setSelectedSubject(mockSubject1);
      actions.current.setFilters({ academicYear: 2567 });
      actions.current.pushHistory([mockSubject1]);
    });

    // Reset on teacher change
    act(() => {
      actions.current.resetOnTeacherChange();
    });

    // Teacher context should be preserved
    expect(result.current.currentTeacherID).toBe("TCH001");
    expect(result.current.teacherData).toEqual(mockTeacher);
    expect(result.current.filters.academicYear).toBe(2567);

    // Other state should be reset
    expect(result.current.selectedSubject).toBeNull();
    expect(result.current.history.past).toEqual([]);
    expect(result.current.history.present).toEqual([]);
  });
});

// ============================================================================
// Selector Performance Tests
// ============================================================================

describe("Selector Performance", () => {
  it("should not re-render when unrelated state changes", () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useSelectedSubject();
    });

    const { result: actions } = renderHook(() => useTeacherArrangeActions());

    expect(renderCount).toBe(1);

    // Change unrelated state
    act(() => {
      actions.current.setIsSaving(true);
    });

    // Should not trigger re-render of useSelectedSubject
    expect(renderCount).toBe(1);

    // Change related state
    act(() => {
      actions.current.setSelectedSubject(mockSubject1);
    });

    // Should trigger re-render
    expect(renderCount).toBe(2);
  });

  it("actions hook should never cause re-renders", () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useTeacherArrangeActions();
    });

    expect(renderCount).toBe(1);

    // Trigger any action
    act(() => {
      result.current.setSelectedSubject(mockSubject1);
      result.current.setIsSaving(true);
      result.current.setFilters({ academicYear: 2567 });
    });

    // Actions hook should not re-render
    expect(renderCount).toBe(1);
  });
});
