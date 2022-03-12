import { ThemisWorld } from './world';
import { ComponentBase, ComponentType } from '../../public/component';
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

  public addComponent(...components: ComponentBase[]): this {
    components.forEach((component) => {
      this.world.addComponent(this.entityId, component);
    });
    return this;
  }

  public getComponent<T extends ComponentBase>(componentType: ComponentType<T>): T {
    return this.world.getComponent(this.entityId, componentType);
  }

  public removeComponent(...componentTypes: ComponentType<ComponentBase>[]): this {
    componentTypes.forEach((componentType) => {
      this.world.removeComponent(this.entityId, componentType);
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
