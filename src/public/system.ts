import { World } from './world';
import { EntityCollection } from './entity-collection';
import { ComponentSet } from '../internal/core/component-set';
import { ThemisWorld } from '../internal/core/world';
import { Entity } from './entity';
import { ComponentType } from './component';
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
  public registerListeners(): void {}
}

const COMPONENT_SET_CONFIG = '__themis__component__set__config';

type ComponentSetConfig = {
  all?: ComponentType<any>[];
  any?: ComponentType<any>[];
  none?: ComponentType<any>[];
};

type ComponentSetConfigKey = keyof ComponentSetConfig;

const setComponentSetConfig = function (
  prototype: any,
  key: ComponentSetConfigKey,
  ...components: ComponentType<any>[]
): void {
  const componentSetConfig: ComponentSetConfig = prototype[COMPONENT_SET_CONFIG] || {};
  componentSetConfig[key] = components;
  prototype[COMPONENT_SET_CONFIG] = componentSetConfig;
};

export type EntitySystemType<T extends EntitySystem> = new (...args: any[]) => T;

export const All = function (...components: ComponentType<any>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>) {
    setComponentSetConfig(constructor.prototype, 'all', ...components);
  };
};

export const Any = function (...components: ComponentType<any>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>) {
    setComponentSetConfig(constructor.prototype, 'any', ...components);
  };
};

export const None = function (...components: ComponentType<any>[]) {
  return function <T extends EntitySystem>(constructor: EntitySystemType<T>) {
    setComponentSetConfig(constructor.prototype, 'none', ...components);
  };
};

export abstract class EntitySystem extends System {
  private componentSet!: ComponentSet;

  /**
   * @internal
   * @param world
   */
  public init(world: ThemisWorld) {
    super.init(world);
    const prototype = Object.getPrototypeOf(this);
    const componentSetConfig: ComponentSetConfig = prototype[COMPONENT_SET_CONFIG] || {};
    const componentSetBuilder = new ComponentSetBuilder()
      .containingAll(...(componentSetConfig.all || []))
      .containingAny(...(componentSetConfig.any || []))
      .containingNone(...(componentSetConfig.none || []));

    this.componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
  }

  public getEntities(): EntityCollection {
    return new EntityCollection(this.componentSet.getActiveEntities(), this.getWorld() as ThemisWorld);
  }

  public onEntityAdd(entity: Entity): void {}

  public onEntityRemove(entity: Entity): void {}
}
