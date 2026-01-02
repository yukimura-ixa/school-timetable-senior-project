import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import {
  ConflictType,
  ExistingSchedule,
  ScheduleArrangementInput,
  TeacherResponsibility,
} from "@/features/schedule-arrangement/domain/models/conflict.model";

// --- MOCK DATA ---

const ACADEMIC_YEAR = 2567;
const SEMESTER = "SEMESTER_1";

// Teachers
const TEACHER_A_ID = 101; // John Doe
const TEACHER_B_ID = 102; // Jane Smith

// Responsibilities (Who teaches what)
const responsibilities: TeacherResponsibility[] = [
  {
    respId: 1,
    teacherId: TEACHER_A_ID,
    subjectCode: "MATH101",
    gradeId: "M1/1",
    academicYear: ACADEMIC_YEAR,
    semester: SEMESTER,
    teachHour: 4,
  },
  {
    respId: 2,
    teacherId: TEACHER_A_ID,
    subjectCode: "MATH101",
    gradeId: "M1/2",
    academicYear: ACADEMIC_YEAR,
    semester: SEMESTER,
    teachHour: 4,
  },
  {
    respId: 3,
    teacherId: TEACHER_B_ID,
    subjectCode: "SCI101",
    gradeId: "M1/1",
    academicYear: ACADEMIC_YEAR,
    semester: SEMESTER,
    teachHour: 4,
  },
];

// Existing Schedules in DB
const existingSchedules: ExistingSchedule[] = [
  // Teacher A is teaching M1/1 at MON_08 (Timeslot T1)
  {
    classId: 1,
    timeslotId: "T1", // MON 08:30-09:20
    subjectCode: "MATH101",
    subjectName: "Mathematics",
    gradeId: "M1/1",
    roomId: 201, // Room 201
    roomName: "Math Room 1",
    teacherId: TEACHER_A_ID,
    teacherName: "John Doe",
    isLocked: false,
  },
  // Locked activity for M1/1 at MON_09 (Timeslot T2)
  {
    classId: 2,
    timeslotId: "T2",
    subjectCode: "ACT101",
    subjectName: "Assembly",
    gradeId: "M1/1",
    roomId: null,
    teacherId: undefined,
    isLocked: true,
  },
];

// --- TEST SCENARIOS ---

function runTest(
  name: string,
  input: ScheduleArrangementInput,
  expectedConflict: ConflictType,
) {
  console.log(`\n-----------------------------------`);
  console.log(`TEST: ${name}`);

  const result = checkAllConflicts(input, existingSchedules, responsibilities);

  console.log(`Expected: ${expectedConflict}`);
  console.log(`Actual:   ${result.conflictType}`);
  console.log(`Message:  ${result.message}`);

  if (result.conflictType === expectedConflict) {
    console.log(`✅ PASS`);
  } else {
    console.log(`❌ FAIL`);
  }
}

async function main() {
  console.log("=== Conflict Detection Verification ===");

  // 1. Valid Schedule (Teacher A, M1/2, T3 - New slot, no overlap)
  runTest(
    "Valid Schedule (No Conflict)",
    {
      timeslotId: "T3",
      subjectCode: "MATH101",
      gradeId: "M1/2",
      teacherId: TEACHER_A_ID,
      roomId: 202,
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.NONE,
  );

  // 2. Teacher Conflict (Teacher A is busy at T1 with M1/1)
  // Trying to assign Teacher A to M1/2 at T1
  runTest(
    "Teacher Conflict",
    {
      timeslotId: "T1", // Teacher A is busy here
      subjectCode: "MATH101",
      gradeId: "M1/2",
      teacherId: TEACHER_A_ID,
      roomId: 202,
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.TEACHER_CONFLICT,
  );

  // 3. Class Conflict (M1/1 is busy at T1 with Math)
  // Trying to assign M1/1 to Science at T1
  runTest(
    "Class Conflict",
    {
      timeslotId: "T1", // M1/1 is busy here
      subjectCode: "SCI101",
      gradeId: "M1/1",
      teacherId: TEACHER_B_ID,
      roomId: 301,
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.CLASS_CONFLICT,
  );

  // 4. Room Conflict (Room 201 is occupied at T1)
  // Trying to assign M1/2 to Room 201 at T1
  // (Note: Teacher B is free, so no teacher conflict)
  runTest(
    "Room Conflict",
    {
      timeslotId: "T1", // Room 201 is occupied
      subjectCode: "SCI101",
      gradeId: "M1/2",
      teacherId: TEACHER_B_ID, // Free
      roomId: 201, // Occupied by M1/1
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.ROOM_CONFLICT,
  );

  // 5. Locked Timeslot (M1/1 has Assembly at T2)
  // Trying to schedule anything at T2 for M1/1
  runTest(
    "Locked Timeslot",
    {
      timeslotId: "T2", // Locked for M1/1
      subjectCode: "SCI101",
      gradeId: "M1/1",
      teacherId: TEACHER_B_ID,
      roomId: 301,
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.LOCKED_TIMESLOT,
  );

  // 6. Teacher Not Assigned (Teacher A doesn't teach SCI101)
  runTest(
    "Teacher Not Assigned",
    {
      timeslotId: "T3",
      subjectCode: "SCI101",
      gradeId: "M1/1",
      teacherId: TEACHER_A_ID, // Teaches MATH, not SCI
      roomId: 301,
      academicYear: ACADEMIC_YEAR,
      semester: SEMESTER,
    },
    ConflictType.TEACHER_NOT_ASSIGNED,
  );
}

main();
