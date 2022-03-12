import { Entity } from './entity';

export interface Query {
  readonly entities: EntityCollection;
  readonly events: Events;
}

export interface EntityCollection {
  forEach(callback: (entity: Entity) => void): void;
  size(): number;
  getIds(): number[];
}

export interface Events {
  onEntityAdd(callback: (obj: Entity) => void): void;
  onEntityRemove(callback: (obj: Entity) => void): void;
}
