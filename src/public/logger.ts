export interface LoggerInterface {
  error(msg: any, ...optionalParams: any[]): void;
  warn(msg: any, ...optionalParams: any[]): void;
  info(msg: any, ...optionalParams: any[]): void;
  debug(msg: any, ...optionalParams: any[]): void;
  trace(msg: any, ...optionalParams: any[]): void;
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

const noop = () => {};

export class Logger implements LoggerInterface {
  error = noop;
  warn = noop;
  info = noop;
  debug = noop;
  trace = noop;
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
    logger.trace = level <= LogLevel.TRACE ? loggerInterface.trace : noop;
    logger.debug = level <= LogLevel.DEBUG ? loggerInterface.debug : noop;
    logger.info = level <= LogLevel.INFO ? loggerInterface.info : noop;
    logger.warn = level <= LogLevel.WARN ? loggerInterface.warn : noop;
    logger.error = level <= LogLevel.ERROR ? loggerInterface.error : noop;
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
