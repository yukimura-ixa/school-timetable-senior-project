"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AddCircleOutlined as AddCircleOutlineIcon,
} from "@mui/icons-material";
import type {
  teachers_responsibility,
  subject,
  gradelevel,
  teacher as Teacher,
} from "@/prisma/generated/client";
import { useGradeLevels } from "@/hooks/use-grade-levels";
import { getSubjectsByGradeAction } from "@/features/subject/application/actions/subject.actions";
import { syncAssignmentsAction } from "@/features/assign/application/actions/assign.actions";
import { subjectCreditToNumber } from "../../domain/utils/subject-credit";
import { formatGradeIdDisplay } from "@/utils/grade-display";
import { SelectClassRoomModal } from "./SelectClassRoomModal";
import { AddSubjectModal, type SubjectOption } from "./AddSubjectModal";
import {
  assignmentsToEditState,
  buildSyncResp,
  findEmptyRooms,
  type EditState,
} from "./teacher-centric-editor.logic";

export interface AssignmentWithRelations extends teachers_responsibility {
  gradelevel: gradelevel;
  subject: subject;
  teacher?: Teacher;
  SubjectName: string;
  Credit: string;
}

export interface TeacherCentricEditorProps {
  teacherId: number;
  teacherName?: string;
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
  assignments: AssignmentWithRelations[];
  onSaved?: () => void;
}

const YEARS = [1, 2, 3, 4, 5, 6] as const;

function teachHours(credit: string): number {
  return subjectCreditToNumber(credit) * 2;
}

export function TeacherCentricEditor({
  teacherId,
  teacherName,
  academicYear,
  semester,
  assignments,
  onSaved,
}: TeacherCentricEditorProps) {
  const [editState, setEditState] = useState<EditState>(() =>
    assignmentsToEditState(assignments),
  );
  // Re-derive edit state when the persisted assignments change (e.g. a save
  // reload). Adjusting state during render (guarded by a snapshot) is React's
  // sanctioned alternative to a setState-in-effect here.
  const [snapshot, setSnapshot] = useState(assignments);
  if (snapshot !== assignments) {
    setSnapshot(assignments);
    setEditState(assignmentsToEditState(assignments));
  }

  const gradeLevels = useGradeLevels();

  // GradeID is an opaque id ("M1-1"); resolve year and labels from the
  // gradelevel records rather than parsing the id string.
  const gradeYearById = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) map.set(a.GradeID, a.gradelevel.Year);
    for (const g of gradeLevels.data) map.set(g.GradeID, g.Year);
    return map;
  }, [assignments, gradeLevels.data]);
  const yearOf = (gradeId: string): number => gradeYearById.get(gradeId) ?? 0;

  const [roomModalYear, setRoomModalYear] = useState<number | null>(null);
  const [subjectModalRoom, setSubjectModalRoom] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>(
    [],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roomsForYear = (year: number): string[] =>
    Object.keys(editState)
      .filter((g) => yearOf(g) === year)
      .sort();

  const availableRoomsForYear = (year: number): string[] =>
    gradeLevels.data
      .filter((g) => g.Year === year)
      .map((g) => g.GradeID)
      .sort();

  const confirmRooms = (gradeIds: string[], year: number) => {
    setEditState((prev) => {
      const next: EditState = { ...prev };
      for (const key of Object.keys(next)) {
        if (yearOf(key) === year && !gradeIds.includes(key)) delete next[key];
      }
      for (const g of gradeIds) if (!next[g]) next[g] = [];
      return next;
    });
    setRoomModalYear(null);
  };

  const openSubjectModal = async (gradeId: string) => {
    setError(null);
    setSuccess(null);
    setSubjectModalRoom(gradeId);
    const result = await getSubjectsByGradeAction({ GradeID: gradeId });
    const data =
      result && "success" in result && result.success && result.data
        ? (result.data as SubjectOption[])
        : [];
    setAvailableSubjects(
      data.map((s) => ({
        SubjectCode: s.SubjectCode,
        SubjectName: s.SubjectName,
        Credit: s.Credit,
      })),
    );
  };

  const confirmSubjects = (subjects: SubjectOption[]) => {
    if (!subjectModalRoom) return;
    const room = subjectModalRoom;
    setEditState((prev) => ({ ...prev, [room]: subjects }));
    setSubjectModalRoom(null);
  };

  const handleSave = async () => {
    const empty = findEmptyRooms(editState);
    if (empty.length > 0) {
      setError("ยังเพิ่มวิชาเรียนไม่ครบทุกชั้นเรียน");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await syncAssignmentsAction({
        TeacherID: teacherId,
        AcademicYear: academicYear,
        Semester: semester,
        Resp: buildSyncResp(editState),
      });
      setSuccess("บันทึกข้อมูลสำเร็จ");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการบันทึก");
    }
    setSaving(false);
  };

  return (
    <Stack spacing={2}>
      {teacherName && (
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          ชั้นเรียนที่รับผิดชอบของ {teacherName}
        </Typography>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {YEARS.map((year) => {
        const rooms = roomsForYear(year);
        const yearHours = rooms
          .flatMap((g) => editState[g] ?? [])
          .reduce((sum, s) => sum + teachHours(s.Credit), 0);
        return (
          <Accordion key={year} defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexGrow: 1 }}>ม.{year}</Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mr: 2 }}
              >
                {yearHours} คาบ
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {rooms.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    ยังไม่มีชั้นเรียนที่รับผิดชอบ
                  </Typography>
                ) : (
                  rooms.map((gradeId) => (
                    <Box key={gradeId}>
                      <Chip
                        label={formatGradeIdDisplay(gradeId)}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => void openSubjectModal(gradeId)}
                      />
                      <Stack spacing={0.5} sx={{ mt: 1, pl: 1 }}>
                        {(editState[gradeId] ?? []).length === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{ color: "warning.main" }}
                          >
                            กดที่ชั้นเรียนเพื่อเพิ่มวิชา
                          </Typography>
                        ) : (
                          (editState[gradeId] ?? []).map((s) => (
                            <Typography
                              key={`${gradeId}-${s.SubjectCode}`}
                              variant="body2"
                            >
                              {s.SubjectCode} {s.SubjectName} ·{" "}
                              {teachHours(s.Credit)} คาบ
                            </Typography>
                          ))
                        )}
                      </Stack>
                    </Box>
                  ))
                )}
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setRoomModalYear(year);
                  }}
                  sx={{ alignSelf: "flex-start" }}
                >
                  เพิ่มชั้นเรียน
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Button
        variant="contained"
        color="success"
        onClick={() => void handleSave()}
        disabled={saving}
        startIcon={
          saving ? <CircularProgress size={18} color="inherit" /> : undefined
        }
      >
        บันทึกข้อมูล
      </Button>

      {roomModalYear !== null && (
        <SelectClassRoomModal
          open
          year={roomModalYear}
          availableRooms={availableRoomsForYear(roomModalYear)}
          selected={roomsForYear(roomModalYear)}
          onConfirm={confirmRooms}
          onClose={() => setRoomModalYear(null)}
        />
      )}
      {subjectModalRoom !== null && (
        <AddSubjectModal
          open
          roomLabel={formatGradeIdDisplay(subjectModalRoom)}
          availableSubjects={availableSubjects}
          existingSubjects={editState[subjectModalRoom] ?? []}
          onConfirm={confirmSubjects}
          onClose={() => setSubjectModalRoom(null)}
        />
      )}
    </Stack>
  );
}
