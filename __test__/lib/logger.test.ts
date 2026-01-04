/**
 * Logger Utility Tests
 *
 * Tests for the structured logging utility used across server actions
 * and server components.
 *
 * @see src/lib/logger.ts
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { logger, Logger, createLogger } from "@/lib/logger";

describe("Logger Utility", () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Singleton logger", () => {
    it("should export a singleton logger instance", () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should call console.info for info level", () => {
      logger.info("Test message");
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it("should call console.warn for warn level", () => {
      logger.warn("Warning message");
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it("should call console.error for error level", () => {
      logger.error("Error message");
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it("should call console.debug for debug level (dev mode)", () => {
      logger.debug("Debug message");
      expect(consoleSpy.debug).toHaveBeenCalled();
    });
  });

  describe("createLogger", () => {
    it("should create a child logger with component context", () => {
      const componentLogger = createLogger("TeacherService");
      componentLogger.info("Service initialized");

      expect(consoleSpy.info).toHaveBeenCalled();
      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain("TeacherService");
      expect(logOutput).toContain("Service initialized");
    });

    it("should maintain component context across multiple logs", () => {
      const componentLogger = createLogger("RoomService");

      componentLogger.info("First log");
      componentLogger.warn("Second log");

      expect(consoleSpy.info.mock.calls[0][0]).toContain("RoomService");
      expect(consoleSpy.warn.mock.calls[0][0]).toContain("RoomService");
    });
  });

  describe("Child logger", () => {
    it("should create child logger with merged context", () => {
      const parentLogger = new Logger({ service: "API" });
      const childLogger = parentLogger.child({ action: "create" });

      childLogger.info("Creating resource");

      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain("service");
      expect(logOutput).toContain("API");
      expect(logOutput).toContain("action");
      expect(logOutput).toContain("create");
    });

    it("should generate traceId when withTraceId is true", () => {
      const parentLogger = new Logger({});
      const childLogger = parentLogger.child({ request: "test" }, true);

      childLogger.info("Request started");

      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain("traceId");
    });
  });

  describe("Context logging", () => {
    it("should include additional context in log output", () => {
      logger.info("User action", { userId: 123, action: "login" });

      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain("userId");
      expect(logOutput).toContain("123");
      expect(logOutput).toContain("action");
      expect(logOutput).toContain("login");
    });

    it("should handle empty context gracefully", () => {
      logger.info("Simple message");
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it("should handle complex nested context", () => {
      logger.info("Complex context", {
        user: { id: 1, role: "admin" },
        metadata: { timestamp: "2024-01-01" },
      });

      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain("user");
      expect(logOutput).toContain("admin");
    });
  });

  describe("Log format", () => {
    it("should include timestamp in dev mode", () => {
      logger.info("Test");

      const logOutput = consoleSpy.info.mock.calls[0][0];
      // ISO timestamp format check (YYYY-MM-DDTHH:mm:ss)
      expect(logOutput).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should include level tag in pretty format", () => {
      logger.info("Test info");
      logger.warn("Test warn");
      logger.error("Test error");

      expect(consoleSpy.info.mock.calls[0][0]).toContain("[INFO]");
      expect(consoleSpy.warn.mock.calls[0][0]).toContain("[WARN]");
      expect(consoleSpy.error.mock.calls[0][0]).toContain("[ERROR]");
    });
  });

  describe("logError", () => {
    it("should log Error instance with name and message", () => {
      const error = new Error("Test error message");
      logger.logError(error);

      expect(consoleSpy.error).toHaveBeenCalled();
      const logOutput = consoleSpy.error.mock.calls[0][0];
      expect(logOutput).toContain("Test error message");
    });

    it("should log Error with additional context", () => {
      const error = new Error("Database connection failed");
      logger.logError(error, { database: "postgres", retryCount: 3 });

      const logOutput = consoleSpy.error.mock.calls[0][0];
      expect(logOutput).toContain("Database connection failed");
      expect(logOutput).toContain("postgres");
      expect(logOutput).toContain("retryCount");
    });

    it("should handle non-Error values", () => {
      logger.logError("String error");
      expect(consoleSpy.error).toHaveBeenCalled();
      const logOutput = consoleSpy.error.mock.calls[0][0];
      expect(logOutput).toContain("Unknown error");
    });

    it("should handle null/undefined errors", () => {
      logger.logError(null);
      logger.logError(undefined);
      expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    });
  });

  describe("time utility", () => {
    it("should measure successful async operation", async () => {
      const result = await logger.time(
        "testOperation",
        async () => {
          await new Promise((r) => setTimeout(r, 10));
          return "success";
        },
        { operationType: "test" },
      );

      expect(result).toBe("success");
      expect(consoleSpy.debug).toHaveBeenCalled();
      const logOutput = consoleSpy.debug.mock.calls[0][0];
      expect(logOutput).toContain("testOperation completed");
      expect(logOutput).toContain("duration");
    });

    it("should log error and rethrow on failed operation", async () => {
      const failingFn = async () => {
        throw new Error("Operation failed");
      };

      await expect(logger.time("failingOp", failingFn)).rejects.toThrow(
        "Operation failed",
      );

      expect(consoleSpy.error).toHaveBeenCalled();
      const logOutput = consoleSpy.error.mock.calls[0][0];
      expect(logOutput).toContain("failingOp failed");
      expect(logOutput).toContain("duration");
    });
  });

  describe("Log level filtering", () => {
    it("should respect minimum log level configuration", () => {
      const warnLogger = new Logger(
        {},
        {
          minLevel: "warn",
          enableDebug: false,
          enableTimestamp: true,
          prettyPrint: true,
        },
      );

      warnLogger.debug("Debug - should not appear");
      warnLogger.info("Info - should not appear");
      warnLogger.warn("Warn - should appear");
      warnLogger.error("Error - should appear");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("Production mode behavior", () => {
    it("should output JSON format when prettyPrint is disabled", () => {
      const prodLogger = new Logger(
        {},
        {
          minLevel: "info",
          enableDebug: false,
          enableTimestamp: true,
          prettyPrint: false,
        },
      );

      prodLogger.info("Production log", { userId: 1 });

      const logOutput = consoleSpy.info.mock.calls[0][0];
      // Should be valid JSON string
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe("info");
      expect(parsed.message).toBe("Production log");
      expect(parsed.userId).toBe(1);
    });
  });
});

describe("Logger Integration Scenarios", () => {
  let consoleSpy: {
    info: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should support server action logging pattern", () => {
    // Simulate server action logging pattern used in the codebase
    const actionLogger = createLogger("TeacherActions");

    // Log start
    actionLogger.info("getTeachers started", { configId: "1-2567" });

    // Log completion
    actionLogger.info("getTeachers completed", {
      configId: "1-2567",
      teacherCount: 50,
    });

    expect(consoleSpy.info).toHaveBeenCalledTimes(2);
    expect(consoleSpy.info.mock.calls[0][0]).toContain("TeacherActions");
    expect(consoleSpy.info.mock.calls[1][0]).toContain("teacherCount");
  });

  it("should support API route logging pattern", () => {
    // Simulate API route logging pattern
    const routeLogger = createLogger("PDFExport");

    routeLogger.info("PDF generation started", {
      gradeLevel: "M.1",
      semester: 1,
    });

    routeLogger.info("PDF generation completed", {
      pageCount: 5,
      durationMs: 1200,
    });

    expect(consoleSpy.info).toHaveBeenCalledTimes(2);
  });

  it("should support error handling pattern", () => {
    const actionLogger = createLogger("ConflictChecker");

    // Simulate error during conflict check
    const error = new Error("Database timeout");
    actionLogger.logError(error, {
      action: "checkConflicts",
      timeslotId: "1-2567-MON1",
    });

    expect(consoleSpy.error).toHaveBeenCalled();
    const logOutput = consoleSpy.error.mock.calls[0][0];
    expect(logOutput).toContain("ConflictChecker");
    expect(logOutput).toContain("Database timeout");
    expect(logOutput).toContain("1-2567-MON1");
  });
});
