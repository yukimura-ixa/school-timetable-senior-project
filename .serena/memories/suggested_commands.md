# Suggested Commands - School Timetable System

## Package Manager

**CRITICAL: Use PNPM only (not npm or yarn)**

```powershell
# Install dependencies
pnpm install

# Add a package
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>

# Remove a package
pnpm remove <package-name>
```

## Development

### Start Development Server

```powershell
# Start Next.js development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server (after build)
pnpm start
```

## Database (Prisma)

### Schema Management

```powershell
# Generate Prisma Client (run after schema changes)
pnpm prisma generate

# Create migration (development only)
pnpm db:migrate
# Or manually:
pnpm prisma migrate dev --name <descriptive-name>

# Apply migrations (production/CI)
pnpm db:deploy
# Or manually:
pnpm prisma migrate deploy

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Seeding

```powershell
# Development seeding (admin only - safe, no data deletion)
pnpm db:seed

# Clean seeding (DELETES ALL DATA - use carefully!)
pnpm db:seed:clean

# Production seeding (semesters only)
pnpm seed:prod

# Production seeding with full data (semesters + timeslots + config)
.\scripts\seed-production.ps1 -SeedData

# Setup seed secret (one-time for production)
pnpm seed:setup
```

### Admin Management

```powershell
# Create admin user
pnpm admin:create

# Verify admin exists
pnpm admin:verify
```

## Code Quality

### Linting

```powershell
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Manually run ESLint with specific options
pnpm eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings=0
```

### Formatting

```powershell
# Format all files with Prettier
pnpm format

# Check formatting (without writing)
pnpm prettier --check .

# Format specific files
pnpm prettier --write src/**/*.ts
```

### Type Checking

```powershell
# Type check without emitting files
pnpm tsc --noEmit

# Type check with skip lib check (faster)
pnpm tsc --noEmit --skipLibCheck
```

## Testing

### Unit Tests (Jest)

```powershell
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test <test-file-path>

# Run with coverage
pnpm test --coverage
```

### E2E Tests (Playwright)

```powershell
# Install Playwright browsers (first time setup)
pnpm playwright:install

# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e e2e/smoke/semester-smoke.spec.ts

# Show test report
pnpm test:report
```

### Vercel E2E Tests

```powershell
# Test against Vercel deployment
pnpm test:vercel

# Test public pages only
pnpm test:vercel:public

# Test dashboard
pnpm test:vercel:dashboard

# With UI mode
pnpm test:vercel:ui

# Show Vercel test report
pnpm test:vercel:report
```

## Git Workflow

### Common Git Commands (PowerShell)

```powershell
# Check status
git status

# View changes
git diff

# Stage all changes
git add .

# Stage specific files
git add <file-path>

# Commit with message
git commit -m "feat: add new feature"

# Push to remote
git push

# Pull latest changes
git pull

# Create and checkout new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# View commit history
git log --oneline

# View last 10 commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes to file
git checkout -- <file-path>
```

## Windows-Specific Commands

### PowerShell Navigation

```powershell
# List directory contents
Get-ChildItem
# Or shorter alias:
ls
dir

# Change directory
Set-Location <path>
# Or shorter alias:
cd <path>

# Create directory
New-Item -ItemType Directory -Path <path>
# Or shorter:
mkdir <path>

# Remove directory
Remove-Item -Recurse -Force <path>

# View file content
Get-Content <file-path>
# Or shorter:
cat <file-path>

# Find files by name
Get-ChildItem -Recurse -Filter "*config*"

# Search in files (grep equivalent)
Select-String -Path "src/**/*.ts" -Pattern "ConfigID"

# Environment variables
$env:DATABASE_URL = "postgres://..."
$env:NODE_ENV = "development"
```

### File Operations

```powershell
# Copy file
Copy-Item <source> <destination>

# Move/Rename file
Move-Item <source> <destination>

# Delete file
Remove-Item <file-path>
```

## Environment Management

### Local Environment

```powershell
# Pull environment variables from Vercel (requires Vercel CLI)
vercel env pull .env.local

# View current environment variables
Get-Content .env.local

# Edit environment file
notepad .env.local
```

## Build & Deploy

### Local Build

```powershell
# Full production build
pnpm build

# Analyze bundle size
pnpm build --analyze
```

### Vercel Deployment

```powershell
# Deploy to Vercel (requires Vercel CLI)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

## Troubleshooting

### Common Issues & Solutions

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
pnpm install

# Regenerate Prisma Client
pnpm prisma generate

# Reset database (DANGER: deletes all data!)
pnpm prisma migrate reset

# Check Node version (should be 18+)
node --version

# Check pnpm version
pnpm --version
```

### Logs & Debugging

```powershell
# View Next.js build output
pnpm build 2>&1 | Out-File build-log.txt

# View test output
pnpm test 2>&1 | Out-File test-log.txt

# Check Prisma connection
pnpm prisma db pull
```

## Quick Reference

### Daily Development Workflow

```powershell
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
pnpm install

# 3. Apply database migrations
pnpm db:deploy

# 4. Start development server
pnpm dev

# 5. Make changes and test
pnpm test

# 6. Lint and format
pnpm lint:fix
pnpm format

# 7. Commit and push
git add .
git commit -m "feat: your changes"
git push
```

### Before Committing

```powershell
# Check everything passes
pnpm tsc --noEmit --skipLibCheck
pnpm lint
pnpm test
```

### After Schema Changes

```powershell
# 1. Generate Prisma Client
pnpm prisma generate

# 2. Create migration
pnpm prisma migrate dev --name <migration-name>

# 3. Verify migration worked
pnpm db:studio
```

## ConfigID Migration Commands (Recent Work)

### Phase-by-Phase Migration

```powershell
# Phase 1: Validation layer (DONE)
# - Updated config-validation.service.ts
# - Updated config.schemas.ts

# Phase 2: Routes (DONE)
# - Updated dashboard/[semesterAndyear]/layout.tsx
# - Updated schedule/[semesterAndyear]/layout.tsx

# Phase 3: Actions (DONE)
# - Updated semester.actions.ts

# Phase 4: Repository (DONE)
# - Updated seed-semesters/route.ts

# Phase 5: Tests (IN PROGRESS)
# Search for old formats in tests
Select-String -Path "__test__/**/*.ts" -Pattern "SEMESTER_1_\d{4}|/\d{4}"

# Phase 6: Database verification
# Run this query in Prisma Studio or psql:
# SELECT ConfigID FROM table_config WHERE ConfigID NOT REGEXP '^[1-3]-[0-9]{4}$';

# Phase 7: Update docs
# Update all examples in docs/ and README.md

# Phase 8: Deploy
pnpm test
pnpm test:e2e
pnpm build
vercel --prod
```
