import { ThemisWorld } from './world';
import { Component, ComponentType } from '../../public/component';
import { Entity as IEntity } from '../../public/entity';

/**
 * @internal
 */
export class Entity implements IEntity {
  private readonly entityId: number;
  private readonly world: ThemisWorld;

  constructor(world: ThemisWorld, entityId: number) {
    this.world = world;
    this.entityId = entityId;
  }

  public getEntityId(): number {
    return this.entityId;
  }

  public getWorld(): ThemisWorld {
    return this.world;
  }

  public addComponent(...components: Component[]): this {
    components.forEach((component) => {
      const componentType = Object.getPrototypeOf(component).constructor;
      this.world.getComponentMapper(componentType).addComponent(this.entityId, component);
    });
    return this;
  }

  public getComponent<T extends Component>(componentType: ComponentType<T>): T {
    return this.world.getComponentMapper(componentType).getComponent(this.entityId) as T;
  }

  public removeComponent(...componentTypes: ComponentType<any>[]): this {
    componentTypes.forEach((componentType) => {
      this.world.getComponentMapper(componentType).removeComponent(this.entityId);
    });
    return this;
  }

  public delete(): void {
    this.world.getEntityRegistry().deleteEntityById(this.entityId);
  }

  public setAlias(alias: string): this {
    this.getWorld().registerAlias(this.entityId, alias);
    return this;
  }
}

/**
 * @internal
 */
export class EntityFactory {
  private readonly world: ThemisWorld;

  constructor(world: ThemisWorld) {
    this.world = world;
  }

  public build(entityId: number): Entity {
    return new Entity(this.world, entityId);
  }
}
