import { Identifier } from '../../public/decorator';
import { ModuleClass } from '../../public/module';

/**
 * @internal
 */
export interface Resolver {
  resolve<T>(identifier: Identifier<T>, module?: ModuleClass): T | undefined;
}
