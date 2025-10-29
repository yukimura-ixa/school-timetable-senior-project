# Quick Setup: Add SEED_SECRET to Vercel

## Steps (2 minutes)

### 1. Open Vercel Environment Variables Page

Click this link (or navigate manually):
👉 **https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/settings/environment-variables**

### 2. Add New Variable

1. Click **"Add New"** button (top right)
2. Fill in the form:

   ```
   Key:   SEED_SECRET
   
   Value: df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0
   
   Environments: ☑ Production
                 ☑ Preview  
                 ☑ Development
   ```

3. Click **"Save"**

### 3. Trigger Redeploy

The environment variable won't be active until the next deployment. You have 2 options:

**Option A: Wait for next git push** (automatic)
- The next time you push to main, it will pick up the new env var

**Option B: Manual redeploy** (instant)
1. Go to: https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/deployments
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"
4. Click "Redeploy" again to confirm

### 4. Run the Seed Script

Once redeployed, run this in PowerShell:

```pwsh
pnpm seed:prod
```

Or directly:

```pwsh
.\scripts\seed-production.ps1
```

### Expected Output

```
🌱 Seeding production database...
URL: https://phrasongsa-timetable.vercel.app
Years: 2567, 2568 (semesters 1 & 2)

✓ Seed successful!

Results:
✨ Semester 1/2567 - CREATED (ConfigID: 1-2567)
✨ Semester 2/2567 - CREATED (ConfigID: 2-2567)
✨ Semester 1/2568 - CREATED (ConfigID: 1-2568)
✨ Semester 2/2568 - CREATED (ConfigID: 2-2568)

You can now access these routes:
  • /dashboard/1-2567/all-timeslot
  • /dashboard/2-2567/all-timeslot
  • /dashboard/1-2568/all-timeslot
  • /dashboard/2-2568/all-timeslot
  ...
```

### Verify It Worked

Visit these URLs - they should load now (instead of redirecting):
- https://phrasongsa-timetable.vercel.app/dashboard/1-2567/all-timeslot
- https://phrasongsa-timetable.vercel.app/dashboard/1-2568/all-timeslot

---

## Troubleshooting

### Still getting "Unauthorized"?
- Make sure you saved the SEED_SECRET in Vercel
- Verify you redeployed after adding the env var
- Check the value is exactly: `df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0`

### Routes still redirect to select-semester?
- Confirm the seed script showed "CREATED" for all 4 semesters
- Try clearing browser cache or use incognito mode
- Check Vercel logs for any database errors

---

**That's it!** 🎉

For more details, see: `docs/PRODUCTION_SEED_GUIDE.md`
