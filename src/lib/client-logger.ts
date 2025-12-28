/**
 * Client-Side Logger Utility
 *
 * Lightweight structured logging for React client components.
 * Mirrors the server-side logger API for consistency.
 *
 * Usage:
 * ```typescript
 * import { createClientLogger } from '@/lib/client-logger';
 *
 * const log = createClientLogger('MyComponent');
 * log.error('Failed to save', { id: 123 });
 * log.logError(error, { action: 'save' });
 * ```
 */

export interface ClientLogContext {
  [key: string]: unknown;
}

export interface ClientLogger {
  debug: (message: string, context?: ClientLogContext) => void;
  info: (message: string, context?: ClientLogContext) => void;
  warn: (message: string, context?: ClientLogContext) => void;
  error: (message: string, context?: ClientLogContext) => void;
  logError: (error: unknown, context?: ClientLogContext) => void;
}

/**
 * Create a client-side logger with component context
 *
 * @param component - Component name for log prefixing
 * @returns Logger instance with debug, info, warn, error, logError methods
 */
export function createClientLogger(component: string): ClientLogger {
  const prefix = `[${component}]`;

  return {
    debug: (message: string, context?: ClientLogContext) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(prefix, "[debug]", message, context ?? "");
      }
    },

    info: (message: string, context?: ClientLogContext) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(prefix, "[info]", message, context ?? "");
      }
    },

    warn: (message: string, context?: ClientLogContext) => {
      console.warn(prefix, message, context ?? "");
    },

    error: (message: string, context?: ClientLogContext) => {
      console.error(prefix, message, context ?? "");
    },

    logError: (error: unknown, context?: ClientLogContext) => {
      if (error instanceof Error) {
        console.error(prefix, error.message, {
          ...context,
          errorName: error.name,
          stack:
            process.env.NODE_ENV !== "production" ? error.stack : undefined,
        });
      } else {
        console.error(prefix, "Unknown error", { ...context, error });
      }
    },
  };
}
