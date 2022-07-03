import { Identifier } from '../../public/decorator';
import { ForwardRefWrapper } from '../../public/forward-ref';

/**
 * @internal
 */
export type Token<T = unknown> = Identifier<T> | ForwardRefWrapper<T>;

/**
 *  @internal
 */
export function isForwardRef(object: Token): object is ForwardRefWrapper {
  if (object === undefined) {
    return false;
  }
  if (typeof object === 'string') {
    return false;
  }
  return 'forwardRef' in object;
}
