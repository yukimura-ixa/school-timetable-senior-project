import nodemailer, { type Transporter } from "nodemailer";
import { createLogger } from "@/lib/logger";

const log = createLogger("Mailer");

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  tlsRejectUnauthorized: boolean;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const secureRaw = process.env.SMTP_SECURE;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const tlsRejectUnauthorizedRaw = process.env.SMTP_TLS_REJECT_UNAUTHORIZED;

  if (!host || !portRaw || !from) return null;

  const port = Number(portRaw);
  const secure = secureRaw === "true" || port === 465;
  const tlsRejectUnauthorized =
    tlsRejectUnauthorizedRaw == null ? true : tlsRejectUnauthorizedRaw === "true";

  if (!Number.isFinite(port)) return null;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    tlsRejectUnauthorized,
  };
}

const globalForMailer = global as unknown as {
  mailer?: Transporter;
  mailerConfigKey?: string;
};

function makeConfigKey(cfg: SmtpConfig) {
  return [
    cfg.host,
    cfg.port,
    cfg.secure ? "secure" : "insecure",
    cfg.user ?? "-",
    cfg.from,
    cfg.tlsRejectUnauthorized ? "tlsStrict" : "tlsLenient",
  ].join("|");
}

function getTransporter(): Transporter | null {
  const cfg = getSmtpConfig();
  if (!cfg) return null;

  const key = makeConfigKey(cfg);
  if (globalForMailer.mailer && globalForMailer.mailerConfigKey === key) {
    return globalForMailer.mailer;
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth:
      cfg.user && cfg.pass
        ? {
            user: cfg.user,
            pass: cfg.pass,
          }
        : undefined,
    tls: {
      rejectUnauthorized: cfg.tlsRejectUnauthorized,
      minVersion: "TLSv1.2",
    },
  });

  globalForMailer.mailer = transporter;
  globalForMailer.mailerConfigKey = key;

  log.info("Mailer initialized", {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    hasAuth: Boolean(cfg.user && cfg.pass),
  });

  return transporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendEmailResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

/**
 * Send an email via configured SMTP service.
 * Returns success: false if SMTP is not configured (check error message).
 * This allows the application to work without email in development/test environments.
 * 
 * @param input - Email parameters (to, subject, text, html)
 * @returns SendEmailResult with success status and messageId or error
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const cfg = getSmtpConfig();
  if (!cfg) {
    return {
      success: false,
      error:
        "Email service is not configured (missing SMTP_HOST/SMTP_PORT/EMAIL_FROM).",
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      error:
        "Email service is not configured (invalid SMTP settings).",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: cfg.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send email.";
    return { success: false, error: message };
  }
}

