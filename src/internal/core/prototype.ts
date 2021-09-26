import { Identifier } from '../../public/decorator';
import { ComponentQueryFunction } from '../../public/component';

const THEMIS_METADATA_KEY = '__themis';

/**
 * @internal
 */
export type InjectMetadata = { [key: string]: Identifier };

/**
 * @internal
 */
export type ComponentQueryMetadata = { [key: string]: ComponentQueryFunction[] };

/**
 * @internal
 */
export interface PrototypeMetadata {
  injectMetadata?: InjectMetadata;
  componentQueryMetadata?: ComponentQueryMetadata;
}

/**
 * @internal
 */
export class Prototype {
  public static getMetadata(prototype: unknown): PrototypeMetadata {
    let metadata = (prototype as Record<string, PrototypeMetadata>)[THEMIS_METADATA_KEY];
    if (!metadata) {
      metadata = {};
      Object.defineProperty(prototype, THEMIS_METADATA_KEY, {
        value: metadata,
        writable: true
      });
    }
    return metadata;
  }
}
