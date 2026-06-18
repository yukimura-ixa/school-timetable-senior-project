import { describe, it, expect } from "vitest";
import { renderUrlToPdf } from "@/features/print/render-pdf";

// Integration test: launches a real headless Chromium against a running dev
// server. Requires `pnpm dev` up + CHROME_PATH set, so it is skipped in the
// unit CI and run only in the e2e job (or locally).
describe.skipIf(!process.env.CHROME_PATH)("renderUrlToPdf", () => {
  it(
    "returns a non-empty application/pdf buffer",
    async () => {
      const pdf = await renderUrlToPdf(
        "http://localhost:3000/print/classes/M1-1/2568/1",
        { landscape: false },
      );
      expect(pdf.length).toBeGreaterThan(1000);
      expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    },
    60_000,
  );
});
