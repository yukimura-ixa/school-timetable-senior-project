import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import { TimetableHeader } from "./components/TimetableHeader";
import { TimetableGrid } from "./components/TimetableGrid";
import { CreditSummary } from "./components/CreditSummary";
import { pdfStyles } from "../styles/pdf-styles";
import "../fonts/register-fonts";

export interface StudentTimeslot {
  timeslotId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breaktime: string;
}

export interface StudentScheduleEntry {
  timeslotId: string;
  subjectCode: string;
  subjectName: string;
  teacherName?: string;
  roomName: string;
}

export interface StudentTimetableData {
  gradeId: string;
  gradeName: string;
  semester: string;
  academicYear: string;
  timeslots: StudentTimeslot[];
  scheduleEntries: StudentScheduleEntry[];
  totalCredits: number;
  totalHours: number;
}

const DAY_NAME_MAP: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
};

export const StudentTimetablePDF: React.FC<{ data: StudentTimetableData }> = ({
  data,
}) => {
  const { gradeName, semester, academicYear, timeslots, scheduleEntries, totalCredits, totalHours } = data;

  // Create schedule map for quick lookup
  const scheduleMap = new Map<string, StudentScheduleEntry>();
  scheduleEntries.forEach((entry) => {
    scheduleMap.set(entry.timeslotId, entry);
  });

  // Transform to TimetableGrid format
  const maxPeriods = Math.max(
    ...timeslots.map((t) => {
      const parts = t.timeslotId.split("_");
      return parseInt(parts[parts.length - 1] || "0");
    }),
    0
  );

  const gridTimeslots = timeslots
    .filter((t) => t.breaktime === "NORMAL")
    .map((t) => {
      const parts = t.timeslotId.split("_");
      const period = parseInt(parts[parts.length - 1] || "0") - 1;
      const day = DAY_NAME_MAP[t.dayOfWeek] || t.dayOfWeek;
      const schedule = scheduleMap.get(t.timeslotId);

      return {
        day,
        period,
        subject: schedule?.subjectName,
        room: schedule?.roomName,
        class: schedule?.teacherName ? `(${schedule.teacherName})` : undefined,
      };
    });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View>
          {/* Header */}
          <TimetableHeader
            title={`ตารางเรียน ${gradeName}`}
            semester={parseInt(semester)}
            academicYear={parseInt(academicYear)}
          />

          {/* Timetable Grid */}
          <TimetableGrid timeslots={gridTimeslots} maxPeriods={maxPeriods} />

          {/* Credit Summary */}
          <CreditSummary totalCredits={totalCredits} totalHours={totalHours} />
        </View>
      </Page>
    </Document>
  );
};
