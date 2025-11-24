import { PrismaClient } from "./prisma/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to DB...");
  try {
    const teacherEmail = "debug-teacher@school.local";
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Creating user...");
    await prisma.user.upsert({
      where: { email: teacherEmail },
      update: {},
      create: {
        email: teacherEmail,
        name: "Debug Teacher",
        password: hashedPassword,
        role: "teacher",
      },
    });
    console.log("User created.");

    console.log("Creating teacher...");
    await prisma.teacher.upsert({
      where: { Email: teacherEmail },
      update: {},
      create: {
        Prefix: "นาย",
        Firstname: "Debug",
        Lastname: "Teacher",
        Department: "วิทยาศาสตร์",
        Email: teacherEmail,
        Role: "teacher",
      },
    });
    console.log("Teacher created.");

    // Cleanup
    await prisma.user.delete({ where: { email: teacherEmail } });
    await prisma.teacher.delete({ where: { Email: teacherEmail } });
    console.log("Cleanup done.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
