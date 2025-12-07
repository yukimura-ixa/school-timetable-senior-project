/**
 * Application Logger Utility
 *
 * Lightweight structured logging with dev/debug mode support.
 * Designed for Next.js 16 Server Components and Server Actions.
 *
 * Features:
 * - Environment-aware logging (production vs development)
 * - Structured log format with context
 * - Debug mode toggle via DEBUG_MODE env var
 * - No external dependencies (uses native console)
 * - Server-side only (Client components should use browser console directly)
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * // Basic logging
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Database error', { error: err.message });
 * logger.debug('Processing request', { params });
 *
 * // Component-specific logger
 * const log = logger.child({ component: 'AuthService' });
 * log.info('Authentication started');
 * ```
 */

/* eslint-disable no-console */
// This file is a logging utility wrapper, console usage is intentional

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

interface LoggerConfig {
  minLevel: LogLevel;
  enableDebug: boolean;
  enableTimestamp: boolean;
  prettyPrint: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  private context: LogContext;

  constructor(context: LogContext = {}, config?: Partial<LoggerConfig>) {
    const isDev = process.env.NODE_ENV !== "production";
    const debugMode = process.env.DEBUG_MODE === "true";

    this.context = context;
    this.config = {
      minLevel: isDev ? "debug" : "info",
      enableDebug: isDev || debugMode,
      enableTimestamp: true,
      prettyPrint: isDev,
      ...config,
    };
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: LogContext): Logger {
    return new Logger({ ...this.context, ...childContext }, this.config);
  }

  /**
   * Debug-level logging (only in dev/debug mode)
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * Info-level logging
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * Warning-level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * Error-level logging
   */
  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Skip if below minimum level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    // Skip debug logs unless explicitly enabled
    if (level === "debug" && !this.config.enableDebug) {
      return;
    }

    const logEntry = this.formatLogEntry(level, message, context);

    // Route to appropriate console method
    switch (level) {
      case "debug":
        console.debug(logEntry);
        break;
      case "info":
        console.info(logEntry);
        break;
      case "warn":
        console.warn(logEntry);
        break;
      case "error":
        console.error(logEntry);
        break;
    }
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string | object {
    const mergedContext = { ...this.context, ...context };

    if (this.config.prettyPrint) {
      // Pretty format for development
      const timestamp = this.config.enableTimestamp
        ? new Date().toISOString()
        : "";
      const levelTag = `[${level.toUpperCase()}]`;
      const contextStr =
        Object.keys(mergedContext).length > 0
          ? ` ${JSON.stringify(mergedContext)}`
          : "";

      return `${timestamp} ${levelTag} ${message}${contextStr}`;
    } else {
      // Structured JSON for production
      return {
        timestamp: this.config.enableTimestamp
          ? new Date().toISOString()
          : undefined,
        level,
        message,
        ...mergedContext,
      };
    }
  }

  /**
   * Measure execution time
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { ...context, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, {
        ...context,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Safe error logging with stack trace
   */
  logError(error: unknown, context?: LogContext): void {
    if (error instanceof Error) {
      this.error(error.message, {
        ...context,
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
        },
      });
    } else {
      this.error("Unknown error occurred", {
        ...context,
        error: String(error),
      });
    }
  }
}

// Export singleton logger
export const logger = new Logger();

// Export class for custom instances
export { Logger };

/**
 * Utility: Create component-scoped logger
 */
export function createLogger(component: string): Logger {
  return logger.child({ component });
}
