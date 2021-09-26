import { World } from './world';

export interface System<T = number> {
  init(world: World): void;
  update(o: T): void;
}
