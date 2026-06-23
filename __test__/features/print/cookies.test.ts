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
  it("omits secure/sameSite on http (default) so __Secure- cookies are not required", () => {
    expect(parseCookieHeader("a=1", "localhost")).toEqual([
      { name: "a", value: "1", domain: "localhost", path: "/" },
    ]);
  });
  it("marks cookies Secure + Lax under https so __Secure- session cookies are accepted", () => {
    expect(parseCookieHeader("__Secure-session=tok", "example.com", true)).toEqual([
      {
        name: "__Secure-session",
        value: "tok",
        domain: "example.com",
        path: "/",
        secure: true,
        sameSite: "Lax",
      },
    ]);
  });
});
