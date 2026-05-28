import { describe, expect, it } from "vitest";
import { extractMonogram, monogramGradient, gradeMonogram } from "./monogram";

describe("extractMonogram", () => {
  it("strips นาย prefix and returns first grapheme", () => {
    expect(extractMonogram("นายสมชาย ใจดี")).toBe("ส");
  });

  it("strips นาง prefix", () => {
    expect(extractMonogram("นางมาลี ดวงดี")).toBe("ม");
  });

  it("strips นางสาว prefix", () => {
    expect(extractMonogram("นางสาวพิมพ์ พิทักษ์")).toBe("พ");
  });

  it("strips น.ส. prefix", () => {
    expect(extractMonogram("น.ส.วิภา สุข")).toBe("ว");
  });

  it("strips เด็กชาย / ด.ช. prefix", () => {
    expect(extractMonogram("เด็กชายอนุชา")).toBe("อ");
    expect(extractMonogram("ด.ช.อนุชา")).toBe("อ");
  });

  it("returns empty string for empty input", () => {
    expect(extractMonogram("")).toBe("");
  });

  it("falls back to first grapheme when no prefix matches", () => {
    expect(extractMonogram("John Doe")).toBe("J");
  });
});

describe("monogramGradient", () => {
  it("returns a linear-gradient string", () => {
    expect(monogramGradient(1)).toMatch(/^linear-gradient\(/);
  });

  it("is deterministic for the same id", () => {
    expect(monogramGradient(42)).toBe(monogramGradient(42));
  });

  it("differs for different ids", () => {
    expect(monogramGradient(1)).not.toBe(monogramGradient(2));
  });
});

describe("gradeMonogram", () => {
  it("formats Year as ม.{Year}", () => {
    expect(gradeMonogram(1)).toBe("ม.1");
    expect(gradeMonogram(6)).toBe("ม.6");
  });
});
