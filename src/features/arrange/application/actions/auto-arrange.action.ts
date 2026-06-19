/**
 * Auto-Arrange Server Action
 *
 * Server Action for automatic schedule arrangement using the greedy solver.
 * Replaces the raw fetch call to /api/schedule/auto-arrange.
 */

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { solve, toUnplacedSubject } from "@/features/arrange/domain/auto-arrange";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  SolverInput,
  UnplacedSubject,
} from "@/features/arrange/domain/auto-arrange";
import { invalidatePublicCache } from "@/lib/cache-invalidation";
import { buildGradeGroupIndex } from "@/utils/break-utils";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import { breakGroupRepository } from "@/features/timeslot/infrastructure/repositories/break-group.repository";
import { toBreakGroups } from "@/features/timeslot/domain/services/break-context";

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
    const session = await auth.api.getSession({ headers: await headers() });

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
    const configId = `${semester === "1" ? "1" : "2"}-${academicYear}`;

    const [timeslotsRaw, allSchedules, rooms, teacherResponsibilities, configRow, breakGroupRows] =
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

        // 5. Term config (for SlotConfig[] — Phase 2A per-grade break guard)
        prisma.table_config.findUnique({ where: { ConfigID: configId } }),

        // 6. Break groups for this term (Phase 2A per-grade break guard)
        breakGroupRepository.findByConfigId(configId),
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

        // Required periods = TeachHour (credit × 2 per the assign step), shared
        // with the whole-school route so the two paths can't diverge (6ri/c6r).
        return toUnplacedSubject(resp, alreadyPlaced);
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

    // ── Build per-grade break guard (Phase 2A) ──
    // Parse config slots and build grade→group index so the solver can skip
    // cells where a specific grade has a staggered break (e.g. junior lunch).
    let breakGuard: SolverInput["breakGuard"];
    if (configRow?.Config) {
      try {
        const configData = parseConfigData(configRow.Config);
        breakGuard = {
          slotConfigs: configData.slots,
          gradeBreakIndex: buildGradeGroupIndex(toBreakGroups(breakGroupRows)),
        };
      } catch {
        // Malformed config — fall back to isBreak-only guard (safe)
        log.warn("Could not parse term config for break-guard; falling back to isBreak-only", { configId });
      }
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
      breakGuard,
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
