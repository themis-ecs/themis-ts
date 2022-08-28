import { ModuleContext } from './module';
import { Class, Identifier, SINGLETON } from '../../public/decorator';
import { ProviderDefinition } from '../../public/provider';
import { Injector as IPublicInjector } from '../../public/injector';
import { INJECT_METADATA, InjectMetadata, MODULE_METADATA, ModuleMetadata } from './metadata';
import { Injector } from './injector';
import { ModuleInjector } from './module-injector';
import { ComponentQueryInjector } from './component-query-injector';
import { Resolver } from './resolver';
import { PublicInjector } from './public-injector';
import { isForwardRef, Token } from './token';
import { createProxy } from './proxy';
import { ModuleClass } from '../../public/module';

/**
 * @internal
 */
export class Container implements Resolver {
  private globalContext = this.newContext();
  private rootContext = this.newContext();
  private contexts = new Map<ModuleClass, ModuleContext>();
  private injectors: Injector[] = [new ModuleInjector(this), new ComponentQueryInjector(this)];

  constructor() {
    this.registerInjector(this.globalContext);
  }

  public registerGlobal(provider: ProviderDefinition): void {
    this.globalContext.registerProvider(provider);
  }

  public registerModule(module: ModuleClass): void {
    if (this.contexts.has(module)) {
      return;
    }
    const metadata = this.getMetadata(module);
    if (!metadata) {
      return;
    }
    this.newContext(module, metadata);

    const importedModules = metadata.imports;
    const exportedModules = metadata.exports.filter((ex) => typeof ex !== 'string');

    Array.of(...importedModules, ...exportedModules).forEach((it) => this.registerModule(it as ModuleClass));
  }

  public getMetadata(module: ModuleClass): ModuleMetadata | undefined {
    return Reflect.getMetadata(MODULE_METADATA, module);
  }

  private newContext(module?: ModuleClass, metadata?: ModuleMetadata): ModuleContext {
    const context = new ModuleContext(module, metadata);
    this.registerInjector(context, module);
    if (module) {
      this.contexts.set(module, context);
    }
    return context;
  }

  private registerInjector(context: ModuleContext, module?: ModuleClass): void {
    context.registerProvider({
      provide: IPublicInjector,
      useValue: new PublicInjector(this, module)
    });
  }

  public resolve<T>(identifier: Identifier<T>, module?: ModuleClass): T | undefined {
    if (!module) {
      return this.useProvider(this.globalContext, identifier);
    }

    const context = this.contexts.get(module);

    if (!context) {
      throw new Error(`missing context for module ${module}`);
    }

    const instance =
      this.useProvider(context, identifier, module) ||
      this.useImports(context, identifier, module) ||
      this.useProvider(this.globalContext, identifier);

    if (instance) {
      this.inject(instance, module);
    }

    return instance;
  }

  private useProvider<T>(context: ModuleContext, token: Identifier<T>, module?: ModuleClass): T | undefined {
    const provider = context.getProvider(token);
    return (Container.useValueProvider(provider) ||
      Container.useFactoryProvider(provider) ||
      this.useClassProvider(context, provider, module)) as T;
  }

  private useClassProvider(
    context: ModuleContext,
    provider: ProviderDefinition | undefined,
    module?: ModuleClass
  ): unknown | undefined {
    if (provider?.useClass) {
      const constructor = provider.useClass;
      const cachedInstance = context.getInstance(constructor);
      if (cachedInstance !== undefined) {
        return cachedInstance;
      }
      const dependencies: Class[] | undefined = Reflect.getMetadata('design:paramtypes', constructor);
      const metadata: InjectMetadata | undefined = Reflect.getMetadata(INJECT_METADATA, constructor);

      if (metadata?.providedIn === 'root') {
        const cachedRootInstance = this.rootContext.getInstance(constructor);
        if (cachedRootInstance !== undefined) {
          return cachedRootInstance;
        }
      }

      const constructorInjectionPoints = metadata?.constructorInjectionPoints || {};

      const resolvedDependencies =
        (dependencies?.map((dependency, index) => {
          const configuredToken: Token = constructorInjectionPoints[index];
          const forwardRef = isForwardRef(configuredToken);
          const configuredDependency: Identifier = forwardRef ? configuredToken.forwardRef() : configuredToken;
          if (configuredDependency !== undefined) {
            if (forwardRef) {
              return createProxy(() => this.resolve(configuredDependency, module));
            }
            return this.resolve(configuredDependency, module);
          } else {
            return this.resolve(dependency, module);
          }
        }) as never[]) || [];
      const instance = new constructor(...resolvedDependencies);

      if (metadata?.scope === SINGLETON && metadata?.providedIn === 'module') {
        context.registerInstance(constructor, instance);
      }
      if (metadata?.scope === SINGLETON && metadata?.providedIn === 'root') {
        this.rootContext.registerInstance(constructor, instance);
      }

      return instance;
    }
    return undefined;
  }

  private useImports<T>(context: ModuleContext, token: Token<T>, module: ModuleClass): T | undefined {
    const identifier = isForwardRef(token) ? token.forwardRef() : token;
    for (const importedModule of context.getImports()) {
      const importContext = this.contexts.get(importedModule);
      if (!importContext) {
        throw new Error(`missing context for module ${module}`);
      }
      if (Container.hasExportedProvider(importContext, identifier)) {
        return this.resolve(identifier, importedModule);
      }

      const exportedModules = this.getExportedModules(importContext);
      while (exportedModules.length > 0) {
        const exportedModule = exportedModules.pop();
        if (!exportedModule) {
          continue;
        }
        const exportedContext = this.contexts.get(exportedModule);
        if (!exportedContext) {
          throw new Error(`missing context for module ${exportedModule}`);
        }
        if (Container.hasExportedProvider(exportedContext, identifier)) {
          return this.resolve(identifier, exportedModule);
        }
        exportedModules.push(...this.getExportedModules(exportedContext));
      }
    }
    return undefined;
  }

  private getExportedModules(context: ModuleContext): ModuleClass[] {
    return Array.from(context.getExports()).filter((it) => this.isModule(it)) as ModuleClass[];
  }

  private isModule(identifier: Identifier): boolean {
    return this.contexts.has(identifier as ModuleClass);
  }

  private static useValueProvider(provider: ProviderDefinition | undefined): unknown | undefined {
    return provider?.useValue;
  }

  private static useFactoryProvider(provider: ProviderDefinition | undefined): unknown | undefined {
    return provider?.useFactory ? provider.useFactory() : undefined;
  }

  private static hasExportedProvider(context: ModuleContext, identifier: Identifier): boolean {
    return context.getExports().has(identifier) && context.getProvider(identifier) !== undefined;
  }

  public inject(object: unknown, module?: ModuleClass): void {
    this.injectors.forEach((injector) => injector.inject(object, module));
  }
}
