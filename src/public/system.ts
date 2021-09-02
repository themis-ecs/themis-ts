import { World } from './world';
import { EntityCollection } from './entity-collection';
import { ComponentSet } from '../internal/core/component-set';
import { ThemisWorld } from '../internal/core/world';
import { Entity } from './entity';
import { Component, ComponentType } from './component';
import { ComponentSetBuilder } from '../internal/core/component-set-builder';

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
  public registerListeners(): void {
    return;
  }
}

const COMPONENT_SET_CONFIG = '__themis__component__set__config';

type ComponentSetConfig = {
  all?: ComponentType<Component>[];
  any?: ComponentType<Component>[];
  none?: ComponentType<Component>[];
};

type ComponentSetConfigKey = keyof ComponentSetConfig;

const setComponentSetConfig = function (
  prototype: Record<string, ComponentSetConfig>,
  key: ComponentSetConfigKey,
  ...components: ComponentType<Component>[]
): void {
  const componentSetConfig: ComponentSetConfig = prototype[COMPONENT_SET_CONFIG] || {};
  componentSetConfig[key] = components;
  prototype[COMPONENT_SET_CONFIG] = componentSetConfig;
};

export type EntitySystemType<T extends EntitySystem> = new (...args: never[]) => T;

export const All = function (...components: ComponentType<Component>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>): void {
    setComponentSetConfig(constructor.prototype, 'all', ...components);
  };
};

export const Any = function (...components: ComponentType<Component>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>): void {
    setComponentSetConfig(constructor.prototype, 'any', ...components);
  };
};

export const None = function (...components: ComponentType<Component>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>): void {
    setComponentSetConfig(constructor.prototype, 'none', ...components);
  };
};

export abstract class EntitySystem extends System {
  private componentSet!: ComponentSet;

  /**
   * @internal
   * @param world
   */
  public init(world: ThemisWorld): void {
    super.init(world);
    const prototype = Object.getPrototypeOf(this);
    const componentSetConfig: ComponentSetConfig = prototype[COMPONENT_SET_CONFIG] || {};
    const componentSetBuilder = new ComponentSetBuilder()
      .containingAll(...(componentSetConfig.all || []))
      .containingAny(...(componentSetConfig.any || []))
      .containingNone(...(componentSetConfig.none || []));

    this.componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
    this.componentSet.onEntityAdd((entityId) => this.onEntityAdd(world.getEntityRegistry().getEntity(entityId)));
    this.componentSet.onEntityRemove((entityId) => this.onEntityRemove(world.getEntityRegistry().getEntity(entityId)));
  }

  public getEntities(): EntityCollection {
    return new EntityCollection(this.componentSet.getActiveEntities(), this.getWorld() as ThemisWorld);
  }

  public abstract onEntityAdd(entity: Entity): void;
  public abstract onEntityRemove(entity: Entity): void;
}
