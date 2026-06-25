import prisma from "@/lib/prisma";
import { ProgramTrack } from "@/prisma/generated/client";

const TRACKS = Object.values(ProgramTrack);

/**
 * Create an isolated throwaway program for inheritance tests. The program model
 * has @@unique([Year, Track]), so the slot must be free — pick a year that has a
 * grade_fundamental template (so the program inherits CORE) and a track not yet
 * used for that year. Returns the program plus one inherited CORE code.
 */
export async function createThrowawayProgram() {
  const fundamentals = await prisma.grade_fundamental.findMany({
    orderBy: { Year: "asc" },
  });
  const existing = await prisma.program.findMany({
    select: { Year: true, Track: true },
  });
  const years = [...new Set(fundamentals.map((f) => f.Year))].sort((a, b) => a - b);

  for (const year of years) {
    const used = new Set(
      existing.filter((p) => p.Year === year).map((p) => p.Track),
    );
    const track = TRACKS.find((t) => !used.has(t));
    if (!track) continue;

    const program = await prisma.program.create({
      data: {
        ProgramCode: `TEST-${year}-${track}-${Date.now()}`,
        ProgramName: `inheritance test ${year}-${track}`,
        Year: year,
        Track: track,
        MinTotalCredits: 0,
        IsActive: true,
      },
    });
    const coreCode = fundamentals.find((f) => f.Year === year)!.SubjectCode;
    return { program, coreCode };
  }

  throw new Error("no free (Year, Track) slot available for a test program");
}
