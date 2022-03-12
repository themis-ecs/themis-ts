import { EntityRegistry } from '../internal/core/entity-registry';
import { SystemRegistry } from '../internal/core/system-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { EntityFactory } from '../internal/core/entity';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Container } from '../internal/di/container';
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
    const entityRegistry = new EntityRegistry(eventRegistry);
    const componentRegistry = new ComponentRegistry(eventRegistry);
    const systemRegistry = new SystemRegistry();
    const blueprintRegistry = new BlueprintRegistry();

    const world = new ThemisWorld(
      entityRegistry,
      systemRegistry,
      componentRegistry,
      blueprintRegistry,
      eventRegistry,
      this.container
    );

    this.register(World, world);

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

    entityRegistry.setEntityFactory(new EntityFactory(world));

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
