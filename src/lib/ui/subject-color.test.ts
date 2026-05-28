import { describe, expect, it } from "vitest";
import { subjectHue, subjectColors } from "./subject-color";

describe("subjectHue", () => {
  it("is deterministic for the same code", () => {
    expect(subjectHue("ค31101")).toBe(subjectHue("ค31101"));
  });

  it("returns a hue in [0, 360)", () => {
    for (const code of ["ค31101", "ท31101", "ว31101", "อ31101", "ABC"]) {
      const h = subjectHue(code);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it("spreads adjacent codes by at least 10 degrees", () => {
    const a = subjectHue("ค31101");
    const b = subjectHue("ค31102");
    expect(Math.abs(a - b)).toBeGreaterThanOrEqual(10);
  });

  it("returns 0 for empty string (safe default)", () => {
    expect(subjectHue("")).toBe(0);
  });
});

describe("subjectColors", () => {
  it("returns bg, stripe, and text HSL strings", () => {
    const c = subjectColors("ค31101");
    expect(c.bg).toMatch(/^hsl\(\d+, 70%, 95%\)$/);
    expect(c.stripe).toMatch(/^hsl\(\d+, 60%, 35%\)$/);
    expect(c.text).toMatch(/^hsl\(\d+, 55%, 20%\)$/);
  });

  it("shares hue across bg/stripe/text", () => {
    const c = subjectColors("ค31101");
    const hue = subjectHue("ค31101");
    expect(c.bg).toContain(`hsl(${hue},`);
    expect(c.stripe).toContain(`hsl(${hue},`);
    expect(c.text).toContain(`hsl(${hue},`);
  });
});
