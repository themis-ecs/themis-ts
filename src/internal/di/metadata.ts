import { Identifier, Scope } from '../../public/decorator';
import { ComponentQueryFunction } from '../../public/component';

/**
 * @internal
 */
export const INJECT_METADATA = 'themis:inject';
/**
 * @internal
 */
export const COMPONENT_METADATA = 'themis:component';
/**
 * @internal
 */
export const COMPONENT_QUERY_METADATA = 'themis:component-query';

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
export type ComponentMetadata = {
  id?: string;
};
