export interface ILogger {
  log(message: any, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
}

export enum LogLevel {
  SILENT = 0,
  NORMAL = 1,
  VERBOSE = 2,
}

export class Logger implements ILogger {
  private level: LogLevel;
  constructor(level: LogLevel = LogLevel.NORMAL) {
    this.level = level;
  }
  warn(message: any, ...optionalParams: any[]): void {
    if (this.level >= LogLevel.NORMAL) {
      console.warn(message, optionalParams);
    }
  }
  error(message: any, ...optionalParams: any[]): void {
    if (this.level >= LogLevel.NORMAL) {
      console.error(message, optionalParams);
    }
  }
  log = (message: string, ...optionalParams: any[]) => {
    if (this.level >= LogLevel.NORMAL) {
      console.log(message, optionalParams);
    }
  };
  info = (message: string, ...optionalParams: any[]) => {
    if (this.level >= LogLevel.NORMAL) {
      console.info(message, optionalParams);
    }
  };
}
