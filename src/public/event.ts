import { ComponentBase } from './component';

export class Event {}

export type EventType<T extends Event> = new (...params: never[]) => T;

export type EventListener<T extends Event> = (event: T) => void;

export type EventErrorCallback<T extends Event> = (event: T, error: unknown) => void;

export class EntityEvent {
  private readonly entityId;
  constructor(entityId: number) {
    this.entityId = entityId;
  }

  public getEntityId(): number {
    return this.entityId;
  }
}

export class EntityCreateEvent extends EntityEvent {}
export class EntityDeleteEvent extends EntityEvent {}

export class ComponentEvent<T extends ComponentBase> extends EntityEvent {
  private readonly componentId: number;
  private readonly component: T;

  constructor(entityId: number, componentId: number, component: T) {
    super(entityId);
    this.componentId = componentId;
    this.component = component;
  }

  public getComponent(): T {
    return this.component;
  }

  public getComponentId(): number {
    return this.componentId;
  }
}

export class ComponentAddEvent<T extends ComponentBase> extends ComponentEvent<T> {
  private readonly bluePrintAdd: boolean;

  constructor(entityId: number, componentId: number, component: T, blueprintAdd: boolean) {
    super(entityId, componentId, component);
    this.bluePrintAdd = blueprintAdd;
  }

  public isBlueprintAdd(): boolean {
    return this.bluePrintAdd;
  }
}

export class ComponentRemoveEvent<T extends ComponentBase> extends ComponentEvent<T> {
  private readonly entityDelete: boolean;

  constructor(entityId: number, componentId: number, component: T, entityDelete: boolean) {
    super(entityId, componentId, component);
    this.entityDelete = entityDelete;
  }

  public isEntityDelete(): boolean {
    return this.entityDelete;
  }
}
