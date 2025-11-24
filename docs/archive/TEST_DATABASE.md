# Test Database Setup Scripts

# Scripts for managing the local PostgreSQL test database with Docker

## Quick Start

```powershell
# 1. Start test database
pnpm test:db:up

# 2. Apply migrations
pnpm test:db:migrate

# 3. Seed test data
pnpm test:db:seed

# 4. Run tests
pnpm test

# 5. Stop database when done
pnpm test:db:down
```

## Available Commands

### Database Lifecycle

- `pnpm test:db:up` - Start PostgreSQL test database in Docker
- `pnpm test:db:down` - Stop and remove test database container
- `pnpm test:db:restart` - Restart test database
- `pnpm test:db:logs` - View database logs

### Schema Management

- `pnpm test:db:migrate` - Apply all migrations to test database
- `pnpm test:db:reset` - Reset database (drop + migrate)
- `pnpm test:db:seed` - Seed test data

### Testing

- `pnpm test:unit` - Run Jest tests with test database
- `pnpm test:unit:watch` - Run Jest in watch mode

## Database Connection

**Host:** localhost
**Port:** 5433 (to avoid conflicts with default PostgreSQL on 5432)
**Database:** test_timetable
**User:** test_user
**Password:** test_password

**Connection String:**

```
postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public
```

## Docker Compose

The test database is configured in `docker-compose.test.yml`:

- Uses PostgreSQL 16
- Persists data in Docker volume `test_db_data`
- Includes health checks
- Auto-restarts on system reboot

## Environment Variables

Test environment variables are loaded from `.env.test.local`:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Mock auth secret
- `NODE_ENV=test` - Ensures test mode

## Troubleshooting

### Port 5433 already in use

```powershell
# Check what's using the port
Get-NetTCPConnection -LocalPort 5433

# Stop the test database
pnpm test:db:down

# Or force remove
docker-compose -f docker-compose.test.yml down -v
```

### Connection refused

```powershell
# Check if container is running
docker ps | Select-String "timetable-test-db"

# Check logs
pnpm test:db:logs

# Restart database
pnpm test:db:restart
```

### Migration errors

```powershell
# Reset database completely
pnpm test:db:reset

# Check Prisma connection
$env:DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_timetable"
pnpm prisma db push
```

### Clean slate

```powershell
# Remove everything and start fresh
docker-compose -f docker-compose.test.yml down -v
pnpm test:db:up
pnpm test:db:migrate
pnpm test:db:seed
```

## Best Practices

1. **Keep test DB running** - Leave it running during development, restart only when needed
2. **Reset between test suites** - Use `beforeAll()` hooks to clear data
3. **Use transactions** - Wrap tests in transactions and rollback for isolation
4. **Seed data** - Keep seed data minimal and focused on test scenarios
5. **CI/CD** - Use same Docker setup in CI for consistency

## Integration with Jest

Jest is configured to:

1. Load `.env.test.local` automatically
2. Mock Prisma client for unit tests
3. Polyfill TextEncoder/TextDecoder for Node.js
4. Skip E2E tests (use Playwright for those)

See `jest.config.js` and `jest.setup.js` for details.
