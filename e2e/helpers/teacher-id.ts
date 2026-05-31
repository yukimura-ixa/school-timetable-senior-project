import type { Page } from "@playwright/test";
import { testTeacher } from "../fixtures/seed-data.fixture";

let cached: number | null = null;

/**
 * Resolve the pinned E2E teacher's auto-increment TeacherID at runtime.
 *
 * TeacherID is not stable across seeds (auto-increment), so fixtures can't
 * hardcode it — the fixture only pins the teacher by Email. Look it up via the
 * authenticated /api/teachers endpoint and match on Email.
 */
export async function getE2ETeacherId(page: Page): Promise<number> {
  if (cached != null) return cached;
  const res = await page.request.get("/api/teachers");
  if (!res.ok()) {
    throw new Error(`GET /api/teachers failed: ${res.status()}`);
  }
  const body = (await res.json()) as {
    data?: Array<{ TeacherID: number; Email: string | null }>;
  };
  const match = body.data?.find((t) => t.Email === testTeacher.Email);
  if (!match) {
    throw new Error(
      `E2E teacher not found by email ${testTeacher.Email} in /api/teachers`,
    );
  }
  cached = match.TeacherID;
  return cached;
}
