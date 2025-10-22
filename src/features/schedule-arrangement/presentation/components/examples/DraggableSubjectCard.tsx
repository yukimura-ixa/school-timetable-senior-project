/**
 * DraggableSubjectCard.tsx
 * 
 * MIGRATION EXAMPLE: react-beautiful-dnd → @dnd-kit
 * STORE USAGE: Zustand arrangement-ui.store.ts
 * 
 * This component demonstrates:
 * 1. Zustand store integration with selector hooks
 * 2. @dnd-kit useSortable for drag/drop (replaces react-beautiful-dnd's Draggable)
 * 3. TypeScript-first patterns with full type safety
 * 4. Separation of concerns: UI state (Zustand) vs business logic (Server Actions)
 * 
 * BEFORE (react-beautiful-dnd):
 * ```tsx
 * <Draggable draggableId={subject.id} index={index}>
 *   {(provided, snapshot) => (
 *     <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
 *       // Content
 *     </div>
 *   )}
 * </Draggable>
 * ```
 * 
 * AFTER (@dnd-kit):
 * ```tsx
 * const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: subject.id});
 * <div ref={setNodeRef} style={{transform, transition}} {...attributes} {...listeners}>
 *   // Content
 * </div>
 * ```
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';

// Import Zustand store hooks
import {
  useArrangementUIStore,
  useSelectedSubject,
} from '../../stores/arrangement-ui.store';

/**
 * Props interface for DraggableSubjectCard
 * 
 * MIGRATION NOTE:
 * - react-beautiful-dnd required: draggableId, index, snapshot
 * - @dnd-kit requires: id (string/number), data (optional)
 */
interface DraggableSubjectCardProps {
  /** Unique identifier (SubjectCode or composite key) */
  id: string;
  
  /** Subject data from database */
  subject: {
    subjectCode: string;
    subjectName: string;
    credit: number;
    remainingHours: number;
  };
  
  /** Teacher context (for validation/display) */
  teacherId?: string;
  
  /** Optional: Disable dragging */
  disabled?: boolean;
}

/**
 * DraggableSubjectCard Component
 * 
 * Renders a draggable subject card that:
 * 1. Uses Zustand store for UI state (selection, highlighting)
 * 2. Uses @dnd-kit for drag/drop functionality
 * 3. Demonstrates selector pattern for performance
 * 4. Shows migration from react-beautiful-dnd patterns
 * 
 * @example
 * ```tsx
 * // In parent component with DndContext + SortableContext:
 * <DraggableSubjectCard
 *   id={subject.subjectCode}
 *   subject={subject}
 *   teacherId={currentTeacher}
 * />
 * ```
 */
