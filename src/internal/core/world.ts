import { BlueprintRegistry } from './blueprint-registry';
import { EntityRegistry } from './entity-registry';
import { ComponentRegistry } from './component-registry';
import { EventRegistry } from './event-registry';
import { ComponentBase, ComponentQueryFunction, ComponentType } from '../../public/component';
import { World } from '../../public/world';
import { BlueprintBuilder } from '../../public/blueprint';
import {
  EntityCreateEvent,
  Event,
  EventErrorCallback,
  EventListener,
  EventType,
  Subscription
} from '../../public/event';
import { Entity } from '../../public/entity';
import { ComponentQueryBuilder } from './component-query-builder';
import { ComponentQueryAdapter } from './component-query-adapter';
import { Query } from 'public/query';
import { Container } from '../ioc/container';
import { Identifier } from '../../public/decorator';
import { Module } from '../ioc/module';

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

  public getEntities(...entityIds: number[]): Entity[] {
    return this.entityRegistry.getEntities(...entityIds);
  }

  public createEntity(): Entity;
  public createEntity(blueprint: string): Entity;
  public createEntity(blueprint?: string): Entity {
    const entity = this.getEntity(this.createEntityId());
    if (blueprint) {
      const configuration = this.blueprintRegistry.getBlueprint(blueprint);
      this.componentRegistry.applyBlueprint(entity.getEntityId(), configuration);
      configuration.initialize(entity);
    }
    this.eventRegistry.submit(EntityCreateEvent, new EntityCreateEvent(entity.getEntityId()));
    return entity;
  }

  public addComponent<T extends ComponentType<ComponentBase>>(
    entityId: number,
    component: T,
    ...args: ConstructorParameters<T>
  ): void {
    this.componentRegistry.addComponent(entityId, component, ...args);
  }

  public removeComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): void {
    this.componentRegistry.removeComponent(entityId, component);
  }

  public getComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): T {
    return this.componentRegistry.getComponent(entityId, component);
  }

  public registerBlueprint(blueprint: BlueprintBuilder): void {
    const blueprintDefinition = blueprint.build();
    const blueprintConfiguration = this.componentRegistry.getBlueprintConfiguration(blueprintDefinition);
    this.blueprintRegistry.registerBlueprint(blueprintDefinition.name, blueprintConfiguration);
  }

  public registerAlias(entityId: number, name: string): void {
    this.entityRegistry.registerAlias(entityId, name);
  }

  public registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): Subscription {
    return this.eventRegistry.registerListener(eventType, listener, errorCallback);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T, instant = false): void {
    this.eventRegistry.submit(eventType, event, instant);
  }

  public resolve<T>(identifier: Identifier<T>, module?: Module): T | undefined {
    return this.container.resolve(identifier, module);
  }

  public inject(object: unknown, module?: Module): void {
    this.container.inject(object, module);
  }

  public query(...queries: ComponentQueryFunction[]): Query {
    const componentQueryBuilder = new ComponentQueryBuilder();
    queries.forEach((fn) => fn(componentQueryBuilder));
    const componentQuery = this.componentRegistry.getComponentQuery(componentQueryBuilder);
    componentQuery.processModifications();
    return new ComponentQueryAdapter(componentQuery, this);
  }
}
