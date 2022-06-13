export class Event {}

export type EventType<T extends Event> = new (...params: never[]) => T;

export type EventListener<T extends Event> = (event: T) => void;

export type EventErrorCallback<T extends Event> = (event: T, error: unknown) => void;

export interface Subscription {
  unsubscribe(): void;
}

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
