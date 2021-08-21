export interface LoggerInterface {
  error(msg: string): void;
  warn(msg: string): void;
  info(msg: string): void;
  debug(msg: string): void;
  trace(msg: string): void;
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
          error: console.error.bind(console, `[${module}]`),
          warn: console.warn.bind(console, `[${module}]`),
          info: console.log.bind(console, `[${module}]`),
          debug: console.debug.bind(console, `[${module}]`),
          trace: console.trace.bind(console, `[${module}]`)
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

export const logging = new LogManager();
