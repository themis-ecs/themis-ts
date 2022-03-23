import { Container } from '../internal/di/container';
import { EntityRegistry } from '../internal/core/entity-registry';
import { SystemRegistry } from '../internal/core/system-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Logging } from './logger';
import { PipelineDefinition, PipelineDefinitionBuilder } from './pipeline';
import { ThemisPipeline } from '../internal/core/pipeline';
import { Identifier } from './decorator';

const logger = Logging.getLogger('themis.world.builder');

export class WorldBuilder {
  private readonly pipelines: Array<PipelineDefinition<unknown>> = [];
  private container = new Container();

  public build(): World {
    logger.info('Welcome to Themis-ECS');
    logger.info('building your world...');

    const eventRegistry = new EventRegistry();
    const systemRegistry = new SystemRegistry();
    const blueprintRegistry = new BlueprintRegistry();
    const entityRegistry = new EntityRegistry(eventRegistry);
    const componentRegistry = new ComponentRegistry(eventRegistry);

    const world = new ThemisWorld(entityRegistry, componentRegistry, blueprintRegistry, eventRegistry, this.container);

    this.register(World, world);
    this.register(ThemisWorld, world);
    this.register(EntityRegistry, eventRegistry);
    this.register(SystemRegistry, systemRegistry);
    this.register(BlueprintRegistry, blueprintRegistry);
    this.register(EntityRegistry, entityRegistry);
    this.register(ComponentRegistry, componentRegistry);

    this.container.inject(entityRegistry);

    const pipelines = this.pipelines.map((definition) => {
      return {
        pipeline: new ThemisPipeline(
          definition.id,
          definition.systems.map((system) => (typeof system === 'function' ? this.container.resolve(system) : system)),
          entityRegistry,
          componentRegistry,
          eventRegistry
        ),
        updateCallback: definition.setupCallback
      };
    });

    pipelines.forEach((it) => systemRegistry.registerSystem(...it.pipeline.getSystems()));
    systemRegistry.initSystems(world);

    pipelines.forEach((it) => {
      it.updateCallback(it.pipeline);
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
}
