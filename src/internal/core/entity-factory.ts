import { Entity } from 'public/entity';
import { Injectable } from '../../public/decorator';
import { ThemisWorld } from './world';
import { ThemisEntity } from './entity';

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
