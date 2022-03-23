import { ThemisWorld } from './world';
import { ComponentQuery } from './component-query';
import { EntityCollection, Events, Query } from '../../public/query';
import { Entity } from '../../public/entity';

export class ComponentQueryAdapter implements Query {
  protected readonly componentQuery: ComponentQuery;
  protected readonly world: ThemisWorld;

  constructor(componentSet: ComponentQuery, world: ThemisWorld) {
    this.componentQuery = componentSet;
    this.world = world;
  }

  public get entities(): EntityCollection {
    return this;
  }

  public get events(): Events {
    return this;
  }

  public forEach(callback: (entity: Entity) => void): void {
    this.componentQuery.getActiveEntities().forEach((entityId) => {
      callback(this.world.getEntity(entityId));
    });
  }

  public size(): number {
    return this.componentQuery.getActiveEntities().length;
  }

  public getIds(): Uint32Array {
    return this.componentQuery.getActiveEntities();
  }

  public onEntityAdd(callback: (entity: Entity) => void): void {
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
