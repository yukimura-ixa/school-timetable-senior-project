/**
 * Auto-Arrange Solver
 *
 * Greedy placement with backtracking + soft-constraint scoring.
 * This is a PURE FUNCTION — no database access, no side effects.
 * All data is passed in via SolverInput, results returned via SolverResult.
 *
 * Algorithm:
 * 1. Expand subjects into individual period-slots (e.g., 3 credits → 3 items)
 * 2. Sort by "most constrained first" (fewest valid timeslots)
 * 3. For each item, try all valid timeslots, score by soft constraints, pick best
 * 4. If no valid slot: record failure and continue (no hard backtracking in MVP)
 * 5. Return all placements + failures + stats
 */

import {
  checkAllHardConstraints,
  checkRoomConflict,
  scoreSoftConstraints,
} from "./constraints";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  Placement,
  PlacementFailure,
  SolverInput,
  SolverResult,
  SolverStats,
  UnplacedSubject,
} from "./types";

/** Maximum solver runtime in milliseconds */
const SOLVER_TIMEOUT_MS = 10_000;

/**
 * A single "placement job" — one period of one subject that needs a slot.
 * If a subject needs 3 periods/week, it becomes 3 PlacementJobs.
 */
interface PlacementJob {
  respId: number;
  subjectCode: string;
  subjectName: string;
  gradeId: string;
  gradeName: string;
  /** Index within this subject's periods (0-based) */
  periodIndex: number;
}

/**
 * Main solver entry point.
 *
 * @param input - All data needed for scheduling (no DB access)
 * @returns Placements, failures, and performance stats
 */
export function solve(input: SolverInput): SolverResult {
  const startTime = Date.now();

  // ── Step 1: Expand subjects into individual period jobs ──
  const jobs = expandToJobs(input.unplacedSubjects);

  // ── Step 2: Filter usable timeslots (non-break only) ──
  const usableTimeslots = input.timeslots.filter((t) => !t.isBreak);

  // ── Step 3: Pre-compute "difficulty" for each job ──
  // Count how many valid timeslots each subject-grade combo has.
  // Most constrained (fewest options) should be placed first.
  const jobsWithDifficulty = jobs.map((job) => {
    const validCount = countValidTimeslots(
      job,
      input.teacherId,
      usableTimeslots,
      input.existingSchedules,
      [], // no pending placements yet for counting
    );
    return { job, validCount };
  });

  // Sort: fewest valid slots first (most constrained first)
  jobsWithDifficulty.sort((a, b) => a.validCount - b.validCount);

  // ── Step 4: Greedy placement loop ──
  const placements: Placement[] = [];
  const failures: PlacementFailure[] = [];

  for (const { job } of jobsWithDifficulty) {
    // Check timeout
    if (Date.now() - startTime > SOLVER_TIMEOUT_MS) {
      failures.push({
        respId: job.respId,
        subjectCode: job.subjectCode,
        gradeId: job.gradeId,
        reason: "หมดเวลาในการจัดตาราง (เกิน 10 วินาที)",
      });
      continue;
    }

    const bestPlacement = findBestPlacement(
      job,
      input.teacherId,
      usableTimeslots,
      input.existingSchedules,
      placements,
      input.rooms,
    );

    if (bestPlacement) {
      placements.push(bestPlacement);
    } else {
      failures.push({
        respId: job.respId,
        subjectCode: job.subjectCode,
        gradeId: job.gradeId,
        reason: `ไม่สามารถหาช่วงเวลาที่ว่างสำหรับ ${job.subjectName} (${job.gradeName}) คาบที่ ${job.periodIndex + 1}`,
      });
    }
  }

  // ── Step 5: Compute stats ──
  const durationMs = Date.now() - startTime;
  const qualityScore = computeQualityScore(
    placements,
    input.existingSchedules,
    usableTimeslots,
  );

  const stats: SolverStats = {
    totalSubjectsToPlace: jobs.length,
    successfullyPlaced: placements.length,
    failed: failures.length,
    durationMs,
    qualityScore,
  };

  return {
    success: failures.length === 0,
    placements,
    failures,
    stats,
  };
}

