import { Identifier } from '../../public/inject';
/**
 * @internal
 */
export const DI_CONFIG = '__themis__di__config';

/**
 * @internal
 */
export type Config = { [identifier: string]: Identifier };

/**
 * @internal
 */
export class Container {
  private instances: Map<Identifier, any> = new Map<Identifier, any>();

  public register(identifier: Identifier, instance: any): void {
    this.instances.set(identifier, instance);
  }

  public inject(object: any): void {
    const proto = Object.getPrototypeOf(object);
    const config: Config = proto[DI_CONFIG] || {};
    Object.keys(config).forEach((key: string) => {
      const identifier = config[key];
      object[key] = this.instances.get(identifier);
    });
  }
}
