/**
 * Verification script to check program seed data (MOE model)
 * Shows programs grouped by Year (M.1–M.6) and Track
 */

import prisma from "../src/lib/prisma";
import type { program } from "../prisma/generated/client";

async function verifyProgramSeed() {
  console.warn("🔍 Verifying Program Seed Data\n");
  console.warn("=".repeat(80));

  // Get all programs ordered by Year, Track, ProgramName
  const programs = await prisma.program.findMany({
    orderBy: [{ Year: "asc" }, { Track: "asc" }, { ProgramName: "asc" }],
    include: {
      _count: {
        select: {
          gradelevel: true,
        },
      },
    },
  });

  console.warn(`\n📊 Total Programs: ${programs.length}\n`);

  // Group by Year (1..6)
  const groupedByYear = programs.reduce(
    (acc: Record<number, program[]>, program: program) => {
      const year = program.Year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(program);
      return acc;
    },
    {} as Record<number, program[]>,
  );

  // Display grouped data
  for (const [year, yearPrograms] of (
    Object.entries(groupedByYear)
  ).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.warn(`\n📅 Year ม.${year} (${yearPrograms.length} programs)`);
    console.warn("-".repeat(80));

    const groupedByTrack = yearPrograms.reduce(
      (acc: Record<string, program[]>, p: program) => {
        const list = acc[p.Track] ?? (acc[p.Track] = [] as program[]);
        list.push(p);
        return acc;
      },
      {} as Record<string, program[]>,
    );

    for (const [track, list] of Object.entries(groupedByTrack)) {
      console.warn(`\n  📖 Track: ${track}`);
      list.forEach((p: any) => {
        console.warn(
          `    • ${p.ProgramCode.padEnd(14)} ${p.ProgramName.padEnd(40)} (${p._count?.gradelevel ?? 0} grade levels)`,
        );
      });
    }
  }

  console.warn("\n" + "=".repeat(80));
  console.warn("✅ Verification Complete\n");

  // Test composite uniqueness (client-side check)
  console.warn("🔐 Testing Composite Unique Constraint (Year + Track)...");
  const counts = new Map<string, number>();
  for (const p of programs) {
    const key = `${p.Year}-${p.Track}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const dups = Array.from(counts.entries()).filter(([_, c]) => c > 1);
  if (dups.length === 0) {
    console.warn("   ✓ No duplicate Year+Track combinations found");
  } else {
    console.warn("   ✗ Duplicates found for Year+Track:", dups);
  }

  await prisma.$disconnect();
}

verifyProgramSeed().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
