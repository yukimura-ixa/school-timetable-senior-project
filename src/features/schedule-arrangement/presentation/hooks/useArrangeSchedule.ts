/**
 * useArrangeSchedule Hook
 *
 * Encapsulates schedule arrangement operations with validation and error handling.
 * Wraps Zustand store actions with business logic.
 *
 * Week 5.4 - Custom Hooks Extraction
 */

import { useArrangementUIStore } from "../stores/arrangement-ui.store";
import type { SubjectData, SubjectPayload } from "@/types/schedule.types";

export interface ArrangeScheduleOperations {
  // Subject operations
  handleAddSubject: (subject: SubjectData, timeslotID: string) => void;
  handleRemoveSubject: (subject: SubjectData, timeslotID: string) => void;
  handleSwapSubject: (sourceID: string, destinationID: string) => void;
  handleReturnSubject: (subject: SubjectData) => void;

  // Room operations
  handleOpenRoomModal: (timeslotID: string) => void;
  handleCloseRoomModal: () => void;
  handleCancelAddRoom: () => void;

  // Selection operations
  handleSelectSubject: (subject: SubjectData) => void;
  handleClearSelection: () => void;

  // Change subject operations
  handleInitiateChange: (subject: SubjectData, sourceID: string) => void;
  handleCompleteChange: (destinationID: string) => void;
  handleCancelChange: () => void;
}

/**
 * Custom hook for schedule arrangement operations
 *
 * Provides high-level operations that combine Zustand store actions
 * with business logic and validation.
 *
 * @example
 * ```typescript
 * const {
 *   handleAddSubject,
 *   handleRemoveSubject,
 *   handleOpenRoomModal
 * } = useArrangeSchedule();
 *
 * // Add subject to timeslot
 * handleAddSubject(selectedSubject, 'T1');
 * ```
 */
export function useArrangeSchedule(): ArrangeScheduleOperations {
  // Get store state and actions
  const {
    selectedSubject,
    scheduledSubjects,
    subjectPayload,
    timeslotIDtoChange,
    timeSlotData,

    // Actions
    setScheduledSubjects,
    setSubjectPayload,
    updateTimeslotSubject,
    addSubjectToData,
    openModal,
    closeModal,
    clearSelectedSubject,
    setChangeTimeSlotSubject,
    setTimeslotIDtoChange,
    setIsClickToChangeSubject,
    setDestinationSubject,
    setYearSelected,
  } = useArrangementUIStore();

  /**
   * Add subject to a timeslot and open room selection modal
   */
  const handleAddSubject = (
    subject: SubjectData | null,
    timeslotID: string,
  ) => {
    if (!subject || Object.keys(subject).length === 0) return;

    const payload: SubjectPayload = {
      timeslotID,
      selectedSubject: subject,
    };

    // Update timeslot with subject
    updateTimeslotSubject(timeslotID, subject);

    // Track scheduled subjects
    const newScheduled = [...scheduledSubjects, subject];
    setScheduledSubjects(newScheduled);

    // Set payload and open modal for room selection
    setSubjectPayload(payload);
    openModal(payload);
  };

  /**
   * Remove subject from timeslot and return to subject list
   */
  const handleRemoveSubject = (
    subject: SubjectData | null,
    timeslotID: string,
  ) => {
    if (!subject || Object.keys(subject).length === 0) return;

    // Clear timeslot
    updateTimeslotSubject(timeslotID, null);

    // Mark subject as unscheduled
    const updatedSubject = { ...subject, scheduled: false };
    addSubjectToData(updatedSubject);

    // Clear selection state
    clearSelectedSubject();
    setYearSelected(null);
    closeModal();
  };

  /**
   * Swap subject between two timeslots
   */
  const handleSwapSubject = (sourceID: string, destinationID: string) => {
    // Get source and destination subjects
    const sourceSlot = timeSlotData.AllData.find(
      (slot) => slot.TimeslotID === sourceID,
    );
    const destSlot = timeSlotData.AllData.find(
      (slot) => slot.TimeslotID === destinationID,
    );

    if (!sourceSlot?.subject) return;

    // Swap subjects
    const sourceSubject = sourceSlot.subject;
    const destSubject = destSlot?.subject || null;

    if (sourceSubject) updateTimeslotSubject(destinationID, sourceSubject);
    updateTimeslotSubject(sourceID, destSubject);

    // Clear change state
    setChangeTimeSlotSubject(null);
    setTimeslotIDtoChange({ source: "", destination: "" });
    setIsClickToChangeSubject(false);
    setDestinationSubject(null);
  };

  /**
   * Return subject to subject list (mark as unscheduled)
   */
  const handleReturnSubject = (subject: SubjectData | null) => {
    if (!subject) return;
    const updatedSubject = { ...subject, scheduled: false };
    addSubjectToData(updatedSubject);
  };

  /**
   * Open room selection modal for adding subject
   */
  const handleOpenRoomModal = (timeslotID: string) => {
    handleAddSubject(selectedSubject, timeslotID);
  };

  /**
   * Close room selection modal
   */
  const handleCloseRoomModal = () => {
    closeModal();
  };

  /**
   * Cancel room selection and remove subject from slot
   */
  const handleCancelAddRoom = () => {
    if (subjectPayload?.selectedSubject && subjectPayload?.timeslotID) {
      // Clear timeslot
      updateTimeslotSubject(subjectPayload.timeslotID, null);

      // Return subject to list if it exists
      if (subjectPayload.selectedSubject) {
        const updatedSubject = {
          ...subjectPayload.selectedSubject,
          scheduled: false,
        };
        addSubjectToData(updatedSubject);
      }
    }
    closeModal();
  };

  /**
   * Select a subject for scheduling
   */
  const handleSelectSubject = (subject: SubjectData) => {
    clearSelectedSubject();
    setChangeTimeSlotSubject(subject);
    setYearSelected(subject.gradelevel?.year ?? null);
  };

  /**
   * Clear selected subject
   */
  const handleClearSelection = () => {
    clearSelectedSubject();
    setYearSelected(null);
  };

  /**
   * Initiate subject change operation (select subject to move)
   */
  const handleInitiateChange = (subject: SubjectData, sourceID: string) => {
    setChangeTimeSlotSubject(subject);
    setTimeslotIDtoChange({ source: sourceID, destination: "" });
    setIsClickToChangeSubject(true);
    setYearSelected(subject.gradelevel?.year ?? null);
  };

  /**
   * Complete subject change operation (move to destination)
   */
  const handleCompleteChange = (destinationID: string) => {
    if (!timeslotIDtoChange.source) return;

    handleSwapSubject(timeslotIDtoChange.source, destinationID);
  };

  /**
   * Cancel subject change operation
   */
  const handleCancelChange = () => {
    setChangeTimeSlotSubject(null);
    setTimeslotIDtoChange({ source: "", destination: "" });
    setIsClickToChangeSubject(false);
    setYearSelected(null);
  };

  return {
    handleAddSubject,
    handleRemoveSubject,
    handleSwapSubject,
    handleReturnSubject,
    handleOpenRoomModal,
    handleCloseRoomModal,
    handleCancelAddRoom,
    handleSelectSubject,
    handleClearSelection,
    handleInitiateChange,
    handleCompleteChange,
    handleCancelChange,
  };
}
