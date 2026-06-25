import { describe, it, expect } from "vitest";
import { findStrayProgramSubjectReads } from "@/scripts/check-program-subject-reads";

describe("seam enforcement", () => {
  it("finds no prisma.program_subject reads outside the allowlist", async () => {
    const offenders = await findStrayProgramSubjectReads();
    expect(offenders, `Stray program_subject reads:\n${offenders.join("\n")}`).toEqual([]);
  });
});
