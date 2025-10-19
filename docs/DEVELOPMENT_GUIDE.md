# Development & Testing Guide

## OAuth Bypass for Testing

For local development and testing without requiring Google OAuth credentials, you can use the built-in bypass mechanism.

### ⚠️ Security Notice

The bypass mechanism uses a **server-only** environment variable (`ENABLE_DEV_BYPASS`) that:
- Is **NOT** embedded in the client-side bundle
- Defaults to **disabled** (`false`) for security
- Must be **explicitly** enabled in your local `.env` file
- Should **NEVER** be enabled in production deployments

### Setup Instructions

1. **Copy the environment template**
   ```bash
   cp .env.example .env
   ```

2. **Enable bypass mode in `.env`** (OPT-IN for local dev only)
   ```env
   # Set to "true" ONLY for local development
   # NEVER enable in production
   ENABLE_DEV_BYPASS="true"
   ```

3. **Configure the development user**
   ```env
   DEV_USER_EMAIL="admin@test.com"
   DEV_USER_ROLE="admin"
   DEV_USER_ID="1"
   DEV_USER_NAME="Test Admin"
   ```

4. **Restart the dev server** (required for env changes)
   ```bash
   npm run dev
   ```

### Usage

When bypass mode is enabled:

1. **Home Page**: A "เข้าสู่ระบบ (Dev Bypass)" button will appear
2. **Sign-in Page**: A "Dev Bypass (Testing)" button will be available
3. **No Database Check**: The system won't verify if the user exists in the database
4. **Admin Access**: You'll automatically get admin-level access

### Available Roles

Set `DEV_USER_ROLE` to one of:
- `admin` - Full system access (recommended for testing)
- `teacher` - Teacher-level access
- `student` - Read-only access to schedules

### Testing Different Users

To test different user types, change the `DEV_USER_ROLE` in `.env` and restart the dev server:

```bash
# Test as admin
DEV_USER_ROLE="admin"

# Test as teacher  
DEV_USER_ROLE="teacher"

# Test as student
DEV_USER_ROLE="student"
```

### Security Notes

⚠️ **CRITICAL - READ CAREFULLY**: 

**Why the bypass is secure:**
- Uses `ENABLE_DEV_BYPASS` (server-only variable) instead of `NEXT_PUBLIC_*`
- Server-only variables are **never embedded** in the client bundle
- Defaults to disabled (`false`) - must be explicitly enabled
- Production builds will not include the bypass even if accidentally enabled in `.env`

**Security checklist:**
- ✅ Bypass is **OPT-IN** - disabled by default
- ✅ Uses **server-only** environment variable
- ✅ Not embedded in production JavaScript bundles
- ✅ Checked server-side in middleware and auth callbacks
- ⚠️ NEVER set `ENABLE_DEV_BYPASS="true"` in production deployments
- ⚠️ Always use proper Google OAuth in production environments

### Disabling Bypass Mode

To use Google OAuth (production mode):

1. Set in `.env` (or remove the variable entirely):
   ```env
   ENABLE_DEV_BYPASS="false"
   ```

2. Configure Google OAuth credentials:
   ```env
   NEXT_GOOGLE_AUTH_CLIENT_ID="your-actual-google-client-id"
   NEXT_GOOGLE_AUTH_CLIENT_SECRET="your-actual-google-client-secret"
   ```

3. Restart the development server

## Running the Application

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.0
- npm package manager

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run prisma:migrate
npm run prisma:generate

# Seed test data (optional)
npm run prisma:seed
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:report
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### "Teacher not found" error with Google login

This happens when your Google account email doesn't exist in the `teacher` table. Solutions:

1. Use bypass mode for testing (recommended)
2. Add your Google account email to the database:
   ```sql
   INSERT INTO teacher (Email, Role, ...) VALUES ('your-email@gmail.com', 'admin', ...);
   ```

### Cannot access management pages

Check that your `DEV_USER_ROLE` is set to `"admin"` in `.env`

### Bypass button not showing

Ensure:
1. `NEXT_PUBLIC_BYPASS_AUTH="true"` is set in `.env`
2. The dev server has been restarted after changing `.env`
3. Environment variables starting with `NEXT_PUBLIC_` are available to the browser

## Documentation

See the [Documentation Index](./INDEX.md) for all available documentation.
