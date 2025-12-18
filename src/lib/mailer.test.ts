import { describe, expect, it } from "vitest";
import { sendEmail } from "@/lib/mailer";

/**
 * @vitest-environment node
 */

describe("mailer", () => {
  it("returns a clear error when SMTP env is missing", async () => {
    const prev = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      EMAIL_FROM: process.env.EMAIL_FROM,
    };

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.EMAIL_FROM;

    const res = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      text: "Hello",
    });

    process.env.SMTP_HOST = prev.SMTP_HOST;
    process.env.SMTP_PORT = prev.SMTP_PORT;
    process.env.SMTP_SECURE = prev.SMTP_SECURE;
    process.env.SMTP_USER = prev.SMTP_USER;
    process.env.SMTP_PASSWORD = prev.SMTP_PASSWORD;
    process.env.EMAIL_FROM = prev.EMAIL_FROM;

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("Email service is not configured");
    }
  });
});

