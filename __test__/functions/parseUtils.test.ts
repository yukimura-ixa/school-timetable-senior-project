import { safeParseInt, parseIntWithDefault } from "@/functions/parseUtils";

describe("parseUtils", () => {
  describe("safeParseInt", () => {
    it("should parse valid integer strings", () => {
      expect(safeParseInt("123")).toBe(123);
      expect(safeParseInt("0")).toBe(0);
      expect(safeParseInt("-456")).toBe(-456);
    });

    it("should return null for invalid inputs", () => {
      expect(safeParseInt(null)).toBe(null);
      expect(safeParseInt(undefined)).toBe(null);
      expect(safeParseInt("")).toBe(null);
      expect(safeParseInt("abc")).toBe(null);
      expect(safeParseInt("12.34")).toBe(12); // parseInt truncates decimals
    });

    it("should handle edge cases", () => {
      expect(safeParseInt("  123  ")).toBe(123); // whitespace
      expect(safeParseInt("123abc")).toBe(123); // partial parse
      expect(safeParseInt("NaN")).toBe(null);
    });
  });

  describe("parseIntWithDefault", () => {
    it("should parse valid integer strings", () => {
      expect(parseIntWithDefault("123", 0)).toBe(123);
      expect(parseIntWithDefault("0", 999)).toBe(0);
    });

    it("should return default value for invalid inputs", () => {
      expect(parseIntWithDefault(null, 100)).toBe(100);
      expect(parseIntWithDefault(undefined, 200)).toBe(200);
      expect(parseIntWithDefault("abc", 300)).toBe(300);
    });
  });
});
