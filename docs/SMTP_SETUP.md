# Azure Communication Services Email Setup Guide

This project sends transactional emails (password reset, email verification,
email-change confirmation) using Azure Communication Services (ACS) Email.
The mailer is implemented in `src/lib/mailer.ts` and reads configuration from
environment variables.

When ACS is not configured, the app still works: every would-be email is
recorded in the `email_outbox` table and viewable at
`/management/email-outbox`, where admins can copy verification URLs by hand.
This means **email delivery is optional for correctness but required for
self-service verification/reset flows at scale**.

## Environment variables

The mailer recognizes these env vars (all read in `src/lib/mailer.ts`):

| Variable | Required | Description |
| --- | --- | --- |
| `ACS_CONNECTION_STRING` | Yes (for sending) | Connection string from your ACS Communication Services resource |
| `ACS_SENDER_ADDRESS` | Yes (for sending) | Verified sender address, for example `DoNotReply@<guid>.azurecomm.net` or your custom-domain sender |

If either variable is missing, `sendEmail()` returns
`{ success: false, error: "Email service is not configured..." }` and the
outbox row is marked `SKIPPED`. Auth flows continue to function.

## From zero: ACS managed domain setup

Use this path when you want to get email sending live quickly without DNS work.

1. Create an **Email Communication Services** resource in Azure Portal.
2. Add an **Azure-managed domain** to that email resource.
3. Create an **Azure Communication Services** resource.
4. Open the ACS resource, go to **Email > Domains**, and connect your verified
   managed domain.
5. Use **Try Email** in the portal to confirm you can send to a real inbox.
6. Copy the ACS **connection string** from the ACS resource.
7. Pick a sender from the managed domain, for example:
   `DoNotReply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net`.

Important:
- Domain and ACS resources must be in the same geography.
- Keep the connection string secret; never commit it to git.

## Production with custom domain

Use this path for branded sender identity and best deliverability.

1. In Email Communication Services, add your custom domain (for example
   `phrasong.ac.th` or subdomain such as `mail.phrasong.ac.th`).
2. Add required DNS records in your DNS provider (SPF/DKIM and verification).
3. Wait until the domain is fully verified in Azure.
4. Connect the verified domain to your ACS resource.
5. Create the sender address you will use in app config.
6. Update production env vars and deploy.

## App configuration (Vercel)

Set these in Vercel Project Settings -> Environment Variables:

```
ACS_CONNECTION_STRING=endpoint=https://<resource>.communication.azure.com/;accesskey=<key>
ACS_SENDER_ADDRESS=DoNotReply@<guid>.azurecomm.net
```

For custom domain, use your verified sender address for
`ACS_SENDER_ADDRESS`.

## Validation checklist

1. Trigger password reset for a test user.
2. Check `/management/email-outbox`:
   - `SENT` means ACS accepted the message.
   - `FAILED` means provider/API error.
   - `SKIPPED` means ACS env vars are missing.
3. Confirm the email reaches the destination inbox (including Spam/Junk check).

## Troubleshooting

**Email outbox shows `SKIPPED`**
- `ACS_CONNECTION_STRING` or `ACS_SENDER_ADDRESS` is missing in runtime env.

**Email outbox shows `FAILED` with auth/permission errors**
- Connection string is incorrect or rotated.
- Sender address is not part of a connected, verified domain.

**ACS accepted send but recipient never received email**
- Check recipient spam folder.
- Verify sender domain authentication status (SPF/DKIM).
- Review ACS email events/logs for bounce/block diagnostics.

**Region/geography errors when connecting domains**
- Ensure Email Communication resource and ACS resource are created in matching
  geography before linking.
