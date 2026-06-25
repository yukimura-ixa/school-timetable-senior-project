import { describe, it, expect } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import { validateProgramMOECredits } from "@/features/program/domain/services/moe-validation.service";
import prisma from "@/lib/prisma";

describe("validation via the effective seam", () => {
  it("validates M4-SCI on effective subjects without throwing", async () => {
    const p = await prisma.program.findUnique({ where: { ProgramCode: "M4-SCI" } });
    const subjects = await programRepository.getEffectiveSubjectsForValidation(p!.ProgramID);
    const result = validateProgramMOECredits(p!.Year, subjects, p!.Track);
    expect(result).toHaveProperty("isValid");
    expect(Array.isArray(result.learningAreas)).toBe(true);
  });
});
