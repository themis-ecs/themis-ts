import { Module } from './module';
import { Identifier } from '../../public/decorator';

/**
 * @internal
 */
export interface Resolver {
  resolve<T>(identifier: Identifier<T>, module?: Module): T | undefined;
}
