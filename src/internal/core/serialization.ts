import { ComponentBase } from '../../public/component';

/**
 * @internal
 */
export type Serialization = {
  componentRegistry: ComponentRegistrySerialization;
  entityRegistry: EntityRegistrySerialization;
};

/**
 * @internal
 */
export type ComponentRegistrySerialization = {
  componentIdentityMap: { [componentName: string]: number };
  entityCompositionMap: { [entityId: number]: number[] };
  componentIdCounter: number;
  componentMapper: ComponentMapperSerialization[];
};

/**
 * @internal
 */
export type ComponentMapperSerialization = {
  components: { [entityId: number]: unknown };
  cachedDeletions: number[];
  componentId: number;
  componentName: string;
};

/**
 * @internal
 */
export type EntityRegistrySerialization = {
  entityIdCounter: number;
  deletedEntities: number[];
  recyclableEntities: number[];
  aliasToEntityIdMap: { [alias: string]: number };
  entityIdToAliasMap: { [entityId: number]: string };
};

export interface ComponentSerializer<T extends ComponentBase, U> {
  serialize(component: T): U;
  deserialize(data: U): T;
}

export class DefaultComponentSerializer implements ComponentSerializer<ComponentBase, ComponentBase> {
  deserialize(data: ComponentBase): ComponentBase {
    return data;
  }

  serialize(component: ComponentBase): ComponentBase {
    return component;
  }
}

export function serialize(object: unknown): string {
  return JSON.stringify(object);
}

export function deserialize(object: string): Serialization {
  return JSON.parse(object);
}
