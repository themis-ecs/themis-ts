import { EntityRegistry } from '../internal/core/entity-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Logging } from './logger';
import { Pipeline, SetupCallback } from './pipeline';
import { ThemisPipeline } from '../internal/core/pipeline';
import { Class, Identifier } from './decorator';
import { SystemType } from './system';
import { SubModule, TopModule } from './module';
import { ProviderDefinition } from './provider';
import { NOOP } from '../internal/core/noop';
import { Container } from '../internal/ioc/container';
import { EntityFactory } from '../internal/core/entity-factory';
import { Module } from '../internal/ioc/module';

const logger = Logging.getLogger('themis.world.builder');

type PipelineAndSetupCallback<T> = {
  pipeline: ThemisPipeline<T>;
  setupCallback: SetupCallback<T>;
};

export class WorldBuilder {
  private readonly modules: Array<Class<TopModule<unknown>>> = [];
  private readonly container = new Container();
  private readonly eventRegistry = new EventRegistry();
  private readonly entityRegistry = new EntityRegistry(this.eventRegistry);
  private readonly componentRegistry = new ComponentRegistry(this.eventRegistry);

  public build(): World {
    logger.info('Welcome to Themis-ECS');
    logger.info('building your world...');

    const world = new ThemisWorld(this.entityRegistry, this.componentRegistry, this.eventRegistry, this.container);

    this.register(World, world);
    this.register(ThemisWorld, world);
    this.register(EntityRegistry, this.eventRegistry);
    this.register(EntityRegistry, this.entityRegistry);
    this.register(ComponentRegistry, this.componentRegistry);
    this.provider({ provide: EntityFactory, useClass: EntityFactory });

    this.container.inject(this.entityRegistry);

    const modulePipelines = this.loadTopModules();

    modulePipelines.forEach((it) => {
      it.setupCallback(it.pipeline);
    });

    logger.info('world building done!');
    return world;
  }

  public register(identifier: Identifier, instance: unknown): this {
    this.provider({ provide: identifier, useValue: instance });
    return this;
  }

  public provider<T>(provider: ProviderDefinition<T>): this {
    this.container.registerGlobal(provider);
    return this;
  }

  public module(module: Class<TopModule<unknown>>): this {
    this.modules.push(module);
    return this;
  }

  private loadTopModules(): PipelineAndSetupCallback<unknown>[] {
    return this.modules.map((module) => {
      this.container.registerModule(module);
      const name = module.name;
      const systems = this.loadSystems(module);
      this.loadSubModules(module);
      const moduleInstance = this.container.resolve(module, module);
      logger.info(`module ${name} loaded.`);
      return {
        pipeline: new ThemisPipeline(name, systems, this.entityRegistry, this.componentRegistry, this.eventRegistry),
        setupCallback: (pipeline: Pipeline<unknown>) => (moduleInstance?.init ? moduleInstance.init(pipeline) : NOOP)
      };
    });
  }

  private loadSystems(module: Module, loadedModules = new Set<Module>()): SystemType<unknown>[] {
    const metadata = this.container.getMetadata(module);
    if (!metadata || loadedModules.has(module)) {
      return [];
    }
    loadedModules.add(module);
    const systems: SystemType<unknown>[] = [];
    metadata.imports
      .map((subModule) => this.loadSystems(subModule, loadedModules))
      .forEach((it) => systems.push(...it));
    metadata.systems
      .map((system) => this.container.resolve(system, module))
      .forEach((instance) => {
        if (instance) {
          if (instance.init) {
            instance.init();
          }
          systems.push(instance);
        }
      });
    return systems;
  }

  private loadSubModules(module: Class<TopModule<unknown>>): void {
    this.getSubModules(module).forEach((subModule) => {
      const instance = this.container.resolve(subModule, subModule);
      if (instance) {
        if (instance.init) {
          instance.init();
        }
      }
    });
  }

  private getSubModules(module: Module, loadedModules = new Set<Module>()): ReadonlySet<Class<SubModule>> {
    const metadata = this.container.getMetadata(module);
    const subModules = new Set<Class<SubModule>>();
    if (!metadata || loadedModules.has(module)) {
      return subModules;
    }
    loadedModules.add(module);
    metadata.imports
      .map((subModule) => this.getSubModules(subModule, loadedModules))
      .forEach((imports) => imports.forEach((subModule) => subModules.add(subModule)));
    metadata.imports.forEach((subModule) => subModules.add(subModule));
    return subModules;
  }
}
