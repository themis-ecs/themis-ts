import { AbstractClass, Class } from './decorator';

export type ForwardRef<T = unknown> = () => Class<T> | AbstractClass<T>;
export interface ForwardRefWrapper<T = unknown> {
  forwardRef: ForwardRef<T>;
}
export function forwardRef<T = unknown>(fn: ForwardRef<T>): ForwardRefWrapper<T> {
  return { forwardRef: fn };
}
