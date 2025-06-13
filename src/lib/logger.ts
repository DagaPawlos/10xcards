/**
 * Simple logger class for service logging
 */
export class Logger {
  constructor(private readonly context: string) {}

  /**
   * Log info level message
   * @param message Log message
   * @param meta Additional metadata
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[${this.context}] INFO:`, message, meta ? meta : "");
  }

  /**
   * Log error level message
   * @param error Error object
   * @param meta Additional metadata
   */
  public error(error: Error, meta?: Record<string, unknown>): void {
    console.error(`[${this.context}] ERROR:`, error.message, meta ? meta : "", error.stack);
  }
}
