import { ComponentQueryFunction } from './component';
import { EntityCollection } from './entity-collection';
import { Prototype } from '../internal/core/prototype';

export type Class<T> = new (...params: never[]) => T;

type PropertyDecorator<T = unknown> = <Key extends string | symbol, Prototype extends Record<Key, T>>(
  protoOrClass: Prototype,
  key: Key
) => void;

export type Identifier = string | Class<unknown>;

export function Inject(identifier: Identifier): PropertyDecorator {
  return (prototype, key) => {
    const metadata = Prototype.getMetadata(prototype);
    const injectMetadata = metadata.injectMetadata || {};
    injectMetadata[key as string] = identifier;
    metadata.injectMetadata = injectMetadata;
  };
}

export function ComponentQuery(...queries: ComponentQueryFunction[]): PropertyDecorator<EntityCollection> {
  return (prototype, key) => {
    const metadata = Prototype.getMetadata(prototype);
    const componentSetMetadata = metadata.componentSetMetadata || {};
    componentSetMetadata[key as string] = queries;
    metadata.componentSetMetadata = componentSetMetadata;
  };
}
