import { Identifier } from '../../public/decorator';
import { Module } from './module';

/**
 * @internal
 */
export interface Resolver {
  resolve<T>(identifier: Identifier<T>, module?: Module): T | undefined;
}
