import { Class, Identifier, SINGLETON } from '../../public/decorator';
import { ThemisWorld } from '../core/world';
import 'reflect-metadata';
import { COMPONENT_QUERY_METADATA, ComponentQueryMetadata, INJECT_METADATA, InjectMetadata } from './metadata';
import { Provider, ProviderDefinition } from '../../public/provider';

/**
 * @internal
 */
export class Container {
  private instances = new Map<Identifier, unknown>();
  private providers = new Map<Identifier, Provider<unknown>>();

  public register(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public registerProvider(provider: ProviderDefinition<unknown>) {
    const identifier = provider.provide;
    if (provider.useValue) {
      this.instances.set(identifier, provider.useValue);
      return;
    }
    if (provider.useClass) {
      const useClass = provider.useClass;
      this.providers.set(identifier, () => this.resolve(useClass));
      return;
    }
    if (provider.useFactory) {
      this.providers.set(identifier, provider.useFactory);
      return;
    }
    throw new Error(`Provider for identifier ${identifier} needs to have either useValue, useClass or useFactory`);
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

  public resolve<T>(identifier: Identifier<T>, dependencyStack: Set<Class> = new Set<Class>()): T {
    const instance = this.instances.get(identifier);
    if (instance) {
      return instance as T;
    }
    const provider = this.providers.get(identifier);
    if (provider) {
      return provider() as T;
    }
    if (typeof identifier === 'function') {
      const dependencies: Class[] | undefined = Reflect.getMetadata('design:paramtypes', identifier);
      dependencies?.forEach((dependency) => {
        if (dependencyStack.has(dependency)) {
          if (this.instances.has(dependency)) {
            dependencyStack.delete(dependency);
          } else {
            throw new Error(`${identifier} has dependency ${dependency} which can not be resolved`);
          }
        } else {
          dependencyStack.add(dependency);
        }
      });
      const metadata: InjectMetadata | undefined = Reflect.getMetadata(INJECT_METADATA, identifier);
      const resolvedDependencies =
        (dependencies?.map((dependency) => this.resolve(dependency, dependencyStack)) as never[]) || [];
      const newInstance = new identifier(...resolvedDependencies) as T;
      if (metadata?.scope === SINGLETON) {
        this.instances.set(identifier, newInstance);
      }
      return newInstance;
    }
    throw new Error(`${identifier} can not be resolved`);
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
    const world = this.resolve(ThemisWorld);
    Object.keys(metadata).forEach((key: string) => {
      const queryFunctions = metadata[key];
      const componentQueryAdapter = world.query(...queryFunctions);
      Object.defineProperty(object, key, {
        value: componentQueryAdapter,
        configurable: true
      });
    });
  }
}
