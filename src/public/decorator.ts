import { ComponentQueryFunction } from './component';
import 'reflect-metadata';
import {
  COMPONENT_QUERY_METADATA,
  ComponentQueryMetadata,
  INJECT_METADATA,
  InjectMetadata,
  MODULE_METADATA,
  ModuleMetadata
} from '../internal/ioc/metadata';
import { SubModule, ThemisModule } from './module';
import { SystemType } from './system';
import { ProviderDefinition } from './provider';

export type Class<T = unknown> = new (...params: never[]) => T;

export type AbstractClass<T = unknown> = abstract new (...params: never[]) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
type PropertyDecorator = <Key extends string | symbol>(target: Object, key: Key) => void;
type ClassDecorator<T> = (constructor: Class<T>) => void;

export type Identifier<T = unknown> = string | Class<T> | AbstractClass<T>;

export function Inject(identifier?: Identifier): PropertyDecorator {
  return (target, key) => {
    const injectMetadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, target) || {};
    if (!injectMetadata.injectionPoints) {
      injectMetadata.injectionPoints = {};
    }
    if (identifier) {
      injectMetadata.injectionPoints[key] = identifier;
    } else {
      injectMetadata.injectionPoints[key] = Reflect.getMetadata('design:type', target, key);
    }

    Reflect.defineMetadata(INJECT_METADATA, injectMetadata, target);
  };
}

export function ComponentQuery(...queries: ComponentQueryFunction[]): PropertyDecorator {
  return (prototype, key) => {
    const componentQueryMetadata: ComponentQueryMetadata =
      Reflect.getMetadata(COMPONENT_QUERY_METADATA, prototype) || {};
    componentQueryMetadata[key] = queries;
    Reflect.defineMetadata(COMPONENT_QUERY_METADATA, componentQueryMetadata, prototype);
  };
}

export const SINGLETON = 'SINGLETON';
export const REQUEST = 'REQUEST';

export type Scope = 'SINGLETON' | 'REQUEST';
export type ProvidedIn = 'root' | 'module';

export type InjectableOptions = {
  scope?: Scope;
  providedIn?: ProvidedIn;
};

export function Injectable(options?: InjectableOptions): ClassDecorator<unknown> {
  return function <T>(constructor: Class<T>) {
    const metadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA, constructor) || {};
    metadata.scope = options?.scope ? options.scope : SINGLETON;
    metadata.providedIn = options?.providedIn ? options.providedIn : 'module';
    Reflect.defineMetadata(INJECT_METADATA, metadata, constructor);
  };
}

export type Systems<T> = Class<SystemType<T>>[];
export type Providers<T = unknown> = (ProviderDefinition<T> | Class)[];
export type Imports = Class<SubModule>[];
export type Exports = (Class<SubModule> | Identifier)[];

export type ModuleDefinitionOptions<T> = {
  systems?: Systems<T>;
  providers?: Providers;
  imports?: Imports;
  exports?: Exports;
};

export function Module<U>(options: ModuleDefinitionOptions<U>): ClassDecorator<ThemisModule<U>> {
  const injectableFn = Injectable({ scope: SINGLETON });
  return function <T extends ThemisModule<U>>(constructor: Class<T>) {
    injectableFn(constructor);
    const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA, constructor) || {};
    metadata.systems = options.systems || [];
    metadata.providers = options.providers || [];
    metadata.imports = options.imports || [];
    metadata.exports = options.exports || [];
    Reflect.defineMetadata(MODULE_METADATA, metadata, constructor);
  };
}

export function System(): ClassDecorator<SystemType<unknown>> {
  const injectableFn = Injectable({ scope: SINGLETON });
  return function <T extends SystemType<unknown>>(constructor: Class<T>) {
    injectableFn(constructor);
  };
}
