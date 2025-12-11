/**
 * PDF Generator Tests
 * 
 * NOTE: These tests verify the PDF export infrastructure exists.
 * Full integration tests with actual PDF generation are in e2e/export/pdf-export.spec.ts
 * 
 * To run these tests after TypeScript cache refresh:
 * 1. Restart TypeScript server (VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")
 * 2. Run: pnpm test __test__/features/export/pdf/teacher-pdf-generator.test.ts
 */

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

describe("PDF Export Infrastructure Files", () => {
  const projectRoot = resolve(__dirname, "../../../../");

  it("should have PDF generator file", () => {
    const generatorPath = resolve(projectRoot, "src/features/export/pdf/generators/teacher-pdf-generator.tsx");
    expect(existsSync(generatorPath)).toBe(true);
  });

  it("should have teacher timetable template", () => {
    const templatePath = resolve(projectRoot, "src/features/export/pdf/templates/teacher-timetable-pdf.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("should have PDF styles module", () => {
    const stylesPath = resolve(projectRoot, "src/features/export/pdf/styles/pdf-styles.ts");
    expect(existsSync(stylesPath)).toBe(true);
  });

  it("should have font registration module", () => {
    const fontsPath = resolve(projectRoot, "src/features/export/pdf/fonts/register-fonts.ts");
    expect(existsSync(fontsPath)).toBe(true);
  });

  it("should have Sarabun font files", () => {
    const regularPath = resolve(projectRoot, "public/fonts/Sarabun-Regular.ttf");
    const boldPath = resolve(projectRoot, "public/fonts/Sarabun-Bold.ttf");
    expect(existsSync(regularPath)).toBe(true);
    expect(existsSync(boldPath)).toBe(true);
  });

  it("should have PDF API route", () => {
    const apiPath = resolve(projectRoot, "src/app/api/export/teacher-timetable/pdf/route.ts");
    expect(existsSync(apiPath)).toBe(true);
  });
});

describe("PDF Component Files", () => {
  const projectRoot = resolve(__dirname, "../../../../");

  it("should have TimetableHeader component", () => {
    const path = resolve(projectRoot, "src/features/export/pdf/templates/components/TimetableHeader.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("should have TimetableGrid component", () => {
    const path = resolve(projectRoot, "src/features/export/pdf/templates/components/TimetableGrid.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("should have CreditSummary component", () => {
    const path = resolve(projectRoot, "src/features/export/pdf/templates/components/CreditSummary.tsx");
    expect(existsSync(path)).toBe(true);
  });
});

/**
 * Full integration tests with actual PDF generation and RBAC:
 * - e2e/export/pdf-export.spec.ts (Playwright E2E tests)
 * - Manual testing checklist in docs/PDF_EXPORT_MIGRATION_SUMMARY.md
 */