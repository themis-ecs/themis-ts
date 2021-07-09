import { System } from './system';
import { EntityRegistry } from '../internal/entity-registry';
import { SystemRegistry } from '../internal/system-registry';
import { ComponentRegistry } from '../internal/component-registry';
import { BlueprintRegistry } from '../internal/blueprint-registry';
import { EventRegistry } from '../internal/event-registry';
import { EntityFactory } from '../internal/entity';
import { ThemisWorld } from '../internal/world';
import { World } from './world';

export class WorldBuilder {
  private readonly systems: Array<System> = [];

  public build(): World {
    const entityRegistry = new EntityRegistry();
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry();
    const blueprintRegistry = new BlueprintRegistry();
    const eventRegistry = new EventRegistry();

    entityRegistry.onEntityDelete((entity) => componentRegistry.processEntityDelete(entity));

    const world = new ThemisWorld(entityRegistry, systemRegistry, componentRegistry, blueprintRegistry, eventRegistry);

    this.systems.forEach((system: any) => {
      world.injectComponentMappers(system);
    });

    entityRegistry.setEntityFactory(new EntityFactory(world));

    this.systems.forEach((system) => system.init(world));
    this.systems.forEach((system) => system.onInit());

    return world;
  }

  public with(...systems: System[]): WorldBuilder {
    this.systems.push(...systems);
    return this;
  }
}
