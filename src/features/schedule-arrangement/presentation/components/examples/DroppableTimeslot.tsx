/**
 * DroppableTimeslot.tsx
 *
 * MIGRATION EXAMPLE: react-beautiful-dnd → @dnd-kit
 * STORE USAGE: Zustand arrangement-ui.store.ts
 *
 * This component demonstrates:
 * 1. Zustand store for timeslot state and validation
 * 2. @dnd-kit useDroppable for drop zones (replaces react-beautiful-dnd's Droppable)
 * 3. Integration with conflict detection service
 * 4. Server Action calls for schedule updates
 *
 * BEFORE (react-beautiful-dnd):
 * ```tsx
 * <Droppable droppableId={timeslotId}>
 *   {(provided, snapshot) => (
 *     <div ref={provided.innerRef} {...provided.droppableProps}>
 *       {children}
 *       {provided.placeholder}
 *     </div>
 *   )}
 * </Droppable>
 * ```
 *
 * AFTER (@dnd-kit):
 * ```tsx
 * const {setNodeRef, isOver} = useDroppable({id: timeslotId, data: {...}});
 * <div ref={setNodeRef}>
 *   {children}
 * </div>
 * ```
 */

"use client";

import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box, Paper, Typography, Chip, CircularProgress } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Import Zustand store hooks
import {
  useArrangementUIStore,
  useTimeslotData,
  useSaveState,
} from "../../stores/arrangement-ui.store";

/**
 * Props interface for DroppableTimeslot
 *
 * MIGRATION NOTE:
 * - react-beautiful-dnd: droppableId, type, isDropDisabled
 * - @dnd-kit: id, data (for validation), disabled
 */
interface DroppableTimeslotProps {
  /** Unique timeslot identifier */
  timeslotId: string;

  /** Day of week (1-7 for Mon-Sun) */
  dayOfWeek: number;

  /** Time display (e.g., "08:00 - 09:00") */
  timeRange: string;

  /** Current subject assigned (if any) */
  assignedSubject?: {
    subjectCode: string;
    subjectName: string;
    roomName?: string;
  };

  /** Whether this timeslot is locked (e.g., assembly) */
  isLocked?: boolean;

  /** Grade context for conflict checking */
  gradeId: string;

  /** Teacher context for conflict checking */
  teacherId?: string;
}

/**
 * Day name mapping for display
 */
const DAY_NAMES: Record<number, string> = {
  1: "จันทร์",
  2: "อังคาร",
  3: "พุธ",
  4: "พฤหัสบดี",
  5: "ศุกร์",
  6: "เสาร์",
  7: "อาทิตย์",
};

/**
 * DroppableTimeslot Component
 *
 * Renders a droppable timeslot cell that:
 * 1. Uses Zustand store for conflict data and save state
 * 2. Uses @dnd-kit for drop zone functionality
 * 3. Shows visual feedback for drag-over states
 * 4. Validates drops using conflict detection service
 * 5. Calls Server Actions for persistence
 *
 * @example
 * ```tsx
 * <DroppableTimeslot
 *   timeslotId="slot-123"
 *   dayOfWeek={1}
 *   timeRange="08:00 - 09:00"
 *   gradeId="grade-10-1"
 *   teacherId="teacher-123"
 * />
 * ```
 */
