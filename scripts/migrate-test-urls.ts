/**
 * Script to migrate test URLs from old to new format
 *
 * Old: /schedule/1-2567/arrange → New: /schedule/2567/1/arrange
 * Old: /dashboard/2-2568/analytics → New: /dashboard/2568/2/analytics
 *
 * Usage: pnpm tsx scripts/migrate-test-urls.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";
import path from "path";

// Pattern to match old URLs
// Captures: 1=base (schedule|dashboard), 2=semester, 3=year, 4=rest
const URL_PATTERN = /\/(schedule|dashboard)\/(\d)-(\d{4})(\/[^"'`]*)?/g;

function migrateUrls(content: string): { content: string; changes: number } {
  let changes = 0;

  const newContent = content.replace(
    URL_PATTERN,
    (match, base, semester, year, rest = "") => {
      changes++;
      // Convert: /schedule/1-2567/arrange → /schedule/2567/1/arrange
      return `/${base}/${year}/${semester}${rest}`;
    },
  );

  return { content: newContent, changes };
}

async function main() {
  console.log("🔍 Finding test files...");

  // Find all test files
  const testFiles = await glob("e2e/**/*.spec.ts", {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`📝 Found ${testFiles.length} test files`);

  let totalFiles = 0;
  let totalChanges = 0;
  const updatedFiles: string[] = [];

  for (const filePath of testFiles) {
    const content = readFileSync(filePath, "utf-8");
    const { content: newContent, changes } = migrateUrls(content);

    if (changes > 0) {
      writeFileSync(filePath, newContent, "utf-8");
      totalFiles++;
      totalChanges += changes;
      updatedFiles.push(path.relative(process.cwd(), filePath));
      console.log(`  ✅ ${path.basename(filePath)}: ${changes} URLs updated`);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`  Files updated: ${totalFiles}`);
  console.log(`  URLs migrated: ${totalChanges}`);

  if (updatedFiles.length > 0) {
    console.log("\n📂 Updated files:");
    updatedFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
    if (updatedFiles.length > 10) {
      console.log(`  ... and ${updatedFiles.length - 10} more`);
    }
  }

  console.log("\n✨ Migration complete!");
  console.log("💡 Run tests to verify: pnpm test:e2e");
}

main().catch(console.error);
