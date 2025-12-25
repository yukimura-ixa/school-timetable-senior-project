import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/schedule/validate-drop
 *
 * Consolidated validation endpoint for drag-and-drop schedule creation.
 * Replaces 5 sequential client-side checks with 1 parallel server-side validation.
 *
 * Request body:
 * {
 *   timeslot: string;      // TimeslotID (e.g., "1-2567-MON1")
 *   subject: string;       // SubjectCode
 *   grade: string;         // GradeID
 *   teacher: string;       // TeacherID
 * }
 *
 * Response:
 * {
 *   allowed: boolean;
 *   reason?: string;       // Error reason if not allowed
 *   message?: string;      // Localized error message
 *   conflict?: object;     // Conflict details
 *   rooms?: {              // Available rooms if allowed
 *     available: Room[];
 *     occupied: Room[];
 *   }
 * }
 *
 * Validation checks (all parallel):
 * 1. Timeslot is not a break period
 * 2. Timeslot is not locked
 * 3. Teacher has no conflicting schedule
 * 4. Grade/class has no conflicting schedule
 * 5. Pre-fetch available rooms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeslot, subject, grade, teacher } = body;

    // Validate required fields
    if (!timeslot || !subject || !grade || !teacher) {
      return NextResponse.json(
        {
          allowed: false,
          reason: "missing_parameters",
          message: "ข้อมูลไม่ครบถ้วน",
        },
        { status: 400 },
      );
    }

    const teacherId = parseInt(teacher);

    // === PARALLEL VALIDATION ===
    // Execute all checks simultaneously for maximum performance
    const [
      timeslotData,
      teacherConflict,
      gradeConflict,
      allRooms,
      occupiedRoomSchedules,
    ] = await Promise.all([
      // 1. Check timeslot properties (break status, locked status)
      prisma.timeslot.findUnique({
        where: { TimeslotID: timeslot },
        include: {
          locked_schedule: {
            select: {
              LockedID: true,
              SubjectCode: true,
              GradeID: true,
            },
          },
        },
      }),

      // 2. Check teacher conflict
      prisma.class_schedule.findFirst({
        where: {
          TimeslotID: timeslot,
          teachers_responsibility: {
            TeacherID: teacherId,
          },
        },
        include: {
          subject: {
            select: { SubjectName: true },
          },
          gradelevel: {
            select: { Year: true, Number: true, GradeName: true },
          },
          teachers_responsibility: {
            select: {
              teacher: {
                select: {
                  Prefix: true,
                  Firstname: true,
                  Lastname: true,
                },
              },
            },
          },
        },
      }),

      // 3. Check grade/class conflict
      prisma.class_schedule.findFirst({
        where: {
          TimeslotID: timeslot,
          GradeID: grade,
        },
        include: {
          subject: {
            select: { SubjectName: true },
          },
        },
      }),

      // 4. Fetch all rooms (for available list)
      prisma.room.findMany({
        orderBy: [{ Building: "asc" }, { Floor: "asc" }, { RoomName: "asc" }],
        select: {
          RoomID: true,
          RoomName: true,
          Building: true,
          Floor: true,
          Capacity: true,
        },
      }),

      // 5. Fetch occupied rooms for this timeslot
      prisma.class_schedule.findMany({
        where: { TimeslotID: timeslot },
        select: { RoomID: true },
        distinct: ["RoomID"],
      }),
    ]);

    // === VALIDATION LOGIC (executed in order of severity) ===

    // Check 1: Timeslot doesn't exist
    if (!timeslotData) {
      return NextResponse.json({
        allowed: false,
        reason: "invalid_timeslot",
        message: "ไม่พบช่วงเวลาที่เลือก",
      });
    }

    // Check 2: Break timeslot (cannot schedule classes during breaks)
    if (timeslotData.Breaktime && timeslotData.Breaktime !== "NOT_BREAK") {
      return NextResponse.json({
        allowed: false,
        reason: "break_timeslot",
        message: "⏸️ ไม่สามารถจัดวิชาเรียนในคาบพักได้",
      });
    }

    // Check 3: Locked timeslot (cannot modify locked schedules)
    if (
      timeslotData.locked_schedule &&
      timeslotData.locked_schedule.length > 0
    ) {
      return NextResponse.json({
        allowed: false,
        reason: "locked_timeslot",
        message: "🔒 ช่วงเวลานี้ถูกล็อคแล้ว ไม่สามารถจัดตารางได้",
      });
    }

    // Check 4: Teacher conflict (teacher already teaching another class)
    if (teacherConflict) {
      const teacher = teacherConflict.teachers_responsibility.teacher;
      const teacherName = `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`;
      const subjectName = teacherConflict.subject.SubjectName;
      const gradeName = teacherConflict.gradelevel.GradeName;

      return NextResponse.json({
        allowed: false,
        reason: "teacher_conflict",
        message: `⚠️ ${teacherName} สอนวิชา "${subjectName}" ชั้น ${gradeName} ในช่วงเวลานี้แล้ว`,
        conflict: {
          teacherName,
          subjectName,
          gradeName,
          year: teacherConflict.gradelevel.Year,
          number: teacherConflict.gradelevel.Number,
        },
      });
    }

    // Check 5: Grade conflict (class already has another subject scheduled)
    if (gradeConflict) {
      return NextResponse.json({
        allowed: false,
        reason: "grade_conflict",
        message: `⚠️ ชั้นเรียนนี้มีวิชา "${gradeConflict.subject.SubjectName}" ในช่วงเวลานี้แล้ว`,
      });
    }

    // === SUCCESS: All checks passed ===

    // Calculate available and occupied rooms
    const occupiedIds = new Set(occupiedRoomSchedules.map((s) => s.RoomID));
    const available = allRooms.filter((room) => !occupiedIds.has(room.RoomID));
    const occupied = allRooms.filter((room) => occupiedIds.has(room.RoomID));

    return NextResponse.json({
      allowed: true,
      rooms: {
        available,
        occupied,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/schedule/validate-drop error:", error);
    return NextResponse.json(
      {
        allowed: false,
        reason: "server_error",
        message: "เกิดข้อผิดพลาดในการตรวจสอบ",
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
