import {
  EmailClient,
  KnownEmailSendStatus,
} from "@azure/communication-email";
import { createLogger } from "@/lib/logger";

const log = createLogger("Mailer");

type AcsEmailConfig = {
  connectionString: string;
  senderAddress: string;
};

function getAcsConfig(): AcsEmailConfig | null {
  const connectionString = process.env.ACS_CONNECTION_STRING;
  const senderAddress = process.env.ACS_SENDER_ADDRESS;

  if (!connectionString || !senderAddress) return null;

  return {
    connectionString,
    senderAddress,
  };
}

const globalForMailer = global as unknown as {
  mailer?: EmailClient;
  mailerConfigKey?: string;
};

function makeConfigKey(cfg: AcsEmailConfig) {
  return [cfg.connectionString, cfg.senderAddress].join("|");
}

function getEmailClient(): EmailClient | null {
  const cfg = getAcsConfig();
  if (!cfg) return null;

  const key = makeConfigKey(cfg);
  if (globalForMailer.mailer && globalForMailer.mailerConfigKey === key) {
    return globalForMailer.mailer;
  }

  const client = new EmailClient(cfg.connectionString);

  globalForMailer.mailer = client;
  globalForMailer.mailerConfigKey = key;

  log.info("Mailer initialized", { provider: "ACS", senderAddress: cfg.senderAddress });

  return client;
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
 * Send an email via configured Azure Communication Services Email.
 * Returns success: false if ACS is not configured (check error message).
 * This allows the application to work without email in development/test environments.
 *
 * @param input - Email parameters (to, subject, text, html)
 * @returns SendEmailResult with success status and messageId or error
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const cfg = getAcsConfig();
  if (!cfg) {
    return {
      success: false,
      error:
        "Email service is not configured (missing ACS_CONNECTION_STRING/ACS_SENDER_ADDRESS).",
    };
  }

  const client = getEmailClient();
  if (!client) {
    return {
      success: false,
      error:
        "Email service is not configured (invalid ACS settings).",
    };
  }

  try {
    const poller = await client.beginSend({
      senderAddress: cfg.senderAddress,
      content: {
        subject: input.subject,
        plainText: input.text,
        ...(input.html ? { html: input.html } : {}),
      },
      recipients: {
        to: [{ address: input.to }],
      },
    });

    const result = await poller.pollUntilDone();

    if (!result || result.status !== KnownEmailSendStatus.Succeeded) {
      const providerError =
        result?.error?.message ??
        `Email send did not succeed (status: ${result?.status ?? "unknown"}).`;
      return { success: false, error: providerError };
    }

    return { success: true, messageId: result.id };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send email.";
    return { success: false, error: message };
  }
}

