# Windows Docker Desktop - DATABASE_URL Troubleshooting

## Problem

If you're experiencing Prisma connection errors like:

```
PrismaClientInitializationError: 
Can't reach database server at `localhost:5433`
```

Even though your Docker container is running and healthy, this is likely a **Windows Docker Desktop networking issue**.

## Root Cause

Windows Docker Desktop has a known limitation where:
- ✅ `127.0.0.1` works correctly for port forwarding
- ❌ `localhost` fails to resolve to Docker containers

## Solution

In your `.env.test` file, use `127.0.0.1` instead of `localhost`:

### ❌ WRONG (doesn't work on Windows)
```bash
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public"
```

### ✅ CORRECT (works on Windows)
```bash
DATABASE_URL="postgresql://test_user:test_password@127.0.0.1:5433/test_timetable?schema=public"
```

## Verification Steps

### 1. Check Docker Container is Running
```powershell
docker ps | Select-String "timetable-test-db"
```

Expected output:
```
0.0.0.0:5433->5432/tcp   timetable-test-db
```

### 2. Test Database Connection from Inside Container
```powershell
docker exec -it timetable-test-db psql -U test_user -d test_timetable -c "SELECT 1;"
```

Expected output:
```
 ?column? 
----------
        1
(1 row)
```

### 3. Test Prisma Connection from Host
```powershell
pnpm test:db:seed
```

Expected output:
```
🌱 Starting seed...
✅ Created 9 programs
✅ Created 18 grade levels
...
🎉 Seed completed successfully!
```

## References

- [Docker Desktop for Windows Networking](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)
- [Prisma Windows Docker Issues](https://github.com/prisma/prisma/issues?q=is%3Aissue+windows+localhost+docker)
- [Issue #102](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/102) - Original investigation and fix

## Additional Notes

This issue affects:
- Local E2E test database connections
- Playwright global setup seed script
- Any direct Prisma CLI commands using test database

This issue does NOT affect:
- Production deployments (Vercel uses connection pooling)
- macOS/Linux development (localhost works correctly)
- CI/CD pipelines (use environment variables directly)
