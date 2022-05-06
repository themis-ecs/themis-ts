import { Injector } from './injector';
import { INJECT_METADATA, InjectMetadata } from './metadata';
import { Module } from './module';

/**
 * @internal
 */
export class ModuleInjector extends Injector {
  inject(instance: unknown, module?: Module): void {
    const metadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, Object.getPrototypeOf(instance));
    if (!metadata || !metadata.injectionPoints) {
      return;
    }
    Object.keys(metadata.injectionPoints).forEach((key: string) => {
      const identifier = metadata.injectionPoints[key];
      this.defineProperty(instance, key, this.resolve(identifier, module));
    });
  }
}
