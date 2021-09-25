import { ComponentSetBuilder } from '../internal/core/component-set-builder';

export class Component {}

export type ComponentType<T extends Component> = new (...params: never[]) => T;

export type ComponentQueryDefiniton = {
  all?: ComponentType<Component>[];
  any?: ComponentType<Component>[];
  none?: ComponentType<Component>[];
};

export type ComponentQueryFunction = (builder: ComponentSetBuilder) => ComponentSetBuilder;

export function all(...components: ComponentType<Component>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingAll(...components);
  };
}

export function any(...components: ComponentType<Component>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingAny(...components);
  };
}

export function none(...components: ComponentType<Component>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingNone(...components);
  };
}
