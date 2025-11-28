import { PrismaClient } from "./prisma/generated/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  console.log("Connecting to DB...");
  try {
    const teacherEmail = "debug-teacher@school.local";
    const hashedPassword = await hashPassword("password123");

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
