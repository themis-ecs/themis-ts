import { Identifier } from '../../public/decorator';
import { Prototype } from '../core/prototype';

/**
 * @internal
 */
export class Container {
  private instances: Map<Identifier, unknown> = new Map<Identifier, unknown>();

  public register(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public inject(object: unknown): void {
    const metadata = Prototype.getMetadata(Object.getPrototypeOf(object));
    const injectMetadata = metadata.injectMetadata;
    if (!injectMetadata) {
      return;
    }
    Object.keys(injectMetadata).forEach((key: string) => {
      const identifier = injectMetadata[key];
      (object as Record<string, unknown>)[key] = this.instances.get(identifier);
    });
  }
}
