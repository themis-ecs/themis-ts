import { ComponentQueryFunction } from './component';
import { Prototype } from '../internal/core/prototype';
import { QueryResult } from './query-result';

export type Class<T> = new (...params: never[]) => T;

export type AbstractClass<T> = abstract new (...params: never[]) => T;

export type NoArgsClass<T> = new () => T;

type PropertyDecorator<T = unknown> = <Key extends string | symbol, Prototype extends Record<Key, T>>(
  protoOrClass: Prototype,
  key: Key
) => void;

export type Identifier = string | Class<unknown> | AbstractClass<unknown>;

export function Inject(identifier: Identifier): PropertyDecorator {
  return (prototype, key) => {
    const metadata = Prototype.getMetadata(prototype);
    const injectMetadata = metadata.injectMetadata || {};
    injectMetadata[key as string] = identifier;
    metadata.injectMetadata = injectMetadata;
  };
}

export function ComponentQuery(...queries: ComponentQueryFunction[]): PropertyDecorator<QueryResult> {
  return (prototype, key) => {
    const metadata = Prototype.getMetadata(prototype);
    const componentSetMetadata = metadata.componentQueryMetadata || {};
    componentSetMetadata[key as string] = queries;
    metadata.componentQueryMetadata = componentSetMetadata;
  };
}
