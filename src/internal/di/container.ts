import { Identifier } from '../../public/decorator';
import { Prototype, PrototypeMetadata } from '../core/prototype';
import { ThemisWorld } from '../core/world';
import { ComponentQueryBuilder } from '../core/component-query-builder';
import { ComponentQueryResult } from '../core/component-query-result';
import { World } from '../../public/world';

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
    this.injectObjects(metadata, object);
    this.injectComponentQueries(metadata, object);
  }

  private injectObjects(metadata: PrototypeMetadata, object: unknown): void {
    const injectMetadata = metadata.injectMetadata;
    if (!injectMetadata) {
      return;
    }
    Object.keys(injectMetadata).forEach((key: string) => {
      const identifier = injectMetadata[key];
      Object.defineProperty(object, key, {
        value: this.resolve(identifier),
        configurable: true
      });
    });
  }

  private resolve(identifier: Identifier): unknown {
    return this.instances.get(identifier);
  }

  private injectComponentQueries(metadata: PrototypeMetadata, object: unknown) {
    const componentQueryMetadata = metadata.componentQueryMetadata;
    if (!componentQueryMetadata) {
      return;
    }
    const world = this.resolve(World) as ThemisWorld;

    Object.keys(componentQueryMetadata).forEach((key: string) => {
      const queryFunctions = componentQueryMetadata[key];

      const componentQueryBuilder = new ComponentQueryBuilder();
      queryFunctions.forEach((fn) => fn(componentQueryBuilder));

      const componentQuery = world.getComponentRegistry().getComponentQuery(componentQueryBuilder);
      const componentQueryResult = new ComponentQueryResult(componentQuery, world);

      Object.defineProperty(object, key, {
        value: componentQueryResult,
        configurable: true
      });
    });
  }
}
