import "dotenv/config";
import {
  PrismaClient,
  SubjectCategory,
  LearningArea,
  subject_credit,
} from "../prisma/generated/client";

console.log("DEBUG: DATABASE_URL exists?", !!process.env.DATABASE_URL);
console.log("DEBUG: PrismaClient defined?", !!PrismaClient);

const prisma = new PrismaClient({} as any);

async function runSeed(args?: any) {
  console.log("Start seeding test data for Charter B...");

  try {
    const count = await prisma.subject.count();
    console.log("DEBUG: Subject count:", count);
  } catch (e) {
    console.error("DEBUG: Connection/Query Error:", e);
    throw e;
  }

  // 1. Create Subject: TEST-SUBJ-B
  const subjectCode = "TEST-SUBJ-B";
  const existingSubject = await prisma.subject.findUnique({
    where: { SubjectCode: subjectCode },
  });

  if (!existingSubject) {
    console.log(`Creating Subject ${subjectCode}...`);
    await prisma.subject.create({
      data: {
        SubjectCode: subjectCode,
        SubjectName: "Test Subject B",
        Credit: subject_credit.CREDIT_20, // 2.0 Credit
        Category: SubjectCategory.CORE,
        LearningArea: LearningArea.SCIENCE,
        Description: "Created by Antigravity for E2E Testing",
        IsGraded: true,
      },
    });
    console.log(`Subject ${subjectCode} created.`);
  } else {
    console.log(`Subject ${subjectCode} already exists.`);
  }

  // 2. Create Teacher: Test Teacher-B
  const teacherEmail = "teacher-b@test.local";
  const existingTeacher = await prisma.teacher.findUnique({
    where: { Email: teacherEmail },
  });

  if (!existingTeacher) {
    console.log(`Creating Teacher ${teacherEmail}...`);
    await prisma.teacher.create({
      data: {
        Prefix: "นาย",
        Firstname: "Test Teacher-B",
        Lastname: "Surname-B",
        Department: "วิทยาศาสตร์และเทคโนโลยี", // MUST MATCH MOE
        Email: teacherEmail,
        Role: "teacher",
      },
    });
    console.log(`Teacher ${teacherEmail} created.`);
  } else {
    console.log(`Teacher ${teacherEmail} already exists.`);
  }

  // 3. Create Room: TEST-ROOM-B
  const roomName = "TEST-ROOM-B";
  const existingRoom = await prisma.room.findUnique({
    where: { RoomName: roomName },
  });

  if (!existingRoom) {
    console.log(`Creating Room ${roomName}...`);
    await prisma.room.create({
      data: {
        RoomName: roomName,
        Building: "Building B",
        Floor: "2",
      },
    });
    console.log(`Room ${roomName} created.`);
  } else {
    console.log(`Room ${roomName} already exists.`);
  }

  console.log("Seeding completed.");
}

runSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });
