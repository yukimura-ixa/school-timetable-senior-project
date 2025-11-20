#!/usr/bin/env tsx
/**
 * Script to check if admin user exists with proper password
 * Run with: pnpm tsx scripts/check-admin-user.ts
 */

import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log("\n🔍 Checking for admin users...\n");

    const adminUsers = await prisma.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true, // Will show if password exists (not the actual hash)
        createdAt: true,
      },
    });

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in database");
      console.log("\n💡 Create an admin user with:");
      console.log("   pnpm admin:create");
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || "Unnamed"}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Password set: ${user.password ? "✅ Yes" : "❌ No"}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log("");
    });

    const usersWithoutPassword = adminUsers.filter((u) => !u.password);
    if (usersWithoutPassword.length > 0) {
      console.log(
        "⚠️  Warning: Some admin users don't have passwords set (likely created via OAuth)"
      );
      console.log("   These users cannot use credential-based login\n");
    }
  } catch (error) {
    console.error("❌ Error checking admin users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
