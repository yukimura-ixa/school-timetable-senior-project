import { describe, expect, it } from "vitest";
import {
  normalizeAppRole,
  toAppRole,
  isAdminRole,
  isGuestRole,
} from "@/lib/authz";

describe("normalizeAppRole", () => {
  it("returns 'admin' for exactly 'admin'", () => {
    expect(normalizeAppRole("admin")).toBe("admin");
  });

  it("is case-sensitive — non-lowercase admin is not privileged", () => {
    expect(normalizeAppRole("Admin")).toBeUndefined();
    expect(normalizeAppRole("ADMIN")).toBeUndefined();
  });

  it("returns undefined for any other role", () => {
    expect(normalizeAppRole("teacher")).toBeUndefined();
    expect(normalizeAppRole("user")).toBeUndefined();
    expect(normalizeAppRole("")).toBeUndefined();
  });

  it("returns undefined for null or undefined", () => {
    expect(normalizeAppRole(null)).toBeUndefined();
    expect(normalizeAppRole(undefined)).toBeUndefined();
  });
});

describe("toAppRole", () => {
  it("is an alias of normalizeAppRole", () => {
    expect(toAppRole).toBe(normalizeAppRole);
    expect(toAppRole("admin")).toBe("admin");
  });
});

describe("isAdminRole", () => {
  it("is true only for 'admin'", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

describe("isGuestRole", () => {
  it("treats anything not admin as guest", () => {
    expect(isGuestRole(undefined)).toBe(true);
    expect(isGuestRole("admin")).toBe(false);
  });
});
