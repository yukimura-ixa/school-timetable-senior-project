"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type {
  teachers_responsibility,
  subject,
  gradelevel,
  teacher as Teacher,
} from "@/prisma/generated/client";
import { subjectCreditToNumber } from "../../domain/utils/subject-credit";

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

// GradeID "101" → room "01" → "1" (legacy strips the two-digit year prefix).
function roomNumber(gradeId: string): string {
  return gradeId.substring(2);
}

function teachHours(credit: string): number {
  return subjectCreditToNumber(credit) * 2;
}

export function TeacherCentricEditor({ assignments }: TeacherCentricEditorProps) {
  // year → ordered unique GradeIDs the teacher is responsible for
  const roomsByYear = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const a of assignments) {
      const list = map.get(a.gradelevel.Year) ?? [];
      if (!list.includes(a.GradeID)) list.push(a.GradeID);
      map.set(a.gradelevel.Year, list);
    }
    return map;
  }, [assignments]);

  const subjectsForRoom = (gradeId: string) =>
    assignments.filter((a) => a.GradeID === gradeId);

  const yearHours = (year: number) =>
    assignments
      .filter((a) => a.gradelevel.Year === year)
      .reduce((sum, a) => sum + teachHours(a.Credit), 0);

  return (
    <Stack spacing={2}>
      {YEARS.map((year) => {
        const rooms = roomsByYear.get(year) ?? [];
        return (
          <Accordion key={year} defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexGrow: 1 }}>ม.{year}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {yearHours(year)} คาบ
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {rooms.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ยังไม่มีชั้นเรียนที่รับผิดชอบ
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {rooms.map((gradeId) => (
                    <Box key={gradeId}>
                      <Chip
                        label={`ม.${year}/${roomNumber(gradeId)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Stack spacing={0.5} sx={{ mt: 1, pl: 1 }}>
                        {subjectsForRoom(gradeId).map((a) => (
                          <Typography
                            key={`${a.GradeID}-${a.SubjectCode}-${a.RespID}`}
                            variant="body2"
                          >
                            {a.SubjectCode} {a.SubjectName} · {teachHours(a.Credit)}{" "}
                            คาบ
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
