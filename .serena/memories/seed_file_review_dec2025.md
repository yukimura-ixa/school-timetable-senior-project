# Seed File Review & Production Seeding (December 2025)

## Summary

Reviewed and fixed `prisma/seed.ts`, then successfully seeded production database.

## Critical Bug Fixed: TimeslotID Format

**Issue:** TimeslotID format was inconsistent across the codebase.
- **Documented standard:** `1-2567-MON1` (no dash before period)
- **seed.ts was using:** `1-2567-MON-1` (with dash before period)

**Lines Fixed:**
- Line 399: Demo timeslots for 2567 semesters
- Line 428: Demo timeslots for 2568 semester
- Line 606: Demo class schedules
- Line 2091: Full test semester 1 timeslots
- Line 2123: Full test semester 2 timeslots  
- Line 2153: Full test semester 1-2568 timeslots
- Line 2488: Full test class schedules lookup
- Line 2534: Full test locked club activity schedules

**Regex Pattern (standard):** `/^[1-3]-\d{4}-(MON|TUE|WED|THU|FRI)[1-8]$/`

## Seed Modes Available

| Command | Mode | Use Case |
|---------|------|----------|
| `pnpm db:seed` | Default | Admin user only (safe for prod init) |
| `pnpm db:seed:demo` | Demo | Minimal demo data (idempotent, additive) |
| `pnpm db:seed:clean` | Full Test | 40 teachers, 18 grades (destructive cleanup) |
| `pnpm test:db:seed` | CI/CD | Same as clean + auth session cleanup |
| `pnpm seed:prod` | API | Semesters + timeslots via API endpoint |

## Production Seeding Command

```bash
# Pull production env vars
vercel env pull .env.production

# Run demo seed against production
$env:SEED_DEMO_DATA = "true"
pnpm dotenv -e .env.production -- tsx prisma/seed.ts
```

## Production Data Created

| Entity | Count | Notes |
|--------|-------|-------|
| Admin User | 1 | admin@school.local / admin123 |
| Subjects | 10 | MOE 8 learning areas for M.1 |
| Programs | 1 | หลักสูตรวิทย์-คณิต ม.1 |
| Program-Subject Links | 10 | All subjects linked to program |
| Grade Levels | 3 | M.1/1, M.1/2, M.1/3 |
| Rooms | 5 | ห้อง 111-113, 211-212 |
| Teachers | 8 | 1 per department |
| Timeslots | 120 | 3 semesters × 5 days × 8 periods |
| Table Configs | 3 | 1-2567, 2-2567, 1-2568 |
| Responsibilities | 72 | 3 semesters × 3 grades × 8 subjects |
| Class Schedules | 12 | Sample schedules for visual testing |

## API Endpoint for Infrastructure Seeding

`/api/admin/seed-semesters` - Creates semesters, timeslots, and table_configs only.

Requires:
- `SEED_SECRET` env variable
- Admin session (in production)

Usage via script:
```powershell
pnpm seed:prod             # Semesters only
pnpm seed:prod -SeedData   # + timeslots + config
```

## Known Issues

1. **Teacher-Subject Department Warnings** - Demo seed reuses existing teachers whose departments may not match subject learning areas. This is expected behavior.

2. **Unique Constraint Errors** - When re-running seed, class_schedule upserts fail due to new unique constraints (`TimeslotID + RoomID`). The error handling catches these and skips duplicates.

## Related Files

- `prisma/seed.ts` - Main seed file
- `scripts/seed-production.ps1` - Production API seeding script
- `src/app/api/admin/seed-semesters/route.ts` - API endpoint
- `docs/SEED_README.md` - Detailed seed documentation
