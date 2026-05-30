import { describe, it, expect } from "vitest";
import theme from "../theme";

describe("theme palette lighter tokens", () => {
  it("defines lighter on primary, success, and error", () => {
    expect(theme.palette.primary.lighter).toBe("#EFF6FF");
    expect(theme.palette.success.lighter).toBe("#ECFDF5");
    expect(theme.palette.error.lighter).toBe("#FEF2F2");
  });
});
