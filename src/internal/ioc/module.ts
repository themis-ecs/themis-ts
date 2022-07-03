import { Class, Identifier } from '../../public/decorator';
import { ProviderDefinition } from '../../public/provider';
import { ThemisModule } from '../../public/module';
import { ModuleMetadata } from './metadata';
import { SystemType } from '../../public/system';

/**
 * @internal
 */
export type Module = Class<ThemisModule<unknown>>;

/**
 * @internal
 */
export class ModuleContext {
  private imports = new Set<Module>();
  private exports = new Set<Identifier>();
  private providers = new Map<Identifier, ProviderDefinition>();
  private instances = new Map<Identifier, unknown>();
  private systems = new Set<Class<SystemType<unknown>>>();

  constructor(module?: Module, metadata?: ModuleMetadata) {
    if (!metadata || !module) {
      return;
    }
    this.registerProvider({ provide: module, useClass: module });
    metadata.imports.forEach((it) => this.registerImport(it));
    metadata.exports.forEach((it) => this.registerExport(it));
    metadata.providers.forEach((it) => {
      if (typeof it === 'function') {
        this.registerProvider({ provide: it, useClass: it });
      } else {
        this.registerProvider(it);
      }
    });
    metadata.systems.forEach((system) => {
      this.registerProvider({ provide: system, useClass: system });
      this.registerSystem(system);
    });
  }

  public registerImport(module: Module): void {
    this.imports.add(module);
  }

  public registerExport(module: Identifier): void {
    this.exports.add(module);
  }

  public registerProvider(provider: ProviderDefinition): void {
    this.providers.set(provider.provide, provider);
  }

  public registerInstance(identifier: Identifier, instance: unknown): void {
    this.instances.set(identifier, instance);
  }

  public registerSystem(system: Class<SystemType<unknown>>): void {
    this.systems.add(system);
  }

  public getImports(): ReadonlySet<Module> {
    return this.imports;
  }

  public getExports(): ReadonlySet<Identifier> {
    return this.exports;
  }

  public getProvider(token: Identifier): ProviderDefinition | undefined {
    return this.providers.get(token);
  }

  public getInstance<T>(identifier: Identifier<T>): T | undefined {
    return this.instances.get(identifier) as T;
  }

  public getSystems(): ReadonlySet<Class<SystemType>> {
    return this.systems;
  }
}
