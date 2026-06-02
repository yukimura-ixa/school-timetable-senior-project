/**
 * Validate Drop Server Action
 *
 * Server Action for validating drag-and-drop schedule placement.
 * Replaces the raw fetch call to /api/schedule/validate-drop.
 */

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { isBreakForGrade, buildGradeGroupIndex } from "@/utils/break-utils";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import { breakGroupRepository } from "@/features/timeslot/infrastructure/repositories/break-group.repository";
import { toBreakGroups } from "@/features/timeslot/domain/services/break-context";

const log = createLogger("ValidateDropAction");

export type ValidateDropInput = {
  timeslot: string;
  subject: string;
  grade: string;
  teacher: string;
};

type Room = {
  RoomID: number;
  RoomName: string;
  Building: string;
  Floor: string;
};

export type ValidateDropResult =
  | {
      allowed: true;
      rooms: {
        available: Room[];
        occupied: Room[];
      };
    }
  | {
      allowed: false;
      reason: string;
      message: string;
      conflict?: {
        teacherName?: string;
        subjectName?: string;
        gradeName?: string;
        year?: number;
        number?: number;
      };
    };

/**
 * Validate drop placement for drag-and-drop scheduling
 *
 * Consolidated validation that checks:
 * 1. Timeslot is not a break period
 * 2. Timeslot is not locked
 * 3. Teacher has no conflicting schedule
 * 4. Grade/class has no conflicting schedule
 * 5. Fetches available rooms
 */
export async function validateDropAction(
  input: ValidateDropInput,
): Promise<ValidateDropResult> {
  try {
    log.debug("Validate drop request", { input });

    // ── Auth ──
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        allowed: false,
        reason: "unauthorized",
        message: "กรุณาเข้าสู่ระบบ",
      };
    }

    const role = normalizeAppRole(session.user?.role);
    if (!isAdminRole(role)) {
      return {
        allowed: false,
        reason: "forbidden",
        message: "ไม่มีสิทธิ์เข้าถึง",
      };
    }

    // ── Validate Input ──
    const { timeslot, subject, grade, teacher } = input;

    if (!timeslot || !subject || !grade || !teacher) {
      return {
        allowed: false,
        reason: "missing_parameters",
        message: "ข้อมูลไม่ครบถ้วน",
      };
    }

    const teacherId = parseInt(teacher);

    // ── Parallel Validation ──
    const [
      timeslotData,
      teacherConflict,
      gradeConflict,
      allRooms,
      occupiedRoomSchedules,
    ] = await Promise.all([
      // 1. Check timeslot properties
      prisma.timeslot.findUnique({
        where: { TimeslotID: timeslot },
      }),

      // 2. Check teacher conflict
      prisma.class_schedule.findFirst({
        where: {
          TimeslotID: timeslot,
          teachers_responsibility: {
            some: {
              TeacherID: teacherId,
            },
          },
        },
        include: {
          subject: {
            select: { SubjectName: true },
          },
          gradelevel: {
            select: { Year: true, Number: true },
          },
          teachers_responsibility: {
            select: {
              TeacherID: true,
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

      // 4. Fetch all rooms
      prisma.room.findMany({
        orderBy: [{ Building: "asc" }, { Floor: "asc" }, { RoomName: "asc" }],
        select: {
          RoomID: true,
          RoomName: true,
          Building: true,
          Floor: true,
        },
      }),

      // 5. Fetch occupied rooms for this timeslot
      prisma.class_schedule.findMany({
        where: { TimeslotID: timeslot },
        select: { RoomID: true },
        distinct: ["RoomID"],
      }),
    ]);

    // ── Validation Logic (in order of severity) ──

    // Check 1: Timeslot doesn't exist
    if (!timeslotData) {
      return {
        allowed: false,
        reason: "invalid_timeslot",
        message: "ไม่พบช่วงเวลาที่เลือก",
      };
    }

    // Check 2: Break timeslot (universal — Breaktime field)
    if (timeslotData.Breaktime && timeslotData.Breaktime !== "NOT_BREAK") {
      return {
        allowed: false,
        reason: "break_timeslot",
        message: "⏸️ ไม่สามารถจัดวิชาเรียนในคาบพักได้",
      };
    }

    // Check 2b: Per-grade staggered break (Phase 2A)
    // A slot may look like a normal teaching slot globally but be a break
    // for a specific grade group (e.g. junior lunch at period 4).
    {
      const periodMatch = timeslot.match(/(\d+)$/);
      const slotNumber = periodMatch?.[1] ? parseInt(periodMatch[1]) : 0;
      const semesterStr = timeslotData.Semester === "SEMESTER_1" ? "1" : "2";
      const configId = `${semesterStr}-${timeslotData.AcademicYear}`;

      try {
        const [configRow, breakGroupRows] = await Promise.all([
          prisma.table_config.findUnique({ where: { ConfigID: configId } }),
          breakGroupRepository.findByConfigId(configId),
        ]);

        if (configRow?.Config && slotNumber > 0) {
          const configData = parseConfigData(configRow.Config);
          const gradeBreakIndex = buildGradeGroupIndex(toBreakGroups(breakGroupRows));
          if (isBreakForGrade(slotNumber, grade, configData.slots, gradeBreakIndex)) {
            return {
              allowed: false,
              reason: "break_timeslot",
              message: "⏸️ ไม่สามารถจัดวิชาเรียนในคาบพักได้",
            };
          }
        }
      } catch {
        // Config load failed — skip per-grade check, let other guards run
        log.warn("Could not load config for per-grade break check", { configId, timeslot });
      }
    }

    // Check 4: Teacher conflict
    if (teacherConflict) {
      const responsibility = teacherConflict.teachers_responsibility.find(
        (r) => r.TeacherID === teacherId,
      );

      const teacher = responsibility?.teacher;

      if (teacher) {
        const teacherName = `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`;
        const subjectName = teacherConflict.subject.SubjectName;
        const gradeName = `M.${teacherConflict.gradelevel.Year}/${teacherConflict.gradelevel.Number}`;

        return {
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
        };
      }
    }

    // Check 5: Grade conflict
    if (gradeConflict) {
      return {
        allowed: false,
        reason: "grade_conflict",
        message: `⚠️ ชั้นเรียนนี้มีวิชา "${gradeConflict.subject.SubjectName}" ในช่วงเวลานี้แล้ว`,
      };
    }

    // ── Success: Calculate available and occupied rooms ──
    const occupiedIds = new Set(occupiedRoomSchedules.map((s) => s.RoomID));
    const available = allRooms.filter((room) => !occupiedIds.has(room.RoomID));
    const occupied = allRooms.filter((room) => occupiedIds.has(room.RoomID));

    log.info("Validation passed", {
      timeslot,
      subject,
      grade,
      teacher,
      availableRooms: available.length,
    });

    return {
      allowed: true,
      rooms: {
        available,
        occupied,
      },
    };
  } catch (error) {
    log.logError(error, { action: "validateDropAction", input });
    return {
      allowed: false,
      reason: "server_error",
      message: "เกิดข้อผิดพลาดในการตรวจสอบ",
    };
  }
}
