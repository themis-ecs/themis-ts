import { Entity } from './entity';

export interface QueryResult {
  forEach(callback: (entity: Entity) => void): void;
  size(): number;
  getIds(): number[];
  onEntityAdd(callback: (entity: Entity) => void): void;
  onEntityRemove(callback: (entity: Entity) => void): void;
}
