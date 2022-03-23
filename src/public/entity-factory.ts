import { Entity } from 'public/entity';
import { Injectable } from './decorator';
import { ThemisWorld } from '../internal/core/world';
import { ThemisEntity } from '../internal/core/entity';

@Injectable()
export class EntityFactory {
  private readonly world: ThemisWorld;

  constructor(world: ThemisWorld) {
    this.world = world;
  }

  public get(entityId: number): Entity {
    return new ThemisEntity(this.world, entityId);
  }
}
