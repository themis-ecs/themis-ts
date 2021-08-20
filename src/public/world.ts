import { Entity } from './entity';
import { BlueprintDefinition } from './blueprint';
import { Event, EventErrorCallback, EventListener, EventType } from './event';

export interface World {
  update(dt: number): void;
  getEntity(alias: string): Entity;
  getEntity(entityId: number): Entity;
  createEntity(): Entity;
  createEntity(blueprint: string): Entity;
  registerBlueprint(blueprint: BlueprintDefinition): void;
  registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): void;
  submit<T extends Event>(eventType: EventType<T>, event: T, instant?: boolean): void;
  inject(object: any): void;
}
