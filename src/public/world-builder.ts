import { EntityRegistry } from '../internal/core/entity-registry';
import { SystemRegistry } from '../internal/core/system-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { EntityFactory } from '../internal/core/entity';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { Container } from '../internal/di/container';
import { Identifier } from './inject';
import { Logging } from './logger';
import { PipelineDefinition, PipelineDefinitionBuilder } from './pipeline';
import { ThemisPipeline } from '../internal/core/pipeline';

const logger = Logging.getLogger('themis.world.builder');

export class WorldBuilder {
  private readonly pipelineDefinitions: Array<PipelineDefinition> = [];
  private container = new Container();

  public build(): World {
    logger.info('Welcome to Themis-ECS');
    logger.info('building your world...');

    const eventRegistry = new EventRegistry();
    const entityRegistry = new EntityRegistry(eventRegistry);
    const componentRegistry = new ComponentRegistry(eventRegistry);

    const pipelines = this.pipelineDefinitions.map((definition) => ({
      pipeline: new ThemisPipeline(definition.id, definition.systems, entityRegistry, componentRegistry, eventRegistry),
      updateCallback: definition.updateCallback
    }));

    const systemRegistry = new SystemRegistry(pipelines.map((it) => it.pipeline));

    const blueprintRegistry = new BlueprintRegistry();

    const world = new ThemisWorld(
      entityRegistry,
      systemRegistry,
      componentRegistry,
      blueprintRegistry,
      eventRegistry,
      this.container
    );

    entityRegistry.setEntityFactory(new EntityFactory(world));

    pipelines.forEach((it) => {
      const pipeline = it.pipeline;
      logger.info(`initializing pipeline ${pipeline.getId()}`);
      pipeline.init(world);
      pipeline.registerListeners();
      pipeline.onInit();
      it.updateCallback(pipeline);
    });

    logger.info('world building done!');
    return world;
  }

  public pipeline(pipelineBuilder: PipelineDefinitionBuilder): this {
    this.pipelineDefinitions.push(pipelineBuilder.build());
    return this;
  }

  public register(identifier: Identifier, instance: unknown): void {
    this.container.register(identifier, instance);
  }
}
