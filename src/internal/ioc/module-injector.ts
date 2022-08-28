import { Injector } from './injector';
import { INJECT_METADATA, InjectMetadata } from './metadata';
import { isForwardRef } from './token';
import { Identifier } from '../../public/decorator';
import { createProxy } from './proxy';
import { ModuleClass } from '../../public/module';

/**
 * @internal
 */
export class ModuleInjector extends Injector {
  inject(instance: unknown, module?: ModuleClass): void {
    const metadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, Object.getPrototypeOf(instance));
    if (!metadata || !metadata.injectionPoints) {
      return;
    }
    Object.keys(metadata.injectionPoints).forEach((key: string) => {
      const token = metadata.injectionPoints[key];
      const forwardRef = isForwardRef(token);
      const identifier: Identifier = forwardRef ? token.forwardRef() : token;
      if (forwardRef) {
        const proxy = createProxy(() => this.resolve(identifier, module) as object);
        this.defineProperty(instance, key, proxy);
      } else {
        this.defineProperty(instance, key, this.resolve(identifier, module));
      }
    });
  }
}
