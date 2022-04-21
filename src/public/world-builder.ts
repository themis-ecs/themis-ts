import { Container } from '../internal/di/container';
import { EntityRegistry } from '../internal/core/entity-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Logging } from './logger';
import { Pipeline, PipelineDefinition, PipelineDefinitionBuilder, SetupCallback } from './pipeline';
import { ThemisPipeline } from '../internal/core/pipeline';
import { Class, Identifier, Imports, Providers, Systems } from './decorator';
import { SystemType } from './system';
import { ThemisModule, TopModule } from './module';
import { MODULE_METADATA, ModuleMetadata } from '../internal/di/metadata';
import { ProviderDefinition } from './provider';
import { NOOP } from '../internal/core/noop';

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

    this.container.inject(this.entityRegistry);

    const simplePipelines = this.loadPipelines();
    const modulePipelines = this.loadTopModules();

    const pipelines = simplePipelines.concat(modulePipelines);

    const systems = new Set<SystemType<unknown>>();
    pipelines.forEach((it) => it.pipeline.getSystems().forEach((system) => systems.add(system)));
    systems.forEach((system) => this.container.inject(system));
    systems.forEach((system) => {
      if (system.init) {
        system.init();
      }
    });

    pipelines.map((it) => {
      it.setupCallback(it.pipeline);
    });

    logger.info('world building done!');
    return world;
  }

  public pipeline(pipelineBuilder: PipelineDefinitionBuilder<unknown>): this {
    this.pipelines.push(pipelineBuilder.build());
    return this;
  }

  public register(identifier: Identifier, instance: unknown): this {
    this.container.register(identifier, instance);
    return this;
  }

  public provider<T>(provider: ProviderDefinition<T>): this {
    this.container.registerProvider(provider);
    return this;
  }

  public module(module: Class<TopModule<unknown>>): this {
    this.modules.push(module);
    return this;
  }

  private loadPipelines(): PipelineAndSetupCallback<unknown>[] {
    return this.pipelines.map((definition) => ({
      pipeline: new ThemisPipeline(
        definition.id,
        definition.systems.map((system) => (typeof system === 'function' ? this.container.resolve(system) : system)),
        this.entityRegistry,
        this.componentRegistry,
        this.eventRegistry
      ),
      setupCallback: definition.setupCallback
    }));
  }

  private loadTopModules(): PipelineAndSetupCallback<unknown>[] {
    return this.modules.map((module) => {
      const moduleMetadata = this.getModuleMetadata(module);
      const name = module.name;
      moduleMetadata.providers.forEach((definition) => this.provider(definition));
      const systems = moduleMetadata.systems.map((system) => this.container.resolve(system));
      moduleMetadata.imports
        .map((subModule) => this.container.resolve(subModule))
        .forEach((subModuleInstance) => {
          this.container.inject(subModuleInstance);
          if (subModuleInstance.init) {
            subModuleInstance.init();
          }
        });
      const moduleInstance = this.container.resolve(module);
      this.container.inject(moduleInstance);
      logger.info(`module ${name} loaded.`);
      return {
        pipeline: new ThemisPipeline(name, systems, this.entityRegistry, this.componentRegistry, this.eventRegistry),
        setupCallback: (pipeline: Pipeline<unknown>) => (moduleInstance.init ? moduleInstance.init(pipeline) : NOOP)
      };
    });
  }

  private getModuleMetadata(module: Class<ThemisModule<unknown>>): ModuleMetadata {
    const moduleMetadata: ModuleMetadata | undefined = Reflect.getMetadata(MODULE_METADATA, module);
    if (!moduleMetadata) {
      throw new Error(`missing Module decorator on module ${module.name}`);
    }
    const systems: Systems<unknown> = [];
    const providers: Providers<unknown> = [];
    const imports: Imports = [];
    moduleMetadata.imports
      .map((subModule) => this.getModuleMetadata(subModule))
      .forEach((subModuleMetadata) => {
        systems.push(...subModuleMetadata.systems);
        providers.push(...subModuleMetadata.providers);
        imports.push(...subModuleMetadata.imports);
      });
    systems.push(...moduleMetadata.systems);
    providers.push(...moduleMetadata.providers);
    imports.push(...moduleMetadata.imports);
    return {
      systems,
      providers,
      imports
    };
  }
}
