import { Class, Identifier, SINGLETON } from '../../public/decorator';
import { ThemisWorld } from '../core/world';
import { ComponentQueryBuilder } from '../core/component-query-builder';
import { ComponentQueryAdapter } from '../core/component-query-adapter';
import { World } from '../../public/world';
import 'reflect-metadata';
import { COMPONENT_QUERY_METADATA, ComponentQueryMetadata, INJECT_METADATA, InjectMetadata } from './metadata';

/**
 * @internal
 */
export class Container {
  private instances: Map<Identifier, unknown> = new Map<Identifier, unknown>();

  public register(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public inject(object: unknown): void {
    const injectMetadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, Object.getPrototypeOf(object));
    const componentQueryMetadata: ComponentQueryMetadata = Reflect.getMetadata(
      COMPONENT_QUERY_METADATA,
      Object.getPrototypeOf(object)
    );
    this.injectObjects(injectMetadata, object);
    this.injectQueries(componentQueryMetadata, object);
  }

  public resolve<T>(identifier: Identifier<T>): T {
    const instance = this.instances.get(identifier);
    if (instance) {
      return instance as T;
    }
    if (typeof identifier === 'function') {
      const dependencies: Class[] | undefined = Reflect.getMetadata('design:paramtypes', identifier);
      const metadata: InjectMetadata | undefined = Reflect.getMetadata(INJECT_METADATA, identifier);
      const resolvedDependencies = (dependencies?.map((dependency) => this.resolve(dependency)) as never[]) || [];
      const newInstance = new identifier(...resolvedDependencies) as T;
      if (metadata?.scope === SINGLETON) {
        this.instances.set(identifier, newInstance);
      }
      return newInstance;
    } else {
      throw new Error(`${identifier} can not be resolved`);
    }
  }

  private injectObjects(metadata: InjectMetadata, object: unknown): void {
    if (!metadata || !metadata.injectionPoints) {
      return;
    }
    Object.keys(metadata.injectionPoints).forEach((key: string) => {
      const identifier = metadata.injectionPoints[key];
      Object.defineProperty(object, key, {
        value: this.resolve(identifier),
        configurable: true
      });
    });
  }

  private injectQueries(metadata: ComponentQueryMetadata, object: unknown) {
    if (!metadata) {
      return;
    }
    const world = this.resolve(World) as ThemisWorld;

    Object.keys(metadata).forEach((key: string) => {
      const queryFunctions = metadata[key];

      const componentQueryBuilder = new ComponentQueryBuilder();
      queryFunctions.forEach((fn) => fn(componentQueryBuilder));

      const componentQuery = world.getComponentRegistry().getComponentQuery(componentQueryBuilder);
      const componentQueryAdapter = new ComponentQueryAdapter(componentQuery, world);

      Object.defineProperty(object, key, {
        value: componentQueryAdapter,
        configurable: true
      });
    });
  }
}
