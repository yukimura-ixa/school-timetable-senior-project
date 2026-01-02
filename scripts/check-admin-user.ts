import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for admin users...");
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ["admin@school.local", "admin@test.local"],
      },
    },
  });
  console.log("Found users:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
