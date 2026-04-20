import { describe, expect, it } from "vitest";
import { sendEmail } from "@/lib/mailer";

/**
 * @vitest-environment node
 */

describe("mailer", () => {
  it("returns a clear error when ACS env is missing", async () => {
    const prev = {
      ACS_CONNECTION_STRING: process.env.ACS_CONNECTION_STRING,
      ACS_SENDER_ADDRESS: process.env.ACS_SENDER_ADDRESS,
    };

    delete process.env.ACS_CONNECTION_STRING;
    delete process.env.ACS_SENDER_ADDRESS;

    const res = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      text: "Hello",
    });

    process.env.ACS_CONNECTION_STRING = prev.ACS_CONNECTION_STRING;
    process.env.ACS_SENDER_ADDRESS = prev.ACS_SENDER_ADDRESS;

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("Email service is not configured");
      expect(res.error).toContain("ACS_CONNECTION_STRING/ACS_SENDER_ADDRESS");
    }
  });
});

