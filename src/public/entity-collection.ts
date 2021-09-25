import { Entity } from '../internal/core/entity';
import { ThemisWorld } from '../internal/core/world';
import { ComponentSet } from '../internal/core/component-set';

export class EntityCollection {
  protected readonly componentSet: ComponentSet;
  protected readonly world: ThemisWorld;

  constructor(componentSet: ComponentSet, world: ThemisWorld) {
    this.componentSet = componentSet;
    this.world = world;
  }

  public forEach(callback: (entity: Entity) => void): void {
    this.componentSet.getActiveEntities().forEach((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }

  public size(): number {
    return this.componentSet.getActiveEntities().length;
  }

  public getIds(): number[] {
    return this.componentSet.getActiveEntities();
  }
}
