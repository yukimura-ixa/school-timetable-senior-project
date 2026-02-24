import type { Metadata } from "next";
import { emailRepository } from "@/features/email/infrastructure/repositories/email.repository";
import { Box, Container, Typography } from "@mui/material";
import EmailOutboxTable, {
  type EmailOutboxRow,
} from "./_components/EmailOutboxTable";
import * as v from "valibot";

export const metadata: Metadata = {
  title: "Email Outbox - Phrasongsa Timetable",
  description: "Admin-only email outbox for verification links",
};

const statusSchema = v.optional(
  v.picklist(["PENDING", "SENT", "FAILED", "SKIPPED"]),
);
const kindSchema = v.optional(
  v.picklist(["EMAIL_VERIFICATION", "CHANGE_EMAIL", "PASSWORD_RESET"]),
);

type SearchParams = Promise<{
  q?: string;
  status?: string;
  kind?: string;
}>;

export default async function EmailOutboxPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // Next.js 16+: searchParams is now a Promise
  const params = await searchParams;
  const q = params?.q?.trim() || undefined;
  const statusResult = v.safeParse(statusSchema, params?.status?.trim());
  const kindResult = v.safeParse(kindSchema, params?.kind?.trim());

  const rows = await emailRepository.findOutboxEmails({
    q,
    status: statusResult.success ? statusResult.output : undefined,
    kind: kindResult.success ? kindResult.output : undefined,
  });

  const data: EmailOutboxRow[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    toEmail: r.toEmail,
    subject: r.subject,
    verificationUrl: r.verificationUrl,
    providerMessageId: r.providerMessageId ?? null,
    lastError: r.lastError ?? null,
    expiresAt: r.expiresAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Email Outbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admin-only: verification links and delivery status (SMTP via
          Nodemailer).
        </Typography>
      </Box>

      <EmailOutboxTable rows={data} />
    </Container>
  );
}
