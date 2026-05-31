"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { RoomSelectionContent } from "./RoomSelectionContent";
import { useSnackbar } from "notistack";
import { validateDropAction } from "@/features/arrange/application/actions/validate-drop.action";
import ConflictDetailsModal from "@/features/schedule-arrangement/presentation/components/ConflictDetailsModal";
import { useConflictResolution } from "@/features/schedule-arrangement/presentation/hooks";
import {
  ConflictType,
  type ConflictResult,
  type ResolutionSuggestion,
  type ScheduleArrangementInput,
} from "@/features/schedule-arrangement/domain/models/conflict.model";

type SubjectDragData = {
  SubjectCode: string;
  GradeID: string;
  RespID?: number;
};

type RoomModalState = {
  timeslot: string;
  subject: string;
  grade: string;
  teacher: string;
  resp?: string;
};

export function ArrangeDndProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");

  const yearInt = parseInt(academicYear, 10);
  const semInt = semester === "2" ? 2 : 1;

  const [conflictModal, setConflictModal] = useState<{
    conflict: ConflictResult;
    attempt: ScheduleArrangementInput;
    respId?: number;
  } | null>(null);

  const [activeSubject, setActiveSubject] = useState<{
    SubjectName?: string;
    GradeName?: string;
  } | null>(null);

  const [roomModal, setRoomModal] = useState<RoomModalState | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSubject(
      (event.active.data.current as { SubjectName?: string; GradeName?: string }) ?? null,
    );
  };

  const {
    suggestions,
    isLoading: isLoadingSuggestions,
    fetchFor,
    reset: resetSuggestions,
  } = useConflictResolution({ academicYear: yearInt, semester: semInt });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSubject(null);
    const { active, over } = event;
    if (!over || !teacher) return;

    const timeslotId = over.id as string;
    const subjectData = active.data.current as SubjectDragData | undefined;

    if (!subjectData?.SubjectCode || !subjectData.GradeID) {
      enqueueSnackbar("ข้อมูลไม่ครบถ้วน", { variant: "warning" });
      return;
    }

    try {
      const result = await validateDropAction({
        timeslot: timeslotId,
        subject: subjectData.SubjectCode,
        grade: subjectData.GradeID,
        teacher,
      });

      if (!result.allowed) {
        const attempt: ScheduleArrangementInput = {
          timeslotId,
          subjectCode: subjectData.SubjectCode,
          gradeId: subjectData.GradeID,
          teacherId: parseInt(teacher, 10) || undefined,
          roomId: null,
          academicYear: yearInt,
          semester: semInt === 1 ? "SEMESTER_1" : "SEMESTER_2",
        };
        const reasonToConflictType: Record<string, ConflictType> = {
          teacher_conflict: ConflictType.TEACHER_CONFLICT,
          grade_conflict: ConflictType.CLASS_CONFLICT,
          break_timeslot: ConflictType.LOCKED_TIMESLOT,
          locked_timeslot: ConflictType.LOCKED_TIMESLOT,
        };
        const conflict: ConflictResult = {
          hasConflict: true,
          conflictType: reasonToConflictType[result.reason] ?? ConflictType.TEACHER_CONFLICT,
          message: result.message || "ไม่สามารถจัดตารางได้",
        };
        setConflictModal({ conflict, attempt, respId: subjectData.RespID });
        void fetchFor(attempt);
        return;
      }

      setRoomModal({
        timeslot: timeslotId,
        subject: subjectData.SubjectCode,
        grade: subjectData.GradeID,
        teacher,
        ...(subjectData.RespID ? { resp: String(subjectData.RespID) } : {}),
      });
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการตรวจสอบ", { variant: "error" });
    }
  };

  const closeConflictModal = () => {
    setConflictModal(null);
    resetSuggestions();
  };

  const handleApplySuggestion = (s: ResolutionSuggestion) => {
    if (!conflictModal || !teacher) return;
    const { attempt, respId } = conflictModal;

    if (s.kind === "MOVE") {
      setRoomModal({
        timeslot: s.targetTimeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        ...(respId ? { resp: String(respId) } : {}),
      });
      closeConflictModal();
      return;
    }

    if (s.kind === "RE_ROOM") {
      setRoomModal({
        timeslot: attempt.timeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        ...(respId ? { resp: String(respId) } : {}),
      });
      closeConflictModal();
      return;
    }

    enqueueSnackbar(
      "ฟังก์ชันสลับอัตโนมัติยังไม่รองรับ โปรดลบรายวิชาปลายทางก่อนแล้วจัดใหม่",
      { variant: "warning" },
    );
    closeConflictModal();
  };

  return (
    <DndContext id="arrange-dnd" sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>
        {activeSubject ? (
          <Paper sx={{ p: 1, px: 1.5, boxShadow: 4 }}>
            <Typography variant="body2" fontWeight="bold">
              {activeSubject.SubjectName ?? "รายวิชา"}
            </Typography>
            {activeSubject.GradeName && (
              <Typography variant="caption" color="text.secondary">
                {activeSubject.GradeName}
              </Typography>
            )}
          </Paper>
        ) : null}
      </DragOverlay>
      {conflictModal && (
        <ConflictDetailsModal
          open
          conflict={conflictModal.conflict}
          attempt={conflictModal.attempt}
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          onApply={handleApplySuggestion}
          onClose={closeConflictModal}
        />
      )}
      {roomModal && (
        <Dialog
          open
          onClose={() => setRoomModal(null)}
          maxWidth="md"
          fullWidth
          data-testid="room-selection-dialog"
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            เลือกห้องเรียน
            <IconButton onClick={() => setRoomModal(null)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <RoomSelectionContent
              timeslot={roomModal.timeslot}
              subject={roomModal.subject}
              grade={roomModal.grade}
              teacher={roomModal.teacher}
              resp={roomModal.resp ?? ""}
              onClose={() => setRoomModal(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </DndContext>
  );
}
