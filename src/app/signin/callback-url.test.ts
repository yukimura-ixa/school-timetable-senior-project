import { describe, it, expect } from "vitest";
import { safeCallbackPath } from "./callback-url";

describe("safeCallbackPath", () => {
  it("returns the default when value is missing", () => {
    expect(safeCallbackPath(undefined)).toBe("/dashboard");
    expect(safeCallbackPath(null)).toBe("/dashboard");
    expect(safeCallbackPath("")).toBe("/dashboard");
  });

  it("allows internal absolute paths, preserving query and encoded chars", () => {
    expect(safeCallbackPath("/schedule/2568/2/arrange")).toBe(
      "/schedule/2568/2/arrange",
    );
    expect(safeCallbackPath("/dashboard/2568/1/analytics?tab=load")).toBe(
      "/dashboard/2568/1/analytics?tab=load",
    );
    expect(safeCallbackPath("/classes/M1-1/2568/1")).toBe(
      "/classes/M1-1/2568/1",
    );
    expect(safeCallbackPath("/path/with%20space")).toBe("/path/with%20space");
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(safeCallbackPath("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackPath("http://evil.com/path")).toBe("/dashboard");
    expect(safeCallbackPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("rejects protocol-relative and backslash open-redirect tricks", () => {
    expect(safeCallbackPath("//evil.com")).toBe("/dashboard");
    expect(safeCallbackPath("//evil.com/path")).toBe("/dashboard");
    expect(safeCallbackPath("/\\evil.com")).toBe("/dashboard");
  });

  it("rejects values that are not absolute paths", () => {
    expect(safeCallbackPath("evil.com")).toBe("/dashboard");
    expect(safeCallbackPath("dashboard")).toBe("/dashboard");
  });

  it("rejects control characters and whitespace", () => {
    expect(safeCallbackPath("/path\nLocation: https://evil.com")).toBe(
      "/dashboard",
    );
    expect(safeCallbackPath("/path\twith-tab")).toBe("/dashboard");
    expect(safeCallbackPath("/path with space")).toBe("/dashboard");
  });

  it("does not loop back to the signin page", () => {
    expect(safeCallbackPath("/signin")).toBe("/dashboard");
    expect(safeCallbackPath("/signin?callbackUrl=/x")).toBe("/dashboard");
    expect(safeCallbackPath("/signin/whatever")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(safeCallbackPath(null, "/home")).toBe("/home");
    expect(safeCallbackPath("//evil.com", "/home")).toBe("/home");
  });
});
