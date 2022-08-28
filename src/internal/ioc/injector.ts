import { Resolver } from './resolver';
import { Identifier } from '../../public/decorator';
import { ModuleClass } from '../../public/module';

/**
 * @internal
 */
export abstract class Injector {
  constructor(private resolver: Resolver) {}

  protected resolve<T>(identifier: Identifier<T>, module?: ModuleClass): T | undefined {
    return this.resolver.resolve(identifier, module);
  }

  protected defineProperty(object: unknown, key: PropertyKey, value: unknown) {
    Object.defineProperty(object, key, {
      value,
      configurable: true
    });
  }

  public abstract inject(instance: unknown, module?: ModuleClass): void;
}
