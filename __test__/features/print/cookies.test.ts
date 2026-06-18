import { describe, it, expect } from "vitest";
import { parseCookieHeader } from "@/features/print/cookies";

describe("parseCookieHeader", () => {
  it("splits a cookie header into puppeteer cookie objects scoped to the domain", () => {
    const out = parseCookieHeader("a=1; b=two", "localhost");
    expect(out).toEqual([
      { name: "a", value: "1", domain: "localhost", path: "/" },
      { name: "b", value: "two", domain: "localhost", path: "/" },
    ]);
  });
  it("returns [] for null/empty", () => {
    expect(parseCookieHeader(null, "localhost")).toEqual([]);
    expect(parseCookieHeader("", "localhost")).toEqual([]);
  });
});