export function DraggableSubjectCard({
  id,
  subject,
  teacherId,
  disabled = false,
}: DraggableSubjectCardProps) {
  /**
   * ZUSTAND STORE INTEGRATION
   * 
   * Using selector hooks for performance:
   * - Only re-renders when relevant state changes
   * - Avoids full store subscription
   */
  const selectedSubject = useSelectedSubject(); // Selector hook from store
  const setSelectedSubject = useArrangementUIStore((state) => state.setSelectedSubject);
  const clearSelectedSubject = useArrangementUIStore((state) => state.clearSelectedSubject);
  
  const isSelected = selectedSubject?.subjectCode === subject.subjectCode;

  /**
   * @DND-KIT INTEGRATION
   * 
   * useSortable hook replaces react-beautiful-dnd's Draggable:
   * - attributes: Accessibility props (role, tabIndex, aria-*)
   * - listeners: Event handlers (onPointerDown, onKeyDown, etc.)
   * - setNodeRef: Ref to attach to draggable element
   * - transform: { x, y, scaleX, scaleY } for CSS transform
   * - transition: CSS transition string for smooth animations
   * - isDragging: Boolean indicating drag state (like snapshot.isDragging)
   * 
   * MIGRATION MAPPING:
   * react-beautiful-dnd          →  @dnd-kit
   * ----------------------------- → ---------------------------
   * provided.innerRef             →  setNodeRef
   * provided.draggableProps       →  attributes
   * provided.dragHandleProps      →  listeners (or separate handle)
   * snapshot.isDragging           →  isDragging
   * style with transform          →  CSS.Transform.toString(transform)
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    // Optional: Pass data for validation in onDragEnd
    data: {
      type: 'subject',
      subjectCode: subject.subjectCode,
      teacherId,
      remainingHours: subject.remainingHours,
    },
  });

  /**
   * STYLE CALCULATION
   * 
   * @dnd-kit provides transform object: { x, y, scaleX, scaleY }
   * Convert to CSS using utility: CSS.Transform.toString()
   * 
   * MIGRATION NOTE:
   * react-beautiful-dnd used transform from provided.draggableProps.style
   * @dnd-kit separates transform calculation for better control
   */
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Additional styles for drag state
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };

  /**
   * EVENT HANDLERS
   * 
   * Zustand store actions for UI state management:
   * - Click: Select subject (for info display, validation)
   * - Remove: Clear from UI state (business logic via Server Action)
   */
  const handleCardClick = () => {
    if (!disabled) {
      setSelectedSubject({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credit: subject.credit,
        remainingHours: subject.remainingHours,
      });
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    clearSelectedSubject();
    // TODO: Call Server Action for actual deletion
    // await deleteScheduleAction({ ... });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        border: isSelected ? '2px solid primary.main' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isDragging ? 'action.hover' : isSelected ? 'primary.light' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: disabled ? 'none' : 2,
          borderColor: disabled ? 'divider' : 'primary.main',
        },
        // Prevent text selection during drag
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, '&:last-child': { pb: 1 } }}>
        {/**
         * DRAG HANDLE PATTERN
         * 
         * @dnd-kit allows flexible drag handle placement:
         * Option 1: Spread listeners on entire card (drag from anywhere)
         * Option 2: Spread listeners only on handle (drag from icon only)
         * 
         * MIGRATION NOTE:
         * react-beautiful-dnd: provided.dragHandleProps on handle element
         * @dnd-kit: spread listeners on desired element
         * 
         * For this example: Using separate drag handle for better UX
         */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'grab',
            color: disabled ? 'text.disabled' : 'text.secondary',
            touchAction: 'none', // Prevent browser default touch behavior
          }}
        >
          <DragIndicatorIcon />
        </Box>

        {/* Subject Information */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {subject.subjectCode}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {subject.subjectName}
          </Typography>
        </Box>

        {/* Metadata Chips */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Chip
            label={`${subject.credit} หน่วยกิต`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`เหลือ ${subject.remainingHours} ชม.`}
            size="small"
            color={subject.remainingHours > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>

        {/* Remove Button */}
        <IconButton
          size="small"
          onClick={handleRemove}
          disabled={disabled}
          sx={{ ml: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}

/**
 * USAGE EXAMPLE IN PARENT COMPONENT:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
 * import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
 * import { DraggableSubjectCard } from './DraggableSubjectCard';
 * import { useArrangementUIStore } from '../stores/arrangement-ui.store';
 * 
 * export function SubjectList() {
 *   // Zustand store
 *   const subjects = useArrangementUIStore((state) => state.availableSubjects);
 *   
 *   // @dnd-kit sensors (replaces react-beautiful-dnd's drag configuration)
 *   const sensors = useSensors(
 *     useSensor(PointerSensor, {
 *       activationConstraint: { distance: 10 } // Prevent accidental drags
 *     }),
 *     useSensor(KeyboardSensor, {
 *       coordinateGetter: sortableKeyboardCoordinates,
 *     })
 *   );
 * 
 *   const handleDragEnd = (event) => {
 *     const { active, over } = event;
 *     if (!over) return;
 * 
 *     // Update Zustand store or call Server Action
 *     console.log(`Dragged ${active.id} over ${over.id}`);
 *   };
 * 
 *   return (
 *     <DndContext
 *       sensors={sensors}
 *       collisionDetection={closestCenter}
 *       onDragEnd={handleDragEnd}
 *     >
 *       <SortableContext
 *         items={subjects.map(s => s.subjectCode)}
 *         strategy={verticalListSortingStrategy}
 *       >
 *         {subjects.map((subject) => (
 *           <DraggableSubjectCard
 *             key={subject.subjectCode}
 *             id={subject.subjectCode}
 *             subject={subject}
 *           />
 *         ))}
 *       </SortableContext>
 *     </DndContext>
 *   );
 * }
 * ```
 * 
 * MIGRATION CHECKLIST:
 * ✅ Replace DragDropContext → DndContext
 * ✅ Replace Droppable → SortableContext (for lists) or useDroppable (for containers)
 * ✅ Replace Draggable → useSortable (for lists) or useDraggable (for free drag)
 * ✅ Replace provided.innerRef → setNodeRef
 * ✅ Replace provided.draggableProps → attributes
 * ✅ Replace provided.dragHandleProps → listeners (on handle element)
 * ✅ Replace snapshot.isDragging → isDragging from hook
 * ✅ Setup sensors (PointerSensor, KeyboardSensor) for activation constraints
 * ✅ Use collision detection strategies (closestCenter, rectIntersection, etc.)
 * ✅ Use CSS.Transform.toString() for transform styles
 */
