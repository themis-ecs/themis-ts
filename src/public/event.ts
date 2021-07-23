import { Component, ComponentType } from './component';

export class Event {}

export type EventType<T extends Event> = new (...params: any[]) => T;

export type EventListener<T extends Event> = (event: T) => void;

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

export class ComponentEvent<T extends Component> extends EntityEvent {
  private readonly componentType: ComponentType<T>;
  private readonly componentId: number;
  private readonly component: T;

  constructor(entityId: number, componentType: ComponentType<T>, componentId: number, component: T) {
    super(entityId);
    this.componentType = componentType;
    this.componentId = componentId;
    this.component = component;
  }

  public getComponent(): T {
    return this.component;
  }

  public getComponentType(): ComponentType<T> {
    return this.componentType;
  }

  public getComponentId(): number {
    return this.componentId;
  }
}

export class ComponentAddEvent<T extends Component> extends ComponentEvent<T> {
  private readonly bluePrintAdd: boolean;

  constructor(
    entityId: number,
    componentType: ComponentType<T>,
    componentId: number,
    component: T,
    blueprintAdd: boolean
  ) {
    super(entityId, componentType, componentId, component);
    this.bluePrintAdd = blueprintAdd;
  }

  public isBlueprintAdd(): boolean {
    return this.bluePrintAdd;
  }
}

export class ComponentRemoveEvent<T extends Component> extends ComponentEvent<T> {
  private readonly entityDelete: boolean;

  constructor(
    entityId: number,
    componentType: ComponentType<T>,
    componentId: number,
    component: T,
    entityDelete: boolean
  ) {
    super(entityId, componentType, componentId, component);
    this.entityDelete = entityDelete;
  }

  public isEntityDelete(): boolean {
    return this.entityDelete;
  }
}