// ─── Internal Helpers ────────────────────────────────────────────

/**
 * Expand each UnplacedSubject into N PlacementJobs based on remaining periods.
 */
function expandToJobs(subjects: UnplacedSubject[]): PlacementJob[] {
  const jobs: PlacementJob[] = [];

  for (const subject of subjects) {
    const remaining = subject.periodsPerWeek - subject.periodsAlreadyPlaced;
    for (let i = 0; i < remaining; i++) {
      jobs.push({
        respId: subject.respId,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        gradeId: subject.gradeId,
        gradeName: subject.gradeName,
        periodIndex: subject.periodsAlreadyPlaced + i,
      });
    }
  }

  return jobs;
}

/**
 * Count how many timeslots are valid for a given job (used for difficulty sorting).
 */
function countValidTimeslots(
  job: PlacementJob,
  teacherId: number,
  timeslots: AvailableTimeslot[],
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): number {
  let count = 0;
  for (const ts of timeslots) {
    const violation = checkAllHardConstraints(
      teacherId,
      job.gradeId,
      0, // dummy room for counting
      ts,
      existingSchedules,
      pendingPlacements,
    );
    // Skip teacher, grade conflicts. Room conflicts are ignored here (roomId=0 is dummy)
    if (!violation || violation.type === "ROOM_CONFLICT") {
      count++;
    }
  }
  return count;
}

/**
 * Find the best valid timeslot + room for a job.
 * Tries all timeslots, scores by soft constraints, returns the best option.
 */
function findBestPlacement(
  job: PlacementJob,
  teacherId: number,
  timeslots: AvailableTimeslot[],
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
  rooms: AvailableRoom[],
): Placement | null {
  let bestPlacement: Placement | null = null;
  let bestScore = -Infinity;

  for (const ts of timeslots) {
    // Quick-check teacher and grade constraints (skip room for now)
    const baseViolation = checkAllHardConstraints(
      teacherId,
      job.gradeId,
      0, // will check room separately below
      ts,
      existingSchedules,
      pendingPlacements,
    );

    // If there's a non-room violation, skip this timeslot
    if (baseViolation && baseViolation.type !== "ROOM_CONFLICT") {
      continue;
    }

    // Find the first available room for this timeslot
    const availableRoom = findAvailableRoom(
      ts.timeslotId,
      rooms,
      existingSchedules,
      pendingPlacements,
    );

    if (!availableRoom) {
      continue; // No rooms available at this time
    }

    // Score soft constraints
    const score = scoreSoftConstraints(
      ts,
      job.subjectCode,
      job.gradeId,
      pendingPlacements,
      existingSchedules,
    );

    if (score > bestScore) {
      bestScore = score;
      bestPlacement = {
        respId: job.respId,
        subjectCode: job.subjectCode,
        gradeId: job.gradeId,
        timeslotId: ts.timeslotId,
        roomId: availableRoom.roomId,
      };
    }
  }

  return bestPlacement;
}

/**
 * Find the first room not occupied at a given timeslot.
 */
function findAvailableRoom(
  timeslotId: string,
  rooms: AvailableRoom[],
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): AvailableRoom | null {
  for (const room of rooms) {
    const conflict = checkRoomConflict(
      room.roomId,
      timeslotId,
      existingSchedules,
      pendingPlacements,
    );
    if (!conflict) {
      return room;
    }
  }
  return null;
}

/**
 * Compute overall quality score (0-100) for the full set of placements.
 */
function computeQualityScore(
  placements: Placement[],
  existingSchedules: ExistingSchedule[],
  timeslots: AvailableTimeslot[],
): number {
  if (placements.length === 0) return 0;

  // Simple average of individual soft scores
  const timeslotMap = new Map(timeslots.map((t) => [t.timeslotId, t]));
  let totalScore = 0;

  for (const p of placements) {
    const ts = timeslotMap.get(p.timeslotId);
    if (ts) {
      totalScore += scoreSoftConstraints(
        ts,
        p.subjectCode,
        p.gradeId,
        placements.filter((x) => x !== p), // exclude self
        existingSchedules,
      );
    }
  }

  return Math.round(totalScore / placements.length);
}
