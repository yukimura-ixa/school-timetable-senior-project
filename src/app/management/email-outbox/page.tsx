import type { Metadata } from "next";
import { emailRepository } from "@/features/email/infrastructure/repositories/email.repository";
import type {
  EmailOutboxKind,
  EmailOutboxStatus,
} from "@/prisma/generated/client";
import { Box, Container, Typography } from "@mui/material";
import EmailOutboxTable, {
  type EmailOutboxRow,
} from "./_components/EmailOutboxTable";

export const metadata: Metadata = {
  title: "Email Outbox - Phrasongsa Timetable",
  description: "Admin-only email outbox for verification links",
};

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
  const status = params?.status?.trim() || undefined;
  const kind = params?.kind?.trim() || undefined;

  const rows = await emailRepository.findOutboxEmails({
    q,
    status: status as EmailOutboxStatus | undefined,
    kind: kind as EmailOutboxKind | undefined,
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
