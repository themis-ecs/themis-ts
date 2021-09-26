import { Identifier } from '../../public/decorator';
import { Prototype, PrototypeMetadata } from '../core/prototype';
import { ThemisWorld } from '../core/world';
import { ComponentQueryBuilder } from '../core/component-query-builder';
import { EntityCollection } from '../../public/entity-collection';

/**
 * @internal
 */
export class Container {
  private instances: Map<Identifier, unknown> = new Map<Identifier, unknown>();

  public register(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public inject(object: unknown, world: ThemisWorld): void {
    const metadata = Prototype.getMetadata(Object.getPrototypeOf(object));
    this.injectObjects(metadata, object);
    this.injectComponentQueries(metadata, object, world);
  }

  private injectObjects(metadata: PrototypeMetadata, object: unknown): void {
    const injectMetadata = metadata.injectMetadata;
    if (!injectMetadata) {
      return;
    }
    Object.keys(injectMetadata).forEach((key: string) => {
      const identifier = injectMetadata[key];
      Object.defineProperty(object, key, {
        value: this.instances.get(identifier)
      });
    });
  }

  private injectComponentQueries(metadata: PrototypeMetadata, object: unknown, world: ThemisWorld) {
    const componentQueryMetadata = metadata.componentQueryMetadata;
    if (!componentQueryMetadata) {
      return;
    }
    Object.keys(componentQueryMetadata).forEach((key: string) => {
      const queryFunctions = componentQueryMetadata[key];

      const componentSetBuilder = new ComponentQueryBuilder();
      queryFunctions.forEach((fn) => fn(componentSetBuilder));

      const componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
      const entityCollection = new EntityCollection(componentSet, world);

      Object.defineProperty(object, key, {
        value: entityCollection
      });
    });
  }
}
