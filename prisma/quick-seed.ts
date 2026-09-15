/**
 * Quick seed for testing arrange page
 * Creates minimal data: semester, teachers, subjects, rooms, grades, timeslots
 */

import { PrismaClient } from "../prisma/generated/client";
import { bangkokClockToTimeslotDate } from "../src/utils/datetime";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Quick seed starting...");

  // 1. Create programs (replaces semester concept)
  console.log("📚 Creating programs...");
  const program1 = await prisma.program.upsert({
    where: { ProgramCode: "GENERAL-M1-2567" },
    update: {},
    create: {
      ProgramCode: "GENERAL-M1-2567",
      ProgramName: "หลักสูตรแกนกลาง ม.ต้น",
      Year: 7,
      Track: "GENERAL",
      Description: "หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน ม.ต้น",
      MinTotalCredits: 40,
      IsActive: true,
    },
  });

  const program2 = await prisma.program.upsert({
    where: { ProgramCode: "SCIENCE_MATH-M4-2567" },
    update: {},
    create: {
      ProgramCode: "SCIENCE_MATH-M4-2567",
      ProgramName: "หลักสูตรแกนกลาง ม.ปลาย วิทย์-คณิต",
      Year: 10,
      Track: "SCIENCE_MATH",
      Description:
        "หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน ม.ปลาย แผนการเรียนวิทย์-คณิต",
      MinTotalCredits: 60,
      IsActive: true,
    },
  });

  // 2. Create teachers
  console.log("👨‍🏫 Creating teachers...");
  const teachers = await Promise.all([
    prisma.teacher.upsert({
      where: { Email: "somchai@school.local" },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "สมชาย",
        Lastname: "ใจดี",
        Department: "คณิตศาสตร์",
        Email: "somchai@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "somying@school.local" },
      update: {},
      create: {
        Prefix: "นาง",
        Firstname: "สมหญิง",
        Lastname: "รักเรียน",
        Department: "วิทยาศาสตร์",
        Email: "somying@school.local",
        Role: "teacher",
      },
    }),
    prisma.teacher.upsert({
      where: { Email: "wichai@school.local" },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "วิชัย",
        Lastname: "สอนดี",
        Department: "ภาษาไทย",
        Email: "wichai@school.local",
        Role: "teacher",
      },
    }),
  ]);

  // 3. Create rooms
  console.log("🏫 Creating rooms...");
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { RoomCode: "R101" },
      update: {},
      create: {
        RoomCode: "R101",
        RoomName: "ห้องเรียน 101",
        Building: "ตึก 1",
        Floor: 1,
        Capacity: 40,
        RoomType: "GENERAL",
      },
    }),
    prisma.room.upsert({
      where: { RoomCode: "R102" },
      update: {},
      create: {
        RoomCode: "R102",
        RoomName: "ห้องเรียน 102",
        Building: "ตึก 1",
        Floor: 1,
        Capacity: 40,
        RoomType: "GENERAL",
      },
    }),
    prisma.room.upsert({
      where: { RoomCode: "LAB201" },
      update: {},
      create: {
        RoomCode: "LAB201",
        RoomName: "ห้องปฏิบัติการวิทยาศาสตร์",
        Building: "ตึก 2",
        Floor: 2,
        Capacity: 30,
        RoomType: "LAB",
      },
    }),
  ]);

  // 4. Create subjects
  console.log("📖 Creating subjects...");
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { SubjectCode: "TH101" },
      update: {},
      create: {
        SubjectCode: "TH101",
        SubjectName: "ภาษาไทย พื้นฐาน",
        Credit: "CREDIT_1_0",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "MA101" },
      update: {},
      create: {
        SubjectCode: "MA101",
        SubjectName: "คณิตศาสตร์ พื้นฐาน",
        Credit: "CREDIT_1_5",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "SC101" },
      update: {},
      create: {
        SubjectCode: "SC101",
        SubjectName: "วิทยาศาสตร์ พื้นฐาน",
        Credit: "CREDIT_1_5",
        Category: "CORE",
      },
    }),
    prisma.subject.upsert({
      where: { SubjectCode: "EN101" },
      update: {},
      create: {
        SubjectCode: "EN101",
        SubjectName: "ภาษาอังกฤษ พื้นฐาน",
        Credit: "CREDIT_1_0",
        Category: "CORE",
      },
    }),
  ]);

  // 5. Create grade levels
  console.log("🎓 Creating grade levels...");
  const grades = await Promise.all([
    prisma.gradelevel.upsert({
      where: { GradeID: "7-1" },
      update: {},
      create: {
        GradeID: "7-1",
        Year: 7,
        Number: 1,
        StudentCount: 35,
        ProgramID: program1.ProgramID,
      },
    }),
    prisma.gradelevel.upsert({
      where: { GradeID: "7-2" },
      update: {},
      create: {
        GradeID: "7-2",
        Year: 7,
        Number: 2,
        StudentCount: 33,
        ProgramID: program1.ProgramID,
      },
    }),
    prisma.gradelevel.upsert({
      where: { GradeID: "10-1" },
      update: {},
      create: {
        GradeID: "10-1",
        Year: 10,
        Number: 1,
        StudentCount: 30,
        ProgramID: program2.ProgramID,
      },
    }),
  ]);

  // 6. Create timeslots for semester 1, academic year 2567
  console.log("⏰ Creating timeslots...");
  const days: ("MON" | "TUE" | "WED" | "THU" | "FRI")[] = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ];
  const periods = [
    { start: "08:00:00", end: "09:00:00", break: "NORMAL" as const },
    { start: "09:00:00", end: "10:00:00", break: "NORMAL" as const },
    { start: "10:00:00", end: "11:00:00", break: "NORMAL" as const },
    { start: "11:00:00", end: "12:00:00", break: "NORMAL" as const },
    { start: "12:00:00", end: "13:00:00", break: "LUNCH_M1_TO_M3" as const },
    { start: "13:00:00", end: "14:00:00", break: "NORMAL" as const },
    { start: "14:00:00", end: "15:00:00", break: "NORMAL" as const },
    { start: "15:00:00", end: "16:00:00", break: "NORMAL" as const },
  ];

  for (const day of days) {
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const timeslotID = `1-2567-${day}-${i + 1}`;

      await prisma.timeslot.upsert({
        where: { TimeslotID: timeslotID },
        update: {},
        create: {
          TimeslotID: timeslotID,
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
          StartTime: bangkokClockToTimeslotDate(period.start.slice(0, 5)),
          EndTime: bangkokClockToTimeslotDate(period.end.slice(0, 5)),
          Breaktime: period.break,
          DayOfWeek: day,
        },
      });
    }
  }

  // 7. Assign teachers to subjects
  console.log("📝 Creating teacher responsibilities...");
  await Promise.all([
    prisma.teachers_responsibility.upsert({
      where: { RespID: 1 },
      update: {},
      create: {
        RespID: 1,
        TeacherID: teachers[0].TeacherID,
        SubjectCode: "MA101",
        GradeID: "7-1",
        TeachHour: 4,
      },
    }),
    prisma.teachers_responsibility.upsert({
      where: { RespID: 2 },
      update: {},
      create: {
        RespID: 2,
        TeacherID: teachers[1].TeacherID,
        SubjectCode: "SC101",
        GradeID: "7-1",
        TeachHour: 4,
      },
    }),
    prisma.teachers_responsibility.upsert({
      where: { RespID: 3 },
      update: {},
      create: {
        RespID: 3,
        TeacherID: teachers[2].TeacherID,
        SubjectCode: "TH101",
        GradeID: "7-1",
        TeachHour: 3,
      },
    }),
  ]);

  console.log("✅ Quick seed completed!");
  console.log("📊 Summary:");
  console.log(`   - Programs: 2`);
  console.log(`   - Teachers: ${teachers.length}`);
  console.log(`   - Rooms: ${rooms.length}`);
  console.log(`   - Subjects: ${subjects.length}`);
  console.log(`   - Grades: ${grades.length}`);
  console.log(`   - Timeslots: ${days.length * periods.length}`);
  console.log(`   - Teacher Responsibilities: 3`);
  console.log(
    "\n🔗 Access URL: http://localhost:3000/schedule/1-2567/arrange?TeacherID=1",
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
