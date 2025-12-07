# Logging Guide

## Overview

The application uses a structured logging utility (`src/lib/logger.ts`) for consistent, environment-aware logging across Server Components and Server Actions.

## Quick Start

```typescript
import { logger, createLogger } from '@/lib/logger';

// Basic usage
logger.info('User logged in', { userId: 123 });
logger.error('Database error', { error: err.message });

// Component-specific logger
const log = createLogger('AuthService');
log.info('Authentication started');
log.debug('Token validated', { token: 'masked' });
```

## Features

### Environment Awareness
- **Development**: Logs debug+ with pretty formatting
- **Production**: Logs info+ as structured JSON
- **Debug Mode**: Enable via `DEBUG_MODE=true` env var

### Log Levels
1. **debug** - Detailed diagnostic information (dev/debug mode only)
2. **info** - General informational messages
3. **warn** - Warning messages
4. **error** - Error conditions

### Structured Context
All log methods accept optional context:
```typescript
logger.info('Processing request', {
  userId: 123,
  endpoint: '/api/data',
  duration: 45
});
```

## Common Patterns

### Server Actions
```typescript
'use server';
import { createLogger } from '@/lib/logger';

const log = createLogger('UserActions');

export async function getUserAction(id: string) {
  log.debug('Fetching user', { id });
  
  try {
    const user = await db.user.findUnique({ where: { id } });
    log.info('User fetched successfully', { userId: id });
    return { success: true, data: user };
  } catch (error) {
    log.logError(error, { userId: id, action: 'getUserAction' });
    return { success: false, error: 'Failed to fetch user' };
  }
}
```

### Error Logging
```typescript
try {
  await riskyOperation();
} catch (error) {
  // Automatic stack trace extraction in dev
  log.logError(error, { context: 'additional info' });
}
```

### Performance Timing
```typescript
const result = await log.time('fetchUsers', async () => {
  return await db.user.findMany();
}, { cacheKey: 'all-users' });
// Logs: "fetchUsers completed" with duration in ms
```

### Child Loggers
Create scoped loggers with persistent context:
```typescript
const userLog = logger.child({ userId: 123, sessionId: 'abc' });
userLog.info('Action performed');
// Output includes: { userId: 123, sessionId: 'abc', ... }
```

## Environment Variables

### `DEBUG_MODE`
Enable debug logging in any environment:
```bash
DEBUG_MODE=true pnpm dev
```

### `NODE_ENV`
Automatically configured:
- `development` - Debug logs enabled, pretty format
- `production` - Info+ only, JSON format
- `test` - Info+ only, JSON format

## Output Formats

### Development (Pretty)
```
2024-12-07T10:30:00.000Z [INFO] User logged in {"userId":123}
2024-12-07T10:30:01.000Z [ERROR] Database error {"error":"Connection failed"}
```

### Production (JSON)
```json
{"timestamp":"2024-12-07T10:30:00.000Z","level":"info","message":"User logged in","userId":123}
{"timestamp":"2024-12-07T10:30:01.000Z","level":"error","message":"Database error","error":"Connection failed"}
```

## Best Practices

### DO
✅ Use component-scoped loggers: `createLogger('ComponentName')`  
✅ Include relevant context in every log  
✅ Use `log.logError()` for caught exceptions  
✅ Log at appropriate levels (debug for diagnostics, info for events)  
✅ Use `log.time()` for performance-critical operations

### DON'T
❌ Log sensitive data (passwords, tokens, API keys)  
❌ Use `console.log()` directly (use logger instead)  
❌ Log excessively in tight loops  
❌ Include full objects with circular references  
❌ Log in client components (use browser console instead)

## Migration from console.log

### Before
```typescript
console.log('[PRISMA] Connecting to DB:', connectionString);
console.error('Error:', error);
```

### After
```typescript
const log = createLogger('Prisma');
log.debug('Connecting to database', { protocol: 'postgres' });
log.logError(error, { context: 'database connection' });
```

## Examples by Feature

### Authentication
```typescript
const log = createLogger('Auth');

log.info('Sign in attempt', { email: user.email });
log.debug('Session created', { sessionId: session.id, expiresAt: session.expiresAt });
log.warn('Invalid credentials', { email: user.email, attempt: 3 });
```

### Database Operations
```typescript
const log = createLogger('Database');

log.debug('Query executed', { table: 'users', duration: 45 });
log.error('Transaction failed', { operation: 'createUser', rollback: true });
```

### API Routes
```typescript
const log = createLogger('API');

log.info('Request received', { method: 'POST', path: '/api/users' });
log.warn('Rate limit exceeded', { ip: req.ip, endpoint: '/api/data' });
```

## Integration with Existing Tools

### Prisma
Already integrated in `src/lib/prisma.ts`:
```typescript
const log = createLogger('Prisma');
log.debug('Initializing database connection', { protocol: 'postgres' });
```

### E2E Tests
Use the test-specific log helper in `e2e/auth.setup.ts`:
```typescript
const log = {
  info: (msg: string, ctx?: Record<string, unknown>) => 
    console.log(`[AUTH SETUP] ${msg}`, ctx || ""),
  // ...
};
```

## Future Enhancements

- [ ] Integration with external logging services (Datadog, LogRocket)
- [ ] Log aggregation and search
- [ ] Performance metrics dashboard
- [ ] Structured error tracking
- [ ] Request ID correlation across services
