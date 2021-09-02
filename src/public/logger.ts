/* eslint-disable no-console */

import { NOOP } from '../internal/core/noop';

export interface LoggerInterface {
  error(msg: unknown, ...optionalParams: unknown[]): void;
  warn(msg: unknown, ...optionalParams: unknown[]): void;
  info(msg: unknown, ...optionalParams: unknown[]): void;
  debug(msg: unknown, ...optionalParams: unknown[]): void;
  trace(msg: unknown, ...optionalParams: unknown[]): void;
}

export type LogConfig = {
  handler?: string;
  levels: { [module: string]: LogLevel };
};

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR
}

export class Logger implements LoggerInterface {
  error = NOOP;
  warn = NOOP;
  info = NOOP;
  debug = NOOP;
  trace = NOOP;
}

export class LogManager {
  private registeredLoggers: { [module: string]: Logger } = {};

  private config: LogConfig = {
    handler: 'console',
    levels: {
      '': LogLevel.INFO
    }
  };

  public getLogger(module: string): LoggerInterface {
    let logger = this.registeredLoggers[module];
    if (!logger) {
      logger = new Logger();
      this.registeredLoggers[module] = logger;
      this.setupLogger(logger, module);
    }
    return logger;
  }

  public configure(config: LogConfig): this {
    this.config = Object.assign({}, this.config, config);
    for (const module in this.registeredLoggers) {
      this.setupLogger(this.registeredLoggers[module], module);
    }
    return this;
  }

  private setupLogger(logger: Logger, module: string) {
    const loggerInterface = this.getLoggerInterface(module);
    let level = LogLevel.INFO;
    let match = '';
    for (const key in this.config.levels) {
      if (module.startsWith(key) && key.length >= match.length) {
        level = this.config.levels[key];
        match = key;
      }
    }
    logger.trace = level <= LogLevel.TRACE ? loggerInterface.trace : NOOP;
    logger.debug = level <= LogLevel.DEBUG ? loggerInterface.debug : NOOP;
    logger.info = level <= LogLevel.INFO ? loggerInterface.info : NOOP;
    logger.warn = level <= LogLevel.WARN ? loggerInterface.warn : NOOP;
    logger.error = level <= LogLevel.ERROR ? loggerInterface.error : NOOP;
  }

  private getLoggerInterface(module: string) {
    switch (this.config.handler) {
      case 'console': {
        return {
          error: console.error.bind(console, `ERROR - %c[${module}]`, 'font-weight: bold'),
          warn: console.warn.bind(console, `WARN - %c[${module}]`, 'font-weight: bold'),
          info: console.log.bind(console, `INFO - %c[${module}]`, 'font-weight: bold'),
          debug: console.debug.bind(console, `DEBUG - %c[${module}]`, 'font-weight: bold'),
          trace: console.trace.bind(console, `TRACE - %c[${module}]`, 'font-weight: bold')
        };
      }
      default: {
        return {
          error: console.error.bind(console, `[${module}]`),
          warn: console.warn.bind(console, `[${module}]`),
          info: console.log.bind(console, `[${module}]`),
          debug: console.debug.bind(console, `[${module}]`),
          trace: console.trace.bind(console, `[${module}]`)
        };
      }
    }
  }
}

export const Logging = new LogManager();
