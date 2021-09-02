import { Identifier } from '../../public/inject';

/**
 * @internal
 */
export type ConfigHolder = {
  __themis__di__config?: Config;
};

/**
 * @internal
 */
export type Config = { [identifier: string]: Identifier };

/**
 * @internal
 */
export class Container {
  private instances: Map<Identifier, unknown> = new Map<Identifier, unknown>();

  public register(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public inject(object: unknown): void {
    const configHolder = Object.getPrototypeOf(object) as ConfigHolder;
    const config: Config = configHolder.__themis__di__config || {};
    Object.keys(config).forEach((key: string) => {
      const identifier = config[key];
      (object as Record<string, unknown>)[key] = this.instances.get(identifier);
    });
  }
}
