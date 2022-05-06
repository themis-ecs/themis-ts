import { Injector } from './injector';
import { ThemisWorld } from '../core/world';
import { COMPONENT_QUERY_METADATA, ComponentQueryMetadata } from './metadata';

/**
 * @internal
 */
export class ComponentQueryInjector extends Injector {
  inject(instance: unknown): void {
    const metadata: ComponentQueryMetadata = Reflect.getMetadata(
      COMPONENT_QUERY_METADATA,
      Object.getPrototypeOf(instance)
    );
    if (!metadata) {
      return;
    }
    const world = this.resolve(ThemisWorld);

    Object.keys(metadata).forEach((key: string) => {
      const queryFunctions = metadata[key];
      const componentQueryAdapter = world?.query(...queryFunctions);
      this.defineProperty(instance, key, componentQueryAdapter);
    });
  }
}
