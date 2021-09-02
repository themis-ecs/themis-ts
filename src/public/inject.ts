import { Config, ConfigHolder } from '../internal/di/container';

export type Class<T> = new (...params: never[]) => T;

export type Identifier = string | Class<unknown>;

export const Inject = function (identifier: Identifier) {
  return function (prototype: unknown, key: string): void {
    const configHolder = prototype as ConfigHolder;
    const config: Config = configHolder.__themis__di__config || {};
    config[key] = identifier;
    configHolder.__themis__di__config = config;
  };
};
