import { NextResponse } from "next/server";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";

export const runtime = "nodejs";

function parseYearsParam(param?: string): number[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 2000 && n < 3000);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret") || undefined;
    const yearsParam = url.searchParams.get("years") || undefined; // e.g., 2567,2568

    // AuthZ: require secret token
    const expected = process.env.SEED_SECRET;
    if (!expected || !secret || secret !== expected) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const years = parseYearsParam(yearsParam);
    const targetYears = years.length > 0 ? years : [2567, 2568];

    const results: Array<{
      year: number;
      semester: 1 | 2;
      created: boolean;
      configId: string;
    }> = [];

    for (const year of targetYears) {
      for (const sem of [1, 2] as const) {
        const existing = await semesterRepository.findByYearAndSemester(year, sem);
        if (existing) {
          results.push({ year, semester: sem, created: false, configId: existing.ConfigID });
        } else {
          const created = await semesterRepository.create({ academicYear: year, semester: sem, config: {} });
          results.push({ year, semester: sem, created: true, configId: created.ConfigID });
        }
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: unknown) {
    console.error("[seed-semesters] error", err);
    let message: string;
    if (err instanceof Error) message = err.message;
    else if (typeof err === "string") message = err;
    else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = "Unknown error";
      }
    }
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // Allow GET for convenience (same behavior as POST)
  return POST(req);
}
