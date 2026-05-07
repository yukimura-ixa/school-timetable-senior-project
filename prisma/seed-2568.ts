/**
 * Seed data for semester 1/2568
 * Creates initial data as if admin is using the app for the first time
 */

import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const isAccelerate = connectionString.startsWith("prisma+");

// Create PrismaClient conditionally
let prisma: PrismaClient;

if (isAccelerate) {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    accelerateUrl: connectionString,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
} else {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    adapter,
  });
}

async function main() {
  console.log("🌱 Seeding semester 1/2568...");

  // 1. Create or get existing programs
  console.log("📚 Creating programs...");
  
  // Find or create program 1
  let program1 = await prisma.program.findFirst({
    where: { Year: 7, Track: "GENERAL" },
  });
  
  if (!program1) {
    program1 = await prisma.program.create({
      data: {
        ProgramCode: "GENERAL-M1",
        ProgramName: "หลักสูตรแกนกลาง ม.ต้น",
        Year: 7,
        Track: "GENERAL",
        Description: "หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน ม.ต้น",
        MinTotalCredits: 40,
        IsActive: true,
      },
    });
  }

  // Find or create program 2
  let program2 = await prisma.program.findFirst({
    where: { Year: 10, Track: "SCIENCE_MATH" },
  });
  
  if (!program2) {
    program2 = await prisma.program.create({
      data: {
        ProgramCode: "SCIENCE_MATH-M4",
        ProgramName: "หลักสูตรแกนกลาง ม.ปลาย วิทย์-คณิต",
        Year: 10,
        Track: "SCIENCE_MATH",
        Description:
          "หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน ม.ปลาย แผนการเรียนวิทย์-คณิต",
        MinTotalCredits: 60,
        IsActive: true,
      },
    });
  }

  // 2. Create teachers
  console.log("👨‍🏫 Creating teachers...");
  const teachers = await Promise.all([
    prisma.teacher.upsert({
      where: { Email: "somchai.jaidi@school.local" },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "สมชาย",
        Lastname: "ใจดี",
        Department: "คณิตศาสตร์",
        Email: "somchai.jaidi@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "somying.rakrian@school.local" },
      update: {},
      create: {
        Prefix: "นาง",
        Firstname: "สมหญิง",
        Lastname: "รักเรียน",
        Department: "วิทยาศาสตร์",
        Email: "somying.rakrian@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "wichai.sondee@school.local" },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "วิชัย",
        Lastname: "สอนดี",
        Department: "ภาษาไทย",
        Email: "wichai.sondee@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "malee.sukchai@school.local" },
      update: {},
      create: {
        Prefix: "นาง",
        Firstname: "มาลี",
        Lastname: "สุขใจ",
        Department: "ภาษาอังกฤษ",
        Email: "malee.sukchai@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "preecha.meekhamsuk@school.local" },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "ปรีชา",
        Lastname: "มีความสุข",
        Department: "สังคมศึกษา",
        Email: "preecha.meekhamsuk@school.local",
        Role: "teacher",
      },
    }),
  ]);

  // 3. Create rooms
  console.log("🏫 Creating rooms...");
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { RoomName: "ห้องเรียน 101" },
      update: {},
      create: {
        RoomName: "ห้องเรียน 101",
        Building: "ตึก 1",
        Floor: "1",
      },
    }),
    prisma.room.upsert({
      where: { RoomName: "ห้องเรียน 102" },
      update: {},
      create: {
        RoomName: "ห้องเรียน 102",
        Building: "ตึก 1",
        Floor: "1",
      },
    }),
    prisma.room.upsert({
      where: { RoomName: "ห้องเรียน 103" },
      update: {},
      create: {
        RoomName: "ห้องเรียน 103",
        Building: "ตึก 1",
        Floor: "1",
      },
    }),
    prisma.room.upsert({
      where: { RoomName: "ห้องปฏิบัติการวิทยาศาสตร์" },
      update: {},
      create: {
        RoomName: "ห้องปฏิบัติการวิทยาศาสตร์",
        Building: "ตึก 2",
        Floor: "2",
      },
    }),
    prisma.room.upsert({
      where: { RoomName: "ห้องเรียน 202" },
      update: {},
      create: {
        RoomName: "ห้องเรียน 202",
        Building: "ตึก 2",
        Floor: "2",
      },
    }),
  ]);

  // 4. Create subjects (following Thai MOE curriculum)
  console.log("📖 Creating subjects...");
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { SubjectCode: "ท21101" },
      update: {},
      create: {
        SubjectCode: "ท21101",
        SubjectName: "ภาษาไทย ม.1",
        Credit: "CREDIT_15",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "ค21101" },
      update: {},
      create: {
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์ ม.1",
        Credit: "CREDIT_15",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "ว21101" },
      update: {},
      create: {
        SubjectCode: "ว21101",
        SubjectName: "วิทยาศาสตร์ ม.1",
        Credit: "CREDIT_20",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "อ21101" },
      update: {},
      create: {
        SubjectCode: "อ21101",
        SubjectName: "ภาษาอังกฤษ ม.1",
        Credit: "CREDIT_15",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "ส21101" },
      update: {},
      create: {
        SubjectCode: "ส21101",
        SubjectName: "สังคมศึกษา ม.1",
        Credit: "CREDIT_10",
        Category: "CORE",
      },
    }),
  ]);

  // 5. Create grade levels
  console.log("🎓 Creating grade levels...");
  const grades = await Promise.all([
    prisma.gradelevel.upsert({
      where: { GradeID: "7-1-2568" },
      update: {},
      create: {
        GradeID: "7-1-2568",
        Year: 7,
        Number: 1,
        StudentCount: 35,
        ProgramID: program1.ProgramID,
      },
    }),
    prisma.gradelevel.upsert({
      where: { GradeID: "7-2-2568" },
      update: {},
      create: {
        GradeID: "7-2-2568",
        Year: 7,
        Number: 2,
        StudentCount: 33,
        ProgramID: program1.ProgramID,
      },
    }),
    prisma.gradelevel.upsert({
      where: { GradeID: "7-3-2568" },
      update: {},
      create: {
        GradeID: "7-3-2568",
        Year: 7,
        Number: 3,
        StudentCount: 34,
        ProgramID: program1.ProgramID,
      },
    }),
    prisma.gradelevel.upsert({
      where: { GradeID: "10-1-2568" },
      update: {},
      create: {
        GradeID: "10-1-2568",
        Year: 10,
        Number: 1,
        StudentCount: 30,
        ProgramID: program2.ProgramID,
      },
    }),
  ]);

  // 6. Create timeslots for semester 1, academic year 2568
  console.log("⏰ Creating timeslots...");
  const days: ("MON" | "TUE" | "WED" | "THU" | "FRI")[] = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ];
  const periods = [
    { start: "08:00:00", end: "08:50:00", break: "NOT_BREAK" as const },
    { start: "08:50:00", end: "09:40:00", break: "NOT_BREAK" as const },
    { start: "09:50:00", end: "10:40:00", break: "NOT_BREAK" as const }, // 10 min break after period 3
    { start: "10:40:00", end: "10:55:00", break: "BREAK_JUNIOR" as const },
    { start: "10:55:00", end: "11:10:00", break: "BREAK_SENIOR" as const },
    { start: "11:10:00", end: "12:00:00", break: "NOT_BREAK" as const },
    { start: "12:00:00", end: "12:50:00", break: "NOT_BREAK" as const },
    { start: "12:50:00", end: "13:40:00", break: "NOT_BREAK" as const },
  ];

  for (const day of days) {
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const periodNumber = i + 1; // Periods 1-8
      const timeslotID = `1-2568-${day}${periodNumber}`; // Format: 1-2568-MON1

      await prisma.timeslot.upsert({
        where: { TimeslotID: timeslotID },
        update: {},
        create: {
          TimeslotID: timeslotID,
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          StartTime: new Date(`2025-01-01T${period.start}`),
          EndTime: new Date(`2025-01-01T${period.end}`),
          Breaktime: period.break,
          DayOfWeek: day,
        },
      });
    }
  }

  // 7. Assign teachers to subjects (teacher responsibilities)
  console.log("📝 Creating teacher responsibilities...");
  const responsibilities = [
    {
      TeacherID: teachers[0].TeacherID,
      SubjectCode: "ค21101",
      GradeID: "7-1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[0].TeacherID,
      SubjectCode: "ค21101",
      GradeID: "7-2-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[1].TeacherID,
      SubjectCode: "ว21101",
      GradeID: "7-1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 5,
    },
    {
      TeacherID: teachers[1].TeacherID,
      SubjectCode: "ว21101",
      GradeID: "7-2-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 5,
    },
    {
      TeacherID: teachers[2].TeacherID,
      SubjectCode: "ท21101",
      GradeID: "7-1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[2].TeacherID,
      SubjectCode: "ท21101",
      GradeID: "7-3-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[3].TeacherID,
      SubjectCode: "อ21101",
      GradeID: "7-1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[3].TeacherID,
      SubjectCode: "อ21101",
      GradeID: "7-2-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 4,
    },
    {
      TeacherID: teachers[4].TeacherID,
      SubjectCode: "ส21101",
      GradeID: "7-1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 3,
    },
    {
      TeacherID: teachers[4].TeacherID,
      SubjectCode: "ส21101",
      GradeID: "7-3-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1" as const,
      TeachHour: 3,
    },
  ];

  for (let i = 0; i < responsibilities.length; i++) {
    await prisma.teachers_responsibility.upsert({
      where: { RespID: 100 + i }, // Start from 100 to avoid conflicts
      update: {},
      create: {
        RespID: 100 + i,
        ...responsibilities[i],
      },
    });
  }

  // 8. Create table configuration and break groups
  console.log("⚙️ Creating table configuration...");
  const configID = "1-2568";
  
  const baseConfig = {
    periodsPerDay: 8,
    startTime: "08:00",
    periodDuration: 50,
    schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
    breakDefinitions: [
      {
        id: "mini_break",
        label: "พักสาย",
        slotNumber: 3,
        duration: 10,
        color: "#d1d5db",
        groups: ["*"],
      },
      {
        id: "junior_break",
        label: "พักกลางวัน (ม.ต้น)",
        slotNumber: 4,
        duration: 50,
        color: "#fca5a5",
        groups: ["junior"],
      },
      {
        id: "senior_break",
        label: "พักกลางวัน (ม.ปลาย)",
        slotNumber: 5,
        duration: 50,
        color: "#fcd34d",
        groups: ["senior"],
      },
    ],
  };

  await prisma.table_config.upsert({
    where: { ConfigID: configID },
    update: { Config: baseConfig },
    create: {
      ConfigID: configID,
      AcademicYear: 2568,
      Semester: "SEMESTER_1",
      Config: baseConfig,
      status: "DRAFT",
    },
  });

  console.log("🗂️ Creating break groups...");
  const juniorGrades = grades.filter(g => g.Year >= 7 && g.Year <= 9);
  const seniorGrades = grades.filter(g => g.Year >= 10 && g.Year <= 12);

  const breakGroups = [
    {
      Name: "junior",
      Label: "พักกลางวัน (ม.ต้น)",
      Color: "#fca5a5",
      ConfigID: configID,
      gradeIds: juniorGrades.map(g => g.GradeID),
    },
    {
      Name: "senior",
      Label: "พักกลางวัน (ม.ปลาย)",
      Color: "#fcd34d",
      ConfigID: configID,
      gradeIds: seniorGrades.map(g => g.GradeID),
    },
  ];

  // Idempotent: clear any existing break_groups for this config before recreating
  await prisma.break_group.deleteMany({ where: { ConfigID: configID } });
  for (const bg of breakGroups) {
    await prisma.break_group.create({
      data: {
        Name: bg.Name,
        Label: bg.Label,
        Color: bg.Color,
        ConfigID: bg.ConfigID,
        grades: {
          create: bg.gradeIds.map(gid => ({ GradeID: gid })),
        },
      },
    });
  }

  console.log("✅ Seed completed for semester 1/2568!");
  console.log("📊 Summary:");
  console.log(`   - Programs: 2`);
  console.log(`   - Teachers: ${teachers.length}`);
  console.log(`   - Rooms: ${rooms.length}`);
  console.log(`   - Subjects: ${subjects.length}`);
  console.log(`   - Grades: ${grades.length}`);
  console.log(`   - Timeslots: ${days.length * periods.length} (40 total)`);
  console.log(`   - Teacher Responsibilities: ${responsibilities.length}`);
  console.log(
    "\n🔗 Lock Schedule URL: https://phrasongsa-timetable.vercel.app/schedule/1-2568/lock",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
