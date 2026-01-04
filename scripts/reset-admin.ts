import { auth } from "../src/lib/auth.js";
import prisma from "../src/lib/prisma";

async function resetAdminPassword() {
  // Delete existing admin user and account
  const existing = await prisma.user.findUnique({
    where: { email: "admin@school.local" },
  });

  if (existing) {
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("Deleted existing admin user");
  }

  // Create new admin user via better-auth
  const result = await auth.api.signUpEmail({
    body: {
      email: "admin@school.local",
      password: "admin123",
      name: "System Administrator",
    },
  });

  if (result?.user) {
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "admin", emailVerified: true },
    });
    console.log("Admin user recreated with password: admin123");
  } else {
    console.error("Failed to create admin user");
  }

  await prisma.$disconnect();
}

resetAdminPassword().catch(console.error);
