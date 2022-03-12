export abstract class ComponentBase {}

export type ComponentType<T extends ComponentBase> = new (...params: never[]) => T;

export interface ComponentQueryDefinition {
  containingAll(...components: Array<ComponentType<ComponentBase>>): ComponentQueryDefinition;
  containingAny(...components: Array<ComponentType<ComponentBase>>): ComponentQueryDefinition;
  containingNone(...components: Array<ComponentType<ComponentBase>>): ComponentQueryDefinition;
}

export type ComponentQueryFunction = (builder: ComponentQueryDefinition) => ComponentQueryDefinition;

export function all(...components: ComponentType<ComponentBase>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingAll(...components);
  };
}

export function any(...components: ComponentType<ComponentBase>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingAny(...components);
  };
}

export function none(...components: ComponentType<ComponentBase>[]): ComponentQueryFunction {
  return (builder) => {
    return builder.containingNone(...components);
  };
}
