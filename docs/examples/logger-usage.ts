/**
 * Example: Using the Logger in Server Actions
 * 
 * This file demonstrates how to use the logger utility
 * in various scenarios within the application.
 */

import { createLogger, logger } from '@/lib/logger';

// ============================================================================
// Example 1: Basic Logging
// ============================================================================

export function basicLoggingExample() {
  logger.info('Application started');
  logger.debug('Debug mode enabled', { version: '2.0.0' });
  logger.warn('Deprecated API used', { api: '/old-endpoint' });
  logger.error('Failed to connect', { service: 'database' });
}

// ============================================================================
// Example 2: Component-Scoped Logger
// ============================================================================

const authLog = createLogger('AuthService');

export function authExample() {
  authLog.info('User sign-in attempt', { email: 'user@example.com' });
  authLog.debug('Session created', { sessionId: 'abc123', expiresAt: '2024-12-08' });
  authLog.warn('Rate limit approaching', { remainingAttempts: 2 });
}

// ============================================================================
// Example 3: Error Logging with Stack Traces
// ============================================================================

const dbLog = createLogger('Database');

export async function errorLoggingExample() {
  try {
    // Simulated database operation
    throw new Error('Connection timeout');
  } catch (error) {
    // Automatically extracts error message and stack trace
    dbLog.logError(error, { 
      operation: 'fetchUsers',
      retryAttempt: 1 
    });
  }
}

// ============================================================================
// Example 4: Performance Timing
// ============================================================================

const apiLog = createLogger('API');

export async function performanceExample() {
  // Simulated async operation
  const fetchData = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { users: [], total: 0 };
  };

  // Automatically logs duration
  const result = await apiLog.time('fetchUsers', fetchData, {
    cacheKey: 'all-users',
    endpoint: '/api/users'
  });
  // Logs: "fetchUsers completed" with { duration: 100, cacheKey: 'all-users', ... }

  return result;
}

// ============================================================================
// Example 5: Child Logger with Persistent Context
// ============================================================================

export function childLoggerExample(userId: string, sessionId: string) {
  // Create a child logger with request context
  const requestLog = logger.child({ 
    userId, 
    sessionId,
    requestId: 'req-123' 
  });

  requestLog.info('Processing request');
  // Output: { userId: '...', sessionId: '...', requestId: 'req-123', message: 'Processing request' }

  requestLog.debug('Validating permissions');
  // Output includes the same context automatically

  requestLog.info('Request completed', { duration: 150 });
  // Output: { userId: '...', sessionId: '...', requestId: 'req-123', duration: 150, message: 'Request completed' }
}

// ============================================================================
// Example 6: Server Action with Comprehensive Logging
// ============================================================================

'use server';

const actionLog = createLogger('UserActions');

export async function getUserAction(id: string) {
  actionLog.debug('getUserAction called', { userId: id });

  try {
    // Simulated DB call
    const user = { id, name: 'John Doe', email: 'john@example.com' };

    actionLog.info('User fetched successfully', { 
      userId: id,
      fieldsReturned: Object.keys(user).length 
    });

    return { success: true, data: user };

  } catch (error) {
    actionLog.logError(error, { 
      userId: id, 
      action: 'getUserAction' 
    });

    return { 
      success: false, 
      error: 'Failed to fetch user' 
    };
  }
}

// ============================================================================
// Example 7: Conditional Debug Logging
// ============================================================================

export function conditionalLoggingExample() {
  const perfLog = createLogger('Performance');

  // Debug logs only appear when DEBUG_MODE=true or NODE_ENV=development
  perfLog.debug('Cache hit rate', { rate: 0.85, hits: 850, misses: 150 });
  perfLog.debug('Memory usage', { heapUsed: 45.2, heapTotal: 128 });

  // Info logs always appear (unless in production with DEBUG_MODE=false)
  perfLog.info('Request processed', { duration: 45 });
}

// ============================================================================
// Environment Variables (for reference)
// ============================================================================

/**
 * DEBUG_MODE=true - Enable debug logs in any environment
 * NODE_ENV=production - Production mode (info+ logs, JSON format)
 * NODE_ENV=development - Development mode (debug+ logs, pretty format)
 */
