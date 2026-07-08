import { fileURLToPath } from "node:url";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";
import { FUNDAMENTALS } from "./data/fundamentals";
import { getEffectiveProgramSubjects } from "../src/features/program/domain/services/effective-subjects.service";

// Lazy singleton — only constructed when the script actually runs (not on import).
// Prisma 7 requires an explicit driver adapter (direct pg) or accelerateUrl.
let _prisma: PrismaClient | undefined;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    const connectionString = process.env.DATABASE_URL!;
    if (connectionString?.startsWith("prisma+")) {
      _prisma = new PrismaClient({
        accelerateUrl: connectionString,
      }).$extends(withAccelerate()) as unknown as PrismaClient;
    } else {
      _prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    }
  }
  return _prisma;
}

type CoreRow = { SubjectCode: string; MinCredits: number; MaxCredits: number | null };
type TemplateRow = { SubjectCode: string; MinCredits: number; MaxCredits: number | null };

export function planProgramBackfill(input: {
  template: TemplateRow[];
  coreProgramSubjects: CoreRow[];
}): {
  deletes: string[];
  overrides: Array<{ SubjectCode: string; Excluded: boolean; MinCredits: number | null; MaxCredits: number | null }>;
} {
  const templateByCode = new Map(input.template.map((t) => [t.SubjectCode, t]));
  const coreByCode = new Map(input.coreProgramSubjects.map((c) => [c.SubjectCode, c]));
  const deletes: string[] = [];
  const overrides: Array<{ SubjectCode: string; Excluded: boolean; MinCredits: number | null; MaxCredits: number | null }> = [];

  for (const core of input.coreProgramSubjects) {
    const t = templateByCode.get(core.SubjectCode);
    if (!t) continue; // non-template CORE: leave it owned, untouched
    deletes.push(core.SubjectCode);
    if (core.MinCredits !== t.MinCredits || (core.MaxCredits ?? null) !== (t.MaxCredits ?? null)) {
      overrides.push({
        SubjectCode: core.SubjectCode,
        Excluded: false,
        MinCredits: core.MinCredits,
        MaxCredits: core.MaxCredits ?? null,
      });
    }
  }
  for (const t of input.template) {
    if (!coreByCode.has(t.SubjectCode)) {
      overrides.push({ SubjectCode: t.SubjectCode, Excluded: true, MinCredits: null, MaxCredits: null });
    }
  }
  return { deletes, overrides };
}

async function snapshotEffectiveSets() {
  const prisma = getPrisma();
  const programs = await prisma.program.findMany({
    include: { program_subject: { include: { subject: true } } },
  });
  const map = new Map<number, string>();
  for (const p of programs) {
    map.set(p.ProgramID, serialize(p.program_subject));
  }
  return map;
}

function serialize(rows: Array<{ SubjectCode: string; Category: string; MinCredits: number; MaxCredits: number | null; IsMandatory: boolean }>) {
  return rows
    .map((r) => `${r.SubjectCode}|${r.Category}|${r.MinCredits}|${r.MaxCredits ?? "null"}|${r.IsMandatory}`)
    .sort()
    .join(";");
}

async function main() {
  const prisma = getPrisma();

  // 1. Seed grade_fundamental from the canonical data (idempotent upsert).
  for (const f of FUNDAMENTALS) {
    await prisma.grade_fundamental.upsert({
      where: { Year_SubjectCode: { Year: f.Year, SubjectCode: f.SubjectCode } },
      update: { MinCredits: f.MinCredits, MaxCredits: f.MaxCredits, SortOrder: f.SortOrder },
      create: f,
    });
  }

  // 2. Snapshot BEFORE.
  const before = await snapshotEffectiveSets();

  // 3. Backfill per program.
  const programs = await prisma.program.findMany({
    include: { program_subject: { include: { subject: true } } },
  });
  for (const p of programs) {
    const template = FUNDAMENTALS.filter((f) => f.Year === p.Year);
    const coreRows = p.program_subject.filter((ps) => ps.Category === "CORE");
    const plan = planProgramBackfill({ template, coreProgramSubjects: coreRows });
    await prisma.$transaction(async (tx) => {
      if (plan.deletes.length) {
        await tx.program_subject.deleteMany({
          where: { ProgramID: p.ProgramID, SubjectCode: { in: plan.deletes } },
        });
      }
      for (const o of plan.overrides) {
        await tx.program_fundamental_override.upsert({
          where: { ProgramID_SubjectCode: { ProgramID: p.ProgramID, SubjectCode: o.SubjectCode } },
          update: { Excluded: o.Excluded, MinCredits: o.MinCredits, MaxCredits: o.MaxCredits },
          create: { ProgramID: p.ProgramID, ...o },
        });
      }
    });
  }

  // 4. Verify AFTER == BEFORE on the effective set.
  await verify(before);
  console.log("✅ Backfill complete and verified.");
}

async function verify(before: Map<number, string>) {
  const prisma = getPrisma();
  const programs = await prisma.program.findMany({ select: { ProgramID: true, Year: true } });
  for (const p of programs) {
    const template = await prisma.grade_fundamental.findMany({ where: { Year: p.Year }, include: { subject: true } });
    const overrides = await prisma.program_fundamental_override.findMany({ where: { ProgramID: p.ProgramID } });
    const programSubjects = await prisma.program_subject.findMany({ where: { ProgramID: p.ProgramID }, include: { subject: true } });
    const eff = getEffectiveProgramSubjects({ programId: p.ProgramID, year: p.Year, template, overrides, programSubjects });
    const after = serialize(eff);
    const wanted = before.get(p.ProgramID) ?? "";
    if (after !== wanted) {
      throw new Error(
        `Backfill mismatch for program ${p.ProgramID} (Year ${p.Year}).\n  before: ${wanted}\n  after:  ${after}`,
      );
    }
  }
}

// ESM-safe guard: run main() only when executed directly, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => getPrisma().$disconnect());
}
