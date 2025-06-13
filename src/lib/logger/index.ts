/**
 * Interface for metadata that can be logged
 */
export type LogMetadata = Record<string, unknown>;

/**
 * Logger service for consistent logging across the application
 */
export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log an info level message
   * @param message The message to log
   * @param meta Optional metadata to include
   */
  public info(message: string, meta?: LogMetadata): void {
    this.log("INFO", message, meta);
  }

  /**
   * Log an error level message
   * @param error The error object
   * @param meta Optional metadata to include
   */
  public error(error: Error, meta?: LogMetadata): void {
    this.log("ERROR", error.message, {
      ...meta,
      stack: error.stack,
      name: error.name,
    });
  }

  /**
   * Log a warning level message
   * @param message The message to log
   * @param meta Optional metadata to include
   */
  public warn(message: string, meta?: LogMetadata): void {
    this.log("WARN", message, meta);
  }

  /**
   * Log a debug level message
   * @param message The message to log
   * @param meta Optional metadata to include
   */
  public debug(message: string, meta?: LogMetadata): void {
    if (process.env.NODE_ENV === "development") {
      this.log("DEBUG", message, meta);
    }
  }

  /**
   * Internal method to format and output logs
   * @param level The log level
   * @param message The message to log
   * @param meta Optional metadata to include
   */
  private log(level: "INFO" | "ERROR" | "WARN" | "DEBUG", message: string, meta?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta ? { meta } : {}),
    };

    switch (level) {
      case "ERROR":
        console.error(JSON.stringify(logData, null, 2));
        break;
      case "WARN":
        console.warn(JSON.stringify(logData, null, 2));
        break;
      case "DEBUG":
        console.debug(JSON.stringify(logData, null, 2));
        break;
      default:
        console.log(JSON.stringify(logData, null, 2));
    }
  }
}