export function DroppableTimeslot({
  timeslotId,
  dayOfWeek,
  timeRange,
  assignedSubject,
  isLocked = false,
  gradeId,
  teacherId,
}: DroppableTimeslotProps) {
  /**
   * ZUSTAND STORE INTEGRATION
   *
   * Using selector hooks and store actions:
   * - timeSlotData: All timeslot data including assignments
   * - isSaving: Save operation state
   * - Store actions: setShowErrorMsg, setIsSaving
   */
  const timeSlotData = useTimeslotData(); // Selector hook
  const isSaving = useSaveState(); // Returns boolean directly
  const setShowErrorMsg = useArrangementUIStore(
    (state) => state.setShowErrorMsg,
  );
  const setIsSaving = useArrangementUIStore((state) => state.setIsSaving);

  /**
   * Check if this specific timeslot has conflicts
   * (In real implementation, this would come from conflict detection service)
   */
  const hasConflict = useMemo(() => {
    // Example: Check if timeslot has error flag in store
    // In actual implementation, integrate with ConflictDetectorService
    return false; // Placeholder - integrate with conflict detection
  }, []);

  /**
   * @DND-KIT INTEGRATION
   *
   * useDroppable hook replaces react-beautiful-dnd's Droppable:
   * - setNodeRef: Ref to attach to droppable element
   * - isOver: Boolean indicating if draggable is over this droppable
   * - active: Current draggable data (or null)
   *
   * MIGRATION MAPPING:
   * react-beautiful-dnd          →  @dnd-kit
   * ----------------------------- → ---------------------------
   * provided.innerRef             →  setNodeRef
   * provided.droppableProps       →  (no equivalent - just use ref)
   * snapshot.isDraggingOver       →  isOver
   * snapshot.draggingOverWith     →  active?.id
   * provided.placeholder          →  (not needed - CSS handles layout)
   *
   * Data property usage:
   * - Pass context for validation in DndContext.onDragOver/onDragEnd
   * - Allows type checking (e.g., only accept 'subject' draggables)
   */
  const { setNodeRef, isOver, active } = useDroppable({
    id: timeslotId,
    disabled: isLocked || isSaving,
    data: {
      type: "timeslot",
      timeslotId,
      dayOfWeek,
      gradeId,
      teacherId,
      isLocked,
      hasAssignment: !!assignedSubject,
    },
  });

  /**
   * Determine if drop is valid based on dragging item
   *
   * This is a client-side preview - actual validation happens server-side
   * via conflict detection service in Server Action
   */
  const canAcceptDrop = useMemo(() => {
    if (!active || isLocked) return false;

    // Check if dragging a subject
    const dragData = active.data.current;
    if (dragData?.type !== "subject") return false;

    // Check if subject has remaining hours
    if (dragData.remainingHours <= 0) return false;

    // Check if dropping on same teacher's slot
    if (teacherId && dragData.teacherId !== teacherId) return false;

    return true;
  }, [active, isLocked, teacherId]);

  /**
   * Visual state calculation
   */
  const bgColor = useMemo(() => {
    if (isLocked) return "action.disabledBackground";
    if (hasConflict) return "error.light";
    if (isOver && canAcceptDrop) return "success.light";
    if (isOver && !canAcceptDrop) return "error.light";
    if (assignedSubject) return "primary.light";
    return "background.paper";
  }, [isLocked, hasConflict, isOver, canAcceptDrop, assignedSubject]);

  const borderColor = useMemo(() => {
    if (isLocked) return "action.disabled";
    if (hasConflict) return "error.main";
    if (isOver && canAcceptDrop) return "success.main";
    if (isOver && !canAcceptDrop) return "error.main";
    if (assignedSubject) return "primary.main";
    return "divider";
  }, [isLocked, hasConflict, isOver, canAcceptDrop, assignedSubject]);

  /**
   * Status icon based on state
   */
  const StatusIcon = useMemo(() => {
    if (isSaving) return <CircularProgress size={16} />;
    if (isLocked) return <LockIcon fontSize="small" />;
    if (hasConflict) return <WarningIcon fontSize="small" color="error" />;
    if (assignedSubject && !hasConflict)
      return <CheckCircleIcon fontSize="small" color="success" />;
    return null;
  }, [isSaving, isLocked, hasConflict, assignedSubject]);

  return (
    <Paper
      ref={setNodeRef}
      elevation={isOver ? 4 : 1}
      sx={{
        p: 1.5,
        minHeight: 100,
        border: 2,
        borderColor,
        bgcolor: bgColor,
        transition: "all 0.2s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        // Visual feedback for drag over
        transform: isOver ? "scale(1.02)" : "scale(1)",
        // Disable pointer events during save
        pointerEvents: isSaving ? "none" : "auto",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Header: Time and Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          fontWeight="medium"
          color="text.secondary"
        >
          {DAY_NAMES[dayOfWeek]} {timeRange}
        </Typography>
        {StatusIcon}
      </Box>

      {/* Assigned Subject Display */}
      {assignedSubject && (
        <Box>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {assignedSubject.subjectCode}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {assignedSubject.subjectName}
          </Typography>
          {assignedSubject.roomName && (
            <Chip
              label={assignedSubject.roomName}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Box>
      )}

      {/* Locked State Message */}
      {isLocked && (
        <Typography variant="caption" color="text.disabled" fontStyle="italic">
          ช่วงเวลาถูกล็อค
        </Typography>
      )}

      {/* Drop Preview Message */}
      {isOver && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: canAcceptDrop
              ? "rgba(46, 125, 50, 0.1)"
              : "rgba(211, 47, 47, 0.1)",
            border: 2,
            borderColor: canAcceptDrop ? "success.main" : "error.main",
            borderStyle: "dashed",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color={canAcceptDrop ? "success.main" : "error.main"}
          >
            {canAcceptDrop ? "วางที่นี่" : "ไม่สามารถวางได้"}
          </Typography>
        </Box>
      )}

      {/* Conflict Warning */}
      {hasConflict && !isOver && (
        <Box sx={{ mt: "auto" }}>
          <Chip
            icon={<WarningIcon />}
            label="มีข้อขัดแย้ง"
            size="small"
            color="error"
            variant="filled"
            sx={{ height: 24, fontSize: "0.7rem" }}
          />
        </Box>
      )}
    </Paper>
  );
}

/**
 * USAGE EXAMPLE WITH DNDCONTEXT:
 *
 * ```tsx
 * 'use client';
 *
 * import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
 * import { DroppableTimeslot } from './DroppableTimeslot';
 * import { useArrangementUIStore } from '../stores/arrangement-ui.store';
 * import { arrangeScheduleAction } from '@/features/schedule-arrangement/application/actions/schedule-arrangement.actions';
 *
 * export function TimetableGrid() {
 *   const sensors = useSensors(
 *     useSensor(PointerSensor, {
 *       activationConstraint: { distance: 10 }
 *     })
 *   );
 *
 *   const setIsSaving = useArrangementUIStore((state) => state.setIsSaving);
 *   const setShowErrorMsg = useArrangementUIStore((state) => state.setShowErrorMsg);
 *
 *   const handleDragEnd = async (event: DragEndEvent) => {
 *     const { active, over } = event;
 *     if (!over) return;
 *
 *     // Get drag data
 *     const subjectData = active.data.current;
 *     const timeslotData = over.data.current;
 *
 *     // Validate drop target
 *     if (timeslotData?.type !== 'timeslot') return;
 *     if (timeslotData.isLocked) return;
 *
 *     // Call Server Action with optimistic UI
 *     setIsSaving(true);
 *     try {
 *       const result = await arrangeScheduleAction({
 *         timeslotId: timeslotData.timeslotId,
 *         subjectCode: subjectData.subjectCode,
 *         teacherId: subjectData.teacherId,
 *         gradeId: timeslotData.gradeId,
 *         roomId: null, // Room selection handled separately
 *       });
 *
 *       if (!result.success) {
 *         setShowErrorMsg(timeslotData.timeslotId, true);
 *       }
 *     } catch (error) {
 *       console.error('Failed to arrange schedule:', error);
 *       setShowErrorMsg(timeslotData.timeslotId, true);
 *     } finally {
 *       setIsSaving(false);
 *     }
 *   };
 *
 *   return (
 *     <DndContext
 *       sensors={sensors}
 *       collisionDetection={closestCenter}
 *       onDragEnd={handleDragEnd}
 *     >
 *       <Grid container spacing={1}>
 *         {timeslots.map((slot) => (
 *           <Grid item xs={12} sm={6} md={4} key={slot.timeslotId}>
 *             <DroppableTimeslot
 *               timeslotId={slot.timeslotId}
 *               dayOfWeek={slot.dayOfWeek}
 *               timeRange={`${slot.startTime} - ${slot.endTime}`}
 *               gradeId={currentGrade}
 *               teacherId={currentTeacher}
 *               assignedSubject={slot.assignment}
 *               isLocked={slot.isLocked}
 *             />
 *           </Grid>
 *         ))}
 *       </Grid>
 *     </DndContext>
 *   );
 * }
 * ```
 *
 * MIGRATION NOTES:
 *
 * 1. NO PLACEHOLDER NEEDED:
 *    - react-beautiful-dnd: required {provided.placeholder} for layout
 *    - @dnd-kit: CSS handles layout automatically
 *
 * 2. COLLISION DETECTION:
 *    - Built-in strategies: closestCenter, closestCorners, rectIntersection, pointerWithin
 *    - Custom strategies for complex layouts
 *
 * 3. DATA PROP PATTERN:
 *    - Pass validation context via data prop
 *    - Access in onDragEnd: event.active.data.current, event.over.data.current
 *    - Type-safe with TypeScript generics
 *
 * 4. SENSOR CONFIGURATION:
 *    - PointerSensor: Mouse/touch with activation constraints
 *    - KeyboardSensor: Accessibility support
 *    - Custom sensors for specific input handling
 *
 * 5. PERFORMANCE:
 *    - @dnd-kit uses transform instead of position for 60fps
 *    - Minimal re-renders with proper memoization
 *    - Zustand selectors prevent unnecessary updates
 */
