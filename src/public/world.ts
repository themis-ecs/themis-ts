import { Entity } from './entity';
import { Blueprint } from './blueprint';
import { EventListener, EventType } from './event';

export interface World {
  update(dt: number): void;
  getEntity(alias: string): Entity;
  getEntity(entityId: number): Entity;
  createEntity(): Entity;
  createEntity(blueprint: string): Entity;
  registerBlueprint(blueprint: Blueprint): void;
  registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>): void;
  submit<T extends Event>(eventType: EventType<T>, event: T): void;
}
