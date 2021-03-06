import { Exports, Imports, ProvidedIn, Providers, Scope, Systems } from '../../public/decorator';
import { ComponentQueryFunction } from '../../public/component';
import { Token } from './token';

/**
 * @internal
 */
export const INJECT_METADATA = 'themis:inject';
/**
 * @internal
 */
export const COMPONENT_QUERY_METADATA = 'themis:component-query';
/**
 * @internal
 */
export const MODULE_METADATA = 'themis:module';

/**
 * @internal
 */
export type InjectMetadata = {
  injectionPoints: Record<string | symbol, Token>;
  constructorInjectionPoints: Record<number, Token>;
  scope: Scope;
  providedIn: ProvidedIn;
};
/**
 * @internal
 */
export type ComponentQueryMetadata = Record<string | symbol, ComponentQueryFunction[]>;

/**
 * @internal
 */
export type ModuleMetadata = {
  systems: Systems<unknown>;
  providers: Providers;
  imports: Imports;
  exports: Exports;
};
