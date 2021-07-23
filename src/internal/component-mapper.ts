import { Component, ComponentType } from '../public/component';
import { BitVector } from './bit-vector';
import { EventRegistry } from './event-registry';
import { ComponentAddEvent, ComponentRemoveEvent } from '../public/event';

/**
 * @internal
 */
export class ComponentMapper<T extends Component> {
  private readonly components: { [entityId: number]: T } = {};
  private readonly cachedDeletions = new BitVector();
  private readonly eventRegistry: EventRegistry;
  private readonly componentId: number;
  private readonly componentType: ComponentType<T>;

  constructor(eventRegistry: EventRegistry, componentId: number, componentType: ComponentType<T>) {
    this.eventRegistry = eventRegistry;
    this.componentId = componentId;
    this.componentType = componentType;
  }

  public addComponent(entityId: number, component: T, blueprintAdd = false): void {
    this.components[entityId] = component;
    this.eventRegistry.submit(
      ComponentAddEvent,
      new ComponentAddEvent<T>(entityId, this.componentType, this.componentId, component, blueprintAdd),
      true
    );
    this.cachedDeletions.clear(entityId);
  }

  public removeComponent(entityId: number, entityDelete = false): void {
    this.eventRegistry.submit(
      ComponentRemoveEvent,
      new ComponentRemoveEvent<T>(
        entityId,
        this.componentType,
        this.componentId,
        this.components[entityId],
        entityDelete
      ),
      true
    );
    this.cachedDeletions.set(entityId);
  }

  public processModifications() {
    this.cachedDeletions.getBits().forEach((entity) => {
      delete this.components[entity];
    });
    this.cachedDeletions.reset();
  }

  public getComponent(entityId: number): T {
    return this.components[entityId];
  }
}
