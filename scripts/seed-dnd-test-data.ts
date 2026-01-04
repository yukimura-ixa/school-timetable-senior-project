/**
 * Seed subject assignments for drag-and-drop testing
 * This adds teacher responsibilities for Semester 2/2567 across all grades
 * 
 * Features:
 * - Comprehensive data for M.1-M.6 grades
 * - Multiple teachers per department
 * - Proper logging with structured output
 * 
 * Run with: npx tsx scripts/seed-dnd-test-data.ts
 */
import { PrismaClient, semester } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createLogger } from "../src/lib/logger";
import "dotenv/config";

const log = createLogger("SeedDnDData");

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ACADEMIC_YEAR = 2567;
const SEMESTER: semester = "SEMESTER_2";

interface SeedStats {
  configCreated: boolean;
  responsibilitiesCreated: number;
  responsibilitiesSkipped: number;
  teachersProcessed: number;
}

/**
 * Ensure table_config exists for the semester
 */
async function ensureTableConfig(): Promise<boolean> {
  const configId = `${SEMESTER === "SEMESTER_1" ? 1 : 2}-${ACADEMIC_YEAR}`;
  
  log.debug("Checking table_config", { configId });
  
  const existingConfig = await prisma.table_config.findUnique({
    where: { ConfigID: configId },
  });

  if (existingConfig) {
    log.info("Table config already exists", { configId, status: existingConfig.status });
    return false;
  }

  await prisma.table_config.create({
    data: {
      ConfigID: configId,
      AcademicYear: ACADEMIC_YEAR,
      Semester: SEMESTER,
      Config: {
        daysOfWeek: ["MON", "TUE", "WED", "THU", "FRI"],
        periodsPerDay: 8,
        startTime: "08:30",
        periodDuration: 50,
        breakDuration: 15,
        hasShortBreak: true,
        shortBreakAfterPeriod: 3,
        shortBreakDuration: 10,
        juniorLunchPeriod: 4,
        seniorLunchPeriod: 5,
      },
      status: "DRAFT",
    },
  });

  log.info("Created table_config", { configId });
  return true;
}

/**
 * Create teacher responsibility if not exists
 */
async function createResponsibility(
  teacherId: number,
  gradeId: string,
  subjectCode: string,
  teachHour: number = 3
): Promise<boolean> {
  const existing = await prisma.teachers_responsibility.findFirst({
    where: {
      TeacherID: teacherId,
      GradeID: gradeId,
      SubjectCode: subjectCode,
      AcademicYear: ACADEMIC_YEAR,
      Semester: SEMESTER,
    },
  });

  if (existing) {
    log.debug("Responsibility exists", { teacherId, gradeId, subjectCode });
    return false;
  }

  // Ensure teachHour is a valid number
  const validTeachHour = Number.isNaN(teachHour) || teachHour <= 0 ? 3 : teachHour;

  await prisma.teachers_responsibility.create({
    data: {
      teacher: { connect: { TeacherID: teacherId } },
      gradelevel: { connect: { GradeID: gradeId } },
      subject: { connect: { SubjectCode: subjectCode } },
      AcademicYear: ACADEMIC_YEAR,
      Semester: SEMESTER,
      TeachHour: validTeachHour,
    },
  });

  log.debug("Created responsibility", { teacherId, gradeId, subjectCode, teachHour: validTeachHour });
  return true;
}

/**
 * Seed data for a specific department and grade level
 */
