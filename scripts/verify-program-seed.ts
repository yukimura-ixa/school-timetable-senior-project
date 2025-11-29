/**
 * Verification script to check program seed data (MOE model)
 * Shows programs grouped by Year (M.1–M.6) and Track
 */

import prisma from "../src/lib/prisma";
import type { program } from "../prisma/generated/client";

// Type for program with _count field from include
type ProgramWithCount = program & {
  _count: {
    gradelevel: number;
  };
};

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
    (acc: Record<number, ProgramWithCount[]>, program: ProgramWithCount) => {
      const year = program.Year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(program);
      return acc;
    },
    {} as Record<number, ProgramWithCount[]>,
  );

  // Display grouped data
  for (const [year, yearPrograms] of (
    Object.entries(groupedByYear) as [string, ProgramWithCount[]][]
  ).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.warn(`\n📅 Year ม.${year} (${yearPrograms.length} programs)`);
    console.warn("-".repeat(80));

    const groupedByTrack = yearPrograms.reduce(
      (acc: Record<string, ProgramWithCount[]>, p: ProgramWithCount) => {
        const list = acc[p.Track] ?? (acc[p.Track] = [] as ProgramWithCount[]);
        list.push(p);
        return acc;
      },
      {} as Record<string, ProgramWithCount[]>,
    );

    for (const [track, list] of Object.entries(groupedByTrack) as [
      string,
      ProgramWithCount[],
    ][]) {
      console.warn(`\n  📖 Track: ${track}`);
      list.forEach((p: ProgramWithCount) => {
        console.warn(
          `    • ${p.ProgramCode.padEnd(14)} ${p.ProgramName.padEnd(40)} (${p._count.gradelevel} grade levels)`,
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
