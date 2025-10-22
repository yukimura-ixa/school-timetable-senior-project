# Suggested Commands (Windows PowerShell)

## Development Commands

### Package Management (⚠️ USE PNPM ONLY)
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

### Development Server
```powershell
# Start development server (http://localhost:3000)
pnpm dev
```

### Build & Production
```powershell
# Build for production
pnpm build

# Start production server
pnpm start
```

## Database Commands (Prisma)

### Schema & Migrations
```powershell
# Generate Prisma Client (run after schema changes)
pnpm prisma generate

# Create and apply migration
pnpm prisma migrate dev --name <migration-name>

# Apply pending migrations
pnpm prisma migrate deploy

# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset

# View migration status
pnpm prisma migrate status

# Seed database
pnpm prisma db seed
```

### Database Studio
```powershell
# Open Prisma Studio (GUI for database)
pnpm prisma studio
```

## Testing Commands

### Unit Tests (Jest)
```powershell
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### E2E Tests (Playwright)
```powershell
# Install Playwright browsers (first time only)
pnpm playwright:install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Run E2E tests in headed mode (visible browser)
pnpm test:e2e:headed

# Debug E2E tests
pnpm test:e2e:debug

# Show test report
pnpm test:report
```

## Code Quality Commands

### Linting
```powershell
# Run ESLint
pnpm lint

# Fix auto-fixable lint issues
pnpm lint --fix
```

### Formatting (Prettier)
```powershell
# Check formatting
pnpm prettier --check .

# Fix formatting
pnpm prettier --write .
```

## Git Commands (Windows PowerShell)

### Basic Git Operations
```powershell
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "commit message"

# Push changes
git push

# Pull changes
git pull

# Create new branch
git checkout -b <branch-name>

# Switch branch
git checkout <branch-name>

# View branches
git branch
```

## Windows PowerShell Utility Commands

### File Operations
```powershell
# List directory contents
Get-ChildItem
# or shorthand:
ls
dir

# Change directory
Set-Location <path>
# or shorthand:
cd <path>

# Create directory
New-Item -ItemType Directory -Path <path>

# Remove file/directory
Remove-Item <path>

# Copy file/directory
Copy-Item <source> <destination>

# Move/rename file/directory
Move-Item <source> <destination>
```

### File Content
```powershell
# View file content
Get-Content <file>
# or shorthand:
cat <file>

# Search in files (like grep)
Select-String -Path <path> -Pattern <pattern>

# Find files
Get-ChildItem -Path <path> -Recurse -Filter <pattern>
```

### Environment
```powershell
# View environment variables
Get-ChildItem Env:

# Set environment variable (session)
$env:VARIABLE_NAME = "value"

# View current directory
Get-Location
# or shorthand:
pwd
```

## Task Completion Workflow

After completing any task, run these commands in order:

1. **Generate Prisma Client** (if schema changed):
   ```powershell
   pnpm prisma generate
   ```

2. **Run Tests**:
   ```powershell
   pnpm test
   pnpm test:e2e
   ```

3. **Lint Code**:
   ```powershell
   pnpm lint
   ```

4. **Format Code**:
   ```powershell
   pnpm prettier --write .
   ```

5. **Verify Build**:
   ```powershell
   pnpm build
   ```
