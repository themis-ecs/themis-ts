import { Entity } from '@internal/entity';
import { ThemisWorld } from '@internal/world';

export class EntityCollection {
  protected readonly entityIds: number[];
  protected readonly world: ThemisWorld;

  constructor(entityIds: number[], world: ThemisWorld) {
    this.entityIds = entityIds;
    this.world = world;
  }

  public forEach(callback: (entity: Entity) => void) {
    this.entityIds.forEach((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }

  public size(): number {
    return this.entityIds.length;
  }

  public getIds(): readonly number[] {
    return this.entityIds;
  }
}
