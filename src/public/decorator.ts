import { ComponentBase, ComponentQueryFunction, ComponentType } from './component';
import { Query } from './query';
import { ComponentSerializer } from '../internal/core/serialization';
import { ComponentRegistry } from '../internal/core/component-registry';
import 'reflect-metadata';
import {
  COMPONENT_METADATA,
  COMPONENT_QUERY_METADATA,
  ComponentMetadata,
  ComponentQueryMetadata,
  INJECT_METADATA,
  InjectMetadata
} from '../internal/di/metadata';

export type Class<T = unknown> = new (...params: never[]) => T;

export type AbstractClass<T = unknown> = abstract new (...params: never[]) => T;

type PropertyDecorator<T = unknown> = <Key extends string | symbol, Prototype extends Record<Key, T>>(
  protoOrClass: Prototype,
  key: Key
) => void;

export type Identifier<T = unknown> = string | Class<T> | AbstractClass<T>;

export function Inject(identifier: Identifier): PropertyDecorator {
  return (prototype, key) => {
    const injectMetadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, prototype) || {};
    if (!injectMetadata.injectionPoints) {
      injectMetadata.injectionPoints = {};
    }
    injectMetadata.injectionPoints[key] = identifier;
    Reflect.defineMetadata(INJECT_METADATA, injectMetadata, prototype);
  };
}

export function ComponentQuery(...queries: ComponentQueryFunction[]): PropertyDecorator<Query> {
  return (prototype, key) => {
    const componentQueryMetadata: ComponentQueryMetadata =
      Reflect.getMetadata(COMPONENT_QUERY_METADATA, prototype) || {};
    componentQueryMetadata[key] = queries;
    Reflect.defineMetadata(COMPONENT_QUERY_METADATA, componentQueryMetadata, prototype);
  };
}

export type ComponentDefinition = {
  id?: string;
  serializer?: ComponentSerializer<ComponentBase, unknown>;
};

export function Component(definition?: ComponentDefinition) {
  return function <T extends ComponentBase>(constructor: ComponentType<T>) {
    const metadata: ComponentMetadata = {
      id: definition?.id,
      serializer: definition?.serializer
    };
    Reflect.defineMetadata(COMPONENT_METADATA, metadata, constructor);
    ComponentRegistry.registerComponent(constructor, definition?.id);
    return constructor;
  };
}

export const SINGLETON = 'SINGLETON';
export const REQUEST = 'REQUEST';

export type Scope = 'SINGLETON' | 'REQUEST';

export type InjectableOptions = {
  scope?: Scope;
};

export function Injectable(options?: InjectableOptions) {
  return function <T>(constructor: Class<T>) {
    const metadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, constructor) || {};
    metadata.scope = options?.scope ? options.scope : SINGLETON;
    Reflect.defineMetadata(INJECT_METADATA, metadata, constructor);
  };
}
