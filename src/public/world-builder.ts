import { EntityRegistry } from '../internal/core/entity-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Logging } from './logger';
import { Pipeline, PipelineDefinition, PipelineDefinitionBuilder, SetupCallback } from './pipeline';
import { ThemisPipeline } from '../internal/core/pipeline';
import { Class, Identifier } from './decorator';
import { SystemType } from './system';
import { SubModule, ThemisModule, TopModule } from './module';
import { ProviderDefinition } from './provider';
import { NOOP } from '../internal/core/noop';
import { Container } from '../internal/ioc/container';
import { EntityFactory } from '../internal/core/entity-factory';

const logger = Logging.getLogger('themis.world.builder');

type PipelineAndSetupCallback<T> = {
  pipeline: ThemisPipeline<T>;
  setupCallback: SetupCallback<T>;
};

export class WorldBuilder {
  private readonly pipelines: Array<PipelineDefinition<unknown>> = [];
  private readonly modules: Array<Class<TopModule<unknown>>> = [];
  private readonly container = new Container();
  private readonly eventRegistry = new EventRegistry();
  private readonly blueprintRegistry = new BlueprintRegistry();
  private readonly entityRegistry = new EntityRegistry(this.eventRegistry);
  private readonly componentRegistry = new ComponentRegistry(this.eventRegistry);

  public build(): World {
    logger.info('Welcome to Themis-ECS');
    logger.info('building your world...');

    const world = new ThemisWorld(
      this.entityRegistry,
      this.componentRegistry,
      this.blueprintRegistry,
      this.eventRegistry,
      this.container
    );

    this.register(World, world);
    this.register(ThemisWorld, world);
    this.register(EntityRegistry, this.eventRegistry);
    this.register(BlueprintRegistry, this.blueprintRegistry);
    this.register(EntityRegistry, this.entityRegistry);
    this.register(ComponentRegistry, this.componentRegistry);
    this.provider({ provide: EntityFactory, useClass: EntityFactory });

    this.container.inject(this.entityRegistry);

    const simplePipelines = this.loadPipelines();
    const modulePipelines = this.loadTopModules();

    const pipelines = simplePipelines.concat(modulePipelines);

    pipelines.map((it) => {
      it.setupCallback(it.pipeline);
    });

    logger.info('world building done!');
    return world;
  }

  /**
   * @deprecated I want to remove this... not needed.. need to refactor unit tests....
   * @param pipelineBuilder
   */
  public pipeline(pipelineBuilder: PipelineDefinitionBuilder<unknown>): this {
    this.pipelines.push(pipelineBuilder.build());
    return this;
  }

  public register(identifier: Identifier, instance: unknown): this {
    this.container.registerGlobal({ provide: identifier, useValue: instance });
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

  /**
   * @deprecated
   */
  private loadPipelines(): PipelineAndSetupCallback<unknown>[] {
    return this.pipelines.map((definition) => ({
      pipeline: new ThemisPipeline(
        definition.id,
        definition.systems.map((system) => {
          if (typeof system === 'function') {
            this.container.registerGlobal({ provide: system, useClass: system });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const instance = this.container.resolve(system)!;
            if (instance.init) {
              instance.init();
            }
            return instance;
          } else {
            this.container.inject(system);
            if (system.init) {
              system.init();
            }
            return system;
          }
        }),
        this.entityRegistry,
        this.componentRegistry,
        this.eventRegistry
      ),
      setupCallback: definition.setupCallback
    }));
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

  private loadSystems(module: Class<ThemisModule<unknown>>): SystemType<unknown>[] {
    const metadata = this.container.getMetadata(module);
    if (!metadata) {
      return [];
    }
    const systems: SystemType<unknown>[] = [];
    metadata.imports.map((subModule) => this.loadSystems(subModule)).forEach((it) => systems.push(...it));
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

  private getSubModules(module: Class<ThemisModule<unknown>>): ReadonlySet<Class<SubModule>> {
    const metadata = this.container.getMetadata(module);
    const subModules = new Set<Class<SubModule>>();
    if (!metadata) {
      return subModules;
    }
    metadata.imports
      .map((subModule) => this.getSubModules(subModule))
      .forEach((imports) => imports.forEach((subModule) => subModules.add(subModule)));
    metadata.imports.forEach((subModule) => subModules.add(subModule));
    return subModules;
  }
}
