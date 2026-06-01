import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const isAccelerate = connectionString?.startsWith("prisma+");

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

const DEFAULT_GROUPS = [
  { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradePrefixes: ["M1", "M2", "M3"] },
  { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradePrefixes: ["M4", "M5", "M6"] },
];

async function main() {
  const configs = await prisma.table_config.findMany({
    select: { ConfigID: true, Config: true, break_groups: { select: { Name: true } } },
  });

  const grades = await prisma.gradelevel.findMany({ select: { GradeID: true } });

  for (const cfg of configs) {
    const existing = new Set(cfg.break_groups.map((g) => g.Name));
    const json = (cfg.Config ?? {}) as Record<string, unknown>;
    const defs = (json.breakDefinitions ?? []) as { groups?: string[] }[];
    const referenced = new Set<string>();
    for (const d of defs) for (const g of d.groups ?? []) if (g !== "*") referenced.add(g);

    for (const name of referenced) {
      if (existing.has(name)) continue;
      const preset = DEFAULT_GROUPS.find((p) => p.name === name);
      const gradeIds = preset
        ? grades.filter((g) => preset.gradePrefixes.some((p) => g.GradeID.startsWith(p))).map((g) => g.GradeID)
        : [];
      await prisma.break_group.create({
        data: {
          Name: name,
          Label: preset?.label ?? name,
          Color: preset?.color ?? "#9E9E9E",
          ConfigID: cfg.ConfigID,
          grades: { create: gradeIds.map((gid) => ({ GradeID: gid })) },
        },
      });
      console.log(`Backfilled group "${name}" for config ${cfg.ConfigID} (${gradeIds.length} grades)`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
