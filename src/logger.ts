/**
 * Simple logging utility for the QR Code Generator
 * Supports different log levels and can be disabled in production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private level: LogLevel;
  private enabled: boolean;

  constructor(level: LogLevel = LogLevel.WARN) {
    this.level = level;
    // Enable logging only if DEBUG environment variable is set or in development
    this.enabled =
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development" ||
      false;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  debug(...args: unknown[]): void {
    if (this.enabled && this.level <= LogLevel.DEBUG) {
      console.log("[DEBUG]", ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.enabled && this.level <= LogLevel.INFO) {
      console.log("[INFO]", ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn("[WARN]", ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error("[ERROR]", ...args);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();
