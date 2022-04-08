import { Class, Identifier, Scope } from '../../public/decorator';
import { ComponentQueryFunction } from '../../public/component';
import { System } from '../../public/system';
import { ProviderDefinition } from '../../public/provider';

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
  injectionPoints: Record<string | symbol, Identifier>;
  scope: Scope;
};
/**
 * @internal
 */
export type ComponentQueryMetadata = Record<string | symbol, ComponentQueryFunction[]>;

/**
 * @internal
 */
export type ModuleMetadata = {
  name?: string;
  systems: Class<System<unknown>>[];
  providers: ProviderDefinition<unknown>[];
};
