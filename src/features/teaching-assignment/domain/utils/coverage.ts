export interface CoverageSection {
  requiredCodes: string[];
  assignedCodes: string[];
}

export function computeCoverage(
  sections: CoverageSection[],
): { filled: number; required: number } {
  let filled = 0;
  let required = 0;
  for (const s of sections) {
    const assigned = new Set(s.assignedCodes);
    required += s.requiredCodes.length;
    filled += s.requiredCodes.filter((c) => assigned.has(c)).length;
  }
  return { filled, required };
}
