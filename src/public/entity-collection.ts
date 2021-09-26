import { Entity } from '../internal/core/entity';
import { ThemisWorld } from '../internal/core/world';
import { ComponentQuery } from '../internal/core/component-query';

export class EntityCollection {
  protected readonly componentSet: ComponentQuery;
  protected readonly world: ThemisWorld;

  constructor(componentSet: ComponentQuery, world: ThemisWorld) {
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
