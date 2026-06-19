import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";
import {
  solveWholeSchool,
  toUnplacedSubject,
} from "@/features/arrange/domain/auto-arrange";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  TeacherSolveTask,
  UnplacedSubject,
  WholeSchoolSolverInput,
} from "@/features/arrange/domain/auto-arrange";

const log = createLogger("API:AutoArrangeAll");

/**
 * POST /api/schedule/auto-arrange-all
 *
 * Headline action of the scheduling wizard: auto-generates the timetable for
 * the ENTIRE school in one pass. Loads every teacher's responsibilities for the
 * term, orders them most-constrained-first, and runs the greedy solver per
 * teacher so each sees the prior teachers' placements (no cross-teacher
 * double-booking). All resulting placements are written in a single transaction.
 *
 * Request body:
 * {
 *   academicYear: number;  // e.g., 2567
 *   semester: string;      // "1" or "2"
 * }
 *
 * Response mirrors the per-teacher route plus a `perTeacher` breakdown so the
 * admin can finish any unplaced leftovers in the review step.
 */
export async function POST(request: NextRequest) {
  try {
    log.debug("Whole-school auto-arrange request received");

    // ── Auth ──
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const role = normalizeAppRole(session.user?.role);
    if (!isAdminRole(role)) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 },
      );
    }

    // ── Parse Input ──
    const body = await request.json();
    const { academicYear, semester } = body;

    if (!academicYear || !semester) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ครบถ้วน (academicYear, semester)",
        },
        { status: 400 },
      );
    }

    const semesterEnum = semester === "1" ? "SEMESTER_1" : "SEMESTER_2";
    const year = Number(academicYear);

    // ── Data Gathering (parallel) ──
    const [timeslotsRaw, allSchedules, rooms, allResponsibilities] =
      await Promise.all([
        prisma.timeslot.findMany({
          where: { AcademicYear: year, Semester: semesterEnum },
          orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
        }),

        prisma.class_schedule.findMany({
          where: {
            timeslot: { AcademicYear: year, Semester: semesterEnum },
          },
          include: {
            teachers_responsibility: {
              select: { TeacherID: true, RespID: true },
            },
            timeslot: true,
          },
        }),

        prisma.room.findMany({
          orderBy: [{ Building: "asc" }, { Floor: "asc" }],
        }),

        // All teachers' responsibilities for THIS term (scoped, unlike the
        // per-teacher route which is already narrowed by TeacherID).
        prisma.teachers_responsibility.findMany({
          where: { AcademicYear: year, Semester: semesterEnum },
          include: { subject: true, gradelevel: true },
        }),
      ]);

    // ── Transform to Solver Types ──

    const timeslots: AvailableTimeslot[] = timeslotsRaw.map((t) => {
      const periodMatch = t.TimeslotID.match(/(\d+)$/);
      const period = periodMatch?.[1] ? parseInt(periodMatch[1]) : 0;
      const dayMatch = t.TimeslotID.match(/([A-Z]{3})\d+$/);
      const day: string = dayMatch?.[1] ?? "MON";

      return {
        timeslotId: t.TimeslotID,
        day,
        period,
        isBreak: t.Breaktime !== null && t.Breaktime !== "NOT_BREAK",
      };
    });

    const existingSchedules: ExistingSchedule[] = allSchedules.flatMap((s) => {
      if (s.teachers_responsibility.length === 0) {
        return [
          {
            classId: s.ClassID,
            timeslotId: s.TimeslotID,
            subjectCode: s.SubjectCode,
            gradeId: s.GradeID,
            teacherId: 0,
            roomId: s.RoomID,
            isLocked: s.IsLocked,
          },
        ];
      }
      return s.teachers_responsibility.map((r) => ({
        classId: s.ClassID,
        timeslotId: s.TimeslotID,
        subjectCode: s.SubjectCode,
        gradeId: s.GradeID,
        teacherId: r.TeacherID,
        roomId: s.RoomID,
        isLocked: s.IsLocked,
      }));
    });

    const availableRooms: AvailableRoom[] = rooms.map((r) => ({
      roomId: r.RoomID,
      roomName: r.RoomName,
    }));

    // Group responsibilities into one task per teacher, computing how many
    // periods of each subject+grade are already placed for that teacher.
    const tasksByTeacher = new Map<number, UnplacedSubject[]>();
    for (const resp of allResponsibilities) {
      const alreadyPlaced = allSchedules.filter(
        (s) =>
          s.SubjectCode === resp.SubjectCode &&
          s.GradeID === resp.GradeID &&
          s.teachers_responsibility.some(
            (r) => r.TeacherID === resp.TeacherID,
          ),
      ).length;

      // Required periods come from TeachHour, not Math.ceil(credit) — shared
      // with the per-teacher path so the two cannot diverge again (c6r / 6ri).
      const subject = toUnplacedSubject(resp, alreadyPlaced);

      const existing = tasksByTeacher.get(resp.TeacherID);
      if (existing) {
        existing.push(subject);
      } else {
        tasksByTeacher.set(resp.TeacherID, [subject]);
      }
    }

    const teachers: TeacherSolveTask[] = Array.from(
      tasksByTeacher.entries(),
    ).map(([teacherId, unplacedSubjects]) => ({ teacherId, unplacedSubjects }));

    if (teachers.length === 0) {
      return NextResponse.json({
        success: true,
        placements: [],
        failures: [],
        perTeacher: [],
        stats: {
          totalSubjectsToPlace: 0,
          successfullyPlaced: 0,
          failed: 0,
          durationMs: 0,
          qualityScore: 100,
        },
        message: "ไม่มีภาระงานสอนสำหรับภาคเรียนนี้",
      });
    }

    // ── Run Whole-School Solver ──
    const solverInput: WholeSchoolSolverInput = {
      academicYear: year,
      semester: String(semester),
      teachers,
      timeslots,
      existingSchedules,
      rooms: availableRooms,
    };

    log.info("Running whole-school auto-arrange", {
      teachers: teachers.length,
      timeslots: timeslots.length,
      existingSchedules: existingSchedules.length,
      rooms: availableRooms.length,
    });

    const result = solveWholeSchool(solverInput);

    log.info("Whole-school solver completed", {
      placed: result.stats.successfullyPlaced,
      failed: result.stats.failed,
      durationMs: result.stats.durationMs,
      qualityScore: result.stats.qualityScore,
    });

    // ── Apply Placements Atomically ──
    if (result.placements.length > 0) {
      await prisma.$transaction(
        result.placements.map((p) =>
          prisma.class_schedule.create({
            data: {
              TimeslotID: p.timeslotId,
              SubjectCode: p.subjectCode,
              GradeID: p.gradeId,
              RoomID: p.roomId,
              IsLocked: false,
              teachers_responsibility: {
                connect: { RespID: p.respId },
              },
            },
          }),
        ),
      );

      log.info("Whole-school placements saved", {
        count: result.placements.length,
      });
    }

    return NextResponse.json({
      success: result.success,
      placements: result.placements,
      failures: result.failures,
      perTeacher: result.perTeacher,
      stats: result.stats,
    });
  } catch (error) {
    log.logError(error, { route: "/api/schedule/auto-arrange-all" });
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในระบบจัดตารางอัตโนมัติทั้งโรงเรียน",
        error: { message: sanitizeErrorMessage(error) },
      },
      { status: 500 },
    );
  }
}
