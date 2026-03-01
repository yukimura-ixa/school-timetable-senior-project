/**
 * Auto-Arrange Server Action
 *
 * Server Action for automatic schedule arrangement using the greedy solver.
 * Replaces the raw fetch call to /api/schedule/auto-arrange.
 */

"use server";

import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { solve } from "@/features/arrange/domain/auto-arrange";
import { subjectCreditToNumber } from "@/features/teaching-assignment/domain/utils/subject-credit";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  SolverInput,
  UnplacedSubject,
} from "@/features/arrange/domain/auto-arrange";
import { invalidatePublicCache } from "@/lib/cache-invalidation";

const log = createLogger("AutoArrangeAction");

export type AutoArrangeInput = {
  academicYear: number;
  semester: string;
  teacherId: number;
};

export type AutoArrangeResult =
  | {
      success: true;
      placements: Array<{
        timeslotId: string;
        subjectCode: string;
        gradeId: string;
        roomId: number;
        respId: number;
      }>;
      failures: Array<{
        subjectCode: string;
        reason: string;
      }>;
      stats: {
        totalSubjectsToPlace: number;
        successfullyPlaced: number;
        failed: number;
        durationMs: number;
        qualityScore: number;
      };
      message?: string;
    }
  | {
      success: false;
      message: string;
      failures?: Array<{ subjectCode: string; reason: string }>;
    };

/**
 * Auto-arrange schedule for a teacher
 *
 * Runs the greedy auto-arrange solver for a given teacher's unplaced subjects.
 * All placements are written atomically in a single transaction.
 */
export async function autoArrangeAction(
  input: AutoArrangeInput,
): Promise<AutoArrangeResult> {
  try {
    log.debug("Auto-arrange request received", { input });

    // ── Auth ──
    const session = await auth.api.getSession({ headers: new Headers() });

    if (!session) {
      return { success: false, message: "กรุณาเข้าสู่ระบบ" };
    }

    const role = normalizeAppRole(session.user?.role);
    if (!isAdminRole(role)) {
      return { success: false, message: "ไม่มีสิทธิ์เข้าถึง" };
    }

    // ── Validate Input ──
    const { academicYear, semester, teacherId } = input;

    if (!academicYear || !semester || !teacherId) {
      return {
        success: false,
        message: "ข้อมูลไม่ครบถ้วน (academicYear, semester, teacherId)",
      };
    }

    const semesterEnum = semester === "1" ? "SEMESTER_1" : "SEMESTER_2";

    // ── Data Gathering (parallel) ──
    const [timeslotsRaw, allSchedules, rooms, teacherResponsibilities] =
      await Promise.all([
        // 1. All timeslots for this semester
        prisma.timeslot.findMany({
          where: {
            AcademicYear: Number(academicYear),
            Semester: semesterEnum,
          },
          orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
        }),

        // 2. All existing schedules for this semester (across ALL teachers)
        prisma.class_schedule.findMany({
          where: {
            timeslot: {
              AcademicYear: Number(academicYear),
              Semester: semesterEnum,
            },
          },
          include: {
            teachers_responsibility: {
              select: { TeacherID: true, RespID: true },
            },
            timeslot: true,
          },
        }),

        // 3. All rooms
        prisma.room.findMany({
          orderBy: [{ Building: "asc" }, { Floor: "asc" }],
        }),

        // 4. Teacher's responsibilities (subjects they teach)
        prisma.teachers_responsibility.findMany({
          where: { TeacherID: Number(teacherId) },
          include: {
            subject: true,
            gradelevel: true,
          },
        }),
      ]);

    // ── Transform to Solver Types ──

    // Timeslots
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

    // Existing schedules (flat, one per teacher-schedule combo)
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

    // Rooms
    const availableRooms: AvailableRoom[] = rooms.map((r) => ({
      roomId: r.RoomID,
      roomName: r.RoomName,
    }));

    // Unplaced subjects
    const unplacedSubjects: UnplacedSubject[] = teacherResponsibilities.map(
      (resp) => {
        const alreadyPlaced = allSchedules.filter(
          (s) =>
            s.SubjectCode === resp.SubjectCode &&
            s.GradeID === resp.GradeID &&
            s.teachers_responsibility.some((r) => r.TeacherID === teacherId),
        ).length;

        const credit = subjectCreditToNumber(
          resp.subject?.Credit ?? "CREDIT_10",
        );
        const periodsPerWeek = Math.ceil(credit);

        return {
          respId: resp.RespID,
          subjectCode: resp.SubjectCode,
          subjectName: resp.subject?.SubjectName ?? "ไม่ระบุ",
          gradeId: resp.GradeID,
          gradeName: resp.gradelevel
            ? `${resp.gradelevel.Year}/${resp.gradelevel.Number}`
            : resp.GradeID,
          periodsPerWeek,
          periodsAlreadyPlaced: alreadyPlaced,
        };
      },
    );

    // Filter out fully-placed subjects
    const subjectsNeedingPlacement = unplacedSubjects.filter(
      (s) => s.periodsPerWeek - s.periodsAlreadyPlaced > 0,
    );

    if (subjectsNeedingPlacement.length === 0) {
      return {
        success: true,
        placements: [],
        failures: [],
        stats: {
          totalSubjectsToPlace: 0,
          successfullyPlaced: 0,
          failed: 0,
          durationMs: 0,
          qualityScore: 100,
        },
        message: "ไม่มีวิชาที่ต้องจัดเพิ่ม",
      };
    }

    // ── Run Solver ──
    const solverInput: SolverInput = {
      teacherId: Number(teacherId),
      academicYear: Number(academicYear),
      semester: String(semester),
      unplacedSubjects: subjectsNeedingPlacement,
      timeslots,
      existingSchedules,
      rooms: availableRooms,
    };

    log.info("Running auto-arrange solver", {
      teacherId,
      subjectsToPlace: subjectsNeedingPlacement.length,
      timeslots: timeslots.length,
      existingSchedules: existingSchedules.length,
      rooms: availableRooms.length,
    });

    const result = solve(solverInput);

    log.info("Solver completed", {
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

      log.info("Placements saved", { count: result.placements.length });
    }

    // Return success result
    await invalidatePublicCache(["stats", "classes", "teachers"]);
    return {
      success: true,
      placements: result.placements,
      failures: result.failures,
      stats: result.stats,
    } satisfies AutoArrangeResult;
  } catch (error) {
    log.logError(error, { action: "autoArrangeAction", input });
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในระบบจัดตารางอัตโนมัติ",
    };
  }
}
