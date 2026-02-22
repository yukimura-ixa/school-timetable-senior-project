/* eslint-disable no-console */
import { describe, it, expect, vi, beforeAll } from "vitest";

const hasDatabase = Boolean(process.env.DATABASE_URL);

let complianceRepository!: typeof import("./compliance.repository").complianceRepository;
let prisma!: typeof import("@/lib/prisma").default;

/**
 * Integration Tests for Compliance Repository
 * Runs against the local test database defined in .env.test.local
 *
 * @vitest-environment node
 */
describe.skipIf(!hasDatabase)("Compliance Repository Integration", () => {
  const TEST_CONFIG_ID = "1-2568";

  // These should match the IDs created by scripts/seed-compliance.ts
  const TEST_PROGRAM_CODE = "COMP-P1";
  const MANDATORY_SUBJECT_CODE = "ค21101";

  beforeAll(async () => {
    // Unmock prisma for integration tests only when DATABASE_URL is available.
    vi.unmock("@/lib/prisma");
    prisma = (await import("@/lib/prisma")).default;
    complianceRepository = (await import("./compliance.repository"))
      .complianceRepository;
  });

  it("should connect to the database", async () => {
    // Debug info
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL?.replace(/:[^:]+@/, ":***@"),
    );

    const count = await prisma.program.count();
    console.log("Program count:", count);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should fetch program compliance data for a semester", async () => {
    const results =
      await complianceRepository.getProgramCompliance(TEST_CONFIG_ID);
    console.log("Compliance results count:", results.length);

    expect(results.length).toBeGreaterThan(0);
    const testProgram = results.find(
      (r) => r.programCode === TEST_PROGRAM_CODE,
    );
    expect(testProgram).toBeDefined();
    expect(testProgram?.year).toBe(2568);
  });

  it("should identify missing mandatory subjects", async () => {
    const results =
      await complianceRepository.getProgramCompliance(TEST_CONFIG_ID);
    const testProgram = results.find(
      (r) => r.programCode === TEST_PROGRAM_CODE,
    );

    const missing = testProgram?.missingMandatorySubjects.find(
      (s) => s.subjectCode === MANDATORY_SUBJECT_CODE,
    );

    expect(missing).toBeDefined();
    expect(missing?.reason).toBe("ยังไม่ได้จัดในตาราง");
  });

  it("should calculate scheduled credits correctly when subjects are scheduled", async () => {
    // 1. Find the test grade level for this program
    const grade = await prisma.gradelevel.findFirst({
      where: {
        program: {
          ProgramCode: TEST_PROGRAM_CODE,
        },
      },
    });

    const targetGradeId = grade?.GradeID || "G-COMP-M1";
    console.log("Target Grade ID:", targetGradeId);

    // 2. Find a timeslot for this semester
    const timeslot = await prisma.timeslot.findFirst({
      where: {
        AcademicYear: 2568,
        Semester: "SEMESTER_1",
      },
    });

    const timeslotId = timeslot?.TimeslotID;
    if (!timeslotId) throw new Error("No timeslot found for test");
    console.log("Using Timeslot ID:", timeslotId);

    // 3. Schedule the mandatory subject
    // Note: class_schedule uses TimeslotID_GradeID unique constraint in prisma internally
    // If it fails, fallback to findUnique then create/update
    try {
      await prisma.class_schedule.upsert({
        where: {
          TimeslotID_GradeID: {
            TimeslotID: timeslotId,
            GradeID: targetGradeId,
          },
        } as any,
        update: {
          SubjectCode: MANDATORY_SUBJECT_CODE,
        },
        create: {
          TimeslotID: timeslotId,
          GradeID: targetGradeId,
          SubjectCode: MANDATORY_SUBJECT_CODE,
        },
      });
    } catch (e) {
      console.log("Upsert failed, trying manual check/create", e);
      const existing = await prisma.class_schedule.findFirst({
        where: { TimeslotID: timeslotId, GradeID: targetGradeId },
      });
      if (existing) {
        await prisma.class_schedule.update({
          where: { ClassID: existing.ClassID },
          data: { SubjectCode: MANDATORY_SUBJECT_CODE },
        });
      } else {
        await prisma.class_schedule.create({
          data: {
            TimeslotID: timeslotId,
            GradeID: targetGradeId,
            SubjectCode: MANDATORY_SUBJECT_CODE,
          },
        });
      }
    }

    // 4. Check compliance again
    const results =
      await complianceRepository.getProgramCompliance(TEST_CONFIG_ID);
    const testProgram = results.find(
      (r) => r.programCode === TEST_PROGRAM_CODE,
    );

    // Subject should no longer be missing
    const missing = testProgram?.missingMandatorySubjects.find(
      (s) => s.subjectCode === MANDATORY_SUBJECT_CODE,
    );
    expect(missing).toBeUndefined();

    // Credits should be updated (ค21101 is CORE)
    expect(testProgram?.scheduledCredits.core).toBeGreaterThan(0);
    expect(testProgram?.complianceRate).toBeGreaterThan(0);
  });
});
