import { hexToRGB } from "@/functions/componentFunctions";

describe("hexToRGB", () => {
  it("converts a six digit hex code to RGB", () => {
    expect(hexToRGB("#2F80ED")).toEqual({ r: 47, g: 128, b: 237 });
  });

  it("converts a shorthand hex code to RGB", () => {
    expect(hexToRGB("#0F0")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("throws an error for invalid values", () => {
    expect(() => hexToRGB("invalid")).toThrow("Invalid hex color format");
  });
});