async function seedDepartmentGrade(
  department: string,
  subjectPrefix: string,
  gradePrefix: string,
  gradeSections: string[],
  stats: SeedStats
): Promise<void> {
  const teachers = await prisma.teacher.findMany({
    where: { Department: department },
    orderBy: { TeacherID: "asc" },
    take: 3, // Up to 3 teachers per department
  });

  if (teachers.length === 0) {
    log.warn("No teachers found for department", { department });
    return;
  }

  const subjects = await prisma.subject.findMany({
    where: {
      SubjectCode: { startsWith: subjectPrefix },
    },
    take: 4, // Up to 4 subjects per grade level
  });

  if (subjects.length === 0) {
    log.warn("No subjects found", { subjectPrefix });
    return;
  }

  const grades = await prisma.gradelevel.findMany({
    where: { GradeID: { in: gradeSections } },
  });

  if (grades.length === 0) {
    log.warn("No grades found", { gradeSections });
    return;
  }

  log.info("Processing department", {
    department,
    teacherCount: teachers.length,
    subjectCount: subjects.length,
    gradeCount: grades.length,
  });

  // Distribute subjects among teachers
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const teacher = teachers[i % teachers.length]; // Round-robin assignment

    for (const grade of grades) {
      // Calculate teach hours from credit (default 3 if invalid)
      const creditValue = subject.Credit ? parseFloat(String(subject.Credit)) : 1.5;
      const teachHour = Math.ceil(creditValue * 2) || 3;

      const created = await createResponsibility(
        teacher.TeacherID,
        grade.GradeID,
        subject.SubjectCode,
        teachHour
      );

      if (created) {
        stats.responsibilitiesCreated++;
      } else {
        stats.responsibilitiesSkipped++;
      }
    }
    stats.teachersProcessed++;
  }
}

/**
 * Main seeding function
 */
