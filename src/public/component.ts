export class Component {}

export type ComponentType<T extends Component> = new (...params: never[]) => T;

export interface ComponentQueryDefinition {
  containingAll(...components: Array<ComponentType<Component>>): ComponentQueryDefinition;
  containingAny(...components: Array<ComponentType<Component>>): ComponentQueryDefinition;
  containingNone(...components: Array<ComponentType<Component>>): ComponentQueryDefinition;
}

export type ComponentQueryFunction = (builder: ComponentQueryDefinition) => ComponentQueryDefinition;

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
