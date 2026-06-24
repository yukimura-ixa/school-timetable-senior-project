import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { glob } from "glob";

/**
 * Allowlisted files that may read program_subject directly via Prisma.
 * The seam (program.repository.ts) is the ONE allowed consumer in src/.
 * Seeds, tests, e2e, and generated code are outside src/ and not scanned.
 */
const ALLOW = [
  "src/features/program/infrastructure/repositories/program.repository.ts",
];

/**
 * Match A — DIRECT reads: `prisma.program_subject.<method>` or
 * `tx.program_subject.<method>` where prisma/tx is the runtime client
 * (lowercase). Applies to ALL scanned files. This deliberately excludes:
 *   - `Prisma.programGetPayload<{ include: { program_subject: { ... } } }>` (type-only)
 *   - `program_subject & { subject }` (type intersection)
 *   - `.program_subject` property access on already-fetched results
 *   - Comments mentioning program_subject
 */
const DIRECT_READ_RE =
  /\b(?:prisma|tx)\.program_subject\.(findMany|findFirst|findUnique|count|aggregate|groupBy)\b/;

/**
 * Match B — INDIRECT relational reads: `program_subject: {` or
 * `program_subject: true` inside a Prisma `include`/`select`. This is the
 * bypass vector (e.g. `prisma.program.findMany({ include: { program_subject: true } })`)
 * that pulls program_subject rows without going through the seam.
 *
 * Applies to all scanned files EXCEPT `*.types.ts` — type definitions
 * (`Prisma.programGetPayload<{ include: { program_subject: { ... } } }>`)
 * legitimately use this shape and are not runtime reads. Real prisma queries
 * live in repositories/services, not in `.types.ts`.
 */
const INCLUDE_READ_RE = /program_subject\s*:\s*(\{|true)/;

/**
 * Returns `file:line` offenders for both direct and indirect (include/select)
 * program_subject reads outside the allowlisted seam.
 *
 * Limitation: stray *writes* (create/update/delete) outside the seam are not
 * caught by this gate. That is a known scope boundary.
 */
export async function findStrayProgramSubjectReads(): Promise<string[]> {
  // Scan src/ only; seeds/tests/e2e/generated are outside src/ and excluded.
  // Also exclude any __tests__ directories and test/spec files inside src/.
  const files = await glob("src/**/*.{ts,tsx}", {
    posix: true,
    ignore: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.test.tsx", "src/**/*.spec.tsx"],
  });

  const offenders: string[] = [];

  for (const f of files) {
    if (ALLOW.some((a) => f.endsWith(a))) continue;
    // Match B is suppressed for type-definition files: Prisma payload helpers
    // there use `program_subject: { ... }` shapes that are not runtime reads.
    const applyIncludeMatch = !f.endsWith(".types.ts");
    const lines = (await readFile(f, "utf8")).split("\n");
    lines.forEach((line, i) => {
      const isDirect = DIRECT_READ_RE.test(line);
      const isInclude = applyIncludeMatch && INCLUDE_READ_RE.test(line);
      if (isDirect || isInclude) {
        offenders.push(`${f}:${i + 1}  ${line.trim()}`);
      }
    });
  }

  return offenders;
}

// ESM entrypoint guard — only runs when executed directly, not on import.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  findStrayProgramSubjectReads().then((offenders) => {
    if (offenders.length) {
      console.error(
        "❌ Stray program_subject reads found outside the inheritance seam:\n" +
          offenders.join("\n"),
      );
      process.exit(1);
    }
    console.log("✅ No stray program_subject reads. Seam is clean.");
  });
}
