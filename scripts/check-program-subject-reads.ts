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
 * Matches ONLY real Prisma runtime reads — `prisma.program_subject.<method>`
 * or `tx.program_subject.<method>` where prisma/tx is the runtime client
 * (lowercase). This deliberately excludes:
 *   - `Prisma.programGetPayload<{ include: { program_subject: { ... } } }>` (type-only)
 *   - `program_subject & { subject }` (type intersection)
 *   - `.program_subject` property access on already-fetched results
 *   - Comments mentioning program_subject
 */
const DIRECT_READ_RE =
  /\b(?:prisma|tx)\.program_subject\.(findMany|findFirst|findUnique|count|aggregate|groupBy)\b/;

/**
 * Matches `prisma.program_subject.<method>` or `tx.program_subject.<method>`
 * calls that use the Prisma query methods — the only real reads.
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
    const lines = (await readFile(f, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (DIRECT_READ_RE.test(line)) {
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
