/**
 * Create Admin User Script
 * Simple script to create admin user without running full seed
 */

import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("👤 Creating admin user...\n");

  // Hash password
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@school.local" },
  });

  if (existingAdmin) {
    console.log("ℹ️  Admin user already exists!");
    console.log("📧 Email:", existingAdmin.email);
    console.log("👤 Name:", existingAdmin.name);
    console.log("🔑 Role:", existingAdmin.role);
    console.log("\n✅ You can login at: http://localhost:3000/signin");
    console.log("   Email: admin@school.local");
    console.log("   Password: admin123");
    return;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@school.local",
      name: "System Administrator",
      password: adminPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log("📧 Email:", admin.email);
  console.log("👤 Name:", admin.name);
  console.log("🔑 Role:", admin.role);
  console.log("\n📝 Login Credentials:");
  console.log("   Email: admin@school.local");
  console.log("   Password: admin123");
  console.log("\n🌐 Test at: http://localhost:3000/signin");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
