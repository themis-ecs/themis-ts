import { Entity } from '@public/entity';
import { Blueprint } from '@public/blueprint';
import { EventListener, EventType } from '@public/event';

export interface World {
  update(dt: number): void;
  getEntity(alias: string): Entity;
  createEntity(): Entity;
  createEntity(blueprint: string): Entity;
  registerBlueprint(blueprint: Blueprint): void;
  registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>): void;
  submit<T extends Event>(eventType: EventType<T>, event: T): void;
}
