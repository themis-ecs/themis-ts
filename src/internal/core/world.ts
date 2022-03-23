import { BlueprintRegistry } from './blueprint-registry';
import { EntityRegistry } from './entity-registry';
import { ComponentRegistry } from './component-registry';
import { EventRegistry } from './event-registry';
import { ComponentBase, ComponentType } from '../../public/component';
import { World } from '../../public/world';
import { BlueprintDefinition } from '../../public/blueprint';
import { EntityCreateEvent, Event, EventErrorCallback, EventListener, EventType } from '../../public/event';
import { Container } from '../di/container';
import { NOOP } from './noop';
import { Entity } from '../../public/entity';

/**
 * @internal
 */
export class ThemisWorld implements World {
  constructor(
    private readonly entityRegistry: EntityRegistry,
    private readonly componentRegistry: ComponentRegistry,
    private readonly blueprintRegistry: BlueprintRegistry,
    private readonly eventRegistry: EventRegistry,
    private readonly container: Container
  ) {}

  public getEntityRegistry(): EntityRegistry {
    return this.entityRegistry;
  }

  public createEntityId(): number {
    return this.entityRegistry.createEntityId();
  }

  public deleteEntityById(entity: number): void {
    this.entityRegistry.deleteEntityById(entity);
  }

  public getEntity(alias: string): Entity;
  public getEntity(entityId: number): Entity;
  public getEntity(entityIdOrAlias: number | string): Entity {
    return typeof entityIdOrAlias === 'number'
      ? this.entityRegistry.getEntity(entityIdOrAlias as number)
      : this.entityRegistry.getEntityByAlias(entityIdOrAlias as string);
  }

  public createEntity(): Entity;
  public createEntity(blueprint: string): Entity;
  public createEntity(blueprint?: string): Entity {
    const entity = this.getEntity(this.createEntityId());
    if (blueprint) {
      const configuration = this.blueprintRegistry.getBlueprint(blueprint);
      this.componentRegistry.applyBlueprint(entity.getEntityId(), configuration);
    }
    this.eventRegistry.submit(EntityCreateEvent, new EntityCreateEvent(entity.getEntityId()));
    return entity;
  }

  public addComponent<T extends ComponentBase>(entityId: number, component: T): void {
    this.componentRegistry.addComponent(entityId, component);
  }

  public removeComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): void {
    this.componentRegistry.removeComponent(entityId, component);
  }

  public getComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): T {
    return this.componentRegistry.getComponent(entityId, component);
  }

  public registerBlueprint(blueprint: BlueprintDefinition): void {
    this.blueprintRegistry.registerBlueprintDefinition(blueprint);
    const blueprintConfiguration = this.componentRegistry.getBlueprintConfiguration(blueprint);
    blueprintConfiguration.initialize = blueprint.initialize ? blueprint.initialize : () => NOOP;
    this.blueprintRegistry.registerBlueprint(blueprint.name, blueprintConfiguration);
  }

  public registerAlias(entityId: number, name: string): void {
    this.entityRegistry.registerAlias(entityId, name);
  }

  public registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): void {
    this.eventRegistry.registerListener(eventType, listener, errorCallback);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T, instant = false): void {
    this.eventRegistry.submit(eventType, event, instant);
  }

  public inject(object: unknown): void {
    this.container.inject(object);
  }
}
