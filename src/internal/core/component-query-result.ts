import { Entity } from './entity';
import { ThemisWorld } from './world';
import { ComponentQuery } from './component-query';
import { QueryResult } from '../../public/query-result';

export class ComponentQueryResult implements QueryResult {
  protected readonly componentQuery: ComponentQuery;
  protected readonly world: ThemisWorld;

  constructor(componentSet: ComponentQuery, world: ThemisWorld) {
    this.componentQuery = componentSet;
    this.world = world;
  }

  public forEach(callback: (entity: Entity) => void): void {
    this.componentQuery.getActiveEntities().forEach((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }

  public size(): number {
    return this.componentQuery.getActiveEntities().length;
  }

  public getIds(): number[] {
    return this.componentQuery.getActiveEntities();
  }

  public onEntityAdd(callback: (entity: Entity) => void): void {
    // TODO Naming....
    this.componentQuery.onEntityAdd((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }

  public onEntityRemove(callback: (entity: Entity) => void): void {
    this.componentQuery.onEntityRemove((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }
}
