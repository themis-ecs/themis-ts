import { System } from './system';
import { EntityRegistry } from '../internal/entity-registry';
import { SystemRegistry } from '../internal/system-registry';
import { ComponentRegistry } from '../internal/component-registry';
import { BlueprintRegistry } from '../internal/blueprint-registry';
import { EventRegistry } from '../internal/event-registry';
import { EntityFactory } from '../internal/entity';
import { ThemisWorld } from '../internal/world';
import { World } from './world';
import { ThemisInspector } from '../internal/inspector';

export class WorldBuilder {
  private readonly systems: Array<System> = [];
  private inspectorContainer: HTMLElement | null = null;

  public build(): World {
    const eventRegistry = new EventRegistry();
    const entityRegistry = new EntityRegistry(eventRegistry);
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry(eventRegistry);
    const blueprintRegistry = new BlueprintRegistry();

    const world = new ThemisWorld(entityRegistry, systemRegistry, componentRegistry, blueprintRegistry, eventRegistry);

    if (this.inspectorContainer !== null) {
      const inspector = new ThemisInspector(this.inspectorContainer);
      this.systems.push(inspector);
    }

    this.systems.forEach((system: any) => {
      world.injectComponentMappers(system);
    });

    entityRegistry.setEntityFactory(new EntityFactory(world));

    this.systems.forEach((system) => system.init(world));
    this.systems.forEach((system) => system.onInit());

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
}
