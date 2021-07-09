import { World } from '@public/world';
import { EntityCollection } from '@public/entity-collection';
import { ComponentSet } from '@internal/component-set';
import { ThemisWorld } from '@internal/world';
import { Entity } from '@public/entity';
import { ComponentSetBuilder } from './component-set-builder';

export abstract class System {
  private world!: World;

  /**
   * @internal
   * @param world
   */
  public init(world: ThemisWorld): void {
    this.world = world;
  }

  /**
   * @internal
   * @param dt
   */
  public update(dt: number): void {
    this.onUpdate(dt);
  }

  public getWorld(): World {
    return this.world;
  }

  abstract onUpdate(dt: number): void;
  abstract onInit(): void;
}

export abstract class EntitySystem extends System {
  private componentSet!: ComponentSet;

  /**
   * @internal
   * @param world
   */
  public init(world: ThemisWorld): void {
    let componentSetBuilder = this.initComponentSet(new ComponentSetBuilder());
    this.componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
    this.componentSet.onEntityAdd((entityId) => this.onEntityAdd(world.getEntity(entityId)));
    this.componentSet.onEntityRemove((entityId) => this.onEntityRemove(world.getEntity(entityId)));
    super.init(world);
  }

  public getEntities(): EntityCollection {
    return new EntityCollection(this.componentSet.getActiveEntities(), this.getWorld() as ThemisWorld);
  }

  protected abstract initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder;

  protected onEntityAdd(entity: Entity): void {}

  protected onEntityRemove(entity: Entity): void {}
}
