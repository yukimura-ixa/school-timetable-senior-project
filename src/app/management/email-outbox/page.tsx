import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Box, Container, Typography } from "@mui/material";
import type { EmailOutbox } from "@/prisma/generated/client";
import EmailOutboxTable, { type EmailOutboxRow } from "./_components/EmailOutboxTable";

export const metadata: Metadata = {
  title: "Email Outbox - Phrasongsa Timetable",
  description: "Admin-only email outbox for verification links",
};

type SearchParams = {
  q?: string;
  status?: string;
  kind?: string;
};

export default async function EmailOutboxPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = searchParams?.q?.trim() || undefined;
  const status = searchParams?.status?.trim() || undefined;
  const kind = searchParams?.kind?.trim() || undefined;

  const rows = (await prisma.emailOutbox.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { toEmail: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
      ...(kind ? { kind: kind as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })) as EmailOutbox[];

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
          Admin-only: verification links and delivery status (SMTP via Nodemailer).
        </Typography>
      </Box>

      <EmailOutboxTable rows={data} />
    </Container>
  );
}
