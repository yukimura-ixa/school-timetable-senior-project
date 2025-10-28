# Production Database Seeding Guide

## Overview

The production database seeding system allows you to safely create semester records (table_config entries) in production without manual SQL or Prisma Studio access.

## How It Works

1. **Seed API Route** (`/api/admin/seed-semesters`)
   - Protected by `SEED_SECRET` environment variable
   - Idempotent: safe to run multiple times (won't duplicate data)
   - Creates `table_config` records for specified academic years/semesters
   - Only creates missing records; skips existing ones

2. **Server Validation Layouts**
   - Dashboard and schedule routes validate semester existence before rendering
   - Automatically redirect to `/dashboard/select-semester` if semester doesn't exist
   - Prevents error pages for missing semesters

3. **Enhanced Error Boundaries**
   - Show specific error messages with semester/year details
   - Example: "ไม่พบภาคเรียน 1/2568 ในระบบ หรือยังไม่ได้ตั้งค่า"

## Setup Instructions

### 1. Add SEED_SECRET to Vercel

**Option A: Using PowerShell Script (Recommended)**

```pwsh
# You'll need a Vercel API token from: https://vercel.com/account/tokens
# Set it as environment variable:
$env:VERCEL_TOKEN = "your_token_here"

# Run the script
.\scripts\add-seed-secret.ps1
```

**Option B: Manual via Vercel Dashboard**

1. Go to: https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/settings/environment-variables
2. Click "Add New"
3. Set:
   - Key: `SEED_SECRET`
   - Value: `df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0`
   - Environments: Production, Preview, Development (all checked)
4. Click "Save"

### 2. Redeploy (if needed)

After adding the environment variable, trigger a redeploy:

```bash
git commit --allow-empty -m "chore: trigger redeploy for SEED_SECRET"
git push origin main
```

Or use Vercel dashboard: https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/deployments

### 3. Run the Seed Script

```pwsh
.\scripts\seed-production.ps1
```

This will create 4 semester records:
- Semester 1/2567 (ConfigID: `1-2567`)
- Semester 2/2567 (ConfigID: `2-2567`)
- Semester 1/2568 (ConfigID: `1-2568`)
- Semester 2/2568 (ConfigID: `2-2568`)

## Verification

After seeding, test the routes:

### Production URLs
- https://phrasongsa-timetable.vercel.app/dashboard/1-2567/all-timeslot
- https://phrasongsa-timetable.vercel.app/dashboard/2-2567/all-timeslot
- https://phrasongsa-timetable.vercel.app/dashboard/1-2568/all-timeslot
- https://phrasongsa-timetable.vercel.app/dashboard/2-2568/all-timeslot

These should now:
✅ Load without redirects (instead of redirecting to select-semester)
✅ Show the page (even if data is empty initially)

### Invalid Routes (Test Error Handling)
- https://phrasongsa-timetable.vercel.app/dashboard/1-2569/all-timeslot
- https://phrasongsa-timetable.vercel.app/dashboard/3-2567/all-timeslot

These should:
✅ Redirect to `/dashboard/select-semester`

## API Details

### Endpoint
```
GET/POST /api/admin/seed-semesters?secret=<SEED_SECRET>&years=2567,2568
```

### Parameters
- `secret` (required): Must match `SEED_SECRET` env var
- `years` (optional): Comma-separated list of years. Default: `2567,2568`

### Response
```json
{
  "ok": true,
  "results": [
    {
      "year": 2567,
      "semester": 1,
      "created": true,
      "configId": "1-2567"
    },
    {
      "year": 2567,
      "semester": 2,
      "created": false,
      "configId": "2-2567"
    }
  ]
}
```

- `created: true` = New record created
- `created: false` = Record already existed

### Error Responses

**401 Unauthorized**
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```
→ SEED_SECRET missing or incorrect

**500 Internal Server Error**
```json
{
  "ok": false,
  "error": "Database connection failed"
}
```
→ Check Vercel logs for details

## Security Notes

- ⚠️ **Never commit** `SEED_SECRET` to git (it's in `.env.local` which is gitignored)
- ⚠️ The secret is **64 characters long** and randomly generated
- ✅ Endpoint is safe to expose publicly (protected by secret)
- ✅ Idempotent: running multiple times won't cause issues

## Troubleshooting

### "Unauthorized" error
- Verify `SEED_SECRET` is set in Vercel environment variables
- Ensure you've redeployed after adding the secret
- Check the secret value matches exactly (no extra spaces/quotes)

### "Database connection failed"
- Check Vercel logs: https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/logs
- Verify `DATABASE_URL` is set correctly
- Ensure Prisma client is generated (`postinstall` runs on deploy)

### Routes still redirect after seeding
- Check the seed response to confirm `created: true` or `created: false`
- Verify the ConfigID format matches the URL pattern (`1-2567`, not `2567-1`)
- Clear browser cache or try incognito mode

### Local Development

For local testing, the `.env.local` file already has `SEED_SECRET` set. You can test the endpoint locally:

```pwsh
# Start dev server
pnpm dev

# In another terminal, call the local endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/seed-semesters?secret=df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0"
```

## Next Steps

After seeding, you may want to:

1. **Create timeslots** for each semester via the dashboard
2. **Import teacher data** if starting fresh
3. **Set up class/subject assignments**
4. **Configure period schedules** for each semester

These can be done through the admin UI at:
- https://phrasongsa-timetable.vercel.app/dashboard/select-semester
