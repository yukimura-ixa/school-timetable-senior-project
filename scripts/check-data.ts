import { prisma } from "../src/lib/prisma";

async function main() {
  console.log(`Checking data for env: ${process.env.NODE_ENV}`);

  try {
    const countConfig = await prisma.table_config.count();
    console.log("Table Config Count:", countConfig);

    const configs = await prisma.table_config.findMany();
    console.log("Configs:", configs);

    const teachers = await prisma.teacher.count();
    console.log("Teacher Count:", teachers);
  } catch (error) {
    console.error("❌ Check Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
