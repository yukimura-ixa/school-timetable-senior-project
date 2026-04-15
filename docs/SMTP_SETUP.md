# SMTP Setup Guide

This project sends transactional emails (password reset, email verification,
email-change confirmation) via standard SMTP. The mailer is implemented in
`src/lib/mailer.ts` and reads configuration from environment variables.

When SMTP is not configured, the app still works: every would-be email is
recorded in the `email_outbox` table and viewable at
`/management/email-outbox`, where admins can copy verification URLs by hand.
This means **SMTP is optional for correctness but required for self-service
password reset / email verification at scale**.

See also: issue #203 for the full email-verification roadmap.

## Environment variables

The mailer recognizes these env vars (all read in `src/lib/mailer.ts`):

| Variable | Required | Description |
| --- | --- | --- |
| `SMTP_HOST` | Yes (for sending) | Hostname of the SMTP relay |
| `SMTP_PORT` | Yes (for sending) | Port. 587 for STARTTLS, 465 for implicit TLS, 1025 for local Mailpit |
| `EMAIL_FROM` | Yes (for sending) | `From:` address. Must be a verified sender at the provider |
| `SMTP_USER` | Provider-dependent | SMTP login (skip for Mailpit) |
| `SMTP_PASSWORD` | Provider-dependent | SMTP password / API key (skip for Mailpit) |
| `SMTP_SECURE` | No | `"true"` forces implicit TLS. Defaults to `true` when port is 465, `false` otherwise |
| `SMTP_TLS_REJECT_UNAUTHORIZED` | No | `"false"` disables cert validation. **Never set in production** — only for local relays using self-signed certs |

If `SMTP_HOST`, `SMTP_PORT`, or `EMAIL_FROM` is missing, `sendEmail()` returns
`{ success: false, error: "Email service is not configured..." }` and the
outbox row is marked SKIPPED. Auth flows continue to function.

## Local development: Mailpit (self-hosted, zero config)

[Mailpit](https://github.com/axllent/mailpit) is a single-binary SMTP server
with a web UI that captures every message sent to it without relaying
anywhere. It's bundled into `docker-compose.test.yml`.

### Start it

```bash
docker compose -f docker-compose.test.yml up -d mailpit
```

### Wire up your env

In `.env.local`:

```bash
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false"
EMAIL_FROM="noreply@test.local"
# SMTP_USER / SMTP_PASSWORD omitted — Mailpit accepts any auth
```

### View captured messages

Open <http://localhost:8025> to see every email the app has tried to send,
including rendered HTML, headers, attachments, and links.

### Why Mailpit (not a real provider) for dev

- Nothing leaves your machine, so you can't accidentally email real users.
- No daily quota to exhaust while iterating on templates.
- Works offline / on CI runners without network egress.
- Deterministic — every run starts with an empty inbox.

E2E tests can assert against Mailpit's HTTP API
(`http://localhost:8025/api/v1/messages`) to verify a specific email was sent
with the right subject and body.

## Production: Brevo (free tier, recommended)

[Brevo](https://www.brevo.com/) (formerly Sendinblue) offers **300 free
emails/day forever** with no credit card. For a school sending a few dozen
verification emails per month, this is essentially unlimited. Deliverability
is good because you're on a shared, reputable IP pool.

### Why not self-hosted?

Running your own mail server (Postfix, Mailcow, Mail-in-a-Box) is cheap on
hardware but expensive on ongoing work: IP reputation, SPF/DKIM/DMARC tuning,
rDNS records, bounce handling, and fighting delisting from Gmail/Outlook
blocklists. For low-volume transactional email to arbitrary addresses, a
managed provider's shared reputation is worth far more than a few dollars of
saved hosting cost. Self-hosted SMTP is appropriate for internal/intra-school
mail only.

### Setup steps

1. **Sign up** at <https://onboarding.brevo.com/account/register>. Confirm
   your email. No card required.

2. **Create an SMTP key**: Brevo dashboard → `SMTP & API` → `SMTP` tab →
   `Generate a new SMTP key`. Copy the key (you won't see it again).

3. **Verify your sender domain**: Brevo → `Senders, Domains & Dedicated IPs`
   → `Domains` → add `phrasong.ac.th` (or whichever domain you own). Brevo
   gives you 3 DNS records (DKIM + Brevo verification + optional DMARC).
   Add them to your DNS provider. Propagation is usually 15 min–2 hours.

   If you can't modify the school's DNS, Brevo also provides a `brevosend.com`
   subdomain you can use for testing, but the sender will look unofficial to
   recipients.

4. **Set the Vercel env vars** (Project Settings → Environment Variables):

   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=<your Brevo SMTP login, e.g. 8abc12@smtp-brevo.com>
   SMTP_PASSWORD=<the SMTP key from step 2>
   EMAIL_FROM=noreply@phrasong.ac.th
   ```

   **Do not** commit these values to git. Set them as Production (and
   optionally Preview) env vars.

5. **Deploy** — no code change needed. The mailer reads these on startup.

6. **Verify delivery end-to-end**: trigger a password reset for an address
   you control, confirm the email arrives in the inbox (check Spam folder on
   first send while reputation warms up).

### Monitoring

- Brevo dashboard → `Transactional` → `Statistics` shows delivered, bounced,
  opened, clicked.
- The app's `email_outbox` table is the source of truth for *what the app
  tried to send* regardless of provider status.
- Failed sends are visible both in Brevo's logs and in `email_outbox` with
  status `FAILED` plus the error message.

### If you hit the 300/day limit

300/day is 9,000/month. If the school ever exceeds that, Brevo's next tier is
paid but cheap (€8/month for 20k emails). Alternatives with similar free
tiers:

- **Resend** — 100/day, 3k/month free. Better DX, native `react-email`
  integration if you later build HTML templates (acceptance criterion #5 of
  #203).
- **Mailjet** — 200/day, 6k/month free.
- **AWS SES** — $0.10 per 1k emails. Cheap but not free; requires AWS
  account.

All speak standard SMTP, so switching is just changing the env vars.

## Alternative: Gmail SMTP

Only viable if the school has **Google Workspace for Education** on its own
domain (e.g. `@phrasong.ac.th`). Personal `@gmail.com` accounts technically
violate Google's TOS for transactional app email and are rate-limited at
~500/day.

If you do have Workspace EDU:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<workspace account, e.g. noreply@phrasong.ac.th>
SMTP_PASSWORD=<App Password generated at https://myaccount.google.com/apppasswords>
EMAIL_FROM=noreply@phrasong.ac.th
```

An App Password is required because 2FA is mandatory on Workspace accounts
and it lets apps bypass interactive login without exposing the user
password.

## Troubleshooting

**`EAUTH` / `535 Authentication failed`**
- Confirm `SMTP_USER` / `SMTP_PASSWORD` are correct. For Brevo, `SMTP_USER`
  looks like `8abc12@smtp-brevo.com`, not your dashboard login.
- For Gmail, confirm you're using an App Password, not the account
  password.

**Email sent but never arrives**
- Check `/management/email-outbox` — the row's `status` tells you whether
  the app even tried to send.
- Check the provider's dashboard for bounces / blocks.
- Inspect the recipient's spam folder. First sends on a new sender often
  land there; delivery improves once the domain warms up.

**`self signed certificate in certificate chain` from a local relay**
- Set `SMTP_TLS_REJECT_UNAUTHORIZED=false`. **Local dev only.**

**`ECONNREFUSED` against localhost:1025**
- Mailpit isn't running.
  `docker compose -f docker-compose.test.yml up -d mailpit`
