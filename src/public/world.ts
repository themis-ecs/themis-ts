import { Entity } from './entity';
import { BlueprintDefinition } from './blueprint';
import { Event, EventListener, EventType } from './event';

export interface World {
  update(dt: number): void;
  getEntity(alias: string): Entity;
  getEntity(entityId: number): Entity;
  createEntity(): Entity;
  createEntity(blueprint: string): Entity;
  registerBlueprint(blueprint: BlueprintDefinition): void;
  registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>): void;
  submit<T extends Event>(eventType: EventType<T>, event: T, instant?: boolean): void;
  inject(object: any): void;
}