async function main() {
  log.info("Starting DnD test data seed", { 
    academicYear: ACADEMIC_YEAR, 
    semester: SEMESTER 
  });

  const stats: SeedStats = {
    configCreated: false,
    responsibilitiesCreated: 0,
    responsibilitiesSkipped: 0,
    teachersProcessed: 0,
  };

  // Step 1: Ensure table config exists
  stats.configCreated = await ensureTableConfig();

  // Step 2: Define grade level configurations
  const gradeConfigs = [
    // M.1 (ม.1)
    { prefix: "ค21", gradePrefix: "M1", sections: ["M1-1", "M1-2", "M1-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท21", gradePrefix: "M1", sections: ["M1-1", "M1-2", "M1-3"], dept: "ภาษาไทย" },
    { prefix: "ว21", gradePrefix: "M1", sections: ["M1-1", "M1-2", "M1-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส21", gradePrefix: "M1", sections: ["M1-1", "M1-2", "M1-3"], dept: "สังคมศึกษา" },
    { prefix: "อ21", gradePrefix: "M1", sections: ["M1-1", "M1-2", "M1-3"], dept: "ภาษาต่างประเทศ" },
    
    // M.2 (ม.2)
    { prefix: "ค22", gradePrefix: "M2", sections: ["M2-1", "M2-2", "M2-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท22", gradePrefix: "M2", sections: ["M2-1", "M2-2", "M2-3"], dept: "ภาษาไทย" },
    { prefix: "ว22", gradePrefix: "M2", sections: ["M2-1", "M2-2", "M2-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส22", gradePrefix: "M2", sections: ["M2-1", "M2-2", "M2-3"], dept: "สังคมศึกษา" },
    { prefix: "อ22", gradePrefix: "M2", sections: ["M2-1", "M2-2", "M2-3"], dept: "ภาษาต่างประเทศ" },
    
    // M.3 (ม.3)
    { prefix: "ค23", gradePrefix: "M3", sections: ["M3-1", "M3-2", "M3-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท23", gradePrefix: "M3", sections: ["M3-1", "M3-2", "M3-3"], dept: "ภาษาไทย" },
    { prefix: "ว23", gradePrefix: "M3", sections: ["M3-1", "M3-2", "M3-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส23", gradePrefix: "M3", sections: ["M3-1", "M3-2", "M3-3"], dept: "สังคมศึกษา" },
    { prefix: "อ23", gradePrefix: "M3", sections: ["M3-1", "M3-2", "M3-3"], dept: "ภาษาต่างประเทศ" },

    // M.4 (ม.4)
    { prefix: "ค31", gradePrefix: "M4", sections: ["M4-1", "M4-2", "M4-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท31", gradePrefix: "M4", sections: ["M4-1", "M4-2", "M4-3"], dept: "ภาษาไทย" },
    { prefix: "ว31", gradePrefix: "M4", sections: ["M4-1", "M4-2", "M4-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส31", gradePrefix: "M4", sections: ["M4-1", "M4-2", "M4-3"], dept: "สังคมศึกษา" },
    { prefix: "อ31", gradePrefix: "M4", sections: ["M4-1", "M4-2", "M4-3"], dept: "ภาษาต่างประเทศ" },

    // M.5 (ม.5)
    { prefix: "ค32", gradePrefix: "M5", sections: ["M5-1", "M5-2", "M5-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท32", gradePrefix: "M5", sections: ["M5-1", "M5-2", "M5-3"], dept: "ภาษาไทย" },
    { prefix: "ว32", gradePrefix: "M5", sections: ["M5-1", "M5-2", "M5-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส32", gradePrefix: "M5", sections: ["M5-1", "M5-2", "M5-3"], dept: "สังคมศึกษา" },
    { prefix: "อ32", gradePrefix: "M5", sections: ["M5-1", "M5-2", "M5-3"], dept: "ภาษาต่างประเทศ" },

    // M.6 (ม.6)
    { prefix: "ค33", gradePrefix: "M6", sections: ["M6-1", "M6-2", "M6-3"], dept: "คณิตศาสตร์" },
    { prefix: "ท33", gradePrefix: "M6", sections: ["M6-1", "M6-2", "M6-3"], dept: "ภาษาไทย" },
    { prefix: "ว33", gradePrefix: "M6", sections: ["M6-1", "M6-2", "M6-3"], dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { prefix: "ส33", gradePrefix: "M6", sections: ["M6-1", "M6-2", "M6-3"], dept: "สังคมศึกษา" },
    { prefix: "อ33", gradePrefix: "M6", sections: ["M6-1", "M6-2", "M6-3"], dept: "ภาษาต่างประเทศ" },
  ];

  // Step 3: Process each grade configuration
  for (const config of gradeConfigs) {
    await seedDepartmentGrade(
      config.dept,
      config.prefix,
      config.gradePrefix,
      config.sections,
      stats
    );
  }

  // Step 4: Add additional departments (Arts, PE, Work/Tech)
  const additionalDepts = [
    { prefix: "ศ21", sections: ["M1-1", "M1-2", "M1-3"], dept: "ศิลปะ" },
    { prefix: "พ21", sections: ["M1-1", "M1-2", "M1-3"], dept: "สุขศึกษาและพลศึกษา" },
    { prefix: "ง21", sections: ["M1-1", "M1-2", "M1-3"], dept: "การงานอาชีพ" },
  ];

  for (const config of additionalDepts) {
    await seedDepartmentGrade(
      config.dept,
      config.prefix,
      "M1",
      config.sections,
      stats
    );
  }

  // Step 5: Verify final count
  const totalResponsibilities = await prisma.teachers_responsibility.count({
    where: {
      AcademicYear: ACADEMIC_YEAR,
      Semester: SEMESTER,
    },
  });

  log.info("Seed completed", {
    configCreated: stats.configCreated,
    responsibilitiesCreated: stats.responsibilitiesCreated,
    responsibilitiesSkipped: stats.responsibilitiesSkipped,
    teachersProcessed: stats.teachersProcessed,
    totalResponsibilities,
  });

  // Summary output
  console.log("\n" + "=".repeat(60));
  console.log("📊 SEED SUMMARY");
  console.log("=".repeat(60));
  console.log(`📅 Academic Year: ${ACADEMIC_YEAR}`);
  console.log(`📆 Semester: ${SEMESTER === "SEMESTER_1" ? "1" : "2"}`);
  console.log(`✅ Responsibilities created: ${stats.responsibilitiesCreated}`);
  console.log(`⏭️  Responsibilities skipped: ${stats.responsibilitiesSkipped}`);
  console.log(`👨‍🏫 Teachers processed: ${stats.teachersProcessed}`);
  console.log(`📊 Total in database: ${totalResponsibilities}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .catch((error) => {
    log.logError(error, { phase: "main" });
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
