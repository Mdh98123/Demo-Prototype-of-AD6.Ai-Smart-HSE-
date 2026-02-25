
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

class LoggerService {
  private static instance: LoggerService;
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  private log(entry: LogEntry): void {
    // In production, this would dispatch to Sentry/Datadog/CloudWatch
    if (this.isProduction && entry.level === LogLevel.DEBUG) return;

    const logPayload = {
      ...entry,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(`[${entry.timestamp}] [ERROR]: ${entry.message}`, entry.context, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(`[${entry.timestamp}] [WARN]: ${entry.message}`, entry.context);
        break;
      case LogLevel.INFO:
        console.info(`[${entry.timestamp}] [INFO]: ${entry.message}`, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(`[${entry.timestamp}] [DEBUG]: ${entry.message}`, entry.context);
        break;
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  public error(message: string, error?: unknown, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    });
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }
}

export const Logger = LoggerService.getInstance();
