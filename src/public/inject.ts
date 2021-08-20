import { Config, DI_CONFIG } from '../internal/di/container';

export type Class<T> = new (...params: any[]) => T;

export type Identifier = string | Class<any>;

export const Inject = function (identifier: Identifier) {
  return function (prototype: any, key: string) {
    const config: Config = prototype[DI_CONFIG] || {};
    config[key] = identifier;
    prototype[DI_CONFIG] = config;
  };
};
