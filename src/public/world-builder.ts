import { System } from './system';
import { EntityRegistry } from '../internal/core/entity-registry';
import { SystemRegistry } from '../internal/core/system-registry';
import { ComponentRegistry } from '../internal/core/component-registry';
import { BlueprintRegistry } from '../internal/core/blueprint-registry';
import { EventRegistry } from '../internal/core/event-registry';
import { EntityFactory } from '../internal/core/entity';
import { ThemisWorld } from '../internal/core/world';
import { World } from './world';
import { ThemisInspector } from '../internal/inspector/inspector';
import { Container } from '../internal/di/container';
import { Identifier } from './inject';
import { Logging } from './logger';

const logger = Logging.getLogger('themis.world.builder');

export class WorldBuilder {
  private readonly systems: Array<System> = [];
  private inspectorContainer: HTMLElement | null = null;
  private container = new Container();

  public build(): World {
    logger.info('Welcome to Themis-ECS');
    logger.info('building your world...');

    const eventRegistry = new EventRegistry();
    const entityRegistry = new EntityRegistry(eventRegistry);
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry(eventRegistry);
    const blueprintRegistry = new BlueprintRegistry();

    const world = new ThemisWorld(
      entityRegistry,
      systemRegistry,
      componentRegistry,
      blueprintRegistry,
      eventRegistry,
      this.container
    );

    if (this.inspectorContainer !== null) {
      const inspector = new ThemisInspector(this.inspectorContainer);
      this.systems.push(inspector);
    }

    entityRegistry.setEntityFactory(new EntityFactory(world));

    this.systems.forEach((system) => system.init(world));
    this.systems.forEach((system) => system.registerListeners());
    this.systems.forEach((system) => system.onInit());

    logger.info('world building done!');
    return world;
  }

  public with(...systems: System[]): this {
    this.systems.push(...systems);
    return this;
  }

  public setInspectorContainer(container: HTMLElement): this {
    this.inspectorContainer = container;
    return this;
  }

  public register(identifier: Identifier, instance: any): void {
    this.container.register(identifier, instance);
  }
}
